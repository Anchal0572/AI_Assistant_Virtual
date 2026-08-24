// import React, { useContext } from 'react'
// import { userDataContext } from '../context/UserContext'

// function Home() {

//   const {userData}=useContext(userDataContext)
//   return (
//     <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d]
//     flex justify-center items-center flex-col gap-[15px]'>

//       <button className='min-w-[150px] h-[60px] mt-[30px]  text-black font-semibold
//           bg-white rounded-full text-[19px]
//          ' disabled={loading}>{loading? "Loading...":"Sign Up"}</button>


//       <div className='w-[300px] h-[400px] flex justify-center
//       items-center overflow-hidden rounded-4xl shadow-lg' >
//         <img src={userData?.assistantImage} alt="" className='h-full object-cover'/>

//       </div>
//       <h1 className='text-white text-[18px] font-semibold '>I'm {userData?.assistantName}</h1>
//     </div>
//   )
// }

// export default Home





import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif"

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText, setUserText] = useState("")
  const [aiText, setAiText] = useState("")
  const [ham, setHam] = useState(false)

  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const userDataRef = useRef(userData)

  useEffect(() => {
    userDataRef.current = userData
  }, [userData])

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUserData(null)
      navigate("/signin")
    }
  }

  const startRecognition = useCallback(() => {
    if (!isSpeakingRef.current && !isRecognizingRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log("Recognition requested to start");
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
      }
    }
  }, [])

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en')) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    isSpeakingRef.current = true;

    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 600);
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 600);
    };

    window.speechSynthesis.speak(utterance);
  }, [startRecognition])

  const handleCommand = useCallback((data) => {
    if (!data) return;
    const { type, userInput, response } = data;
    if (response) {
      speak(response);
    }

    if (type === 'google-search') {
      const query = encodeURIComponent(userInput || "");
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
    if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
    if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    }
    if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    }
    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }
    if (type === "youtube-open") {
      window.open(`https://www.youtube.com/`, '_blank');
    }
    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput || "");
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }
  }, [speak])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognitionRef.current = recognition;
    let isMounted = true;

    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition requested to start");
        } catch (e) {
          if (e.name !== "InvalidStateError") {
            console.error(e);
          }
        }
      }
    }, 1000);

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
            try {
              recognition.start();
              console.log("Recognition restarted");
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
            try {
              recognition.start();
              console.log("Recognition restarted after error");
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      const currentAssistantName = (userDataRef.current?.assistantName || "Assistant").toLowerCase();
      const lower = transcript.toLowerCase();

      const isWakeWord = lower.includes(currentAssistantName);
      const isDirectCommand = /^(open|play|search|show|what|who|how|where|when|tell|get|time|date|weather|calculator|instagram|facebook|youtube|google)\b/i.test(lower) || lower.includes("youtube") || lower.includes("google") || lower.includes("instagram") || lower.includes("facebook");

      if (isWakeWord || isDirectCommand) {
        setAiText("");
        setUserText(transcript);
        try {
          recognition.stop();
        } catch {
          // ignore
        }
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        if (data) {
          handleCommand(data);
          setAiText(data.response || "");
        }
        setUserText("");
      }
    };

    const userName = userDataRef.current?.name || "there";
    if (window.speechSynthesis) {
      const greeting = new SpeechSynthesisUtterance(`Hello ${userName}, what can I help you with?`);
      greeting.lang = 'en-US';
      window.speechSynthesis.speak(greeting);
    }

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, [getGeminiResponse, handleCommand]);

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden relative'>
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer' onClick={()=>setHam(true)}/>
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform z-50`}>
        <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer' onClick={()=>setHam(false)}/>
        <button className='min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
        <button className='min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>

        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>

        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col'>
          {userData?.history?.map((his, index)=>(
            <div key={`history-mobile-${index}`} className='text-gray-200 text-[18px] w-full'>{his}</div>
          ))}
        </div>
      </div>

      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px] bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>
      
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage} alt="Assistant Avatar" className='h-full object-cover'/>
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
      
      <div className='flex flex-col items-center gap-2'>
        {!aiText && <img src={userImg} alt="Listening status" className='w-[200px]'/>}
        {aiText && <img src={aiImg} alt="Speaking status" className='w-[200px]'/>}
        <div className={`text-xs px-3 py-1 rounded-full ${listening ? 'bg-green-600/80 text-white' : 'bg-gray-700/80 text-gray-300'}`}>
          {listening ? '● Listening for wake word...' : '○ Mic Standby'}
        </div>
      </div>
    
      <h1 className='text-white text-[18px] font-semibold text-wrap text-center px-4 max-w-[800px]'>{userText ? userText : aiText ? aiText : null}</h1>
    </div>
  )
}

export default Home