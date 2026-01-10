import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { buildContextForAI } from '@/lib/ai/context-builder'
import { generateSuggestedQuestions } from '@/lib/ai/question-generator'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dataSourceId = searchParams.get('dataSourceId')

        if (!dataSourceId) {
            return NextResponse.json(
                { error: 'dataSourceId required' },
                { status: 400 }
            )
        }

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

        // Fetch sample data to analyze column types
        const { data: sampleRows } = await supabase
            .from('data_rows')
            .select('row_data')
            .eq('data_source_id', dataSourceId)
            .limit(5)

        const sampleData = sampleRows?.map(row => row.row_data) || []

        // Build context (which analyzes column types)
        const { columns, columnTypes } = buildContextForAI(dataSource, sampleData)

        // Generate smart questions
        const suggestions = generateSuggestedQuestions(columns, columnTypes)

        return NextResponse.json({ suggestions })

    } catch (error: any) {
        console.error('Suggestions error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
