import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error('Missing GOOGLE_AI_API_KEY environment variable')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
    }
})

export async function generateText(prompt: string) {
    const result = await geminiModel.generateContent(prompt)
    return result.response.text()
}

export async function chatWithAI(messages: { role: string; content: string }[]) {
    const chat = geminiModel.startChat({
        history: messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        })),
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    return result.response.text()
}
