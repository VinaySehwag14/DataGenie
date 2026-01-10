'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Sparkles, LayoutGrid } from 'lucide-react'
import { BarChartComponent } from '@/components/dashboard/charts/bar-chart'
import { LineChartComponent } from '@/components/dashboard/charts/line-chart'
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart'
import { analyzeDataForChart } from '@/lib/charts/analyzer'
import { ChatInterface } from '@/components/dashboard/chat-interface'
import { InsightsPanel } from '@/components/dashboard/insights-panel'
import { ExportMenu } from '@/components/dashboard/export-menu'
import { EnhancedDataTable } from '@/components/dashboard/enhanced-data-table'

export default function DataSourcePageClient({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string | null>(null)
    const [dataSource, setDataSource] = useState<any>(null)
    const [data, setData] = useState<any[]>([])
    const [analysis, setAnalysis] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [insights, setInsights] = useState<any[]>([])

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        params.then(p => setId(p.id))
    }, [params])

    useEffect(() => {
        if (!id) return;

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUser(user)
        })

        loadData(id)
    }, [id])

    const loadData = async (dataId: string) => {
        try {
            const response = await fetch(`/api/data/${dataId}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error)
            }

            setDataSource(result.dataSource)
            setData(result.data)

            // Analyze data for chart recommendations
            const chartAnalysis = analyzeDataForChart(result.data)
            setAnalysis(chartAnalysis)

            // Fetch insights for sharing
            fetchInsights(dataId)
        } catch (err) {
            console.error('Failed to load data:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchInsights = async (dataId: string) => {
        try {
            const response = await fetch(`/api/insights/${dataId}`)
            const result = await response.json()

            if (result.insights) {
                setInsights(result.insights)
            }
        } catch (err) {
            console.error('Failed to load insights:', err)
        }
    }



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6 glow-animation" />
                    <h2 className="text-2xl font-bold text-white mb-2">Analyzing Data...</h2>
                    <p className="text-indigo-300 animate-pulse">Summoning your data genie</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>



            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Chat & Insights */}
                    <div className="space-y-8 lg:col-span-1">
                        {/* AI Stats Card */}
                        {analysis?.recommendations && (
                            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-md card-3d animate-in slide-in-from-left-5 fade-in duration-500">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">AI Analysis</h3>
                                        <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider">Automated Discovery</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-indigo-500/20">
                                        <span className="text-gray-300 text-sm">Numeric Fields</span>
                                        <span className="text-white font-mono bg-indigo-500/20 px-2 py-0.5 rounded text-xs">
                                            {analysis.columns.numeric.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-indigo-500/20">
                                        <span className="text-gray-300 text-sm">Categories</span>
                                        <span className="text-white font-mono bg-purple-500/20 px-2 py-0.5 rounded text-xs">
                                            {analysis.columns.categorical.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-300 text-sm">Date Fields</span>
                                        <span className="text-white font-mono bg-cyan-500/20 px-2 py-0.5 rounded text-xs">
                                            {analysis.columns.date.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chat Interface */}
                        <div className="bg-gray-900/50 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden card-3d animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100">
                            <ChatInterface
                                dataSourceId={id || ''}
                                dataSourceName={dataSource?.name || 'your data'}
                            />
                        </div>
                    </div>

                    {/* Right Column: Visualization & Data */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Insights Panel - Moved from sidebar for better visibility */}
                        <div className="animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
                            <InsightsPanel dataSourceId={id || ''} />
                        </div>

                        {/* Charts Grid */}
                        <div className="space-y-8">
                            {analysis?.recommendations.map((rec: any, index: number) => (
                                <div
                                    key={index}
                                    style={{ animationDelay: `${index * 150}ms` }}
                                    className="bg-gray-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-500 animate-in fade-in zoom-in card-3d"
                                >
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-white mb-1">{rec.title}</h3>
                                        <p className="text-sm text-gray-500">AI-suggested visualization based on data patterns</p>
                                    </div>

                                    <div className="h-[350px] w-full bg-gradient-to-b from-white/5 to-transparent rounded-2xl p-4 border border-white/5">
                                        {rec.type === 'bar' && (
                                            <BarChartComponent
                                                data={data}
                                                xKey={rec.xKey}
                                                yKey={rec.yKey}
                                                title=""
                                            />
                                        )}
                                        {rec.type === 'line' && (
                                            <LineChartComponent
                                                data={data}
                                                xKey={rec.xKey}
                                                yKey={rec.yKey}
                                                title=""
                                            />
                                        )}
                                        {rec.type === 'pie' && (
                                            <PieChartComponent
                                                data={rec.data || data}
                                                nameKey={rec.nameKey}
                                                valueKey={rec.valueKey}
                                                title=""
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(!analysis || analysis.recommendations.length === 0) && (
                            <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <TrendingUp className="w-8 h-8 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No Visualizations Available</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    Your data doesn't contain enough numeric or categorical relationships for automatic charting. Try uploading a richer dataset.
                                </p>
                            </div>
                        )}

                        {/* Data Table */}
                        <div className="bg-gray-900/50 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <LayoutGrid className="w-5 h-5 text-indigo-400" />
                                        Raw Data Explorer
                                    </h3>
                                    <p className="text-sm text-gray-500">View and search your original dataset</p>
                                </div>
                            </div>
                            <div className="p-6">
                                <EnhancedDataTable
                                    data={data}
                                    fileName={dataSource?.name || 'data'}
                                    maxRows={20}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </main >
        </div >
    )
}
