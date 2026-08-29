import React, { useState } from 'react'
import { RxCross1 } from 'react-icons/rx'
import { 
  FiCheckSquare, 
  FiPlus, 
  FiTrash2, 
  FiClock, 
  FiAlertCircle, 
  FiTag, 
  FiZap, 
  FiList, 
  FiCalendar, 
  FiActivity,
  FiHelpCircle
} from 'react-icons/fi'

export function ProductivityModal({ 
  tasks = [], 
  onCreateTask = () => {}, 
  onToggleTask = () => {}, 
  onGenerateBreakdown = () => {}, 
  onToggleSubtask = () => {}, 
  onDeleteTask = () => {}, 
  onAskAIHelp = () => {}, 
  onClose = () => {} 
}) {
  const [activeTab, setActiveTab] = useState('tasks')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [category, setCategory] = useState('General')
  const [timeBlock, setTimeBlock] = useState('Anytime')
  const [dueDate, setDueDate] = useState('')
  const [isHabit, setIsHabit] = useState(false)
  const [filter, setFilter] = useState('all')
  const [loadingBreakdownId, setLoadingBreakdownId] = useState(null)
  const [expandedTaskId, setExpandedTaskId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !title.trim()) return
    onCreateTask({ title: title.trim(), priority, category, timeBlock, dueDate, isHabit })
    setTitle('')
    setDueDate('')
  }

  const handleBreakdownClick = async (taskId) => {
    if (!taskId) return
    setLoadingBreakdownId(taskId)
    try {
      if (typeof onGenerateBreakdown === 'function') {
        await onGenerateBreakdown(taskId)
      }
      setExpandedTaskId(taskId)
    } catch (e) {
      console.error("Breakdown error:", e)
    } finally {
      setLoadingBreakdownId(null)
    }
  }

  const safeTasks = Array.isArray(tasks) ? tasks : []
  const regularTasks = safeTasks.filter(t => t && !t.isHabit)
  const habitTasks = safeTasks.filter(t => t && t.isHabit)

  const filteredTasks = regularTasks.filter(t => {
    if (!t) return false
    if (filter === 'pending') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f1524] border border-slate-700/80 rounded-2xl w-full max-w-2xl p-5 text-white shadow-2xl relative flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <FiCheckSquare size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Smart Productivity Suite & AI Goal Planner</h3>
              <p className="text-[11px] text-gray-400">AI Task breakdowns, daily schedule blocks, and streak tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg bg-slate-800">
            <RxCross1 size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 my-3 bg-[#131929] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'tasks' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiList size={14} /> To-Do Tasks ({regularTasks.length})
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'planner' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiCalendar size={14} /> Daily Schedule
          </button>

          <button
            onClick={() => setActiveTab('habits')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'habits' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiActivity size={14} /> Habit Streaks ({habitTasks.length})
          </button>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-[#131929] border border-slate-800 rounded-xl space-y-2.5 mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={activeTab === 'habits' ? "Add daily habit (e.g. Code for 1hr daily)..." : "Add goal or task (e.g. Build React AI Chat Dashboard)..."}
              className="flex-1 bg-[#182035] border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                title.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow'
                  : 'bg-slate-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FiPlus size={16} /> Add Task
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-[#182035] px-2.5 py-1 rounded-lg border border-slate-700">
                <FiAlertCircle className="text-amber-400" /> Priority:
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="High" className="bg-[#121824] text-red-400">High</option>
                  <option value="Medium" className="bg-[#121824] text-amber-400">Medium</option>
                  <option value="Low" className="bg-[#121824] text-green-400">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-[#182035] px-2.5 py-1 rounded-lg border border-slate-700">
                <FiTag className="text-blue-400" /> Category:
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="General" className="bg-[#121824]">General</option>
                  <option value="Coding" className="bg-[#121824]">Coding</option>
                  <option value="Study" className="bg-[#121824]">Study</option>
                  <option value="Work" className="bg-[#121824]">Work</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-[#182035] px-2.5 py-1 rounded-lg border border-slate-700">
                <FiClock className="text-purple-400" /> Schedule:
                <select
                  value={timeBlock}
                  onChange={(e) => setTimeBlock(e.target.value)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="Anytime" className="bg-[#121824]">Anytime</option>
                  <option value="Morning" className="bg-[#121824]">Morning</option>
                  <option value="Afternoon" className="bg-[#121824]">Afternoon</option>
                  <option value="Evening" className="bg-[#121824]">Evening</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-amber-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={isHabit}
                onChange={(e) => setIsHabit(e.target.checked)}
                className="rounded accent-amber-500"
              />
              🔥 Track as Daily Habit
            </label>
          </div>
        </form>

        {/* BODY TABS CONTENT */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          
          {/* TAB 1: TO-DO TASKS WITH AI BREAKDOWN */}
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-2 text-xs">
                <div className="flex gap-1.5">
                  {['all', 'pending', 'completed'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition ${
                        filter === f ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onAskAIHelp && onAskAIHelp("Please create a step-by-step daily study and task execution plan for my goals.")}
                  className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/80 cursor-pointer"
                >
                  <FiZap className="animate-pulse text-cyan-400" /> ✨ Plan Day with AI
                </button>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No tasks found. Add a goal or task above!
                </div>
              ) : (
                filteredTasks.map(task => {
                  if (!task) return null
                  const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0
                  const completedSubcount = hasSubtasks ? task.subtasks.filter(s => s && s.completed).length : 0

                  return (
                    <div
                      key={task._id}
                      className={`p-3 rounded-xl border transition flex flex-col gap-2 ${
                        task.completed ? 'bg-[#101522]/60 border-slate-800/80 opacity-60' : 'bg-[#131929] border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 truncate flex-1">
                          <input
                            type="checkbox"
                            checked={Boolean(task.completed)}
                            onChange={() => onToggleTask(task._id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                          />
                          <div className="truncate">
                            <p className={`text-xs font-semibold truncate ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                              <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                                task.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                                task.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {task.priority || 'Medium'}
                              </span>
                              <span>• {task.category || 'General'}</span>
                              {task.timeBlock && task.timeBlock !== 'Anytime' && <span className="text-purple-300 font-medium">• {task.timeBlock}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleBreakdownClick(task._id)}
                            disabled={loadingBreakdownId === task._id}
                            className="px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-700/60 text-cyan-300 text-[10px] font-bold flex items-center gap-1 hover:bg-cyan-900 transition"
                            title="Generate 4 AI subtask steps"
                          >
                            <FiZap className="text-cyan-400" />
                            {loadingBreakdownId === task._id ? 'Generating...' : (hasSubtasks ? `${completedSubcount}/${task.subtasks.length} Steps` : '✨ AI Breakdown')}
                          </button>

                          <button
                            onClick={() => onAskAIHelp && onAskAIHelp(`Help me complete this task: "${task.title}". Provide step-by-step guidance.`)}
                            className="p-1.5 text-slate-300 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition"
                            title="Ask AI to help complete this task"
                          >
                            <FiHelpCircle size={15} />
                          </button>

                          <button
                            onClick={() => onDeleteTask(task._id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg transition"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* AI Subtasks Checklist */}
                      {hasSubtasks && (
                        <div className="mt-1 pt-2 border-t border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-gray-400">
                            <span>Subtask Progress</span>
                            <span className="font-mono text-cyan-400">{Math.round((completedSubcount / task.subtasks.length) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                            <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${(completedSubcount / task.subtasks.length) * 100}%` }} />
                          </div>

                          {task.subtasks.map((st, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2 text-xs ml-2 text-slate-300">
                              <input
                                type="checkbox"
                                checked={Boolean(st.completed)}
                                onChange={() => onToggleSubtask(task._id, sIdx)}
                                className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
                              />
                              <span className={st.completed ? 'line-through text-gray-500' : ''}>{st.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* TAB 2: DAILY SCHEDULE TIME BLOCKS */}
          {activeTab === 'planner' && (
            <div className="space-y-3">
              {['Morning', 'Afternoon', 'Evening', 'Anytime'].map(block => {
                const blockTasks = regularTasks.filter(t => t && t.timeBlock === block)
                return (
                  <div key={block} className="bg-[#131929] border border-slate-800 rounded-xl p-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FiClock className="text-cyan-400" /> {block} Schedule ({blockTasks.length})
                    </h4>
                    {blockTasks.length === 0 ? (
                      <p className="text-[11px] text-gray-500 italic">No tasks scheduled for {block.toLowerCase()}.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {blockTasks.map(t => (
                          <div key={t._id} className="flex items-center justify-between text-xs p-2 bg-[#182035] rounded-lg border border-slate-700/60">
                            <span className={t.completed ? 'line-through text-gray-400' : 'text-white'}>{t.title}</span>
                            <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                              t.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>{t.priority || 'Medium'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 3: HABIT & STREAK TRACKER */}
          {activeTab === 'habits' && (
            <div className="space-y-2">
              {habitTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No habits tracked yet. Check "Track as Daily Habit" when adding a task!
                </div>
              ) : (
                habitTasks.map(h => (
                  <div key={h._id} className="p-3 bg-[#131929] border border-slate-700/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(h.completed)}
                        onChange={() => onToggleTask(h._id)}
                        className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                      />
                      <div>
                        <p className={`text-xs font-semibold ${h.completed ? 'line-through text-gray-400' : 'text-white'}`}>{h.title}</p>
                        <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                          <FiActivity /> {h.streak || 1} Day Streak 🔥
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTask(h._id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg transition"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
