import express from "express"
import { 
    getCurrentUser, 
    updateAssistant, 
    askToAssistant, 
    getUserChats, 
    createChat, 
    getChatById, 
    deleteChat, 
    clearAllChats,
    uploadDocument,
    getUserDocuments,
    deleteDocument,
    getUserTasks,
    createTask,
    toggleTaskStatus,
    generateTaskBreakdown,
    toggleSubtask,
    deleteTask,
    getUserAnalytics
} from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"

const userRouter = express.Router()

userRouter.get("/current", isAuth, getCurrentUser)
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant)
userRouter.post("/asktoassistant", isAuth, askToAssistant)

// Chat routes
userRouter.get("/chats", isAuth, getUserChats)
userRouter.post("/chats", isAuth, createChat)
userRouter.get("/chats/:id", isAuth, getChatById)
userRouter.delete("/chats/:id", isAuth, deleteChat)
userRouter.delete("/chats/all/clear", isAuth, clearAllChats)

// Document Knowledge Base & RAG routes
userRouter.post("/documents/upload", isAuth, upload.single("file"), uploadDocument)
userRouter.get("/documents", isAuth, getUserDocuments)
userRouter.delete("/documents/:id", isAuth, deleteDocument)

// Smart Productivity Suite & AI Breakdown routes
userRouter.get("/tasks", isAuth, getUserTasks)
userRouter.post("/tasks", isAuth, createTask)
userRouter.put("/tasks/:id/toggle", isAuth, toggleTaskStatus)
userRouter.post("/tasks/:id/breakdown", isAuth, generateTaskBreakdown)
userRouter.put("/tasks/:id/subtask/:subtaskIdx", isAuth, toggleSubtask)
userRouter.delete("/tasks/:id", isAuth, deleteTask)

// Personal Analytics Dashboard route
userRouter.get("/analytics", isAuth, getUserAnalytics)

export default userRouter
