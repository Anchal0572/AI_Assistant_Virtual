import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: "general"
    },
    actionData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        default: "New Chat"
    },
    persona: {
        type: String,
        default: "ChatGPT Standard"
    },
    messages: [messageSchema]
}, {
    timestamps: true
})

const Chat = mongoose.model("Chat", chatSchema)
export default Chat
