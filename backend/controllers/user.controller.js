import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import Chat from "../models/chat.model.js"
import DocumentModel from "../models/document.model.js"
import Task from "../models/task.model.js"
import { chunkText, retrieveRelevantChunks, formatRAGPromptContext } from "../services/rag.service.js"
import moment from "moment"
import fs from "fs"
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const cleanAIResponseText = (rawResult, defaultCommand) => {
    if (!rawResult) return "I couldn't generate a response."
    let textStr = String(rawResult).trim()

    const jsonMatch = textStr.match(/{[\s\S]*}/)
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0])
            if (parsed && parsed.response) {
                textStr = parsed.response
            }
        } catch {
            // Keep original string
        }
    }

    textStr = textStr.replace(/\\n/g, '\n')
    return textStr
}

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        return res.status(200).json(user)     
    } catch (error) {
        console.error("getCurrentUser error:", error)
        return res.status(400).json({ message: "get current user error" }) 
    }
}

export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body
        let assistantImage;
        if (req.file) {
            assistantImage = await uploadOnCloudinary(req.file.path)
            if (!assistantImage) {
                return res.status(500).json({ message: "Cloudinary upload failed" })
            }
        } else {
            assistantImage = imageUrl
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            assistantName,
            assistantImage
        }, { new: true }).select("-password")
        return res.status(200).json(user)
    } catch (error) {
        console.error("updateAssistant error:", error)
        return res.status(400).json({ message: "updateAssistantError user error" }) 
    }
}

// Chat Session Controllers
export const getUserChats = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.userId }).sort({ updatedAt: -1 })
        return res.status(200).json(chats)
    } catch (error) {
        console.error("getUserChats error:", error)
        return res.status(500).json({ message: "Failed to fetch chat history" })
    }
}

export const createChat = async (req, res) => {
    try {
        const { title, persona } = req.body
        const newChat = new Chat({
            userId: req.userId,
            title: title || "New Conversation",
            persona: persona || "ChatGPT Standard",
            messages: []
        })
        await newChat.save()
        return res.status(201).json(newChat)
    } catch (error) {
        console.error("createChat error:", error)
        return res.status(500).json({ message: "Failed to create chat" })
    }
}

export const getChatById = async (req, res) => {
    try {
        const { id } = req.params
        const chat = await Chat.findOne({ _id: id, userId: req.userId })
        if (!chat) {
            return res.status(404).json({ message: "Chat session not found" })
        }
        return res.status(200).json(chat)
    } catch (error) {
        console.error("getChatById error:", error)
        return res.status(500).json({ message: "Failed to fetch chat details" })
    }
}

export const deleteChat = async (req, res) => {
    try {
        const { id } = req.params
        await Chat.findOneAndDelete({ _id: id, userId: req.userId })
        return res.status(200).json({ message: "Chat deleted successfully" })
    } catch (error) {
        console.error("deleteChat error:", error)
        return res.status(500).json({ message: "Failed to delete chat" })
    }
}

export const clearAllChats = async (req, res) => {
    try {
        await Chat.deleteMany({ userId: req.userId })
        return res.status(200).json({ message: "All chats cleared successfully" })
    } catch (error) {
        console.error("clearAllChats error:", error)
        return res.status(500).json({ message: "Failed to clear chats" })
    }
}

// TASK PRODUCTIVITY & AI GOAL PLANNING SUITE CONTROLLERS
export const getUserTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 })
        return res.status(200).json(tasks)
    } catch (error) {
        console.error("getUserTasks error:", error)
        return res.status(500).json({ message: "Failed to fetch tasks" })
    }
}

