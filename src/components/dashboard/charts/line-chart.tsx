'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface LineChartComponentProps {
    data: any[]
    xKey: string
    yKey: string
    title?: string
}

export function LineChartComponent({ data, xKey, yKey, title }: LineChartComponentProps) {
    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}

            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
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
                    <Line
                        type="monotone"
                        dataKey={yKey}
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ fill: '#4f46e5', r: 5 }}
                        activeDot={{ r: 7 }}
                        animationDuration={800}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
