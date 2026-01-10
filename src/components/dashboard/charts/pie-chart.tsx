'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PieChartComponentProps {
    data: any[]
    nameKey: string
    valueKey: string
    title?: string
}

const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#ef4444', '#14b8a6']

export function PieChartComponent({ data, nameKey, valueKey, title }: PieChartComponentProps) {
    // Transform data for pie chart
    const pieData = data.map(item => ({
        name: item[nameKey],
        value: typeof item[valueKey] === 'number' ? item[valueKey] : parseFloat(item[valueKey]) || 0
    }))

    return (
        <div className="w-full h-full">
            {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                        stroke="rgba(0,0,0,0.5)"
                        strokeWidth={2}
                        paddingAngle={5}
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#e5e7eb' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
