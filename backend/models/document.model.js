import mongoose from "mongoose"

const chunkSchema = new mongoose.Schema({
    chunkId: Number,
    text: String,
    keywords: [String]
})

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        default: "txt"
    },
    rawText: {
        type: String,
        required: true
    },
    chunks: [chunkSchema]
}, {
    timestamps: true
})

const DocumentModel = mongoose.model("Document", documentSchema)
export default DocumentModel
