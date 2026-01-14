'use client'

import { BarChartComponent } from '@/components/dashboard/charts/bar-chart'
import { LineChartComponent } from '@/components/dashboard/charts/line-chart'
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart'
import { AnalysisIntent } from '@/lib/ai/intent-types'
import { ChartNoAxesCombined } from 'lucide-react'

interface IntentChartRendererProps {
    intent: AnalysisIntent
    data: any[]
}

export function IntentChartRenderer({ intent, data }: IntentChartRendererProps) {
    if (!data || data.length === 0) return null

    // Helper: Determine chart type logic

    // 1. TREND -> Line Chart
    if (intent.type === 'TREND_ANALYSIS') {
        return (
            <LineChartComponent
                data={data}
                xKey="date"  // The query builder standardizes this to "date"
                yKey="value" // The query builder standardizes this to "value"
                title={`Trend of ${intent.metricColumn}`}
            />
        )
    }

    // 2. DISTRIBUTION -> Pie Chart (if small number of items) or Bar Chart
    if (intent.type === 'DISTRIBUTION') {
        // If too many items for a pie, fallback to bar
        if (data.length > 8) {
            return (
                <BarChartComponent
                    data={data}
                    xKey="label" // QBuilder standardizes to "label"
                    yKey="value"
                    title={`Distribution: ${intent.metricColumn} by ${intent.dimensionColumn}`}
                />
            )
        }
        return (
            <PieChartComponent
                data={data}
                nameKey="label"
                valueKey="value"
                title={`Distribution of ${intent.metricColumn}`}
            />
        )
    }

    // 3. TOP LIST -> Bar Chart
    if (intent.type === 'TOP_LIST') {
        return (
            <BarChartComponent
                data={data}
                xKey="label"
                yKey="value"
                title={`Top ${intent.limit} ${intent.dimensionColumn} by ${intent.metricColumn}`}
            />
        )
    }

    // 4. AGGREGATE -> If grouped, Bar Chart. If single number, no chart.
    if (intent.type === 'AGGREGATE_METRIC') {
        if (intent.groupByColumn) {
            return (
                <BarChartComponent
                    data={data}
                    xKey="group" // QBuilder standardizes to "group"
                    yKey="value"
                    title={`${intent.metricColumn} by ${intent.groupByColumn}`}
                />
            )
        }
        // Single value metric - no chart needed, the text response covers it
        return null
    }

    // 5. COMPARE (New) -> Bar Chart comparison 
    if (intent.type === 'COMPARE_METRIC') {
        return (
            <div className="w-full h-full">
                <BarChartComponent
                    data={data}
                    xKey="date"
                    yKey="current_value" // We visualize current value bars
                    title={`Comparison: ${intent.metricColumn} (${intent.period})`}
                />
                {/* Tip: In a real app we would use a grouped bar chart for Current vs Previous. 
                     For MVP, showing the "Current" bars is cleaner than crashing. */}
            </div>
        )
    }

    // 6. COHORT (New) -> Line Chart (Growth)
    if (intent.type === 'COHORT_ANALYSIS') {
        return (
            <LineChartComponent
                data={data}
                xKey="cohort_date"
                yKey="cohort_size"
                title={`Cohort Growth: ${intent.interval}ly`}
            />
        )
    }

    // Fallback or Unknown
    return (
        <div className="flex flex-col items-center justify-center h-48 bg-white/5 rounded-xl border border-white/10 border-dashed">
            <ChartNoAxesCombined className="w-8 h-8 text-gray-500 mb-2" />
            <p className="text-sm text-gray-400">Data available, but no specific chart matched.</p>
        </div>
    )
}
