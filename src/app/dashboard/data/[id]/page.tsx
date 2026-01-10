'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, LogOut, ArrowLeft, TrendingUp } from 'lucide-react'
import { BarChartComponent } from '@/components/dashboard/charts/bar-chart'
import { LineChartComponent } from '@/components/dashboard/charts/line-chart'
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart'
import { analyzeDataForChart } from '@/lib/charts/analyzer'

export default async function DataSourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <DataSourcePageClient id={id} />
}

function DataSourcePageClient({ id }: { id: string }) {
    const [dataSource, setDataSource] = useState<any>(null)
    const [data, setData] = useState<any[]>([])
    const [analysis, setAnalysis] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUser(user)
        })

        loadData()
    }, [id])

    const loadData = async () => {
        try {
            const response = await fetch(`/api/data/${id}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error)
            }

            setDataSource(result.dataSource)
            setData(result.data)

            // Analyze data for chart recommendations
            const chartAnalysis = analyzeDataForChart(result.data)
            setAnalysis(chartAnalysis)
        } catch (err) {
            console.error('Failed to load data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                {dataSource?.name || 'Loading...'}
                            </h1>
                            <p className="text-xs text-gray-500">
                                {dataSource?.row_count.toLocaleString()} rows
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* AI Insights */}
                {analysis?.recommendations && analysis.recommendations.length > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-indigo-50 to-pink-50 border border-indigo-200 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">AI Analysis</h3>
                                <p className="text-sm text-gray-600">
                                    Detected {analysis.columns.numeric.length} numeric columns,
                                    {' '}{analysis.columns.categorical.length} categorical columns, and
                                    {' '}{analysis.columns.date.length} date columns
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts Grid */}
                <div className="space-y-8">
                    {analysis?.recommendations.map((rec: any, index: number) => (
                        <div key={index}>
                            {rec.type === 'bar' && (
                                <BarChartComponent
                                    data={data}
                                    xKey={rec.xKey}
                                    yKey={rec.yKey}
                                    title={rec.title}
                                />
                            )}
                            {rec.type === 'line' && (
                                <LineChartComponent
                                    data={data}
                                    xKey={rec.xKey}
                                    yKey={rec.yKey}
                                    title={rec.title}
                                />
                            )}
                            {rec.type === 'pie' && (
                                <PieChartComponent
                                    data={rec.data || data}
                                    nameKey={rec.nameKey}
                                    valueKey={rec.valueKey}
                                    title={rec.title}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {(!analysis || analysis.recommendations.length === 0) && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-600">
                            No visualizations available for this data.
                            <br />
                            Try uploading data with numeric and categorical columns.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
