// Analyze data and recommend the best chart type
export function analyzeDataForChart(data: any[]) {
    if (data.length === 0) return null

    const columns = Object.keys(data[0])
    const numericColumns: string[] = []
    const categoricalColumns: string[] = []
    const dateColumns: string[] = []

    // Analyze each column
    columns.forEach(col => {
        const sampleValue = data[0][col]

        // Check if numeric
        if (!isNaN(parseFloat(sampleValue)) && isFinite(sampleValue)) {
            numericColumns.push(col)
        }
        // Check if date
        else if (isValidDate(sampleValue)) {
            dateColumns.push(col)
        }
        // Otherwise categorical
        else {
            categoricalColumns.push(col)
        }
    })

    // Recommendation logic
    const recommendations = []

    // If has date column + numeric column → Line chart
    if (dateColumns.length > 0 && numericColumns.length > 0) {
        recommendations.push({
            type: 'line',
            xKey: dateColumns[0],
            yKey: numericColumns[0],
            title: `${numericColumns[0]} over ${dateColumns[0]}`,
            score: 10
        })
    }

    // If has categorical column + numeric column → Bar chart
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
        recommendations.push({
            type: 'bar',
            xKey: categoricalColumns[0],
            yKey: numericColumns[0],
            title: `${numericColumns[0]} by ${categoricalColumns[0]}`,
            score: 9
        })
    }

    // If has categorical column + numeric column (for distribution) → Pie chart
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
        // Aggregate data by category
        const aggregated = aggregateByCategory(data, categoricalColumns[0], numericColumns[0])

        recommendations.push({
            type: 'pie',
            nameKey: categoricalColumns[0],
            valueKey: numericColumns[0],
            title: `Distribution of ${numericColumns[0]}`,
            score: 8,
            data: aggregated
        })
    }

    // Sort by score and return top recommendations
    recommendations.sort((a, b) => b.score - a.score)

    return {
        columns: { numeric: numericColumns, categorical: categoricalColumns, date: dateColumns },
        recommendations,
    }
}

function isValidDate(value: any): boolean {
    if (typeof value !== 'string') return false

    const date = new Date(value)
    return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(value)
}

function aggregateByCategory(data: any[], categoryKey: string, valueKey: string) {
    const aggregated: { [key: string]: number } = {}

    data.forEach(row => {
        const category = row[categoryKey]
        const value = parseFloat(row[valueKey]) || 0

        if (aggregated[category]) {
            aggregated[category] += value
        } else {
            aggregated[category] = value
        }
    })

    return Object.entries(aggregated).map(([name, value]) => ({
        [categoryKey]: name,
        [valueKey]: value
    }))
}
