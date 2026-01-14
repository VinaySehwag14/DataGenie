import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { chatWithAI } from '@/lib/ai/gemini'
import { buildContextForAI } from '@/lib/ai/context-builder'
import { classifyIntent } from '@/lib/ai/intent-classifier'
import { buildSqlFromIntent } from '@/lib/analytics/query-builder'
import { DuckDBExecutor } from '@/lib/analytics/duckdb-executor'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { message, dataSourceId, conversationHistory = [] } = body

        if (!message || !dataSourceId) {
            return NextResponse.json(
                { error: 'Message and dataSourceId required' },
                { status: 400 }
            )
        }

        // Fetch data source with ownership check (and workspace info)
        const { data: dataSource, error: sourceError } = await supabase
            .from('data_sources')
            .select(`
        *,
        workspaces!inner(id, user_id, subscription_plan, daily_ai_usage_count, last_reset_date)
      `)
            .eq('id', dataSourceId)
            .single()

        if (sourceError || !dataSource) {
            return NextResponse.json({ error: 'Data source not found' }, { status: 404 })
        }

        if (dataSource.workspaces.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // === RESTRICTION CHECK START ===
        const workspace = dataSource.workspaces
        const isFreePlan = !workspace.subscription_plan || workspace.subscription_plan === 'free'

        if (isFreePlan) {
            const today = new Date()
            const lastReset = new Date(workspace.last_reset_date)
            const isSameDay = today.toDateString() === lastReset.toDateString()

            let currentUsage = isSameDay ? workspace.daily_ai_usage_count : 0

            // Check limit
            if (currentUsage >= 10) {
                return NextResponse.json({
                    role: 'assistant',
                    content: 'You have reached your daily limit of 10 AI queries on the Free plan. Please upgrade to Pro for unlimited access.',
                    error: true
                })
            }

            // Update usage (Optimistic update - we'll assume the query works)
            const { error: updateError } = await supabase
                .from('workspaces')
                .update({
                    daily_ai_usage_count: currentUsage + 1,
                    last_reset_date: new Date().toISOString()
                })
                .eq('id', workspace.id)

            if (updateError) {
                console.error("Failed to update usage count", updateError)
            }
        }
        // === RESTRICTION CHECK END ===

        // Fetch ALL data rows for this analysis
        // Note: For MVP we fetch from Supabase -> Node Memory -> DuckDB.
        // For production, we would stream this or load directly if it was a file URL.
        const { data: allRows } = await supabase
            .from('data_rows')
            .select('row_data')
            .eq('data_source_id', dataSourceId)
            .limit(5000) // Safety limit for in-memory

        const dataset = allRows?.map(row => row.row_data) || []

        // Use existing helper to get schema info (using first 5 rows for sample)
        const { columns, columnTypes } = buildContextForAI(dataSource, dataset.slice(0, 5))

        // --- NEW DETERMINISTIC FLOW WITH DUCKDB ---

        // 1. Classify Intent
        const intent = await classifyIntent(message, columns, columnTypes)
        console.log("Determined Intent:", JSON.stringify(intent, null, 2))

        if (intent.type === 'UNKNOWN') {
            return NextResponse.json({
                role: 'assistant',
                content: `I'm not sure how to analyze that. ${intent.reasoning || "Could you try asking differently?"}`,
                error: false
            })
        }

        // 2. Build Safe SQL (Standard Dialect)
        let sql = ""
        try {
            // We use 'std' dialect for DuckDB, so columns are plain identifiers
            sql = buildSqlFromIntent(intent, dataSourceId, 'std')
            console.log("Generated DuckDB SQL:", sql)
        } catch (builderError: any) {
            return NextResponse.json({
                role: 'assistant',
                content: `I understood your intent (${intent.type}) but couldn't construct the query: ${builderError.message}`,
                error: true
            })
        }

        // 3. Execute with DuckDB
        const duckDB = new DuckDBExecutor()
        let queryResult: any[] = []

        try {
            // Load data into 'current_analysis' table
            await duckDB.loadData('current_analysis', dataset)

            // Execute
            queryResult = await duckDB.executeQuery(sql)

        } catch (execError: any) {
            console.error("DuckDB Error:", execError)
            return NextResponse.json({
                role: 'assistant',
                content: `Error executing analysis: ${execError.message}`,
                error: true,
                sql
            })
        }

        // 4. Trace & Explain
        const responseMessages = [
            {
                role: 'system', content: `You are a helpful data analyst. 
            The user asked: "${message}".
            
            The analysis returned:
            ${JSON.stringify(queryResult).slice(0, 1000)}
            
            Explain the result simply. Focus on the numbers. Do not mention "SQL".` },
        ]

        const naturalResponse = await chatWithAI(responseMessages as any)

        return NextResponse.json({
            role: 'assistant',
            content: naturalResponse,
            sql,
            intent,
            data: queryResult,
            rowCount: queryResult.length
        })

    } catch (error: any) {
        console.error('AI Chat error:', error)
        return NextResponse.json(
            {
                role: 'assistant',
                content: 'Sorry, I encountered an internal error. Please try again.',
                error: true,
                details: error.message
            },
            { status: 500 }
        )
    }
}
