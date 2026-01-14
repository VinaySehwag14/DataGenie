'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Database, Sparkles, CreditCard } from 'lucide-react'
import { IntentChartRenderer } from './intent-chart-renderer'
import { AnalysisIntent } from '@/lib/ai/intent-types'

interface Message {
    role: 'user' | 'assistant'
    content: string
    sql?: string
    data?: any[]
    intent?: AnalysisIntent // Added intent type
    error?: boolean
}

interface ChatInterfaceProps {
    dataSourceId: string
    dataSourceName: string
}

export function ChatInterface({ dataSourceId, dataSourceName }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hi! I'm your AI analyst. Ask me anything about "${dataSourceName}".`
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
        'What were total sales?',
        'Show me sales by product',
        'Which month had highest revenue?'
    ])
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch smart suggestions on mount
    useEffect(() => {
        fetchSuggestedQuestions()
    }, [dataSourceId])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchSuggestedQuestions = async () => {
        try {
            const response = await fetch(`/api/ai/suggestions?dataSourceId=${dataSourceId}`)
            const result = await response.json()

            if (result.suggestions && result.suggestions.length > 0) {
                setSuggestedQuestions(result.suggestions)
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error)
            // Keep default suggestions on error
        }
    }

    const handleSend = async () => {
        if (!input.trim() || loading) return

        const userMessage: Message = {
            role: 'user',
            content: input
        }

        // Add user message immediately
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    dataSourceId,
                    conversationHistory: messages.slice(1) // Exclude welcome message
                })
            })

            const result = await response.json()

            // Add AI response
            setMessages(prev => [...prev, result])
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                error: true
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-[600px] bg-transparent">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">AI Data Analyst</h3>
                        <p className="text-sm text-gray-400">Chat with your data</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 custom-scrollbar">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg backdrop-blur-sm border ${message.role === 'user'
                                ? 'bg-indigo-600/90 text-white border-indigo-500/50 rounded-tr-sm'
                                : message.error
                                    ? 'bg-red-900/20 text-red-200 border-red-500/30 rounded-tl-sm'
                                    : 'bg-white/10 text-gray-200 border-white/10 rounded-tl-sm'
                                }`}
                        >
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                            {/* Upgrade Prompt */}
                            {message.error && (message.content.includes('limit') || message.content.includes('upgrade')) && (
                                <div className="mt-4 pt-4 border-t border-red-500/20">
                                    <a
                                        href="/pricing"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-200 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        Upgrade to Pro <CreditCard className="w-4 h-4" />
                                    </a>
                                </div>
                            )}

                            {/* Show Chart if Intent + Data available */}
                            {message.intent && message.data && message.data.length > 0 && (
                                <div className="mt-4 mb-2 h-[320px] bg-black/40 rounded-xl border border-white/5 p-4">
                                    <IntentChartRenderer
                                        intent={message.intent}
                                        data={message.data}
                                    />
                                </div>
                            )}

                            {/* Show SQL if available */}
                            {message.sql && (
                                <details className="mt-3 text-sm group">
                                    <summary className="cursor-pointer text-indigo-300 hover:text-indigo-200 flex items-center gap-2">
                                        <Database className="w-3 h-3" /> View SQL Query
                                    </summary>
                                    <pre className="mt-2 p-3 bg-black/50 text-emerald-400 rounded-lg text-xs overflow-x-auto border border-white/5 font-mono">
                                        {message.sql}
                                    </pre>
                                </details>
                            )}

                            {/* Show data table if available */}
                            {message.data && message.data.length > 0 && (
                                <details className="mt-3 text-sm group">
                                    <summary className="cursor-pointer text-indigo-300 hover:text-indigo-200 flex items-center gap-2">
                                        <Database className="w-3 h-3" /> View Data Table
                                    </summary>
                                    <div className="mt-2 overflow-x-auto rounded-lg border border-white/10">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-white/5">
                                                <tr>
                                                    {Object.keys(message.data[0]).map((key, i) => (
                                                        <th key={i} className="px-3 py-2 text-left font-semibold text-gray-300 border-b border-white/10">
                                                            {key}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-black/20 divide-y divide-white/5">
                                                {message.data.slice(0, 10).map((row, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                                        {Object.values(row).map((value: any, j) => (
                                                            <td key={j} className="px-3 py-2 text-gray-300">
                                                                {typeof value === 'number'
                                                                    ? value.toLocaleString()
                                                                    : value?.toString() || '—'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {message.data.length > 10 && (
                                            <div className="px-3 py-2 bg-white/5 border-t border-white/10 text-xs text-gray-400">
                                                +{message.data.length - 10} more rows
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-3 border border-white/10">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                            <span className="text-gray-400 text-sm">Analyzing your data...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-md rounded-b-2xl">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question..."
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Suggested questions */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs text-indigo-300/80 font-medium py-1">Try asking:</span>
                    {suggestedQuestions.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => setInput(suggestion)}
                            disabled={loading}
                            className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-all disabled:opacity-50"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
