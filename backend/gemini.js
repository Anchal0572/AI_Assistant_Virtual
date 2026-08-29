import axios from "axios"

// Comprehensive Knowledge Synthesizer Fallback
const fallbackIntentParser = (command, assistantName, userName, persona = "ChatGPT Standard", ragContext = "", imageData = null) => {
    const text = (command || "").trim()
    const lower = text.toLowerCase()

    const cleanLower = lower.replace(new RegExp(`\\b${assistantName.toLowerCase()}\\b`, 'gi'), '').trim()
    const cleanText = text.replace(new RegExp(`\\b${assistantName}\\b`, 'gi'), '').trim()

    if (imageData) {
        return JSON.stringify({
            type: "general",
            userInput: cleanText || "Analyze image",
            response: `### 🖼️ Multimodal AI Vision Analysis

I have received your image attachment!

#### Image Processing Capabilities:
1. **Error Screenshot Debugging**: Paste code error screenshots for instant code fixes.
2. **Diagram & Architecture Analysis**: Upload flowcharts or system designs.
3. **Handwritten Notes OCR**: Convert handwritten notes into formatted text & summaries.
`
        })
    }

    // Creator check
    if (cleanLower.includes("who created you") || cleanLower.includes("who made you") || cleanLower.includes("created by") || cleanLower.includes("tumhe kisne banaya") || cleanLower.includes("who are you")) {
        return JSON.stringify({
            type: "general",
            userInput: cleanText,
            response: `I am **${assistantName}**, a next-generation Virtual AI Assistant created by **${userName}**. I am powered by advanced Multimodal Vision AI, Document RAG Knowledge, Voice Intelligence, and Smart Productivity Suite!`
        })
    }

    // System Actions
    if (cleanLower.includes("calculator") || cleanLower.includes("calc")) return JSON.stringify({ type: "calculator-open", userInput: cleanText, response: "Opening interactive calculator." })
    if (cleanLower.includes("weather")) return JSON.stringify({ type: "weather-show", userInput: cleanText, response: "Opening live weather forecast." })
    if (cleanLower.includes("instagram")) return JSON.stringify({ type: "instagram-open", userInput: cleanText, response: "Opening Instagram." })
    if (cleanLower.includes("facebook")) return JSON.stringify({ type: "facebook-open", userInput: cleanText, response: "Opening Facebook." })

    if (cleanLower.startsWith("play ") || cleanLower.includes("play song")) {
        const query = cleanText.replace(/^(please\s+)?play\s+/i, '').replace(/on youtube/i, '').trim()
        return JSON.stringify({ type: "youtube-play", userInput: query || cleanText, response: `Playing "${query || cleanText}" on YouTube.` })
    }

    if (cleanLower.includes("youtube")) {
        if (cleanLower.includes("open") || cleanLower === "youtube") return JSON.stringify({ type: "youtube-open", userInput: "youtube", response: "Opening YouTube." })
        const query = cleanText.replace(/^(search\s+(on\s+)?youtube\s+(for\s+)?|youtube\s+search\s+)/i, '').replace(/on youtube/i, '').trim()
        return JSON.stringify({ type: "youtube-search", userInput: query || cleanText, response: `Searching YouTube for "${query || cleanText}".` })
    }

    if (cleanLower.includes("google") || cleanLower.startsWith("search ")) {
        const query = cleanText.replace(/^(search\s+(on\s+)?google\s+(for\s+)?|google\s+search\s+|search\s+(for\s+)?)/i, '').replace(/on google/i, '').trim()
        return JSON.stringify({ type: "google-search", userInput: query || cleanText, response: `Searching Google for "${query || cleanText}".` })
    }

    // Dates / Times
    if (cleanLower.includes("date")) return JSON.stringify({ type: "get-date", userInput: cleanText, response: "Checking current date." })
    if (cleanLower.includes("time")) return JSON.stringify({ type: "get-time", userInput: cleanText, response: "Checking current time." })

    return JSON.stringify({
        type: "general",
        userInput: cleanText,
        response: `### 🧠 OmniMind AI Synthesis

Here is an analysis regarding **${cleanText}**:

For full in-depth responses, ask specific questions, upload documents for RAG Search, or attach images for Vision OCR & Screenshot Analysis!`
    })
}