export const createTask = async (req, res) => {
    try {
        const { title, priority, category, dueDate, timeBlock, isHabit } = req.body
        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Task title is required" })
        }

        let autoPriority = priority || "Medium"
        const lowerTitle = title.toLowerCase()
        if (lowerTitle.includes("urgent") || lowerTitle.includes("important") || lowerTitle.includes("asap") || lowerTitle.includes("today")) {
            autoPriority = "High"
        }

        const newTask = new Task({
            userId: req.userId,
            title: title.trim(),
            priority: autoPriority,
            category: category || "General",
            dueDate: dueDate ? new Date(dueDate) : null,
            timeBlock: timeBlock || "Anytime",
            isHabit: Boolean(isHabit),
            streak: isHabit ? 1 : 0,
            completed: false
        })

        await newTask.save()
        return res.status(201).json(newTask)
    } catch (error) {
        console.error("createTask error:", error)
        return res.status(500).json({ message: "Failed to create task" })
    }
}

export const toggleTaskStatus = async (req, res) => {
    try {
        const { id } = req.params
        const task = await Task.findOne({ _id: id, userId: req.userId })
        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }
        task.completed = !task.completed
        if (task.isHabit && task.completed) {
            task.streak += 1
        }
        await task.save()
        return res.status(200).json(task)
    } catch (error) {
        console.error("toggleTaskStatus error:", error)
        return res.status(500).json({ message: "Failed to update task status" })
    }
}

// 1-Click AI Task Breakdown Generator
export const generateTaskBreakdown = async (req, res) => {
    try {
        const { id } = req.params
        const task = await Task.findOne({ _id: id, userId: req.userId })
        if (!task) {
            return res.status(404).json({ message: "Task not found" })
        }

        const prompt = `You are an AI Goal Planner. Break down the task "${task.title}" into 4 concise, practical, actionable subtasks/steps. Return ONLY a JSON array of strings e.g. ["Step 1", "Step 2", "Step 3", "Step 4"].`
        const rawRes = await geminiResponse(prompt, "Assistant", "User", "Productivity Coach")

        let steps = []
        const arrayMatch = rawRes.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
            try {
                steps = JSON.parse(arrayMatch[0])
            } catch {
                steps = ["Phase 1: Planning & Setup", "Phase 2: Core Implementation", "Phase 3: Testing & Debugging", "Phase 4: Final Review & Polish"]
            }
        } else {
            steps = ["Phase 1: Planning & Setup", "Phase 2: Core Implementation", "Phase 3: Testing & Debugging", "Phase 4: Final Review & Polish"]
        }

        task.subtasks = steps.map(s => ({ text: String(s), completed: false }))
        await task.save()

        return res.status(200).json(task)
    } catch (error) {
        console.error("generateTaskBreakdown error:", error)
        return res.status(500).json({ message: "Failed to generate AI breakdown" })
    }
}

export const toggleSubtask = async (req, res) => {
    try {
        const { id, subtaskIdx } = req.params
        const task = await Task.findOne({ _id: id, userId: req.userId })
        if (!task || !task.subtasks[subtaskIdx]) {
            return res.status(404).json({ message: "Subtask not found" })
        }

        task.subtasks[subtaskIdx].completed = !task.subtasks[subtaskIdx].completed
        const allCompleted = task.subtasks.every(s => s.completed)
        if (allCompleted) {
            task.completed = true
        }

        await task.save()
        return res.status(200).json(task)
    } catch (error) {
        console.error("toggleSubtask error:", error)
        return res.status(500).json({ message: "Failed to toggle subtask" })
    }
}

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params
        await Task.findOneAndDelete({ _id: id, userId: req.userId })
        return res.status(200).json({ message: "Task deleted successfully" })
    } catch (error) {
        console.error("deleteTask error:", error)
        return res.status(500).json({ message: "Failed to delete task" })
    }
}

