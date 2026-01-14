import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { buildContextForAI } from '@/lib/ai/context-builder'
import { generateStatisticalInsights, formatInsightsForAI, generateQualitativeInsights } from '@/lib/ai/insights-generator'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: dataSourceId } = await params
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

        // Fetch all data rows
        const { data: rows, error: rowsError } = await supabase
            .from('data_rows')
            .select('row_data')
            .eq('data_source_id', dataSourceId)

        if (rowsError) {
            return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
        }

        const data = rows.map(row => row.row_data)

        // Build context to get column types
        const { columns, columnTypes } = buildContextForAI(dataSource, data.slice(0, 10))

        // 1. Generate statistical insights (Fast)
        const statsInsights = generateStatisticalInsights(data, columns, columnTypes)

        // 2. Generate AI insights (Slow, but valuable)
        // We act on sample data + the summary from stats
        const dataSummary = formatInsightsForAI(statsInsights)
        const aiInsights = await generateQualitativeInsights(dataSummary, data.slice(0, 10))

        // Combine: Stats first, then AI
        const insights = [...statsInsights, ...aiInsights]

        return NextResponse.json({ insights })

    } catch (error: any) {
        console.error('Insights error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
