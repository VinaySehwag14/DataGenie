'use client'

import { useEffect, useState } from 'react'

interface Insight {
    type: string
    title: string
    description: string
    value?: string | number
    icon: string
    color: string
}

interface InsightsPanelProps {
    dataSourceId: string
}

export function InsightsPanel({ dataSourceId }: InsightsPanelProps) {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchInsights()
    }, [dataSourceId])

    const fetchInsights = async () => {
        try {
            const response = await fetch(`/api/insights/${dataSourceId}`)
            const result = await response.json()

            if (result.insights) {
                setInsights(result.insights)
            }
        } catch (error) {
            console.error('Failed to fetch insights:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <span className="ml-3 text-gray-600">Analyzing your data...</span>
                </div>
            </div>
        )
    }

    if (insights.length === 0) {
        return null
    }

    const colorMap: { [key: string]: string } = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        yellow: 'from-yellow-500 to-yellow-600',
        purple: 'from-purple-500 to-purple-600',
        indigo: 'from-indigo-500 to-indigo-600',
        pink: 'from-pink-500 to-pink-600',
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <h2 className="text-xl font-semibold text-gray-900">Key Insights</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-3xl">{insight.icon}</span>
                            {insight.value && (
                                <span
                                    className={`px-3 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${colorMap[insight.color] || colorMap.blue
                                        }`}
                                >
                                    {insight.value}
                                </span>
                            )}
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
