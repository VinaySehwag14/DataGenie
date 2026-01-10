// Export data to CSV format
export function exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
        throw new Error('No data to export')
    }

    // Get headers from first row
    const headers = Object.keys(data[0])

    // Create CSV content
    const csvContent = [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map(row =>
            headers.map(header => {
                const value = row[header]
                // Handle values with commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`
                }
                return value ?? ''
            }).join(',')
        )
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
}

// Filter data based on search query
export function filterData(data: any[], searchQuery: string): any[] {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()

    return data.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(query)
        )
    )
}
