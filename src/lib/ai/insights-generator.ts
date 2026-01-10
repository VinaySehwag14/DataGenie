// Generate automatic insights from data
// Uses statistics + AI to find interesting patterns

export interface Insight {
    type: 'trend' | 'top' | 'anomaly' | 'comparison'
    title: string
    description: string
    value?: string | number
    icon: string
    color: string
}

export function generateStatisticalInsights(
    data: any[],
    columns: string[],
    columnTypes: { [key: string]: string }
): Insight[] {
    const insights: Insight[] = []

    if (data.length === 0) return insights

    // Find numeric columns for analysis
    const numericColumns = Object.entries(columnTypes)
        .filter(([_, type]) => type === 'number')
        .map(([col, _]) => col)

    // Find categorical columns
    const categoricalColumns = Object.entries(columnTypes)
        .filter(([_, type]) => type === 'text')
        .map(([col, _]) => col)

    // Insight 1: Total count
    insights.push({
        type: 'comparison',
        title: 'Total Records',
        description: `You have ${data.length} rows of data`,
        value: data.length.toLocaleString(),
        icon: '📊',
        color: 'blue'
    })

    // Insight 2: Sum of first numeric column
    if (numericColumns.length > 0) {
        const numCol = numericColumns[0]
        const total = data.reduce((sum, row) => {
            const value = parseFloat(row[numCol])
            return sum + (isNaN(value) ? 0 : value)
        }, 0)

        insights.push({
            type: 'comparison',
            title: `Total ${numCol}`,
            description: `Sum of all ${numCol} values`,
            value: total.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
            icon: '💰',
            color: 'green'
        })
    }

    // Insight 3: Top category (if categorical + numeric exist)
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
        const catCol = categoricalColumns[0]
        const numCol = numericColumns[0]

        // Group by category and sum
        const grouped: { [key: string]: number } = {}
        data.forEach(row => {
            const category = row[catCol]
            const value = parseFloat(row[numCol])
            if (!isNaN(value)) {
                grouped[category] = (grouped[category] || 0) + value
            }
        })

        // Find top category
        const entries = Object.entries(grouped)
        if (entries.length > 0) {
            const top = entries.reduce((max, curr) =>
                curr[1] > max[1] ? curr : max
            )

            insights.push({
                type: 'top',
                title: `Top ${catCol}`,
                description: `${top[0]} generated ${top[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })} in ${numCol}`,
                value: top[0], // Show the category NAME, not the value
                icon: '🏆',
                color: 'yellow'
            })
        }
    }

    // Insight 4: Average (if numeric columns exist)
    if (numericColumns.length > 0) {
        const numCol = numericColumns[0]
        const values = data
            .map(row => parseFloat(row[numCol]))
            .filter(v => !isNaN(v))

        if (values.length > 0) {
            const average = values.reduce((a, b) => a + b, 0) / values.length

            insights.push({
                type: 'comparison',
                title: `Average ${numCol}`,
                description: `Mean value across all records`,
                value: average.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                icon: '📈',
                color: 'purple'
            })
        }
    }

    // Insight 5: Unique count (for categorical)
    if (categoricalColumns.length > 0) {
        const catCol = categoricalColumns[0]
        const unique = new Set(data.map(row => row[catCol]))

        insights.push({
            type: 'comparison',
            title: `Unique ${catCol}`,
            description: `Number of distinct ${catCol} values`,
            value: unique.size,
            icon: '🔢',
            color: 'indigo'
        })
    }

    return insights.slice(0, 5) // Max 5 insights
}

// Helper to format insight text for AI enhancement
export function formatInsightsForAI(insights: Insight[]): string {
    return insights.map(i => `${i.title}: ${i.description} (${i.value})`).join('\n')
}
