// import React, { useContext } from 'react'
// import { Navigate, Route, Routes } from 'react-router-dom'
// import SignUp from './pages/SignUp'
// import SignIn from './pages/SignIn'
// import Customize from './pages/Customize'
// import { userDataContext } from './context/UserContext'
// import Home from './pages/Home'
// import Customize2 from './pages/Customize2'

// function App ()  {

//   const {userData,setUserData}=useContext(userDataContext)
//   return (
//     <Routes>
//       <Route path="/" element={<Home/>}/>
//       {/* <Route path='/Home' element={(userData?.assistantImage && userData.AssistantName)? <Home/>: <Navigate to={"/customize"}/>}/> */}
//       <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/customize"}/>}/>
//       <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
//         {/* <Route path='/customize' element={userData ?<Customize/>:<Navigate to={"/customize"}/>}/>   */}
//        <Route
//         path="/customize"
//         element={<Customize />}
//       /> 
//       {/* <Route path='/customize2' element={userData?<Customize2 />:<Navigate to={"/signup"}/>} /> */}

      
//       <Route path="/customize/customize2" element={<Customize2 />} />



//     </Routes>
//   )
// }

// export default App



// import React, { useContext } from 'react'
// import { Navigate, Route, Routes } from 'react-router-dom'
// import SignUp from './pages/SignUp'
// import SignIn from './pages/SignIn'
// import Customize from './pages/Customize'
// import { userDataContext } from './context/UserContext'
// import Home from './pages/Home'
// import Customize2 from './pages/Customize2'

// function App() {
//   const {userData,setUserData}=useContext(userDataContext)
//   return (
//    <Routes>
//      <Route path='/' element={(userData?.assistantImage && userData?.assistantName)? <Home/> :<Navigate to={"/customize"}/>}/>
//     <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
//      <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
//       <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signup"}/>}/>
//        <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signup"}/>}/>
//    </Routes>
//   )
// }

// export default App









import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import { userDataContext } from './context/UserContext'
import Home from './pages/Home'
import Customize2 from './pages/Customize2'

function App() {
  const { userData, loadingUser } = useContext(userDataContext)

  if (loadingUser) {
    return (
      <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center text-white text-[20px]'>
        Loading...
      </div>
    )
  }

  return (
   <Routes>
     <Route path='/' element={(userData?.assistantImage && userData?.assistantName) ? <Home/> : (userData ? <Navigate to="/customize" /> : <Navigate to="/signup" />)}/>
     <Route path='/signup' element={!userData ? <SignUp/> : <Navigate to={"/"}/>}/>
     <Route path='/signin' element={!userData ? <SignIn/> : <Navigate to={"/"}/>}/>
     <Route path='/customize' element={userData ? <Customize/> : <Navigate to={"/signup"}/>}/>
     <Route path='/customize2' element={userData ? <Customize2/> : <Navigate to={"/signup"}/>}/>
   </Routes>
  )
}

export default App