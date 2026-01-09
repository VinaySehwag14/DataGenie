'use client'

interface DataTableProps {
    data: any[]
    fileName: string
    onClose?: () => void
}

export function DataTable({ data, fileName, onClose }: DataTableProps) {
    if (data.length === 0) return null

    const columns = Object.keys(data[0])
    const displayData = data.slice(0, 20) // Show first 20 rows

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
                    <p className="text-sm text-gray-600">
                        {data.length.toLocaleString()} rows • {columns.length} columns
                        {data.length > 20 && ` • Showing first 20 rows`}
                    </p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                                #
                            </th>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {displayData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3 text-sm text-gray-500 font-medium">
                                    {rowIndex + 1}
                                </td>
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate"
                                        title={row[column]}
                                    >
                                        {row[column] || <span className="text-gray-400">—</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {data.length > 20 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 text-center">
                    +{(data.length - 20).toLocaleString()} more rows not shown
                </div>
            )}
        </div>
    )
}
