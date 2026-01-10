'use client'

import { useState } from 'react'
import { Download, Share2, FileDown, Mail, MessageSquare, Copy, Check, FileText } from 'lucide-react'
import { exportToCSV } from '@/lib/export/csv-exporter'
import { exportToPDF } from '@/lib/export/pdf-exporter'
import { shareToWhatsApp, shareViaEmail, copyToClipboard, formatInsightsForSharing } from '@/lib/share/share-utils'

interface ExportMenuProps {
    data: any[]
    dataSourceName: string
    insights?: any[]
}

export function ExportMenu({ data, dataSourceName, insights = [] }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [generatingPDF, setGeneratingPDF] = useState(false)

    const handleExportCSV = () => {
        exportToCSV(data, `${dataSourceName.replace(/\s+/g, '_')}.csv`)
        setIsOpen(false)
    }

    const handleExportPDF = async () => {
        setGeneratingPDF(true)
        try {
            await exportToPDF({
                dataSourceName,
                data,
                insights
            })
            setIsOpen(false)
        } catch (error) {
            console.error('Failed to generate PDF:', error)
            alert('Failed to generate PDF report')
        } finally {
            setGeneratingPDF(false)
        }
    }

    const handleShareWhatsApp = () => {
        const message = formatInsightsForSharing(
            dataSourceName,
            insights,
            window.location.href
        )
        shareToWhatsApp(message)
        setIsOpen(false)
    }

    const handleShareEmail = () => {
        const subject = `DataGenie Insights - ${dataSourceName}`
        const body = formatInsightsForSharing(
            dataSourceName,
            insights,
            window.location.href
        )
        shareViaEmail(subject, body)
        setIsOpen(false)
    }

    const handleCopyInsights = async () => {
        const text = formatInsightsForSharing(
            dataSourceName,
            insights,
            window.location.href
        )
        const success = await copyToClipboard(text)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="relative">
            {/* Main Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
                <Share2 className="w-4 h-4" />
                Export & Share
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                        {/* Export Section */}
                        <div className="p-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                                Export
                            </p>
                            <button
                                onClick={handleExportCSV}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
                            >
                                <FileDown className="w-4 h-4 text-green-600" />
                                Download as CSV
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={generatingPDF}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileText className="w-4 h-4 text-red-600" />
                                {generatingPDF ? 'Generating PDF...' : 'Download as PDF'}
                            </button>
                        </div>

                        <div className="border-t border-gray-200" />

                        {/* Share Section */}
                        <div className="p-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                                Share
                            </p>
                            <button
                                onClick={handleShareWhatsApp}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
                            >
                                <MessageSquare className="w-4 h-4 text-green-600" />
                                Share to WhatsApp
                            </button>
                            <button
                                onClick={handleShareEmail}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
                            >
                                <Mail className="w-4 h-4 text-blue-600" />
                                Share via Email
                            </button>
                            <button
                                onClick={handleCopyInsights}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-green-600">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 text-gray-600" />
                                        Copy Insights
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