// PERSONAL ANALYTICS DASHBOARD CONTROLLER
export const getUserAnalytics = async (req, res) => {
    try {
        const userId = req.userId
        const totalChats = await Chat.countDocuments({ userId })
        const chats = await Chat.find({ userId })
        
        let totalMessages = 0
        const topicCounts = { Coding: 0, Study: 0, Productivity: 0, General: 0 }

        chats.forEach(c => {
            totalMessages += c.messages?.length || 0
            if (c.persona === "Coding Master") topicCounts.Coding += c.messages.length
            else if (c.persona === "Study Assistant") topicCounts.Study += c.messages.length
            else if (c.persona === "Productivity Coach") topicCounts.Productivity += c.messages.length
            else topicCounts.General += c.messages.length
        })

        const totalTasks = await Task.countDocuments({ userId })
        const completedTasks = await Task.countDocuments({ userId, completed: true })
        const pendingTasks = totalTasks - completedTasks
        const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        const docsCount = await DocumentModel.countDocuments({ userId })

        return res.status(200).json({
            totalChats,
            totalMessages,
            totalTasks,
            completedTasks,
            pendingTasks,
            taskCompletionRate,
            docsCount,
            topicCounts,
            studyHours: Math.round(totalMessages * 0.15 * 10) / 10
        })
    } catch (error) {
        console.error("getUserAnalytics error:", error)
        return res.status(500).json({ message: "Failed to calculate analytics" })
    }
}

// DOCUMENT KNOWLEDGE BASE & REAL PDF PARSING CONTROLLERS
export const uploadDocument = async (req, res) => {
    try {
        let filename = req.body.filename || "document.txt"
        let rawText = req.body.text || ""
        let fileType = req.body.fileType || "txt"
        let fileBuffer = null

        if (req.file) {
            filename = req.file.originalname
            fileType = filename.split('.').pop().toLowerCase()
            fileBuffer = fs.readFileSync(req.file.path)

            if (fileType === "pdf") {
                try {
                    const pdfData = await pdfParse(fileBuffer)
                    rawText = pdfData.text || ""
                } catch (pdfErr) {
                    console.warn("PDF parse warning:", pdfErr?.message)
                }
            } else {
                try {
                    rawText = fileBuffer.toString('utf-8')
                } catch (txtErr) {
                    rawText = req.body.text || "Uploaded document text."
                }
            }
        }

        if (!rawText || !rawText.trim()) {
            rawText = `[Uploaded Document: ${filename}].`
        }

        const chunks = chunkText(rawText)

        const newDoc = new DocumentModel({
            userId: req.userId,
            filename,
            fileType,
            rawText,
            chunks
        })

        await newDoc.save()

        const user = await User.findById(req.userId)
        const userName = user?.name || "User"
        const assistantName = user?.assistantName || "Assistant"

        const pdfExplainPrompt = `Explain the following uploaded PDF document "${filename}" in exhaustive, in-depth detail. 
Extract key sections, numbers, results, subject names, marks, grades, or data tables if present. Provide a full structured summary in Hinglish/English with Markdown formatting.

DOCUMENT TEXT CONTENT:
${rawText.substring(0, 4000)}`

        const rawExplanation = await geminiResponse(pdfExplainPrompt, assistantName, userName, "Study Assistant")
        const parsedExplanation = cleanAIResponseText(rawExplanation, pdfExplainPrompt)

        return res.status(201).json({
            message: `Document "${filename}" parsed & analyzed successfully!`,
            document: newDoc,
            analysis: parsedExplanation
        })
    } catch (error) {
        console.error("uploadDocument error:", error)
        return res.status(500).json({ message: "Failed to upload, parse and index document" })
    }
}

export const getUserDocuments = async (req, res) => {
    try {
        const docs = await DocumentModel.find({ userId: req.userId }).select("-rawText").sort({ createdAt: -1 })
        return res.status(200).json(docs)
    } catch (error) {
        console.error("getUserDocuments error:", error)
        return res.status(500).json({ message: "Failed to fetch user documents" })
    }
}

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params
        await DocumentModel.findOneAndDelete({ _id: id, userId: req.userId })
        return res.status(200).json({ message: "Document deleted from knowledge base" })
    } catch (error) {
        console.error("deleteDocument error:", error)
        return res.status(500).json({ message: "Failed to delete document" })
    }
}

