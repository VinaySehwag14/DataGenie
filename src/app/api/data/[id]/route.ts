import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

        // Get data source to verify ownership
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

        // Verify ownership
        if (dataSource.workspaces.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Get all data rows
        const { data: rows, error: rowsError } = await supabase
            .from('data_rows')
            .select('row_data')
            .eq('data_source_id', dataSourceId)
            .order('created_at', { ascending: true })

        if (rowsError) {
            return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
        }

        // Extract row_data from each row
        const data = rows.map(row => row.row_data)

        return NextResponse.json({
            dataSource: {
                id: dataSource.id,
                name: dataSource.name,
                row_count: dataSource.row_count,
                schema: dataSource.schema,
                created_at: dataSource.created_at,
            },
            data,
        })
    } catch (error: any) {
        console.error('Fetch data error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
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

        // Verify ownership before deleting
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

        // Delete data rows first (cascade)
        const { error: rowsError } = await supabase
            .from('data_rows')
            .delete()
            .eq('data_source_id', dataSourceId)

        if (rowsError) {
            console.error('Error deleting data rows:', rowsError)
            return NextResponse.json(
                { error: 'Failed to delete data rows' },
                { status: 500 }
            )
        }

        // Delete data source
        const { error: deleteError } = await supabase
            .from('data_sources')
            .delete()
            .eq('id', dataSourceId)

        if (deleteError) {
            console.error('Error deleting data source:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete data source' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Delete error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
