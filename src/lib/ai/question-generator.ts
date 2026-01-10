// Generate smart question suggestions based on data structure
export function generateSuggestedQuestions(columns: string[], columnTypes: { [key: string]: string }) {
    const suggestions: string[] = []

    // Find numeric columns (for aggregations)
    const numericColumns = Object.entries(columnTypes)
        .filter(([_, type]) => type === 'number')
        .map(([col, _]) => col)

    // Find categorical columns (for grouping)
    const categoricalColumns = Object.entries(columnTypes)
        .filter(([_, type]) => type === 'text')
        .map(([col, _]) => col)

    // Find date columns (for time-based analysis)
    const dateColumns = Object.entries(columnTypes)
        .filter(([_, type]) => type === 'date')
        .map(([col, _]) => col)

    // Generate questions based on available columns

    // 1. Total/Sum questions (if numeric columns exist)
    if (numericColumns.length > 0) {
        const numCol = numericColumns[0]
        suggestions.push(`What were total ${numCol}?`)
    }

    // 2. Grouping questions (if both categorical and numeric exist)
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
        const catCol = categoricalColumns[0]
        const numCol = numericColumns[0]
        suggestions.push(`Show me ${numCol} by ${catCol}`)
    }

    // 3. Top/Best questions (if categorical and numeric exist)
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
        const catCol = categoricalColumns[0]
        const numCol = numericColumns[0]
        suggestions.push(`Which ${catCol} had highest ${numCol}?`)
    }

    // 4. Time-based questions (if date column exists)
    if (dateColumns.length > 0 && numericColumns.length > 0) {
        const dateCol = dateColumns[0]
        const numCol = numericColumns[0]
        suggestions.push(`Show me ${numCol} by ${dateCol}`)
    }

    // 5. Count questions (if categorical columns exist)
    if (categoricalColumns.length > 0) {
        const catCol = categoricalColumns[0]
        suggestions.push(`How many unique ${catCol}?`)
    }

    // 6. Average questions (if numeric columns exist)
    if (numericColumns.length > 0) {
        const numCol = numericColumns[0]
        suggestions.push(`What is the average ${numCol}?`)
    }

    // Return max 4 suggestions (to avoid cluttering UI)
    return suggestions.slice(0, 4)
}

// Example usage:
// const columns = ['Date', 'Product', 'Sales', 'Quantity', 'Region']
// const types = { Date: 'date', Product: 'text', Sales: 'number', Quantity: 'number', Region: 'text' }
// generateSuggestedQuestions(columns, types)
// Returns:
// [
//   "What were total Sales?",
//   "Show me Sales by Product",
//   "Which Product had highest Sales?",
//   "Show me Sales by Date"
// ]
