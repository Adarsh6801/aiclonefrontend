import { useState, useRef, useEffect } from 'react'
import './ChatPanel.css'

const QUICK = [
  { label: '🎲 Surprise me', text: 'Tell me something fun or surprising!' },
  { label: '🧠 About you', text: 'Tell me about yourself' },
  { label: '😂 Joke time', text: 'Tell me your best joke' },
  { label: '💡 Hot take', text: 'Give me your most controversial opinion' },
  { label: '🌶 Roast me', text: 'Roast me (gently)' },
]

// Splits text into letters for quake animation
function AnimatedText({ text, quaking }) {
  if (!quaking) return <span>{text}</span>
  return (
    <>
      {text.split('').map((ch, i) => (
        <span key={i} style={{ '--i': i, display: 'inline-block',
          animation: 'letter-fall 0.7s ease-in forwards',
          animationDelay: `${i * 0.018}s` }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </>
  )
}

export default function ChatPanel({ messages, typing, onSend }) {
  const [input, setInput]       = useState('')
  const [showQuick, setShowQuick] = useState(true)
  const [reactions, setReactions] = useState({})
  const [floats, setFloats]     = useState([])
  const [search, setSearch]     = useState('')
  const [searching, setSearching] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const handleSend = () => {
    if (!input.trim()) return
    setShowQuick(false)
    setSearching(false)
    onSend(input.trim())
    setInput('')
    textareaRef.current?.focus()
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const react = (msgId, emoji) => {
    setReactions(prev => {
      const curr = prev[msgId] || {}
      return { ...prev, [msgId]: { ...curr, [emoji]: (curr[emoji] || 0) + 1 } }
    })
    const id = Date.now()
    const x = 15 + Math.random() * 70
    setFloats(prev => [...prev, { id, emoji, x }])
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 1500)
  }

  const filtered = search
    ? messages.filter(m => m.text.toLowerCase().includes(search.toLowerCase()))
    : messages

  return (
    <div className="chat-panel">
      {/* Floats */}
      {floats.map(f => (
        <span key={f.id} className="float-emoji" style={{ left: `${f.x}%` }}>{f.emoji}</span>
      ))}

      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar-sm"><span>AI</span></div>
          <div>
            <p className="chat-name">Adarsh</p>
            <p className="chat-subtitle">{typing ? 'typing...' : 'Always here for you ✨'}</p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button
            className={`hdr-btn ${searching ? 'active' : ''}`}
            onClick={() => setSearching(s => !s)}
            title="Search messages"
          >
            <IconSearch />
          </button>
          <div className="header-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>

      {/* Search bar */}
      {searching && (
        <div className="search-bar">
          <IconSearch />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search messages…"
            className="search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="search-clear">✕</button>
          )}
          <span className="search-count">
            {search ? `${filtered.length} found` : ''}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="messages-area">
        <div className="messages-inner">
          {filtered.map((msg, idx) => (
            <MessageRow
              key={msg.id}
              msg={msg}
              idx={idx}
              reactions={reactions[msg.id] || {}}
              onReact={(emoji) => react(msg.id, emoji)}
              searchTerm={search}
            />
          ))}

          {typing && (
            <div className="msg-row ai">
              <div className="msg-avatar ai-av">AI</div>
              <div className="msg-body">
                <div className="bubble typing-bubble">
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick replies */}
      {showQuick && !searching && (
        <div className="quick-row">
          {QUICK.map(q => (
            <button key={q.label} className="quick-btn" onClick={() => { setShowQuick(false); onSend(q.text) }}>
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="input-area">
        <div className="input-box">
          <button className="icon-btn" title="Attach file">
            <IconAttach />
          </button>
          <textarea
            ref={textareaRef}
            className="msg-input"
            value={input}
            onChange={e => { setInput(e.target.value); autoGrow(e.target) }}
            onKeyDown={handleKey}
            placeholder="Message your clone…"
            rows={1}
          />
          <button className="icon-btn" title="Voice">
            <IconMic />
          </button>
          <button className={`send-btn ${input.trim() ? 'ready' : ''}`} onClick={handleSend}>
            <IconSend />
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageRow({ msg, idx, reactions, onReact, searchTerm }) {
  const [hovered, setHovered] = useState(false)
  const isAI = msg.role === 'ai'
  const EMOJIS = ['❤️','🔥','😂','👏','🎯','😮']

  const highlightText = (text) => {
    if (!searchTerm) return text
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'))
    return parts.map((p, i) =>
      p.toLowerCase() === searchTerm.toLowerCase()
        ? <mark key={i} className="highlight">{p}</mark>
        : p
    )
  }

  return (
    <div
      className={`msg-row ${isAI ? 'ai' : 'user'} ${msg.isNudge ? 'nudge' : ''}`}
      style={{ animationDelay: `${Math.min(idx, 6) * 0.06}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isAI && <div className="msg-avatar ai-av">AI</div>}

      <div className="msg-body">
        {msg.isNudge && <span className="nudge-tag">👋 nudge</span>}
        <div className="bubble">
          <p className="bubble-text">{highlightText(msg.text)}</p>
        </div>

        <div className="msg-footer">
          <span className="msg-time">{msg.ts}</span>

          {/* Reaction counts */}
          {Object.entries(reactions).map(([emoji, count]) => count > 0 && (
            <button key={emoji} className="reaction-count" onClick={() => onReact(emoji)}>
              {emoji} {count}
            </button>
          ))}
        </div>

        {/* Emoji picker on hover */}
        {isAI && hovered && (
          <div className="emoji-picker">
            {EMOJIS.map(e => (
              <button key={e} className="emoji-pick-btn" onClick={() => onReact(e)}>{e}</button>
            ))}
          </div>
        )}
      </div>

      {!isAI && <div className="msg-avatar user-av">ME</div>}
    </div>
  )
}

function autoGrow(el) {
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 100) + 'px'
}

function IconSearch() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function IconAttach() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M13.5 8l-6 6a4 4 0 01-5.66-5.66l7-7A2.5 2.5 0 0113 5l-7 7a1 1 0 01-1.41-1.41L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function IconMic() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="5" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 8a6 6 0 0012 0M8 14v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function IconSend() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8L14 2L9 14L8 9L2 8Z" fill="currentColor" opacity="0.9"/></svg>
}
