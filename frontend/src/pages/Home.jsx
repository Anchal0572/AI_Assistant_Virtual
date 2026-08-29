import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import userImg from "../assets/user.gif"
import MarkdownMessage from '../components/MarkdownMessage'
import { QuickActionModal } from '../components/QuickActionModal'
import { DocumentKnowledgeModal } from '../components/DocumentKnowledgeModal'
import { ProductivityModal } from '../components/ProductivityModal'
import { AnalyticsDashboardModal } from '../components/AnalyticsDashboardModal'

import { 
  FiPlus, 
  FiTrash2, 
  FiMessageSquare, 
  FiSend, 
  FiMic, 
  FiMicOff, 
  FiVolume2, 
  FiVolumeX, 
  FiLogOut, 
  FiSettings, 
  FiCpu, 
  FiZap,
  FiCode, 
  FiBookOpen,
  FiSliders,
  FiGrid,
  FiDownload,
  FiPaperclip,
  FiDatabase,
  FiCheckCircle,
  FiBriefcase,
  FiCheckSquare,
  FiTrendingUp,
  FiImage,
  FiX
} from 'react-icons/fi'
import { CgMenuRight } from "react-icons/cg"
import { RxCross1 } from "react-icons/rx"

const PERSONAS = [
  { id: "ChatGPT Standard", name: "OmniMind Standard", icon: FiZap, desc: "Versatile, intelligent & multilingual AI" },
  { id: "Coding Master", name: "Coding Expert", icon: FiCode, desc: "Clean code, debugging & tech advice" },
  { id: "Study Assistant", name: "Study Partner", icon: FiBookOpen, desc: "Simple step-by-step concept breakdowns" },
  { id: "Productivity Coach", name: "Productivity Coach", icon: FiBriefcase, desc: "Task planning, workflows & summaries" },
  { id: "Voice Assistant", name: "Voice Quick", icon: FiCpu, desc: "Fast concise voice-oriented replies" }
]

const PROMPT_SUGGESTIONS = [
  "🖼️ Attach an image/screenshot for Vision OCR analysis",
  "🐍 Write a Python script for web scraping",
  "📄 Summarize key points from my uploaded documents",
  "⚛️ Explain React hooks in Hinglish",
  "🧮 Open Calculator widget"
]

