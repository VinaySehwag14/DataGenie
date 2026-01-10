'use client'

import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

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

        // Determine file type
        const fileName = file.name.toLowerCase()
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
        const isCSV = fileName.endsWith('.csv')

        if (!isExcel && !isCSV) {
            setError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)')
            setUploading(false)
            return
        }

        // Process Excel files
        if (isExcel) {
            const reader = new FileReader()

            reader.onload = (e) => {
                try {
                    const data = e.target?.result
                    const workbook = XLSX.read(data, { type: 'binary' })

                    // Get first sheet
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet)

                    if (jsonData.length === 0) {
                        setError('Excel file is empty')
                        setUploading(false)
                        return
                    }

                    onDataParsed(jsonData, file.name)
                    setUploading(false)
                } catch (error: any) {
                    setError(`Error parsing Excel file: ${error.message}`)
                    setUploading(false)
                }
            }

            reader.onerror = () => {
                setError('Error reading Excel file')
                setUploading(false)
            }

            reader.readAsBinaryString(file)
            return
        }

        // Process CSV files (existing logic)
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
                <div className="mb-4 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-start gap-2 backdrop-blur-sm">
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragging
                        ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10'
                    }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <div className="flex flex-col items-center gap-4">
                    {uploading ? (
                        <>
                            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-gray-300 font-medium">Processing your file...</p>
                        </>
                    ) : (
                        <>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-indigo-500/20' : 'bg-white/10'
                                }`}>
                                {isDragging ? (
                                    <FileSpreadsheet className="w-8 h-8 text-indigo-400" />
                                ) : (
                                    <Upload className="w-8 h-8 text-gray-400" />
                                )}
                            </div>

                            <div>
                                <p className="text-lg font-bold text-white mb-2">
                                    {isDragging ? 'Drop your file here' : 'Upload your data'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Drag and drop a CSV or Excel file, or click to browse
                                </p>
                            </div>

                            <label className="cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                                <span className="relative inline-flex items-center gap-2 px-6 py-3 bg-gray-900 border border-white/10 text-white font-medium rounded-lg hover:bg-gray-800 transition">
                                    <Upload className="w-4 h-4" />
                                    Choose File
                                </span>
                            </label>

                            <p className="text-xs text-gray-500">
                                CSV or Excel files up to 10MB • Free tier: 5,000 rows
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
