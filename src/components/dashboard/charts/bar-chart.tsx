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
        <div className="w-full h-full">
            {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
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
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar
                        dataKey={yKey}
                        fill="#818cf8"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
