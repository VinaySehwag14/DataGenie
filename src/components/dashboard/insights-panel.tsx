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
            <div className="bg-white/5 rounded-2xl border border-white/10 p-8 flex items-center justify-center backdrop-blur-sm">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="ml-3 text-gray-400 text-sm">Finding insights...</span>
            </div>
        )
    }

    if (insights.length === 0) {
        return null
    }

    const colorMap: { [key: string]: string } = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        yellow: 'from-amber-400 to-yellow-500',
        purple: 'from-purple-500 to-purple-600',
        indigo: 'from-indigo-500 to-indigo-600',
        pink: 'from-pink-500 to-pink-600',
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <span className="text-xl animate-pulse">✨</span>
                <h2 className="text-lg font-bold text-white">Key Insights</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-indigo-500/30 transition-all duration-300 group card-3d"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <span className="text-2xl filter drop-shadow-md">{insight.icon}</span>
                            {insight.value && (
                                <span
                                    className={`px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg bg-gradient-to-r ${colorMap[insight.color] || colorMap.blue
                                        }`}
                                >
                                    {insight.value}
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{insight.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{insight.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
