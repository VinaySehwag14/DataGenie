'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UploadZone } from '@/components/dashboard/upload-zone'
import { DataTable } from '@/components/dashboard/data-table'
import { BarChart3, LogOut, Plus, Database, Trash2, Home, Layout, CreditCard, Info, Sparkles, Download, Loader2 } from 'lucide-react'
import Papa from 'papaparse'

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [dataSources, setDataSources] = useState<any[]>([])
    const [uploadedData, setUploadedData] = useState<any[] | null>(null)
    const [fileName, setFileName] = useState<string>('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showUpload, setShowUpload] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const [loading, setLoading] = useState(true)

    const router = useRouter()
    const supabase = createClient()

    // Sample data loading state
    const [loadingSample, setLoadingSample] = useState<string | null>(null)

    const handleLoadSample = async (url: string, fileName: string) => {
        setLoadingSample(fileName)
        try {
            const response = await fetch(url)
            const csvText = await response.text()

            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data.length > 0) {
                        handleDataParsed(results.data, fileName)
                    }
                    setLoadingSample(null)
                },
                error: (error: any) => {
                    console.error('Error parsing sample CSV:', error)
                    setError('Failed to load sample data')
                    setLoadingSample(null)
                }
            })
        } catch (error) {
            console.error('Error fetching sample data:', error)
            setError('Failed to fetch sample data')
            setLoadingSample(null)
        }
    }

    useEffect(() => {
        // Get current user
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user)
                loadDataSources()
            }
        })
    }, [])

    const loadDataSources = async () => {
        try {
            const response = await fetch('/api/data/upload')
            const result = await response.json()

            if (result.dataSources) {
                setDataSources(result.dataSources)
                if (result.dataSources.length === 0) {
                    setShowUpload(true)
                }
            }
        } catch (err) {
            console.error('Failed to load data sources:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDataParsed = (data: any[], name: string) => {
        setUploadedData(data)
        setFileName(name)
        setError(null)
    }

    const handleSaveData = async () => {
        if (!uploadedData) return

        setSaving(true)
        setError(null)

        try {
            const response = await fetch('/api/data/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName,
                    data: uploadedData,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save data')
            }

            // Success!
            await loadDataSources()
            setUploadedData(null)
            setFileName('')
            setShowUpload(false)
        } catch (err: any) {
            setError(err.message || 'Failed to save data')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteDataSource = async (id: string, name: string) => {
        setDeleteConfirm(id)
    }

    const confirmDelete = async () => {
        if (!deleteConfirm) return

        setDeleting(true)
        setError(null)

        try {
            const response = await fetch(`/api/data/${deleteConfirm}`, {
                method: 'DELETE',
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete data source')
            }

            // Success - remove from local state
            setDataSources(prev => prev.filter(ds => ds.id !== deleteConfirm))
            setDeleteConfirm(null)
        } catch (err: any) {
            setError(err.message || 'Failed to delete data source')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white relative selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 backdrop-blur-md bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900/90 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300 card-3d">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 glow-animation">
                                <Trash2 className="w-7 h-7 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Delete Data Source?</h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    {dataSources.find(ds => ds.id === deleteConfirm)?.name}
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-8 leading-relaxed">
                            This action cannot be undone. All data rows and visualizations will be permanently removed from your workspace.
                        </p>

                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                                className="px-5 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-12">
                {/* Page Header */}
                <div className="mb-12 animate-in slide-in-from-bottom-5 fade-in duration-700">
                    <h2 className="text-4xl font-black mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">Dashboard</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Manage your datasets and unleash the power of AI analytics.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6 glow-animation" />
                        <h3 className="text-xl font-bold text-white mb-2">Loading Workspace...</h3>
                        <p className="text-indigo-300 animate-pulse">Summoning your data genie</p>
                    </div>
                ) : (
                    <>
                        {/* Data Sources List */}
                        {dataSources.length > 0 && !showUpload && (
                            <div className="mb-12 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Database className="w-5 h-5 text-indigo-400" />
                                        Your Data Sources
                                    </h3>
                                    <button
                                        onClick={() => setShowUpload(true)}
                                        className="flex items-center gap-2 px-6 py-3 btn-gradient-primary text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-semibold group"
                                    >
                                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                        Upload New Data
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {dataSources.map((source, idx) => (
                                        <div
                                            key={source.id}
                                            style={{ animationDelay: `${idx * 100}ms` }}
                                            className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 cursor-pointer card-3d animate-in fade-in zoom-in fill-mode-backwards"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div
                                                className="relative z-10"
                                                onClick={() => router.push(`/dashboard/data/${source.id}`)}
                                            >
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="w-14 h-14 btn-gradient-primary rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-indigo-500/20">
                                                        <BarChart3 className="w-7 h-7 text-white" />
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteDataSource(source.id, source.name)
                                                        }}
                                                        className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                                                        title="Delete data source"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <h4 className="text-xl font-bold text-white mb-2 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
                                                    {source.name}
                                                </h4>
                                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                                                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                                        <Database className="w-3.5 h-3.5" />
                                                        {source.row_count.toLocaleString()} rows
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full glow-animation"></span>
                                                        Active
                                                    </span>
                                                </div>

                                                <div className="text-xs text-gray-500 font-medium flex items-center gap-2 pt-4 border-t border-white/5">
                                                    <span>Added {new Date(source.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload Section */}
                        {(showUpload || (dataSources.length === 0 && !loading)) && (
                            <div className="max-w-4xl mx-auto animate-in scale-95 fade-in duration-500">
                                {dataSources.length > 0 && (
                                    <button
                                        onClick={() => setShowUpload(false)}
                                        className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                            ←
                                        </div>
                                        Back to dashboard
                                    </button>
                                )}

                                <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm card-3d">
                                    <div className="mb-8 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 mb-4 glow-animation">
                                            <Plus className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Upload New Dataset</h3>
                                        <p className="text-gray-400 mb-6">Supported formats: CSV, Excel (xlsx, xls)</p>

                                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                                            <span className="text-gray-500">Don't have data? Try these:</span>

                                            <button
                                                onClick={() => handleLoadSample('/samples/sales_performance.csv', 'Sales Performance.csv')}
                                                disabled={!!loadingSample}
                                                className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {loadingSample === 'Sales Performance.csv' ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Database className="w-3 h-3" />
                                                )}
                                                Sales Data
                                            </button>

                                            <span className="text-gray-600">|</span>

                                            <button
                                                onClick={() => handleLoadSample('/samples/marketing_metrics.csv', 'Marketing Metrics.csv')}
                                                disabled={!!loadingSample}
                                                className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {loadingSample === 'Marketing Metrics.csv' ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Database className="w-3 h-3" />
                                                )}
                                                Marketing Data
                                            </button>
                                        </div>
                                    </div>

                                    <UploadZone onDataParsed={handleDataParsed} />

                                    {uploadedData && (
                                        <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-500">
                                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                                    <h4 className="font-semibold text-white flex items-center gap-2">
                                                        <Database className="w-4 h-4 text-indigo-400" />
                                                        Data Preview
                                                    </h4>
                                                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-md">
                                                        {uploadedData.length.toLocaleString()} rows detected
                                                    </span>
                                                </div>
                                                <div className="max-h-[400px] overflow-auto">
                                                    <DataTable data={uploadedData} fileName={fileName} />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
                                                <div>
                                                    <p className="font-bold text-white text-lg">Ready to analyze?</p>
                                                    <p className="text-sm text-gray-400">
                                                        Import <strong>{fileName}</strong> to start generating insights.
                                                    </p>
                                                </div>

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => {
                                                            setUploadedData(null)
                                                            setFileName('')
                                                        }}
                                                        className="px-6 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition font-medium"
                                                        disabled={saving}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSaveData}
                                                        disabled={saving}
                                                        className="px-8 py-3 btn-gradient-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                    >
                                                        {saving ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <RocketIcon className="w-4 h-4" />
                                                                Launch Analysis
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3 animate-in shake">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                    {error}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

function RocketIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    )
}
