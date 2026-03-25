import { useState } from 'react'
import './FeedbackForm.css'

export default function FeedbackForm({ apiBase, onAdded }) {
  const [rating, setRating]   = useState(5)
  const [hover, setHover]     = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)   // { reply, success }
  const [error, setError]     = useState('')

  const submit = async e => {
    e.preventDefault()
    if (!message.trim()) { setError('Please write something!'); return }
    setLoading(true); setError('')

    try {
      const r = await fetch(`${apiBase}/feedback/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), rating }),
      })
      if (!r.ok) throw new Error()
      const d = await r.json()
      setResult(d)
      onAdded?.()
    } catch { setError('Could not save — make sure backend is running') }
    finally { setLoading(false) }
  }

  const STAR_LABELS = { 1:'😞 Poor', 2:'😐 Fair', 3:'🙂 Good', 4:'😊 Great', 5:'🔥 Excellent' }

  if (result) return (
    <div className="fb-thankyou">
      <div className="fb-ty-stars">{'⭐'.repeat(rating)}</div>
      <h3>Thanks for the feedback!</h3>
      {result.reply && <div className="fb-ai-reply">"{result.reply}"</div>}
      <button className="fb-again" onClick={() => { setResult(null); setMessage(''); setRating(5) }}>
        Leave Another
      </button>
    </div>
  )

  return (
    <form className="fb-form" onSubmit={submit}>
      {/* Star rating */}
      <div className="fb-stars-section">
        <p className="fb-stars-label">How would you rate working with me?</p>
        <div className="fb-stars-row">
          {[1,2,3,4,5].map(n => (
            <button
              key={n}
              type="button"
              className={`fb-star ${(hover || rating) >= n ? 'active' : ''}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
            >
              ★
            </button>
          ))}
        </div>
        <p className="fb-rating-label">{STAR_LABELS[hover || rating]}</p>
      </div>

      {/* Message */}
      <div className="fb-msg-section">
        <label className="fb-label">Your Feedback</label>
        <textarea
          className="fb-ta"
          rows={4}
          placeholder="Share your honest experience — what was it like working with me? What stood out? What could be better?"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
        <div className="fb-ta-footer">
          <span className="fb-anon-note">🔒 Anonymous — no personal info needed</span>
          <span className="fb-char">{message.length}/500</span>
        </div>
      </div>

      {error && <p className="fb-error">{error}</p>}

      <button className={`fb-submit ${loading ? 'loading' : ''} ${message.trim() ? 'ready' : ''}`} type="submit" disabled={loading || !message.trim()}>
        {loading ? <><FbSpin /> Submitting…</> : '📝 Submit Feedback'}
      </button>
    </form>
  )
}

function FbSpin() { return <span className="fb-spinner" /> }
