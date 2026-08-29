import axios from 'axios'
import React, { createContext, useEffect, useState, useCallback } from 'react'

export const userDataContext = createContext()

function UserContext({ children }) {
    const serverUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"
    const [userData, setUserData] = useState(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    
    // Multimodal Vision attached image state
    const [attachedImage, setAttachedImage] = useState(null)

    // Chat sessions state
    const [chats, setChats] = useState([])
    const [activeChatId, setActiveChatId] = useState(null)
    const [activeChat, setActiveChat] = useState(null)
    const [activePersona, setActivePersona] = useState("ChatGPT Standard")
    const [voiceEnabled, setVoiceEnabled] = useState(true)

    // Document Knowledge & RAG State
    const [documents, setDocuments] = useState([])
    const [useRAG, setUseRAG] = useState(true)

    // Productivity Tasks & Personal Analytics State
    const [tasks, setTasks] = useState([])
    const [analytics, setAnalytics] = useState(null)

    const handleCurrentUser = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
            setUserData(result.data)
        } catch (error) {
            console.log("Current user fetch error:", error?.response?.data || error?.message)
            setUserData(null)
        } finally {
            setLoadingUser(false)
        }
    }

    // Fetch list of user chats
    const fetchUserChats = useCallback(async () => {
        if (!userData) return
        try {
            const res = await axios.get(`${serverUrl}/api/user/chats`, { withCredentials: true })
            setChats(res.data || [])
        } catch (err) {
            console.error("fetchUserChats error:", err)
        }
    }, [serverUrl, userData])

    // Fetch list of user documents
    const fetchUserDocuments = useCallback(async () => {
        if (!userData) return
        try {
            const res = await axios.get(`${serverUrl}/api/user/documents`, { withCredentials: true })
            setDocuments(res.data || [])
        } catch (err) {
            console.error("fetchUserDocuments error:", err)
        }
    }, [serverUrl, userData])

    // Fetch tasks
    const fetchUserTasks = useCallback(async () => {
        if (!userData) return
        try {
            const res = await axios.get(`${serverUrl}/api/user/tasks`, { withCredentials: true })
            setTasks(res.data || [])
        } catch (err) {
            console.error("fetchUserTasks error:", err)
        }
    }, [serverUrl, userData])

    // Fetch analytics
    const fetchUserAnalytics = useCallback(async () => {
        if (!userData) return
        try {
            const res = await axios.get(`${serverUrl}/api/user/analytics`, { withCredentials: true })
            setAnalytics(res.data)
        } catch (err) {
            console.error("fetchUserAnalytics error:", err)
        }
    }, [serverUrl, userData])

    // Task CRUD & AI Breakdown actions
    const createTask = async (taskPayload) => {
        try {
            const res = await axios.post(`${serverUrl}/api/user/tasks`, taskPayload, { withCredentials: true })
            setTasks(prev => [res.data, ...prev])
            fetchUserAnalytics()
            return res.data
        } catch (err) {
            console.error("createTask error:", err)
        }
    }

    const toggleTaskStatus = async (taskId) => {
        try {
            const res = await axios.put(`${serverUrl}/api/user/tasks/${taskId}/toggle`, {}, { withCredentials: true })
            setTasks(prev => prev.map(t => t._id === taskId ? res.data : t))
            fetchUserAnalytics()
        } catch (err) {
            console.error("toggleTaskStatus error:", err)
        }
    }

    const generateTaskBreakdown = async (taskId) => {
        try {
            const res = await axios.post(`${serverUrl}/api/user/tasks/${taskId}/breakdown`, {}, { withCredentials: true })
            setTasks(prev => prev.map(t => t._id === taskId ? res.data : t))
            return res.data
        } catch (err) {
            console.error("generateTaskBreakdown error:", err)
        }
    }

    const toggleSubtask = async (taskId, subtaskIdx) => {
        try {
            const res = await axios.put(`${serverUrl}/api/user/tasks/${taskId}/subtask/${subtaskIdx}`, {}, { withCredentials: true })
            setTasks(prev => prev.map(t => t._id === taskId ? res.data : t))
            fetchUserAnalytics()
        } catch (err) {
            console.error("toggleSubtask error:", err)
        }
    }

    const deleteTask = async (taskId) => {
        try {
            await axios.delete(`${serverUrl}/api/user/tasks/${taskId}`, { withCredentials: true })
            setTasks(prev => prev.filter(t => t._id !== taskId))
            fetchUserAnalytics()
        } catch (err) {
            console.error("deleteTask error:", err)
        }
    }

    // Upload Document file (FormData)
    const uploadDocumentFile = async (formData) => {
        try {
            const res = await axios.post(`${serverUrl}/api/user/documents/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            })
            fetchUserDocuments()
            fetchUserAnalytics()

            if (res.data?.analysis) {
                const analysisText = res.data.analysis
                const filename = res.data.document?.filename || "Uploaded PDF Document"
                await getGeminiResponse(`I have uploaded ${filename}. Please explain everything in detail: ${analysisText.substring(0, 100)}...`)
            }

            return res.data
        } catch (err) {
            console.error("uploadDocumentFile error:", err)
            throw err
        }
    }

    // Upload Raw Document text
    const uploadDocumentText = async (payload) => {
        try {
            const res = await axios.post(`${serverUrl}/api/user/documents/upload`, payload, { withCredentials: true })
            fetchUserDocuments()
            fetchUserAnalytics()

            if (res.data?.analysis) {
                await getGeminiResponse(`Explain the notes from ${payload.filename}: ${res.data.analysis.substring(0, 100)}...`)
            }

            return res.data
        } catch (err) {
            console.error("uploadDocumentText error:", err)
            throw err
        }
    }

    // Delete Document
    const deleteDocument = async (docId) => {
        try {
            await axios.delete(`${serverUrl}/api/user/documents/${docId}`, { withCredentials: true })
            setDocuments(prev => prev.filter(d => d._id !== docId))
            fetchUserAnalytics()
        } catch (err) {
            console.error("deleteDocument error:", err)
        }
    }

    // Load active chat by ID
    const selectChat = useCallback(async (chatId) => {
        if (!chatId) {
            setActiveChatId(null)
            setActiveChat(null)
            return
        }
        try {
            const res = await axios.get(`${serverUrl}/api/user/chats/${chatId}`, { withCredentials: true })
            setActiveChat(res.data)
            setActiveChatId(chatId)
            if (res.data?.persona) {
                setActivePersona(res.data.persona)
            }
        } catch (err) {
            console.error("selectChat error:", err)
        }
    }, [serverUrl])

    // Create a new empty chat session
    const createNewChatSession = useCallback(async (persona = activePersona) => {
        try {
            const res = await axios.post(`${serverUrl}/api/user/chats`, {
                title: "New Conversation",
                persona: persona
            }, { withCredentials: true })
            const newChat = res.data
            setChats(prev => [newChat, ...prev])
            setActiveChat(newChat)
            setActiveChatId(newChat._id)
            return newChat
        } catch (err) {
            console.error("createNewChatSession error:", err)
            return null
        }
    }, [serverUrl, activePersona])

    // Delete chat session
    const deleteChatSession = useCallback(async (chatId) => {
        try {
            await axios.delete(`${serverUrl}/api/user/chats/${chatId}`, { withCredentials: true })
            setChats(prev => prev.filter(c => c._id !== chatId))
            if (activeChatId === chatId) {
                setActiveChatId(null)
                setActiveChat(null)
            }
            fetchUserAnalytics()
        } catch (err) {
            console.error("deleteChatSession error:", err)
        }
    }, [serverUrl, activeChatId])

    // Clear all chats
    const clearAllChatSessions = useCallback(async () => {
        try {
            await axios.delete(`${serverUrl}/api/user/chats/all/clear`, { withCredentials: true })
            setChats([])
            setActiveChat(null)
            setActiveChatId(null)
            fetchUserAnalytics()
        } catch (err) {
            console.error("clearAllChatSessions error:", err)
        }
    }, [serverUrl])

    // Main AI Query trigger
    const getGeminiResponse = async (command, customChatId = activeChatId, persona = activePersona) => {
        try {
            const imageData = attachedImage ? {
                base64: attachedImage.base64,
                mimeType: attachedImage.mimeType
            } : null

            const result = await axios.post(`${serverUrl}/api/user/asktoassistant`, {
                command,
                chatId: customChatId,
                persona,
                useRAG: true,
                imageData
            }, { withCredentials: true })

            setAttachedImage(null)

            const data = result.data
            if (data?.chatId) {
                setActiveChatId(data.chatId)
                setActiveChat(prev => ({
                    ...prev,
                    _id: data.chatId,
                    title: data.chatTitle || prev?.title || "Conversation",
                    messages: data.messages
                }))
                fetchUserChats()
                fetchUserAnalytics()
                fetchUserTasks()
            }
            return data
        } catch (error) {
            console.error("Ask assistant error:", error?.response?.data || error?.message)
            return null
        }
    }

    useEffect(() => {
        handleCurrentUser()
    }, [])

    useEffect(() => {
        if (userData) {
            fetchUserChats()
            fetchUserDocuments()
            fetchUserTasks()
            fetchUserAnalytics()
        }
    }, [userData, fetchUserChats, fetchUserDocuments, fetchUserTasks, fetchUserAnalytics])

    const value = {
        serverUrl,
        userData,
        setUserData,
        loadingUser,
        backendImage,
        setBackendImage,
        frontendImage,
        setFrontendImage,
        attachedImage,
        setAttachedImage,
        getGeminiResponse,
        chats,
        activeChatId,
        activeChat,
        activePersona,
        setActivePersona,
        voiceEnabled,
        setVoiceEnabled,
        documents,
        useRAG,
        setUseRAG,
        tasks,
        analytics,
        fetchUserChats,
        fetchUserDocuments,
        fetchUserTasks,
        fetchUserAnalytics,
        createTask,
        toggleTaskStatus,
        generateTaskBreakdown,
        toggleSubtask,
        deleteTask,
        uploadDocumentFile,
        uploadDocumentText,
        deleteDocument,
        selectChat,
        createNewChatSession,
        deleteChatSession,
        clearAllChatSessions
    }

    return (
        <userDataContext.Provider value={value}>
            {children}
        </userDataContext.Provider>
    )
}

export default UserContext
