'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UploadZone } from '@/components/dashboard/upload-zone'
import { DataTable } from '@/components/dashboard/data-table'
import { BarChart3, LogOut, Plus, Database, Trash2 } from 'lucide-react'

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

    const router = useRouter()
    const supabase = createClient()

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

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
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
        <div className="min-h-screen bg-gray-50">
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Data Source?</h3>
                                <p className="text-sm text-gray-600">
                                    {dataSources.find(ds => ds.id === deleteConfirm)?.name}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-6">
                            This action cannot be undone. All data rows and visualizations will be permanently removed.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">DataGenie</h1>
                            <p className="text-xs text-gray-500">
                                {user?.email || 'Loading...'}
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
                {/* Page Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
                    <p className="text-gray-600">
                        Upload your data and get AI-powered insights
                    </p>
                </div>

                {/* Data Sources List */}
                {dataSources.length > 0 && !showUpload && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Your Data Sources</h3>
                            <button
                                onClick={() => setShowUpload(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Upload New Data
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dataSources.map((source) => (
                                <div
                                    key={source.id}
                                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Database className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => router.push(`/dashboard/data/${source.id}`)}
                                        >
                                            <h4 className="font-semibold text-gray-900 truncate mb-1">
                                                {source.name}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {source.row_count.toLocaleString()} rows
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(source.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteDataSource(source.id, source.name)
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Delete data source"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Section */}
                {(showUpload || dataSources.length === 0) && (
                    <div className="space-y-6">
                        {dataSources.length > 0 && (
                            <button
                                onClick={() => setShowUpload(false)}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                ← Back to data sources
                            </button>
                        )}

                        <UploadZone onDataParsed={handleDataParsed} />

                        {uploadedData && (
                            <div className="space-y-4">
                                <DataTable data={uploadedData} fileName={fileName} />

                                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                                    <div>
                                        <p className="font-medium text-gray-900">Ready to save?</p>
                                        <p className="text-sm text-gray-600">
                                            This will save {uploadedData.length.toLocaleString()} rows to your workspace
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setUploadedData(null)
                                                setFileName('')
                                            }}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveData}
                                            disabled={saving}
                                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            {saving ? 'Saving...' : 'Save Data'}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
