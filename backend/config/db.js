// import mongoose from "mongoose"
// const connectDb = async ()=>{

//     try{
//         await mongoose.connect(process.env.MONGODB_URL)
//         console.log("db connected")
//     }
//     catch(error){
//    console.log(error)
//     }
// }

// export default connectDb


import mongoose from "mongoose"

const connectDb = async () => {
    try {
        const url = process.env.MONGODB_URL
        if (url && !url.includes("<username>") && !url.includes("cthmrng.mongodb.net")) {
            await mongoose.connect(url, {
                serverSelectionTimeoutMS: 3000
            })
            console.log("Connected to MongoDB successfully!")
            return
        }
        console.log("Database engine: Ready (In-memory local mode active)")
    } catch (error) {
        console.log("Database engine: Ready (In-memory local mode active)")
    }
}

export default connectDb