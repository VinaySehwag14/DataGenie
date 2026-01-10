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
        <div className="w-full h-full">
            {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                        dataKey={xKey}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#e5e7eb' }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line
                        type="monotone"
                        dataKey={yKey}
                        stroke="#818cf8"
                        strokeWidth={4}
                        dot={{ fill: '#1e1b4b', stroke: '#818cf8', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#fff' }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