// Main AI Assistant Handler
export const askToAssistant = async (req, res) => {
    try {
        const { command, chatId, persona = "ChatGPT Standard", useRAG = false, imageData = null } = req.body
        if (!command && !imageData) {
            return res.status(400).json({ response: "Command or image is required" })
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ response: "User not found" })
        }

        user.history = user.history || []
        user.history.push(command || "Image Query")
        await user.save()

        // Auto-detect Task creation in chat (e.g. "remind me to...", "add task...")
        const lowerCmd = (command || "").toLowerCase()
        if (lowerCmd.includes("remind me to ") || lowerCmd.includes("add task ") || lowerCmd.includes("todo: ")) {
            let taskTitle = command.replace(/^(please\s+)?(remind\s+me\s+to\s+|add\s+task\s+|todo:\s*)/i, '').trim()
            if (taskTitle) {
                const autoTask = new Task({
                    userId: req.userId,
                    title: taskTitle,
                    priority: lowerCmd.includes("urgent") ? "High" : "Medium",
                    category: lowerCmd.includes("code") ? "Coding" : "General"
                })
                await autoTask.save()
            }
        }

        let chat = null
        if (chatId) {
            chat = await Chat.findOne({ _id: chatId, userId: req.userId })
        }

        const displayTitle = command ? (command.length > 30 ? command.substring(0, 30) + "..." : command) : "Image Vision Query"

        if (!chat) {
            chat = new Chat({
                userId: req.userId,
                title: displayTitle,
                persona: persona,
                messages: []
            })
        } else if (chat.title === "New Conversation" || chat.title === "New Chat") {
            chat.title = displayTitle
        }

        // Record User Message
        const userMsg = {
            sender: "user",
            text: command || "[Attached Image for Vision Analysis]",
            timestamp: new Date()
        }
        chat.messages.push(userMsg)

        const userName = user.name || "User"
        const assistantName = user.assistantName || "Assistant"
        
        // Context history for Gemini
        const historyContext = chat.messages.slice(0, -1)

        // Semantic RAG Context Retrieval (Checks User Documents)
        let ragContext = ""
        let retrievedSources = []
        if (useRAG || command) {
            const documents = await DocumentModel.find({ userId: req.userId })
            const relevantChunks = retrieveRelevantChunks(command, documents, 4)
            if (relevantChunks.length > 0) {
                ragContext = formatRAGPromptContext(relevantChunks)
                retrievedSources = relevantChunks.map(c => `${c.filename} [Chunk #${c.chunkId}]`)
            }
        }

        const rawResult = await geminiResponse(command || "Analyze this image and explain.", assistantName, userName, persona, historyContext, ragContext, imageData)

        let parsedType = "general"
        let parsedUserInput = command

        if (rawResult) {
            const jsonMatch = String(rawResult).match(/{[\s\S]*}/)
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0])
                    parsedType = parsed.type || "general"
                    parsedUserInput = parsed.userInput || command
                } catch {
                    // ignore
                }
            }
        }

        const finalResponseText = cleanAIResponseText(rawResult, command)

        // Record Assistant Message
        const assistantMsg = {
            sender: "assistant",
            text: finalResponseText,
            type: parsedType,
            actionData: {
                userInput: parsedUserInput,
                sources: retrievedSources
            },
            timestamp: new Date()
        }
        chat.messages.push(assistantMsg)
        await chat.save()

        return res.status(200).json({
            chatId: chat._id,
            chatTitle: chat.title,
            type: parsedType,
            userInput: parsedUserInput,
            response: finalResponseText,
            sources: retrievedSources,
            messages: chat.messages
        })

    } catch (error) {
        console.error("ask assistant error:", error)
        return res.status(500).json({ response: "An error occurred while communicating with the AI assistant." })
    }
}