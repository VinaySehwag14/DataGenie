'use client'

import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import Papa from 'papaparse'

interface UploadZoneProps {
    onDataParsed: (data: any[], fileName: string) => void
}

export function UploadZone({ onDataParsed }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const processFile = useCallback((file: File) => {
        setError(null)
        setUploading(true)

        // Check file size (max 10MB for free tier)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB')
            setUploading(false)
            return
        }

        // Check file type
        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain']
        if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
            setError('Please upload a CSV file')
            setUploading(false)
            return
        }

        // Parse CSV
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError(`Error parsing CSV: ${results.errors[0].message}`)
                    setUploading(false)
                    return
                }

                if (results.data.length === 0) {
                    setError('CSV file is empty')
                    setUploading(false)
                    return
                }

                onDataParsed(results.data, file.name)
                setUploading(false)
            },
            error: (error) => {
                setError(`Error reading file: ${error.message}`)
                setUploading(false)
            },
        })
    }, [onDataParsed])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            processFile(files[0])
        }
    }, [processFile])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            processFile(files[0])
        }
    }, [processFile])

    return (
        <div className="w-full">
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all
          ${isDragging
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                    }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <div className="flex flex-col items-center gap-4">
                    {uploading ? (
                        <>
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-gray-600 font-medium">Processing your file...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                                {isDragging ? (
                                    <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                                ) : (
                                    <Upload className="w-8 h-8 text-indigo-600" />
                                )}
                            </div>

                            <div>
                                <p className="text-lg font-semibold text-gray-900 mb-1">
                                    {isDragging ? 'Drop your file here' : 'Upload your data'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Drag and drop a CSV file, or click to browse
                                </p>
                            </div>

                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                <span className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
                                    <Upload className="w-4 h-4" />
                                    Choose File
                                </span>
                            </label>

                            <p className="text-xs text-gray-500">
                                CSV files up to 10MB • Free tier: 5,000 rows
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
