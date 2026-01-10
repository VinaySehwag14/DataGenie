// This file helps Gemini AI understand your data structure
// Think of it like giving AI a "map" of your database

export function buildContextForAI(dataSource: any, sampleData: any[]) {
    // Extract column information from the schema
    const columns = dataSource.schema?.columns || []

    // Analyze column types from sample data
    const columnTypes: { [key: string]: string } = {}

    if (sampleData.length > 0) {
        const firstRow = sampleData[0]

        columns.forEach((col: string) => {
            const value = firstRow[col]

            // Detect type
            if (value === null || value === undefined) {
                columnTypes[col] = 'unknown'
            } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
                columnTypes[col] = 'number'
            } else if (isValidDate(value)) {
                columnTypes[col] = 'date'
            } else {
                columnTypes[col] = 'text'
            }
        })
    }

    // Build a natural language description for Gemini
    const contextPrompt = `
You are a SQL expert analyzing a dataset called "${dataSource.name}".

Dataset Information:
- Total rows: ${dataSource.row_count}
- Columns (${columns.length}):

${columns.map((col: string) => {
        const type = columnTypes[col] || 'text'
        return `  • ${col} (${type})`
    }).join('\n')}

Sample Data (first 3 rows):
${JSON.stringify(sampleData.slice(0, 3), null, 2)}

IMPORTANT INSTRUCTIONS:
1. The data is stored in JSONB format in a table called "data_rows"
2. Each row has a column "row_data" containing the actual data
3. To query, use: SELECT row_data->>'ColumnName' FROM data_rows WHERE data_source_id = '${dataSource.id}'
4. For numeric calculations, cast to numeric: (row_data->>'Sales')::numeric
5. For date filters, cast to date: (row_data->>'Date')::date
6. Always include WHERE data_source_id = '${dataSource.id}' to filter this dataset
7. Return ONLY valid PostgreSQL SQL, no explanations
8. Use proper JSONB operators: ->> for text, -> for JSON

Example Query:
"What were total sales in January?"
Answer: 
SELECT SUM((row_data->>'Sales')::numeric) as total_sales
FROM data_rows 
WHERE data_source_id = '${dataSource.id}'
AND EXTRACT(MONTH FROM (row_data->>'Date')::date) = 1
`

    return {
        contextPrompt,
        columns,
        columnTypes,
        sampleData: sampleData.slice(0, 5), // Keep first 5 rows for reference
    }
}

// Helper function to validate dates
function isValidDate(value: any): boolean {
    if (typeof value !== 'string') return false
    const date = new Date(value)
    return !isNaN(date.getTime()) && !!value.match(/\d{4}-\d{2}-\d{2}/)
}
