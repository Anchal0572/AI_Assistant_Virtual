import React, { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-[#0d1117] font-mono text-sm shadow-lg">
      <div className="flex justify-between items-center px-4 py-1.5 bg-[#161b22] text-xs text-gray-400 border-b border-slate-800">
        <span className="font-semibold text-cyan-400 uppercase tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 transition-colors text-xs cursor-pointer"
        >
          {copied ? (
            <>
              <FiCheck className="text-green-400" />
              <span className="text-green-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed text-[13px]">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function cleanRawText(text) {
  if (!text) return ""
  let str = String(text).trim()

  // Unwrap raw JSON if returned as a JSON string e.g. {"type":"general","response":"..."}
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str)
      if (parsed && parsed.response) {
        str = parsed.response
      }
    } catch {
      // ignore
    }
  }

  // Unescape literal \n into real newlines
  str = str.replace(/\\n/g, '\n')
  return str
}

function parseMarkdown(rawContent) {
  const text = cleanRawText(rawContent)
  if (!text) return []

  // Split text by code blocks ```...```
  const parts = text.split(/(```[\s\S]*?```)/g)

  return parts.map((part, index) => {
    // Code block check
    if (part.startsWith('```') && part.endsWith('```')) {
      const firstLineEnd = part.indexOf('\n')
      let language = 'text'
      let code = part.slice(3, -3)

      if (firstLineEnd !== -1 && firstLineEnd < 25) {
        language = part.slice(3, firstLineEnd).trim() || 'text'
        code = part.slice(firstLineEnd + 1, -3)
      }

      return <CodeBlock key={`code-${index}`} code={code.trim()} language={language} />
    }

    // Process regular text line by line
    const lines = part.split('\n')
    const formattedLines = lines.map((line, lIdx) => {
      let trimmed = line.trim()
      if (!trimmed) return <div key={`empty-${lIdx}`} className="h-2" />

      // Heading 3 ###
      if (trimmed.startsWith('### ')) {
        return <h3 key={`h3-${lIdx}`} className="text-base font-bold text-cyan-300 mt-3 mb-1.5 flex items-center gap-1">{renderInlineFormat(trimmed.replace(/^###\s+/, ''))}</h3>
      }
      // Heading 2 ##
      if (trimmed.startsWith('## ')) {
        return <h2 key={`h2-${lIdx}`} className="text-lg font-extrabold text-white mt-4 mb-2 border-b border-slate-800 pb-1">{renderInlineFormat(trimmed.replace(/^##\s+/, ''))}</h2>
      }
      // Heading 1 #
      if (trimmed.startsWith('# ')) {
        return <h1 key={`h1-${lIdx}`} className="text-xl font-extrabold text-cyan-400 mt-4 mb-2">{renderInlineFormat(trimmed.replace(/^#\s+/, ''))}</h1>
      }

      // Bullet points - or *
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.replace(/^[-*]\s+/, '')
        return (
          <div key={`li-${lIdx}`} className="flex items-start gap-2 my-1 ml-2 text-slate-200 leading-relaxed text-sm">
            <span className="text-cyan-400 font-bold mt-1">•</span>
            <div className="flex-1">{renderInlineFormat(content)}</div>
          </div>
        )
      }

      // Numbered points e.g. 1. 2.
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
      if (numMatch) {
        return (
          <div key={`nli-${lIdx}`} className="flex items-start gap-2 my-1 ml-2 text-slate-200 leading-relaxed text-sm">
            <span className="text-cyan-400 font-bold font-mono">{numMatch[1]}.</span>
            <div className="flex-1">{renderInlineFormat(numMatch[2])}</div>
          </div>
        )
      }

      // Horizontal Divider ---
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={`hr-${lIdx}`} className="my-3 border-slate-800" />
      }

      return (
        <p key={`p-${lIdx}`} className="my-1.5 leading-relaxed text-slate-200 text-sm">
          {renderInlineFormat(line)}
        </p>
      )
    })

    return <React.Fragment key={`text-block-${index}`}>{formattedLines}</React.Fragment>
  })
}

function renderInlineFormat(str) {
  // Format bold **text** and inline `code`
  const tokens = str.split(/(\*\*[\s\S]*?\*\*|`[\s\S]*?`)/g)
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={idx} className="font-semibold text-white">{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs">{token.slice(1, -1)}</code>
    }
    return token
  })
}

export default function MarkdownMessage({ content }) {
  return <div className="markdown-content text-left space-y-1 font-sans">{parseMarkdown(content)}</div>
}
