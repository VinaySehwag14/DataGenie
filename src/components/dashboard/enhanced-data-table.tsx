'use client'

import { useState, useMemo } from 'react'
import { Search, ArrowUp, ArrowDown, Download } from 'lucide-react'
import { exportToCSV } from '@/lib/export/csv-exporter'

interface EnhancedDataTableProps {
    data: any[]
    fileName: string
    maxRows?: number
}

export function EnhancedDataTable({ data, fileName, maxRows = 100 }: EnhancedDataTableProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <p className="text-gray-600">No data available</p>
            </div>
        )
    }

    const columns = Object.keys(data[0])

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data

        const query = searchQuery.toLowerCase()
        return data.filter(row =>
            Object.values(row).some(value =>
                String(value).toLowerCase().includes(query)
            )
        )
    }, [data, searchQuery])

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortColumn]
            const bVal = b[sortColumn]

            // Handle numbers
            const aNum = parseFloat(aVal)
            const bNum = parseFloat(bVal)
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
            }

            // Handle strings
            const aStr = String(aVal).toLowerCase()
            const bStr = String(bVal).toLowerCase()
            if (sortDirection === 'asc') {
                return aStr.localeCompare(bStr)
            } else {
                return bStr.localeCompare(aStr)
            }
        })
    }, [filteredData, sortColumn, sortDirection])

    const displayData = sortedData.slice(0, maxRows)

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            // Toggle direction
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const handleExport = () => {
        exportToCSV(sortedData, `${fileName.replace(/\s+/g, '_')}_filtered.csv`)
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Header with Search and Export */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search data..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                </div>
                {filteredData.length < data.length && (
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        title="Export filtered data"
                    >
                        <Download className="w-4 h-4" />
                        Export Filtered
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                Showing {displayData.length.toLocaleString()} of {sortedData.length.toLocaleString()} rows
                {searchQuery && sortedData.length < data.length && (
                    <span className="ml-2 text-indigo-600">
                        (filtered from {data.length.toLocaleString()})
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    onClick={() => handleSort(column)}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition select-none"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column}</span>
                                        {sortColumn === column && (
                                            sortDirection === 'asc'
                                                ? <ArrowUp className="w-3 h-3 text-indigo-600" />
                                                : <ArrowDown className="w-3 h-3 text-indigo-600" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 transition">
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        {row[column]?.toString() || '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {sortedData.length > maxRows && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
                    Showing first {maxRows} rows. Use search to find specific data.
                </div>
            )}
        </div>
    )
}
