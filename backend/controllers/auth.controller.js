// import genToken from "../config/token.js"
// import User from "../models/user.model.js"
// import bcrypt from "bcryptjs"

//  export const signUp=async (req,res)=>{

//     try{
//         const {name,email,password}=req.body
        
//         const existEmail=await User.findOne({email})
//         if(existEmail){
//             return res.status(400).json({message:"email already exists !"})
//         }
//         if(password.length<6){
//             return res.status(400).json({message:"password must be atleast six characters !"})
//         }
//         const hashedPassword = await bcrypt.hash(password,10 )

//         const user = await User.create({
//             name,password:hashedPassword, email
//         })

//         const token = await genToken(user._id)

//         res.cookie("token",token,{
//             httpOnly: true,
//             maxAge:365*24*60*60*1000,
//             sameSite:"strict",
//             secure:false
//         })

//         return res.status(201).json(user)
//     }
//     catch(error){
//         return res.status(500).json({message:`sign up error ${error}`})
//     }
// }

//  export const Login=async (req,res)=>{

//     try{
//         const {email,password}=req.body
        
//         const user=await User.findOne({email})
//         if(!user){
//             return res.status(400).json({message:"email does not exists !"})
//         }
//         const isMatch =  await bcrypt.compare(password,user.password)

//         if(!isMatch){
//             return res.status(400).json({message:"incorrect password "})

//         }

        

        

//         const token = await genToken(user._id)

//         res.cookie("token",token,{
//             httpOnly: true,
//             maxAge:365*24*60*60*1000,
//             sameSite:"strict",
//             secure:false
//         })

//         return res.status(200).json(user)
//     }
//     catch(error){
//         return res.status(500).json({message:`login error ${error}`})
//     }
// }

// export const LogOut = async(req,res)=>{

//     try{
//         res.clearCookie("token")
//         return res.status(200).json({message:"log out successfully"})
//     }
//     catch(error){
//         return res.status(500).json({message:`logout error ${error}`})

//     }
// }


import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required!" })
        }

        const existEmail = await User.findOne({ email })
        if (existEmail) {
            return res.status(400).json({ message: "email already exists !" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 characters !" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name, password: hashedPassword, email
        })

        const token = await genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "None",
            secure: true
        })

        const userResponse = user.toObject()
        delete userResponse.password

        return res.status(201).json(userResponse)
    } catch (error) {
        console.error("signUp error:", error)
        return res.status(500).json({ message: `sign up error ${error?.message || error}` })
    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "email does not exists !" })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "incorrect password" })
        }

        const token = await genToken(user._id)

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "None",
            secure: true
        })

        const userResponse = user.toObject()
        delete userResponse.password

        return res.status(200).json(userResponse)
    } catch (error) {
        console.error("Login error:", error)
        return res.status(500).json({ message: `login error ${error?.message || error}` })
    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "log out successfully" })
    } catch (error) {
        console.error("logOut error:", error)
        return res.status(500).json({ message: `logout error ${error?.message || error}` })
    }
}
        
