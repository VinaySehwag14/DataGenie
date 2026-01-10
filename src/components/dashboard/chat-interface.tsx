'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Database, Sparkles } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
    sql?: string
    data?: any[]
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
        <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-pink-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">AI Data Analyst</h3>
                        <p className="text-sm text-gray-600">Chat with your data</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-3 ${message.role === 'user'
                                ? 'bg-indigo-600 text-white'
                                : message.error
                                    ? 'bg-red-50 text-red-900 border border-red-200'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>

                            {/* Show SQL if available */}
                            {message.sql && (
                                <details className="mt-3 text-sm">
                                    <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                                        View SQL Query
                                    </summary>
                                    <pre className="mt-2 p-3 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
                                        {message.sql}
                                    </pre>
                                </details>
                            )}

                            {/* Show data table if available */}
                            {message.data && message.data.length > 0 && (
                                <div className="mt-3 overflow-x-auto">
                                    <table className="min-w-full text-sm border border-gray-300 rounded">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                {Object.keys(message.data[0]).map((key, i) => (
                                                    <th key={i} className="px-3 py-2 text-left font-semibold">
                                                        {key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {message.data.slice(0, 10).map((row, i) => (
                                                <tr key={i} className="border-t border-gray-300">
                                                    {Object.values(row).map((value: any, j) => (
                                                        <td key={j} className="px-3 py-2">
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
                                        <p className="text-xs text-gray-500 mt-2">
                                            +{message.data.length - 10} more rows
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                            <span className="text-gray-600">Analyzing...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about your data..."
                        disabled={loading}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Suggested questions */}
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500">Try:</span>
                    {suggestedQuestions.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => setInput(suggestion)}
                            disabled={loading}
                            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition disabled:opacity-50"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
