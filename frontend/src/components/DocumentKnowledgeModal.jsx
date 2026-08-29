import React, { useState } from 'react'
import { RxCross1 } from 'react-icons/rx'
import { FiFileText, FiUploadCloud, FiTrash2, FiDatabase, FiCheck, FiInfo } from 'react-icons/fi'

export function DocumentKnowledgeModal({ documents, onUploadFile, onUploadText, onDeleteDoc, onClose }) {
  const [activeTab, setActiveTab] = useState('upload') // 'upload', 'paste', 'list'
  const [pastedTitle, setPastedTitle] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const handleFileSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setStatusMsg('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await onUploadFile(formData)
      setStatusMsg('Document parsed & analyzed successfully!')
      setFile(null)
      setTimeout(() => {
        setStatusMsg('')
        onClose()
      }, 1200)
    } catch {
      setStatusMsg('Upload failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTextSubmit = async (e) => {
    e.preventDefault()
    if (!pastedText.trim()) return
    setLoading(true)
    setStatusMsg('')

    try {
      await onUploadText({
        filename: pastedTitle.trim() || 'Pasted_Notes.txt',
        text: pastedText,
        fileType: 'txt'
      })
      setStatusMsg('Text saved into Knowledge Vault!')
      setPastedTitle('')
      setPastedText('')
      setTimeout(() => {
        setStatusMsg('')
        onClose()
      }, 1200)
    } catch {
      setStatusMsg('Indexing failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f1524] border border-slate-700/80 rounded-2xl w-full max-w-xl p-5 text-white shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <FiDatabase size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Neural Knowledge Vault</h3>
              <p className="text-[11px] text-gray-400">Upload PDF, TXT, DOCX files for instant AI in-depth analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg bg-slate-800">
            <RxCross1 size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 my-4 bg-[#141b2e] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'upload' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            📁 Upload PDF / TXT Document
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'paste' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            📝 Paste Raw Notes
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'list' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            📚 Vault Library ({documents?.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {statusMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
              <FiCheck /> {statusMsg}
            </div>
          )}

          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 text-center bg-[#13192a] transition cursor-pointer">
                <FiUploadCloud className="mx-auto text-cyan-400 mb-2" size={36} />
                <p className="text-sm font-semibold text-white mb-1">Click to select PDF or document file</p>
                <p className="text-xs text-gray-400 mb-3">Supports .pdf, .txt, .docx files</p>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.txt,.docx"
                  className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                />
              </div>

              {file && (
                <div className="p-3 bg-slate-800/60 rounded-xl text-xs flex items-center justify-between">
                  <span className="font-mono text-cyan-300 truncate">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!file || loading}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition ${
                  file && !loading
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black cursor-pointer shadow-lg'
                    : 'bg-slate-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Parsing PDF & Extracting Text with Gemini...' : 'Upload & Analyze Document In-Depth'}
              </button>
            </form>
          )}

          {/* TAB 2: Paste Raw Text */}
          {activeTab === 'paste' && (
            <form onSubmit={handleTextSubmit} className="space-y-3">
              <input
                type="text"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                placeholder="Document Title (e.g. Project Architecture.txt)"
                className="w-full bg-[#13192a] border border-slate-700/80 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste raw notes, document paragraphs, meeting summaries, or specifications here..."
                rows={6}
                className="w-full bg-[#13192a] border border-slate-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none font-mono"
              />
              <button
                type="submit"
                disabled={!pastedText.trim() || loading}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition ${
                  pastedText.trim() && !loading
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black cursor-pointer shadow-lg'
                    : 'bg-slate-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Indexing Notes...' : 'Save & Index Notes'}
              </button>
            </form>
          )}

          {/* TAB 3: Indexed List */}
          {activeTab === 'list' && (
            <div className="space-y-2">
              {(!documents || documents.length === 0) ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No active documents in Knowledge Vault. Upload a PDF file above!
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc._id} className="p-3 bg-[#13192a] border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <FiFileText className="text-cyan-400 flex-shrink-0" size={20} />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white truncate">{doc.filename}</p>
                        <p className="text-[10px] text-gray-400">{doc.chunks?.length || 0} Vector Chunks Indexed</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteDoc(doc._id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                      title="Delete Document"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><FiInfo className="text-cyan-400" /> Uploading a PDF instantly generates an in-depth AI breakdown & indexes it into Knowledge Vault.</span>
        </div>
      </div>
    </div>
  )
}
