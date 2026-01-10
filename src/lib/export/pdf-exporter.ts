import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PDFExportOptions {
    dataSourceName: string
    data: any[]
    insights?: any[]
    chartElements?: HTMLElement[]
}

export async function exportToPDF(options: PDFExportOptions) {
    const { dataSourceName, data, insights = [], chartElements = [] } = options

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    })

    let yPos = 20

    // ===== PAGE 1: HEADER & EXECUTIVE SUMMARY =====
    doc.setFillColor(99, 102, 241)
    doc.rect(0, 0, 210, 45, 'F')

    // Logo circle
    doc.setFillColor(255, 255, 255, 0.2)
    doc.circle(25, 22, 8, 'F')
    doc.setFillColor(255, 255, 255)
    doc.circle(25, 22, 6, 'F')
    doc.setFontSize(10)
    doc.setTextColor(99, 102, 241)
    doc.setFont('helvetica', 'bold')
    doc.text('DG', 21, 24)

    // Brand name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('DataGenie', 38, 25)

    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.text('Comprehensive Analytics Report', 38, 35)

    yPos = 60

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

    // Executive Summary
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

    doc.text(`Dataset Size: ${totalRecords.toLocaleString()} records analyzed`, 25, yPos)
    yPos += 6
    doc.text(`Dimensions: ${columns.length} fields including ${numericCols.length} metrics`, 25, yPos)
    yPos += 6
    doc.text(`Key insights identified: ${insights.length} actionable findings`, 25, yPos)
    yPos += 6
    doc.text(`Analysis includes trend detection, top performers, and opportunities`, 25, yPos)

    yPos += 20

    // Key Metrics Highlights
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Key Metrics at a Glance', 20, yPos)

    yPos += 10

    // Display insights in a grid
    insights.slice(0, 6).forEach((insight, idx) => {
        const col = idx % 2
        const row = Math.floor(idx / 2)

        const x = 20 + (col * 90)
        const y = yPos + (row * 25)

        // Box
        doc.setFillColor(249, 250, 251)
        doc.roundedRect(x, y - 5, 85, 20, 2, 2, 'F')

        // Title
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 100, 100)
        doc.text(insight.title, x + 4, y)

        // Value
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
    doc.text('Detailed Analysis', 20, yPos)

    yPos += 15

    // Analyze data for breakdowns
    if (data.length > 0) {
        // Find categorical columns
        const categoricalCols = columns.filter(col => {
            const uniqueVals = [...new Set(data.map(row => row[col]))]
            return uniqueVals.length > 1 && uniqueVals.length <= 20 && isNaN(parseFloat(data[0][col]))
        })

        // Find numeric columns
        const metricCols = columns.filter(col => !isNaN(parseFloat(data[0]?.[col])))

        if (categoricalCols.length > 0 && metricCols.length > 0) {
            const categoryCol = categoricalCols[0]
            const metricCol = metricCols[0]

            // Breakdown by category
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text(`Performance by ${categoryCol}`, 20, yPos)

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

                // Bar visualization
                const maxVal = sorted[0][1]
                const barWidth = (value / maxVal) * 120

                doc.setFillColor(99, 102, 241, 0.3)
                doc.rect(60, yPos - 4, barWidth, 6, 'F')

                doc.setTextColor(0, 0, 0)
                doc.text(`${idx + 1}. ${category}`, 25, yPos)
                doc.text(value.toLocaleString('en-IN'), 185, yPos, { align: 'right' })

                yPos += 8
            })
        }
    }

    // Top Performers
    yPos += 10
    if (yPos > 250) {
        doc.addPage()
        yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Top Performers', 20, yPos)

    yPos += 10

    const topInsights = insights.filter(i => i.type === 'top').slice(0, 3)
    topInsights.forEach(insight => {
        if (yPos > 265) {
            doc.addPage()
            yPos = 20
        }

        doc.setFillColor(16, 185, 129, 0.1)
        doc.roundedRect(20, yPos - 5, 170, 18, 2, 2, 'F')

        doc.setFillColor(16, 185, 129)
        doc.circle(27, yPos + 3, 3, 'F')

        // Show category name (now in value field)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`${insight.title}: ${insight.value}`, 35, yPos + 2)

        // Show numbers in description
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(60, 60, 60)
        doc.text(insight.description, 35, yPos + 9)

        yPos += 22
    })

    // ===== PAGE 3: RECOMMENDATIONS =====
    doc.addPage()
    yPos = 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Strategic Recommendations', 20, yPos)

    yPos += 15

    const recommendations = [
        {
            title: 'Focus on High Performers',
            desc: `Based on analysis, your top performers are driving significant value. Consider allocating more resources to these areas.`,
            priority: 'High'
        },
        {
            title: 'Address Data Gaps',
            desc: `Ensure data quality and completeness across all ${columns.length} dimensions for more accurate insights.`,
            priority: 'Medium'
        },
        {
            title: 'Monitor Trends',
            desc: `Set up regular monitoring dashboards to track changes in key metrics over time.`,
            priority: 'Medium'
        },
        {
            title: 'Leverage AI Chat',
            desc: `Use DataGenie's AI chat feature to ask specific questions and dig deeper into the data.`,
            priority: 'Low'
        }
    ]

    recommendations.forEach((rec, idx) => {
        if (yPos > 250) {
            doc.addPage()
            yPos = 20
        }

        const priorityColors: { [key: string]: number[] } = {
            'High': [239, 68, 68],
            'Medium': [245, 158, 11],
            'Low': [59, 130, 246]
        }
        const color = priorityColors[rec.priority] || [100, 100, 100]

        // Number circle
        doc.setFillColor(color[0], color[1], color[2])
        doc.circle(27, yPos + 1, 4, 'F')
        doc.setFontSize(10)
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.text(String(idx + 1), 26, yPos + 3)

        // Title
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(rec.title, 35, yPos + 2)

        // Priority badge
        doc.setFontSize(8)
        doc.setTextColor(color[0], color[1], color[2])
        doc.text(`[${rec.priority} Priority]`, 160, yPos + 2)

        // Description
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(60, 60, 60)
        const lines = doc.splitTextToSize(rec.desc, 155)
        doc.text(lines, 35, yPos + 8)

        yPos += 8 + (lines.length * 5) + 10
    })

    // Next Steps
    yPos += 10
    if (yPos > 250) {
        doc.addPage()
        yPos = 20
    }

    doc.setFillColor(254, 243, 199)
    doc.roundedRect(20, yPos - 5, 170, 35, 2, 2, 'F')

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Next Steps', 25, yPos)

    yPos += 7

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)

    const nextSteps = [
        '1. Review the findings and share with your team',
        '2. Download the CSV for detailed analysis in Excel',
        '3. Use AI Chat to explore specific questions',
        '4. Set up regular data updates to track progress'
    ]

    nextSteps.forEach(step => {
        doc.text(step, 30, yPos)
        yPos += 6
    })

    // Footer on all pages
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

    // Save
    const filename = `${dataSourceName.replace(/\s+/g, '_')}_analysis.pdf`
    doc.save(filename)
}