function Home() {
  const { 
    userData, 
    serverUrl, 
    setUserData, 
    getGeminiResponse,
    chats,
    activeChatId,
    activeChat,
    activePersona,
    setActivePersona,
    voiceEnabled,
    setVoiceEnabled,
    documents,
    useRAG,
    setUseRAG,
    attachedImage,
    setAttachedImage,
    tasks,
    analytics,
    createTask,
    toggleTaskStatus,
    generateTaskBreakdown,
    toggleSubtask,
    deleteTask,
    uploadDocumentFile,
    uploadDocumentText,
    deleteDocument,
    selectChat,
    createNewChatSession,
    deleteChatSession,
    clearAllChatSessions
  } = useContext(userDataContext)

  const navigate = useNavigate()
  
  // UI & Input states
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState("chat") // "chat" or "orb"
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speechRate, setSpeechRate] = useState(1.0)
  const [currentActionModal, setCurrentActionModal] = useState(null)
  const [showDocModal, setShowDocModal] = useState(false)
  const [showProductivityModal, setShowProductivityModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const chatBottomRef = useRef(null)
  const imageInputRef = useRef(null)
  const userDataRef = useRef(userData)

  useEffect(() => {
    userDataRef.current = userData
  }, [userData])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (viewMode === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChat?.messages, loading, viewMode])

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

  // Handle Image File Selection for Vision API
  const handleImageFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1]
      setAttachedImage({
        base64: base64Data,
        mimeType: file.type,
        previewUrl: reader.result,
        name: file.name
      })
    }
    reader.readAsDataURL(file)
  }

  // Text-To-Speech read out
  const speak = useCallback((text) => {
    if (!voiceEnabled || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    // Clean markdown symbols for natural speech
    const cleanSpeechText = text
      .replace(/```[\s\S]*?```/g, "Code snippet output.")
      .replace(/[#*`_~-]/g, "")
      .slice(0, 350);

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.lang = 'en-US';
    utterance.rate = speechRate;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en')) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    isSpeakingRef.current = true;

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, speechRate])

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      isSpeakingRef.current = false
    }
  }

  // Process assistant action command
  const handleCommandAction = useCallback((data) => {
    if (!data) return;
    const { type, userInput, response } = data;

    if (response) {
      speak(response);
    }

    if (['calculator-open', 'weather-show', 'youtube-search', 'youtube-play', 'youtube-open', 'google-search', 'instagram-open', 'facebook-open'].includes(type)) {
      setCurrentActionModal({ type, actionData: { userInput } });
    }
  }, [speak])

  // Handle message submit
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText
    if ((!query || !query.trim()) && !attachedImage || loading) return

    setInputText("")
    setLoading(true)

    try {
      const data = await getGeminiResponse(query, activeChatId, activePersona)
      if (data) {
        handleCommandAction(data)
      }
    } catch (err) {
      console.error("Submit message error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Export Chat Thread to Markdown
  const exportChat = () => {
    if (!activeChat || !activeChat.messages || activeChat.messages.length === 0) return
    let content = `# Conversation: ${activeChat.title || 'Chat'}\nDate: ${new Date().toLocaleString()}\nPersona: ${activeChat.persona}\n\n---\n\n`
    activeChat.messages.forEach(msg => {
      const role = msg.sender === 'user' ? 'User' : (userData?.assistantName || 'OmniMind AI')
      content += `### 👤 ${role}\n${msg.text}\n\n`
    })

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(activeChat.title || 'chat').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Speech Recognition hook with Wake Word check
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
    };

    recognition.onresult = (e) => {
      let transcript = e.results[0][0].transcript.trim();
      if (!transcript) return;

      if (/^hey\s+(jarvis|assistant)/i.test(transcript)) {
        transcript = transcript.replace(/^hey\s+(jarvis|assistant)\s*/i, '').trim()
      }

      setInputText(transcript);
      handleSendMessage(transcript);
    };
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return
    if (listening) {
      try { recognitionRef.current.stop() } catch {}
      setListening(false)
    } else {
      stopSpeaking()
      try { recognitionRef.current.start() } catch (err) { console.error(err) }
    }
  }

  return (
    <div className="w-full h-screen bg-[#070b12] text-slate-100 flex overflow-hidden font-sans">
      
      {/* Quick Action Modal Widget */}
      {currentActionModal && (
        <QuickActionModal
          type={currentActionModal.type}
          actionData={currentActionModal.actionData}
          onClose={() => setCurrentActionModal(null)}
        />
      )}

      {/* Document Knowledge Base Modal */}
      {showDocModal && (
        <DocumentKnowledgeModal
          documents={documents}
          onUploadFile={uploadDocumentFile}
          onUploadText={uploadDocumentText}
          onDeleteDoc={deleteDocument}
          onClose={() => setShowDocModal(false)}
        />
      )}

      {/* Smart Productivity Suite Modal */}
      {showProductivityModal && (
        <ProductivityModal
          tasks={tasks}
          onCreateTask={createTask}
          onToggleTask={toggleTaskStatus}
          onGenerateBreakdown={generateTaskBreakdown}
          onToggleSubtask={toggleSubtask}
          onDeleteTask={deleteTask}
          onAskAIHelp={(promptText) => {
            setShowProductivityModal(false)
            handleSendMessage(promptText)
          }}
          onClose={() => setShowProductivityModal(false)}
        />
      )}

      {/* Personal Analytics Dashboard Modal */}
      {showAnalyticsModal && (
        <AnalyticsDashboardModal
          analytics={analytics}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className={`fixed lg:relative z-40 top-0 left-0 h-full w-72 bg-[#0c101c] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Top Header & New Chat Button */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/60 border border-cyan-400/30">
                <FiZap className="text-white text-lg animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wide text-white block leading-none">OmniMind AI</span>
                <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">Multimodal Studio</span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <RxCross1 size={20} />
            </button>
          </div>

          <button
            onClick={() => {
              createNewChatSession(activePersona)
              if (window.innerWidth < 1024) setSidebarOpen(false)
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:opacity-95 text-white font-bold shadow-lg shadow-cyan-950/50 transition active:scale-[0.98] cursor-pointer"
          >
            <FiPlus size={18} />
            <span>New Chat Thread</span>
          </button>

          {/* Quick Module Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => setShowProductivityModal(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#131928] hover:bg-[#182035] border border-slate-700/80 text-blue-300 text-xs font-semibold transition cursor-pointer"
            >
              <FiCheckSquare size={14} className="text-blue-400" />
              <span>To-Do List</span>
            </button>

            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#131928] hover:bg-[#182035] border border-slate-700/80 text-emerald-300 text-xs font-semibold transition cursor-pointer"
            >
              <FiTrendingUp size={14} className="text-emerald-400" />
              <span>Analytics</span>
            </button>
          </div>

          <button
            onClick={() => setShowDocModal(true)}
            className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[#131928] hover:bg-[#182035] border border-slate-700/80 text-cyan-300 text-xs font-semibold transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FiDatabase size={15} className="text-cyan-400" />
              <span>Smart Document Vault</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
              {documents?.length || 0} Docs
            </span>
          </button>

          {/* Persona Selector Dropdown */}
          <div className="mt-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <FiSliders size={12} className="text-cyan-400" /> AI Persona Mode
            </label>
            <select
              value={activePersona}
              onChange={(e) => setActivePersona(e.target.value)}
              className="w-full bg-[#131929] border border-slate-700/80 text-cyan-300 text-sm font-semibold rounded-xl p-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-inner"
            >
              {PERSONAS.map(p => (
                <option key={p.id} value={p.id} className="bg-[#0f1422] text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Saved Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Saved Conversations
          </div>

          {chats.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No saved conversations yet. Start asking questions!
            </div>
          ) : (
            chats.map(chat => {
              const isActive = chat._id === activeChatId
              return (
                <div
                  key={chat._id}
                  onClick={() => {
                    selectChat(chat._id)
                    if (window.innerWidth < 1024) setSidebarOpen(false)
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition text-sm ${
                    isActive 
                      ? 'bg-cyan-950/40 border border-cyan-500/50 text-white font-medium shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[190px]">
                    <FiMessageSquare className={isActive ? "text-cyan-400 flex-shrink-0" : "text-gray-400 flex-shrink-0"} />
                    <span className="truncate">{chat.title || "Chat"}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChatSession(chat._id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition"
                    title="Delete Chat"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Bottom User Actions */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090d17] flex flex-col gap-2">
          {chats.length > 0 && (
            <button
              onClick={clearAllChatSessions}
              className="w-full text-xs text-gray-400 hover:text-red-400 py-1 flex items-center justify-center gap-1 transition"
            >
              <FiTrash2 size={12} /> Clear all history
            </button>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 truncate">
              <img
                src={userData?.assistantImage || userImg}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{userData?.name || "User"}</p>
                <p className="text-[10px] text-cyan-400 font-medium truncate">{userData?.assistantName || "Assistant"}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate("/customize")}
                className="p-2 text-gray-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition"
                title="Customize Assistant"
              >
                <FiSettings size={16} />
              </button>
              <button
                onClick={handleLogOut}
                className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                title="Log Out"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full bg-[#070b12] relative overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0c101c]/90 backdrop-blur-md px-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <CgMenuRight size={22} />
            </button>
            
            <div className="flex items-center gap-2.5">
              <img
                src={userData?.assistantImage || aiImg}
                alt="Assistant"
                className="w-8 h-8 rounded-full object-cover border border-cyan-400/60 shadow-md"
              />
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{userData?.assistantName || "OmniMind Assistant"}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {activePersona}
                  </span>
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* RAG Mode Toggle Switch */}
            <button
              onClick={() => setUseRAG(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                useRAG 
                  ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/50' 
                  : 'bg-slate-800/60 border-slate-700 text-gray-400'
              }`}
              title="Toggle Document Search Mode"
            >
              <FiDatabase size={14} className={useRAG ? "text-cyan-400 animate-pulse" : ""} />
              <span>{useRAG ? "Doc Vault Search: ON" : "Doc Search Off"}</span>
            </button>

            {/* Export Chat Button */}
            {activeChat?.messages?.length > 0 && (
              <button
                onClick={exportChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                title="Export Chat to Markdown"
              >
                <FiDownload size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}

            {/* Audio Voice Readout & Speed Toggle */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setVoiceEnabled(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition ${
                  voiceEnabled
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-gray-400 hover:text-white'
                }`}
                title={voiceEnabled ? "Voice Output Active" : "Voice Output Muted"}
              >
                {voiceEnabled ? <FiVolume2 size={15} /> : <FiVolumeX size={15} />}
                <span className="hidden sm:inline">{voiceEnabled ? "Voice On" : "Muted"}</span>
              </button>
              
              {voiceEnabled && (
                <button
                  onClick={() => setSpeechRate(r => (r === 1.0 ? 1.25 : r === 1.25 ? 1.5 : 1.0))}
                  className="px-2 py-1.5 text-[11px] font-mono text-cyan-400 border-l border-slate-700 hover:bg-slate-700 transition"
                  title="Speech Speed"
                >
                  {speechRate}x
                </button>
              )}
            </div>

            {/* View Mode Switcher (Chat vs Voice Orb) */}
            <button
              onClick={() => setViewMode(prev => (prev === 'chat' ? 'orb' : 'chat'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/50 text-blue-200 text-xs font-semibold transition"
            >
              <FiGrid size={14} />
              <span className="hidden sm:inline">{viewMode === 'chat' ? 'Voice Orb View' : 'Workspace View'}</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CHAT VIEW */}
        {viewMode === 'chat' ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
            
            {/* MESSAGES DISPLAY */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
              {(!activeChat?.messages || activeChat.messages.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-cyan-900/50 border border-cyan-400/30">
                    <FiZap className="text-white text-3xl animate-bounce" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                    OmniMind AI Core
                  </h1>
                  <p className="text-slate-400 text-sm max-w-md mb-8">
                    Multimodal Vision AI (attach screenshots/error images), Document RAG Knowledge Search, To-Do Planner, & Multilingual support!
                  </p>

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                    {PROMPT_SUGGESTIONS.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug.replace(/^[^\w]+/, '').trim())}
                        className="py-2.5 px-4 rounded-xl bg-[#111726] hover:bg-[#161f33] border border-slate-700/80 text-slate-200 text-xs font-medium transition cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                activeChat.messages.map((msg, index) => {
                  const isUser = msg.sender === 'user'
                  return (
                    <div
                      key={`msg-${index}`}
                      className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <img
                          src={userData?.assistantImage || aiImg}
                          alt="AI"
                          className="w-8 h-8 rounded-full object-cover border border-cyan-500/50 flex-shrink-0 mt-1 shadow"
                        />
                      )}

                      <div className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-xl leading-relaxed text-sm ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-[#101624] border border-slate-800/90 text-slate-100 rounded-tl-none'
                      }`}>
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          <div>
                            <MarkdownMessage content={msg.text} />

                            {/* Render Source Citation Badges if RAG was used */}
                            {msg.actionData?.sources?.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                                <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
                                  <FiCheckCircle size={12} /> Sources Cited:
                                </span>
                                {msg.actionData.sources.map((src, sIdx) => (
                                  <span key={sIdx} className="px-2 py-0.5 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-mono text-[10px]">
                                    📄 {src}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <span className={`block text-[10px] mt-2 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {isUser && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1 shadow">
                          {userData?.name ? userData.name[0].toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                  )
                })
              )}

              {loading && (
                <div className="flex gap-3 items-center text-cyan-400 text-sm animate-pulse py-2">
                  <img src={aiImg} alt="Thinking" className="w-7 h-7 rounded-full" />
                  <span>Synthesizing response & processing pixels...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* INPUT CONTROLS BAR */}
            <div className="p-3 sm:p-4 bg-[#0c101c]/90 border-t border-slate-800/80 backdrop-blur-md">
              
              {/* Attached Image Preview Chip */}
              {attachedImage && (
                <div className="max-w-4xl mx-auto mb-2 flex items-center gap-2 p-2 bg-[#131929] border border-cyan-500/40 rounded-xl w-fit">
                  <img src={attachedImage.previewUrl} alt="Upload preview" className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                  <div className="text-xs">
                    <p className="font-semibold text-white truncate max-w-[200px]">{attachedImage.name}</p>
                    <p className="text-[10px] text-cyan-400">Attached for Vision AI Analysis</p>
                  </div>
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="p-1 text-gray-400 hover:text-red-400 rounded-lg ml-2"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}

              <div className="max-w-4xl mx-auto flex items-end gap-2 bg-[#131929] border border-slate-700/80 rounded-2xl p-2 focus-within:border-cyan-500 transition shadow-xl">
                
                {/* Hidden File Input for Multimodal Vision Image */}
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                {/* Attach Image Button */}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition"
                  title="Attach Image/Screenshot for AI Vision OCR Analysis"
                >
                  <FiImage size={18} />
                </button>

                {/* Document Knowledge Attachment Button */}
                <button
                  onClick={() => setShowDocModal(true)}
                  className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition relative"
                  title="Upload Document to Knowledge Base"
                >
                  <FiPaperclip size={18} />
                  {documents?.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                      {documents.length}
                    </span>
                  )}
                </button>

                {/* Textarea */}
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder={attachedImage ? "Ask something about the attached image..." : `Ask ${userData?.assistantName || "OmniMind"} anything...`}
                  rows={1}
                  className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none resize-none px-3 py-2 max-h-32 min-h-[40px]"
                />

                {/* Speech Microphone Button */}
                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl transition ${
                    listening 
                      ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/50' 
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title={listening ? "Listening... Click to stop" : "Start Voice Input ('Hey Assistant')"}
                >
                  {listening ? <FiMicOff size={18} /> : <FiMic size={18} />}
                </button>

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={(!inputText.trim() && !attachedImage) || loading}
                  className={`p-2.5 rounded-xl transition ${
                    (inputText.trim() || attachedImage) && !loading
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold cursor-pointer shadow-lg shadow-cyan-950/50 hover:opacity-90'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <FiSend size={18} />
                </button>
              </div>

              <p className="text-[11px] text-gray-500 text-center mt-2">
                OmniMind AI Core — Multimodal Vision, Document RAG Knowledge, & Productivity Suite.
              </p>
            </div>

          </div>
        ) : (
          /* CLASSIC VOICE ORB VIEW */
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <div className="relative mb-6">
              <div className="w-56 h-72 sm:w-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border-2 border-cyan-500/40 relative">
                <img src={userData?.assistantImage || aiImg} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">I'm {userData?.assistantName || "Assistant"}</h1>
            <p className="text-cyan-400 text-sm font-medium mb-6">Mode: {activePersona}</p>

            <div className="flex flex-col items-center gap-3 mb-6">
              {listening ? (
                <img src={userImg} alt="Listening" className="w-40 h-20 object-contain" />
              ) : (
                <img src={aiImg} alt="Standby" className="w-40 h-20 object-contain" />
              )}
              
              <div className={`px-4 py-1.5 rounded-full text-xs font-semibold ${listening ? 'bg-green-600/80 text-white animate-pulse' : 'bg-slate-800 text-gray-400'}`}>
                {listening ? '● Listening... Say your prompt' : '○ Mic Standby (Say "Hey Assistant" or click mic)'}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full shadow-2xl transition transform active:scale-95 ${
                  listening ? 'bg-red-600 text-white animate-pulse' : 'bg-cyan-500 text-black hover:bg-cyan-400'
                }`}
              >
                <FiMic size={24} />
              </button>

              <button
                onClick={() => setViewMode('chat')}
                className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition"
              >
                Open Workspace Text Interface
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default Home