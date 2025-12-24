import React, { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([]) // { role: 'user'|'bot', text: string }
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    // scroll to bottom when messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    if (e) e.preventDefault()
    const question = input.trim()
    if (!question) return

    // Add user message locally
    const userMsg = { role: 'user', text: question }
    setMessages((m) => [...m, userMsg])
    setInput('')

    try {
      setLoading(true)
      const resp = await fetch('/api/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      if (!resp.ok) {
        const errText = await resp.text()
        throw new Error(errText || 'API error')
      }

      const data = await resp.json()
      const botMsg = { role: 'bot', text: data.answer, sources: data.sources || [] }
      setMessages((m) => [...m, botMsg])
    } catch (err) {
      setMessages((m) => [...m, { role: 'bot', text: 'Error: ' + err.message }])
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile(e) {
    e.preventDefault()
    if (!file) return
    setUploadLoading(true)
    setUploadError(null)
    setUploadResult(null)

    try {
      const fd = new FormData()
      fd.append('file', file)

      const resp = await fetch('/api/v1/ingest', {
        method: 'POST',
        body: fd,
      })

      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(txt || 'Upload failed')
      }

      const data = await resp.json()
      setUploadResult(data)
      // Optionally add a system message to chat
      const ingestMsg = data && (data.message || JSON.stringify(data))
      setMessages((m) => [...m, { role: 'bot', text: 'Document ingested: ' + ingestMsg }])
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploadLoading(false)
      setFile(null)
    }
  }

  return (
    <div className="chat-root">
      <h1>RAG Chat — Test UI</h1>
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-row ${msg.role}`}>
            <div className="bubble">
              <div className="text">{msg.text}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="sources">Sources: {msg.sources.join(', ')}</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-row bot">
            <div className="bubble loading">Processing...</div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="upload-area">
        <form className="upload-form" onSubmit={uploadFile}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploadLoading}
          />
          <button type="submit" disabled={!file || uploadLoading}>
            {uploadLoading ? 'Uploading...' : 'Upload & Ingest'}
          </button>
        </form>
        {uploadResult && <div className="upload-result">Ingest result: {JSON.stringify(uploadResult)}</div>}
        {uploadError && <div className="upload-error">Error: {uploadError}</div>}
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={loading ? 'Waiting for response...' : 'Type your question...'}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}

export default App
