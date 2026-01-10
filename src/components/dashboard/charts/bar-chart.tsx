'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BarChartComponentProps {
    data: any[]
    xKey: string
    yKey: string
    title?: string
}

export function BarChartComponent({ data, xKey, yKey, title }: BarChartComponentProps) {
    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey={xKey}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={{ stroke: '#d1d5db' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar
                        dataKey={yKey}
                        fill="#4f46e5"
                        radius={[8, 8, 0, 0]}
                        animationDuration={800}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
