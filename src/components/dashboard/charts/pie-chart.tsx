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
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={800}
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
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