const geminiResponse = async (command, assistantName, userName, persona = "ChatGPT Standard", history = [], ragContext = "", imageData = null) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY

        // Active Gemini models
        const endpoints = [
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`
        ]

        let personaInstruction = ""
        switch (persona) {
            case "Coding Master":
                personaInstruction = "You are Coding Master, an expert software architect. Provide complete code snippets, bug detection, time/space complexity analysis (O(N)), unit test case generation, and line-by-line explanations."
                break
            case "Study Assistant":
                personaInstruction = "You are a friendly AI Tutor. Break down topics in-depth with simple step-by-step explanations, key concepts, examples, and summaries."
                break
            case "Productivity Coach":
                personaInstruction = "You are a Productivity Coach. Help organize tasks, detect priorities, summarize goals, draft action plans, and optimize workflows."
                break
            case "Voice Assistant":
                personaInstruction = "You are a fast Voice Assistant. Provide concise, clear, and direct answers."
                break
            default:
                personaInstruction = "You are OmniMind AI, an advanced, highly intelligent AI language model created like ChatGPT. Answer user prompts in great depth with rich Markdown formatting, code snippets, lists, and headers."
        }

        const systemPrompt = `System Persona: ${personaInstruction}
Your name is ${assistantName}, created by ${userName}.

MULTILINGUAL & MULTIMODAL RULES:
1. Support natural conversations in English, Hindi, and Hinglish.
2. If an image is provided: Analyze screenshots, recognize code errors and provide exact fixes, transcribe handwritten notes, explain diagrams or charts.
${ragContext ? ragContext : ""}

CRITICAL FORMAT INSTRUCTIONS:
You MUST return ONLY a JSON object string. Do not wrap in extra markdown text outside the JSON.
Structure:
{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "youtube-open" | "get-time" | "get-date" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",
  "userInput": "<clean extracted query>",
  "response": "<YOUR FULL IN-DEPTH ANSWER HERE IN RICH MARKDOWN WITH CODE SNIPPETS, HEADERS, LISTS, VISION ANALYSIS, AND SOURCE CITATIONS IF APPLICABLE>"
}
`

        const contentsPayload = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: JSON.stringify({ type: "general", userInput: "system_init", response: "Understood. Ready for Multimodal Vision, Multilingual, and RAG operations." }) }] }
        ]

        // Memory history
        if (Array.isArray(history) && history.length > 0) {
            history.slice(-8).forEach(msg => {
                contentsPayload.push({
                    role: msg.sender === "user" ? "user" : "model",
                    parts: [{ text: msg.text || "" }]
                })
            })
        }

        // Current message parts (text + optional image inlineData)
        const userParts = []
        userParts.push({ text: command || "Analyze this image and explain." })

        if (imageData && imageData.base64 && imageData.mimeType) {
            userParts.push({
                inlineData: {
                    mimeType: imageData.mimeType,
                    data: imageData.base64
                }
            })
        }

        contentsPayload.push({
            role: "user",
            parts: userParts
        })

        // Try API endpoints
        for (const url of endpoints) {
            try {
                const result = await axios.post(url, { contents: contentsPayload }, { timeout: 18000 })
                const text = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                    return text
                }
            } catch (err) {
                console.warn(`Endpoint failed (${url.split('models/')[1]?.split(':')[0]}):`, err?.response?.data?.error?.message || err?.message)
            }
        }

        return fallbackIntentParser(command, assistantName, userName, persona, ragContext, imageData)
    } catch (error) {
        return fallbackIntentParser(command, assistantName, userName, persona, ragContext, imageData)
    }
}

export default geminiResponse