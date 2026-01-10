import jsPDF from 'jspdf'

interface PDFExportOptions {
    dataSourceName: string
    data: any[]
    insights?: any[]
}

export async function exportToPDF(options: PDFExportOptions) {
    const { dataSourceName, data, insights = [] } = options

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    let yPos = 20

    // ===== HEADER =====
    doc.setFillColor(99, 102, 241)
    doc.rect(0, 0, 210, 45, 'F')

    // Brand name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('DataGenie', 20, 25)

    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.text('Business Analytics Report', 20, 35)

    yPos = 60

    // Report Title
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(dataSourceName, 20, yPos)

    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'long',
        timeStyle: 'short'
    })
    doc.text(`Generated: ${timestamp}`, 20, yPos)

    yPos += 15

    // ===== EXECUTIVE SUMMARY =====
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Executive Summary', 20, yPos)

    yPos += 10

    doc.setFillColor(245, 247, 250)
    doc.roundedRect(20, yPos - 6, 170, 30, 2, 2, 'F')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)

    const totalRecords = data.length
    const columns = Object.keys(data[0] || {})
    const numericCols = columns.filter(col => !isNaN(parseFloat(data[0]?.[col])))

    doc.text(`Dataset: ${totalRecords.toLocaleString()} records analyzed across ${columns.length} dimensions`, 25, yPos)
    yPos += 6
    doc.text(`Metrics: ${numericCols.length} quantitative KPIs tracked and analyzed`, 25, yPos)
    yPos += 6
    doc.text(`Insights: ${insights.length} key findings identified with actionable recommendations`, 25, yPos)
    yPos += 6
    doc.text(`Analysis: Trends, performance, and growth opportunities highlighted below`, 25, yPos)

    yPos += 20

    // ===== KEY METRICS GRID =====
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Key Performance Indicators', 20, yPos)

    yPos += 10

    insights.slice(0, 6).forEach((insight, idx) => {
        const col = idx % 2
        const row = Math.floor(idx / 2)

        const x = 20 + (col * 90)
        const y = yPos + (row * 25)

        doc.setFillColor(249, 250, 251)
        doc.roundedRect(x, y - 5, 85, 20, 2, 2, 'F')

        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 100, 100)
        doc.text(insight.title, x + 4, y)

        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        const value = String(insight.value || '—')
        doc.text(value, x + 4, y + 10)
    })

    yPos += Math.ceil(insights.slice(0, 6).length / 2) * 25 + 10

    // ===== PAGE 2: DETAILED ANALYSIS =====
    doc.addPage()
    yPos = 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Performance Breakdown', 20, yPos)

    yPos += 15

    if (data.length > 0) {
        const categoricalCols = columns.filter(col => {
            const uniqueVals = [...new Set(data.map(row => row[col]))]
            return uniqueVals.length > 1 && uniqueVals.length <= 20 && isNaN(parseFloat(data[0][col]))
        })

        const metricCols = columns.filter(col => !isNaN(parseFloat(data[0]?.[col])))

        if (categoricalCols.length > 0 && metricCols.length > 0) {
            const categoryCol = categoricalCols[0]
            const metricCol = metricCols[0]

            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text(`${metricCol} by ${categoryCol}`, 20, yPos)

            yPos += 10

            const breakdown: { [key: string]: number } = {}
            data.forEach(row => {
                const cat = String(row[categoryCol])
                const val = parseFloat(row[metricCol])
                if (!isNaN(val)) {
                    breakdown[cat] = (breakdown[cat] || 0) + val
                }
            })

            const sorted = Object.entries(breakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)

            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')

            sorted.forEach(([category, value], idx) => {
                if (yPos > 270) {
                    doc.addPage()
                    yPos = 20
                }

                // Rank
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(60, 60, 60)
                doc.text(`${idx + 1}.`, 25, yPos)

                // Category
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(0, 0, 0)
                const catText = category.length > 15 ? category.substring(0, 13) + '..' : category
                doc.text(catText, 32, yPos)

                // Value
                doc.setFont('helvetica', 'bold')
                doc.text(value.toLocaleString('en-IN'), 185, yPos, { align: 'right' })

                // COLORFUL BAR BELOW TEXT
                const maxVal = sorted[0][1]
                const barWidth = Math.max((value / maxVal) * 110, 3)
                const colors = [
                    [99, 102, 241],   // Indigo
                    [139, 92, 246],   // Purple  
                    [236, 72, 153],   // Pink
                    [59, 130, 246],   // Blue
                    [16, 185, 129],   // Green
                ]
                const color = colors[idx % colors.length]
                doc.setFillColor(color[0], color[1], color[2])
                doc.rect(32, yPos + 2, barWidth, 5, 'F')

                yPos += 12
            })
        }
    }

    // Business Insights Section
    yPos += 10
    if (yPos > 240) {
        doc.addPage()
        yPos = 20
    }

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Business Insights', 20, yPos)

    yPos += 10

    // Generate smart business insights
    const businessInsights = generateBusinessInsights(data, insights)

    businessInsights.forEach((insight, idx) => {
        if (yPos > 260) {
            doc.addPage()
            yPos = 20
        }

        const color = insight.color === 'green' ? [16, 185, 129] :
            insight.color === 'yellow' ? [245, 158, 11] :
                insight.color === 'red' ? [239, 68, 68] : [99, 102, 241]

        doc.setFillColor(color[0], color[1], color[2], 0.1)
        doc.roundedRect(20, yPos - 5, 170, insight.lines * 6 + 8, 2, 2, 'F')

        doc.setFillColor(color[0], color[1], color[2])
        doc.circle(27, yPos + 2, 3, 'F')

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(insight.title, 35, yPos)

        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(60, 60, 60)
        const lines = doc.splitTextToSize(insight.description, 150)
        doc.text(lines, 35, yPos + 6)

        yPos += insight.lines * 6 + 12
    })

    // ===== PAGE 3: RECOMMENDATIONS =====
    doc.addPage()
    yPos = 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Strategic Recommendations', 20, yPos)

    yPos += 15

    const recommendations = generateRecommendations(data, insights)

    recommendations.forEach((rec, idx) => {
        if (yPos > 250) {
            doc.addPage()
            yPos = 20
        }

        const color = rec.priority === 'High' ? [239, 68, 68] :
            rec.priority === 'Medium' ? [245, 158, 11] : [59, 130, 246]

        doc.setFillColor(color[0], color[1], color[2])
        doc.circle(27, yPos + 1, 4, 'F')
        doc.setFontSize(10)
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.text(String(idx + 1), 26, yPos + 3)

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(rec.title, 35, yPos + 2)

        doc.setFontSize(8)
        doc.setTextColor(color[0], color[1], color[2])
        doc.text(`[${rec.priority} Priority]`, 160, yPos + 2)

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(60, 60, 60)
        const lines = doc.splitTextToSize(rec.description, 155)
        doc.text(lines, 35, yPos + 8)

        yPos += 8 + (lines.length * 5) + 10
    })

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setDrawColor(200, 200, 200)
        doc.line(20, 284, 190, 284)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${totalPages}`, 20, 288)
        doc.text('Powered by DataGenie', 190, 288, { align: 'right' })
    }

    const filename = `${dataSourceName.replace(/\s+/g, '_')}_analysis.pdf`
    doc.save(filename)
}

// Generate business insights
function generateBusinessInsights(data: any[], insights: any[]) {
    const businessInsights = []

    // Growth opportunity
    if (data.length > 0) {
        const columns = Object.keys(data[0])
        const numericCols = columns.filter(col => !isNaN(parseFloat(data[0][col])))

        if (numericCols.length > 0) {
            businessInsights.push({
                title: 'Growth Opportunity',
                description: `Your data shows ${numericCols.length} revenue/performance metrics. Focus on the top performers to maximize ROI and scale winning strategies.`,
                color: 'green',
                lines: 2
            })
        }
    }

    // Data quality
    businessInsights.push({
        title: 'Data Quality',
        description: `Dataset contains ${data.length.toLocaleString()} records. Ensure data accuracy through regular validation to maintain reliable insights and decision-making.`,
        color: 'blue',
        lines: 2
    })

    // Competitive advantage
    businessInsights.push({
        title: 'Competitive Edge',
        description: `Use these insights to identify market trends early, optimize resource allocation, and make data-driven decisions faster than competitors.`,
        color: 'green',
        lines: 2
    })

    return businessInsights
}

// Generate recommendations
function generateRecommendations(data: any[], insights: any[]) {
    return [
        {
            title: 'Leverage Top Performers',
            description: `Analyze your highest-performing categories and double down on what works. Allocate more resources to proven winners.`,
            priority: 'High'
        },
        {
            title: 'Monitor Key Metrics Weekly',
            description: `Set up regular data updates to track trends. Early detection of changes helps you pivot quickly and stay ahead.`,
            priority: 'High'
        },
        {
            title: 'Identify Underperformers',
            description: `Look for categories or segments with low performance. Investigate root causes and either optimize or reallocate resources.`,
            priority: 'Medium'
        },
        {
            title: 'Use AI Chat for Deep Dives',
            description: `Ask specific questions using DataGenie's AI chat to uncover hidden patterns and get instant answers from your data.`,
            priority: 'Medium'
        },
        {
            title: 'Share Insights with Team',
            description: `Distribute this report to stakeholders. Data-driven alignment across teams leads to better execution and results.`,
            priority: 'Low'
        }
    ]
}
