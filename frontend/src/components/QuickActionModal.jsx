import React, { useState } from 'react'
import { RxCross1 } from 'react-icons/rx'
import { FiExternalLink, FiSearch, FiSun, FiTv } from 'react-icons/fi'

export function QuickActionModal({ type, actionData, onClose }) {
  const [calcInput, setCalcInput] = useState('')
  const [calcResult, setCalcResult] = useState('')

  if (!type || type === 'general') return null

  const handleCalcButton = (val) => {
    if (val === 'C') {
      setCalcInput('')
      setCalcResult('')
      return
    }
    if (val === '=') {
      try {
        const sanitized = calcInput.replace(/[^0-9+\-*/().]/g, '')
        // eslint-disable-next-line no-eval
        const res = Function(`"use strict"; return (${sanitized})`)()
        setCalcResult(String(res))
      } catch {
        setCalcResult('Error')
      }
      return
    }
    setCalcInput(prev => prev + val)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#121824] border border-slate-700/80 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <RxCross1 size={18} />
        </button>

        {/* Calculator Widget */}
        {type === 'calculator-open' && (
          <div>
            <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
              🧮 Interactive Calculator
            </h3>
            <div className="bg-[#0b0e14] p-3 rounded-xl mb-4 text-right font-mono border border-slate-800">
              <div className="text-gray-400 text-sm h-5 overflow-hidden">{calcInput || '0'}</div>
              <div className="text-2xl font-bold text-green-400 h-8 overflow-hidden">{calcResult || '0'}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map(btn => (
                <button
                  key={btn}
                  onClick={() => handleCalcButton(btn)}
                  className={`py-3 rounded-xl font-semibold transition active:scale-95 text-lg ${
                    btn === '='
                      ? 'bg-blue-600 hover:bg-blue-500 text-white col-span-1'
                      : btn === 'C'
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : ['/', '*', '-', '+'].includes(btn)
                      ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weather Quick Widget */}
        {type === 'weather-show' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiSun size={36} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Live Weather Lookup</h3>
            <p className="text-gray-400 text-sm mb-4">View global weather reports and local forecasts</p>
            <a
              href={`https://www.google.com/search?q=weather+${encodeURIComponent(actionData?.userInput || '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl transition shadow-lg"
            >
              <span>Open Live Weather Map</span>
              <FiExternalLink />
            </a>
          </div>
        )}

        {/* YouTube Action */}
        {(type === 'youtube-search' || type === 'youtube-play' || type === 'youtube-open') && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiTv size={36} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">YouTube Media Player</h3>
            <p className="text-gray-400 text-sm mb-4">
              {type === 'youtube-play' ? `Playing: ${actionData?.userInput}` : 'Searching YouTube videos'}
            </p>
            <a
              href={
                type === 'youtube-open'
                  ? 'https://www.youtube.com'
                  : `https://www.youtube.com/results?search_query=${encodeURIComponent(actionData?.userInput || '')}`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition shadow-lg"
            >
              <span>Launch YouTube</span>
              <FiExternalLink />
            </a>
          </div>
        )}

        {/* Google Search Card */}
        {type === 'google-search' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiSearch size={36} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Google Web Intelligence</h3>
            <p className="text-gray-400 text-sm mb-4">Search query: "{actionData?.userInput}"</p>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(actionData?.userInput || '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg"
            >
              <span>Search on Google</span>
              <FiExternalLink />
            </a>
          </div>
        )}

        {/* Instagram / Facebook */}
        {(type === 'instagram-open' || type === 'facebook-open') && (
          <div className="text-center py-4">
            <h3 className="text-xl font-bold text-white mb-1">Social Portal</h3>
            <p className="text-gray-400 text-sm mb-4">Click below to open {type.split('-')[0]}</p>
            <a
              href={`https://www.${type.split('-')[0]}.com`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl transition shadow-lg"
            >
              <span>Open Platform</span>
              <FiExternalLink />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
