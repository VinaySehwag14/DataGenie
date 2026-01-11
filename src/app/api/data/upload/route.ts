import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { fileName, data } = body

        if (!fileName || !data || !Array.isArray(data)) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            )
        }

        // Get user's workspace
        const { data: workspace, error: workspaceError } = await supabase
            .from('workspaces')
            .select('id, subscription_plan')
            .eq('user_id', user.id)
            .single()

        if (workspaceError || !workspace) {
            return NextResponse.json(
                { error: 'Workspace not found' },
                { status: 404 }
            )
        }

        // === RESTRICTION CHECK START ===
        const isFreePlan = !workspace.subscription_plan || workspace.subscription_plan === 'free'

        // 1. Check Row Limit (Max 1000 for Free)
        if (isFreePlan && data.length > 1000) {
            return NextResponse.json(
                { error: 'Free plan is limited to 1,000 rows per file. Please upgrade to Pro.' },
                { status: 403 }
            )
        }

        // 2. Check Data Source Count Limit (Max 5 for Free)
        if (isFreePlan) {
            const { count, error: countError } = await supabase
                .from('data_sources')
                .select('*', { count: 'exact', head: true })
                .eq('workspace_id', workspace.id)

            if (!countError && count !== null && count >= 5) {
                return NextResponse.json(
                    { error: 'Free plan is limited to 5 data sources. Please upgrade to Pro.' },
                    { status: 403 }
                )
            }
        }
        // === RESTRICTION CHECK END ===

        // Extract schema from first row
        const schema = data.length > 0 ? Object.keys(data[0]) : []

        // Create data source
        const { data: dataSource, error: sourceError } = await supabase
            .from('data_sources')
            .insert({
                workspace_id: workspace.id,
                name: fileName,
                type: 'csv',
                row_count: data.length,
                schema: { columns: schema },
            })
            .select()
            .single()

        if (sourceError || !dataSource) {
            return NextResponse.json(
                { error: 'Failed to create data source' },
                { status: 500 }
            )
        }

        // Insert data rows in batches (Supabase has limits)
        const batchSize = 100
        const batches = []

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize).map((row) => ({
                data_source_id: dataSource.id,
                row_data: row,
            }))
            batches.push(batch)
        }

        // Insert all batches
        for (const batch of batches) {
            const { error: insertError } = await supabase
                .from('data_rows')
                .insert(batch)

            if (insertError) {
                // Rollback: delete the data source
                await supabase.from('data_sources').delete().eq('id', dataSource.id)

                return NextResponse.json(
                    { error: 'Failed to insert data rows' },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json({
            success: true,
            dataSource: {
                id: dataSource.id,
                name: dataSource.name,
                row_count: dataSource.row_count,
                created_at: dataSource.created_at,
            },
        })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

// GET: Fetch all data sources for current user
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's workspace
        const { data: workspace, error: workspaceError } = await supabase
            .from('workspaces')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (workspaceError || !workspace) {
            return NextResponse.json({ dataSources: [] })
        }

        // Get all data sources
        const { data: dataSources, error: sourcesError } = await supabase
            .from('data_sources')
            .select('*')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: false })

        if (sourcesError) {
            return NextResponse.json(
                { error: 'Failed to fetch data sources' },
                { status: 500 }
            )
        }

        return NextResponse.json({ dataSources: dataSources || [] })
    } catch (error: any) {
        console.error('Fetch error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
