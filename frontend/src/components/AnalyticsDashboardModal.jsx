import React from 'react'
import { RxCross1 } from 'react-icons/rx'
import { FiTrendingUp, FiMessageSquare, FiCheckCircle, FiClock, FiDatabase, FiPieChart } from 'react-icons/fi'

export function AnalyticsDashboardModal({ analytics, onClose }) {
  const data = analytics || {
    totalChats: 0,
    totalMessages: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    taskCompletionRate: 0,
    docsCount: 0,
    studyHours: 0,
    topicCounts: { Coding: 0, Study: 0, Productivity: 0, General: 0 }
  }

  const topicTotal = Math.max(1, (data.topicCounts?.Coding || 0) + (data.topicCounts?.Study || 0) + (data.topicCounts?.Productivity || 0) + (data.topicCounts?.General || 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f1524] border border-slate-700/80 rounded-2xl w-full max-w-2xl p-5 text-white shadow-2xl relative max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <FiTrendingUp size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Personal AI Analytics & Productivity Dashboard</h3>
              <p className="text-[11px] text-gray-400">Activity trends, task completion rates, topic usage, and study metrics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg bg-slate-800">
            <RxCross1 size={18} />
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-[#131929] border border-slate-800 p-3 rounded-xl text-center">
            <FiMessageSquare className="mx-auto text-cyan-400 mb-1" size={20} />
            <p className="text-xl font-bold text-white">{data.totalChats}</p>
            <p className="text-[11px] text-gray-400">Chat Threads</p>
          </div>

          <div className="bg-[#131929] border border-slate-800 p-3 rounded-xl text-center">
            <FiCheckCircle className="mx-auto text-emerald-400 mb-1" size={20} />
            <p className="text-xl font-bold text-emerald-400">{data.taskCompletionRate}%</p>
            <p className="text-[11px] text-gray-400">Task Success Rate</p>
          </div>

          <div className="bg-[#131929] border border-slate-800 p-3 rounded-xl text-center">
            <FiClock className="mx-auto text-purple-400 mb-1" size={20} />
            <p className="text-xl font-bold text-purple-300">{data.studyHours}h</p>
            <p className="text-[11px] text-gray-400">Study & Coding Hours</p>
          </div>

          <div className="bg-[#131929] border border-slate-800 p-3 rounded-xl text-center">
            <FiDatabase className="mx-auto text-amber-400 mb-1" size={20} />
            <p className="text-xl font-bold text-amber-300">{data.docsCount}</p>
            <p className="text-[11px] text-gray-400">RAG Documents</p>
          </div>
        </div>

        {/* Section 1: Completion Gauge & Task Metrics */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          
          <div className="bg-[#131929] border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-400" /> Productivity Gauge
            </h4>

            <div className="flex items-center justify-around py-2">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="38" stroke="#1f293d" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 - (238.7 * data.taskCompletionRate) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute font-bold text-lg text-white">{data.taskCompletionRate}%</span>
              </div>

              <div className="text-xs space-y-1">
                <p className="text-gray-400">Total Tasks: <span className="font-bold text-white">{data.totalTasks}</span></p>
                <p className="text-emerald-400 font-semibold">Completed: {data.completedTasks}</p>
                <p className="text-amber-400 font-semibold">Pending: {data.pendingTasks}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Conversation Persona / Topic Distribution Bars */}
          <div className="bg-[#131929] border border-slate-800 p-4 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FiPieChart className="text-cyan-400" /> Topic & Persona Distribution
            </h4>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>💻 Coding Master</span>
                  <span className="font-mono text-cyan-400">{Math.round(((data.topicCounts?.Coding || 0) / topicTotal) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${((data.topicCounts?.Coding || 0) / topicTotal) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>📚 Study Assistant</span>
                  <span className="font-mono text-purple-400">{Math.round(((data.topicCounts?.Study || 0) / topicTotal) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${((data.topicCounts?.Study || 0) / topicTotal) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>🎯 Productivity Coach</span>
                  <span className="font-mono text-emerald-400">{Math.round(((data.topicCounts?.Productivity || 0) / topicTotal) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${((data.topicCounts?.Productivity || 0) / topicTotal) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>🤖 General ChatGPT</span>
                  <span className="font-mono text-blue-400">{Math.round(((data.topicCounts?.General || 0) / topicTotal) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${((data.topicCounts?.General || 0) / topicTotal) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
