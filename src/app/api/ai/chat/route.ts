import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { chatWithAI } from '@/lib/ai/gemini'
import { buildContextForAI } from '@/lib/ai/context-builder'
import { executeSafeSQL, formatQueryResults } from '@/lib/ai/sql-executor'

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

        // Fetch data source with ownership check
        const { data: dataSource, error: sourceError } = await supabase
            .from('data_sources')
            .select(`
        *,
        workspaces!inner(user_id)
      `)
            .eq('id', dataSourceId)
            .single()

        if (sourceError || !dataSource) {
            return NextResponse.json({ error: 'Data source not found' }, { status: 404 })
        }

        if (dataSource.workspaces.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Fetch sample data for context
        const { data: sampleRows } = await supabase
            .from('data_rows')
            .select('row_data')
            .eq('data_source_id', dataSourceId)
            .limit(5)

        const sampleData = sampleRows?.map(row => row.row_data) || []

        // Build AI context
        const { contextPrompt } = buildContextForAI(dataSource, sampleData)

        // Prepare conversation for AI
        const messages = [
            { role: 'user', content: contextPrompt },
            ...conversationHistory,
            { role: 'user', content: `User question: "${message}"\n\nGenerate ONLY the SQL query, no explanation.` }
        ]

        // Call Gemini AI to generate SQL
        const aiResponse = await chatWithAI(messages)

        // Extract SQL from response (AI might add markdown formatting)
        let sql = aiResponse.trim()

        // Remove markdown code blocks if present
        sql = sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim()

        // Log for debugging
        console.log('Generated SQL:', sql)
        console.log('For question:', message)

        // Execute SQL safely
        const queryResult = await executeSafeSQL(sql, dataSourceId, user.id)

        if (!queryResult.success) {
            return NextResponse.json({
                role: 'assistant',
                content: `I encountered an error executing the query: ${queryResult.error}`,
                error: true,
                sql
            })
        }

        // Format results for user
        const formattedResult = formatQueryResults(queryResult.data)

        // Generate natural language response
        const responseMessages = [
            { role: 'user', content: contextPrompt },
            { role: 'user', content: `Question: "${message}"\nSQL: ${sql}\nResult: ${JSON.stringify(queryResult.data)}\n\nExplain this result in a friendly, conversational way. Be concise (2-3 sentences max).` }
        ]

        const naturalResponse = await chatWithAI(responseMessages)

        return NextResponse.json({
            role: 'assistant',
            content: naturalResponse,
            sql,
            data: queryResult.data,
            rowCount: queryResult.rowCount,
            formattedResult
        })

    } catch (error: any) {
        console.error('AI Chat error:', error)
        return NextResponse.json(
            {
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your question. Please try rephrasing it.',
                error: true,
                details: error.message
            },
            { status: 500 }
        )
    }
}
