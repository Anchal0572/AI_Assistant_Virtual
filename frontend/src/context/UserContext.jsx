// import React, { createContext, useEffect, useState } from 'react'
// export const userDataContext = createContext()
// import axios from 'axios'

// function UserContext({children}) {
//     const serverUrl="http://localhost:8000"
//     const [userData,setUserData]=useState(null)
//      const [frontendImage,setFrontendImage]=useState(null)
//     const [backendImage,setBackendImage]=useState(null)
//     const[selectedImage,setSelectedImage]=useState(null)
    

//     const handleCurrentUser=async()=>{
//       try {
//         // const result = await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
//         const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
//         setUserData(result.data)
//         console.log(result.data)
//       } catch (error) {
//         console.log(error)
//       }
//     }
//     useEffect(()=>{
// handleCurrentUser()
//     },[])

//     const value={
//          serverUrl,userData,setUserData,backendImage,setBackendImage,
//          frontendImage,setFrontendImage,selectedImage,setSelectedImage
//     }
//   return (
//     <div>
//         <userDataContext.Provider value={value}>
//         {children}
//         </userDataContext.Provider>
//     </div>
//   )
// }

// export default UserContext





import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'

export const userDataContext = createContext()

function UserContext({children}) {
    const serverUrl = "http://localhost:8000"
    const [userData, setUserData] = useState(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [frontendImage, setFrontendImage] = useState(null)
    const [backendImage, setBackendImage] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)

    const handleCurrentUser = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/user/current`, {withCredentials: true})
            setUserData(result.data)
        } catch (error) {
            console.log("Current user fetch error:", error?.response?.data || error?.message)
            setUserData(null)
        } finally {
            setLoadingUser(false)
        }
    }

    const getGeminiResponse = async (command) => {
        try {
            const result = await axios.post(`${serverUrl}/api/user/asktoassistant`, {command}, {withCredentials: true})
            return result.data
        } catch (error) {
            console.error("Ask assistant error:", error?.response?.data || error?.message)
            return null
        }
    }

    useEffect(() => {
        handleCurrentUser()
    }, [])

    const value = {
        serverUrl,
        userData,
        setUserData,
        loadingUser,
        backendImage,
        setBackendImage,
        frontendImage,
        setFrontendImage,
        selectedImage,
        setSelectedImage,
        getGeminiResponse
    }

    return (
        <userDataContext.Provider value={value}>
            {children}
        </userDataContext.Provider>
    )
}

export default UserContext
