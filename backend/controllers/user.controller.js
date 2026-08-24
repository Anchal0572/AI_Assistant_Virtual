// import User from "../models/user.model.js"
// import uploadOnCloudinary from "../config/cloudinary.js"

// export const getCurrentUser = async (req,res)=>{
//     try {
//         const userId = req.userId
//         const user = await User.findById(userId).select("-password")
//         if(!user){
//             return res.status(400).json({message:"user not found "})
//         }

//         return res.status(200).json(user)

//     } catch (error) {
//         return res.status(400).json({message: "get current user error"})
//     }
// }


// export const updateAssistant = async (req,res)=>{
//     try {
//         const {AssistantName,imageUrl }=req.body
//         let assistantImage;
//         if(req.file){
//             assistantImage=await uploadOnCloudinary(req.file.path)
//         }
//         else {
//             assistantImage=imageUrl

//         }
//         const user= await User.findByIdAndUpdate(req.userId,{
//             assistantName: AssistantName,
//             assistantImage
//         },{new:true}).select("-password")
//         return res.status(200).json(user)

//     } catch (error) {
//           console.error(error)
//           return res.status(400).json({message: "updateAssistantError  user error"})
        
//     }
// }

import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"

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

export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body
        if (!command) {
            return res.status(400).json({ response: "Command is required" })
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ response: "User not found" })
        }

        user.history = user.history || []
        user.history.push(command)
        await user.save()

        const userName = user.name || "User"
        const assistantName = user.assistantName || "Assistant"
        const result = await geminiResponse(command, assistantName, userName)

        if (!result) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response: "I'm having trouble processing that right now."
            })
        }

        const jsonMatch = result.match(/{[\s\S]*}/)
        if (!jsonMatch) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response: result
            })
        }

        let gemResult;
        try {
            gemResult = JSON.parse(jsonMatch[0])
        } catch (parseErr) {
            return res.status(200).json({
                type: "general",
                userInput: command,
                response: result
            })
        }

        console.log("Parsed assistant response:", gemResult)
        const type = gemResult.type

        switch (type) {
            case 'get-date':
                return res.json({
                    type,
                    userInput: gemResult.userInput || command,
                    response: `current date is ${moment().format("YYYY-MM-DD")}`
                });
            case 'get-time':
                return res.json({
                    type,
                    userInput: gemResult.userInput || command,
                    response: `current time is ${moment().format("hh:mm A")}`
                });
            case 'get-day':
                return res.json({
                    type,
                    userInput: gemResult.userInput || command,
                    response: `today is ${moment().format("dddd")}`
                });
            case 'get-month':
                return res.json({
                    type,
                    userInput: gemResult.userInput || command,
                    response: `today is ${moment().format("MMMM")}`
                });
            case 'google-search':
            case 'youtube-search':
            case 'youtube-play':
            case 'general':
            case "calculator-open":
            case "instagram-open": 
            case "facebook-open": 
            case "weather-show":
                return res.json({
                    type,
                    userInput: gemResult.userInput || command,
                    response: gemResult.response,
                });

            default:
                return res.json({
                    type: "general",
                    userInput: command,
                    response: gemResult.response || "I didn't understand that command."
                })
        }
    } catch (error) {
        console.error("ask assistant error:", error)
        return res.status(500).json({ response: "ask assistant error" })
    }
}