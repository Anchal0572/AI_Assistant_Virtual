// import { v2 as cloudinary } from 'cloudinary';
// import fs from "fs"


// const uploadOnCloudinary = async(filePath)=>{
//         cloudinary.config({ 
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_API_SECRET
//     });

//     try {
//         const uploadResult = await cloudinary.uploader
//        .upload(filePath )
//        fs.unlinkSync(filePath)
//        return uploadResult.secure_url
//     } catch (error) {
//              if(fs.existsSync(filePath)){
//                  fs.unlinkSync(filePath)
//              }
//              throw error;
//     }
// }
// export default uploadOnCloudinary









// xeyv34u2







import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

const uploadOnCloudinary = async (filePath) => {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET 
        });

        try {
            const uploadResult = await cloudinary.uploader.upload(filePath)
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            return uploadResult.secure_url
        } catch (error) {
            console.warn("Cloudinary upload failed, falling back to local static URL:", error?.message || error)
        }
    }

    const fileName = filePath.replace(/\\/g, '/').split('/').pop()
    const serverPort = process.env.PORT || 8000
    return `http://localhost:${serverPort}/public/${fileName}`
}

export default uploadOnCloudinary