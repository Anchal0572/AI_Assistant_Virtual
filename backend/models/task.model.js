import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Medium"
    },
    completed: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        default: "General"
    },
    dueDate: {
        type: Date
    },
    timeBlock: {
        type: String,
        enum: ["Morning", "Afternoon", "Evening", "Anytime"],
        default: "Anytime"
    },
    subtasks: [{
        text: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }],
    isHabit: {
        type: Boolean,
        default: false
    },
    streak: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const Task = mongoose.model("Task", taskSchema)
export default Task
