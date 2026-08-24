import axios from "axios"

const fallbackIntentParser = (command, assistantName, userName) => {
    const text = (command || "").trim()
    const lower = text.toLowerCase()

    // Strip assistant name if present
    const cleanLower = lower.replace(new RegExp(`\\b${assistantName.toLowerCase()}\\b`, 'gi'), '').trim()
    const cleanText = text.replace(new RegExp(`\\b${assistantName}\\b`, 'gi'), '').trim()

    // 1. Who created you / who made you
    if (cleanLower.includes("who created you") || cleanLower.includes("who made you") || cleanLower.includes("created by") || cleanLower.includes("tumhe kisne banaya") || cleanLower.includes("who are you")) {
        return JSON.stringify({
            type: "general",
            userInput: cleanText,
            response: `I am ${assistantName}, your virtual assistant created by ${userName}.`
        })
    }

    // 2. Date
    if (cleanLower.includes("date")) {
        return JSON.stringify({
            type: "get-date",
            userInput: cleanText,
            response: "Checking the date for you."
        })
    }

    // 3. Time
    if (cleanLower.includes("time")) {
        return JSON.stringify({
            type: "get-time",
            userInput: cleanText,
            response: "Checking the current time for you."
        })
    }

    // 4. Day
    if (cleanLower.includes("day")) {
        return JSON.stringify({
            type: "get-day",
            userInput: cleanText,
            response: "Checking today's day."
        })
    }

    // 5. Month
    if (cleanLower.includes("month")) {
        return JSON.stringify({
            type: "get-month",
            userInput: cleanText,
            response: "Checking the current month."
        })
    }

    // 6. Calculator
    if (cleanLower.includes("calculator")) {
        return JSON.stringify({
            type: "calculator-open",
            userInput: cleanText,
            response: "Opening calculator for you."
        })
    }

    // 7. Instagram
    if (cleanLower.includes("instagram")) {
        return JSON.stringify({
            type: "instagram-open",
            userInput: cleanText,
            response: "Opening Instagram for you."
        })
    }

    // 8. Facebook
    if (cleanLower.includes("facebook")) {
        return JSON.stringify({
            type: "facebook-open",
            userInput: cleanText,
            response: "Opening Facebook for you."
        })
    }

    // 9. Weather
    if (cleanLower.includes("weather")) {
        return JSON.stringify({
            type: "weather-show",
            userInput: cleanText,
            response: "Showing the weather forecast."
        })
    }

    // 10. YouTube Play
    if (cleanLower.startsWith("play ") || cleanLower.includes("play song") || cleanLower.includes("play video")) {
        const query = cleanText.replace(/^(please\s+)?play\s+/i, '').replace(/on youtube/i, '').trim()
        return JSON.stringify({
            type: "youtube-play",
            userInput: query || cleanText,
            response: `Sure, playing ${query || cleanText} on YouTube.`
        })
    }

    // 11. YouTube Open / Search
    if (cleanLower.includes("youtube")) {
        if (cleanLower.includes("open") || cleanLower === "youtube" || cleanLower === "open youtube") {
            return JSON.stringify({
                type: "youtube-open",
                userInput: "youtube",
                response: "Opening YouTube for you."
            })
        }
        const query = cleanText.replace(/^(search\s+(on\s+)?youtube\s+(for\s+)?|youtube\s+search\s+)/i, '').replace(/on youtube/i, '').replace(/open youtube/i, '').trim()
        return JSON.stringify({
            type: "youtube-search",
            userInput: query || cleanText,
            response: `Searching YouTube for ${query || cleanText}.`
        })
    }

    // 12. Google Search
    if (cleanLower.includes("google") || cleanLower.startsWith("search ")) {
        const query = cleanText.replace(/^(search\s+(on\s+)?google\s+(for\s+)?|google\s+search\s+|search\s+(for\s+)?)/i, '').replace(/on google/i, '').trim()
        return JSON.stringify({
            type: "google-search",
            userInput: query || cleanText,
            response: `Searching Google for ${query || cleanText}.`
        })
    }

    // General fallback
    return JSON.stringify({
        type: "general",
        userInput: cleanText,
        response: `Here is what I found about ${cleanText}.`
    })
}

const geminiResponse = async (command, assistantName, userName) => {
    try {
        const apiUrl = process.env.GEMINI_API_URL
        const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month"|"calculator-open" | "instagram-open" |"facebook-open" |"weather-show",
  "userInput": "<search query or clean input>",
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userInput": original query without assistant name, and if user asked to search google/youtube, extract only the search query.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question. Keep answer short and voice friendly.
- "google-search": if user wants to search something on Google.
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to open a calculator.
- "instagram-open": if user wants to open instagram.
- "facebook-open": if user wants to open facebook.
- "weather-show": if user wants to know weather.
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- If someone asks who made or created you, say you were created by ${userName}.
- Only respond with the JSON object, nothing else.

now your userInput- ${command}
`;

        if (!apiUrl) {
            return fallbackIntentParser(command, assistantName, userName)
        }

        const result = await axios.post(apiUrl, {
            "contents": [{
                "parts": [{ "text": prompt }]
            }]
        }, { timeout: 10000 })

        if (result?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.data.candidates[0].content.parts[0].text
        }
        return fallbackIntentParser(command, assistantName, userName)
    } catch (error) {
        console.warn("Gemini API error (using fallback parser):", error?.response?.data?.error?.message || error?.message)
        return fallbackIntentParser(command, assistantName, userName)
    }
}

export default geminiResponse