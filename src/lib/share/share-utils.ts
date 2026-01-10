// Share insights via WhatsApp
export function shareToWhatsApp(message: string) {
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message)

    // WhatsApp Web API
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`

    // Open in new tab
    window.open(whatsappUrl, '_blank')
}

// Share via Email
export function shareViaEmail(subject: string, body: string) {
    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(body)

    const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`

    window.location.href = mailtoUrl
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (err) {
        console.error('Failed to copy:', err)
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            return true
        } catch (fallbackErr) {
            console.error('Fallback copy failed:', fallbackErr)
            return false
        }
    }
}

// Format insights for sharing
export function formatInsightsForSharing(
    dataSourceName: string,
    insights: any[],
    appUrl: string
): string {
    const insightsList = insights
        .map(insight => `${insight.icon} ${insight.title}: ${insight.value}`)
        .join('\n')

    return `📊 *DataGenie Insights* - ${dataSourceName}

${insightsList}

✨ Powered by DataGenie
🔗 View full analysis: ${appUrl}`
}
