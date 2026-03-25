import { useState, useRef } from 'react'
import './ReferralForm.css'

export default function ReferralForm({ apiBase, onAdded }) {
  const [form, setForm] = useState({ name:'', email:'', role:'', company:'', quote:'', relation:'' })
  const [photo, setPhoto]       = useState(null)
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const fileRef = useRef(null)

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const pickPhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Photo must be under 5MB'); return }
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => { setPhoto(null); setPreview(null); if (fileRef.current) fileRef.current.value = '' }

  const submit = async e => {
    e.preventDefault()
    if (!form.name.trim() || !form.quote.trim()) { setError('Name and quote are required'); return }
    setLoading(true); setError('')

    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (photo) fd.append('photo', photo)

    try {
      const r = await fetch(`${apiBase}/referrals/add`, { method:'POST', body: fd })
      if (!r.ok) { const d = await r.json(); throw new Error(d.detail || 'Failed') }
      setSuccess(true)
      onAdded?.()
    } catch(e) { setError(e.message || 'Could not save — make sure backend is running') }
    finally { setLoading(false) }
  }

  if (success) return (
    <div className="rf-success">
      <div className="rf-success-icon">🎉</div>
      <h3>Referral Added!</h3>
      <p>Thanks! It's now showing in the References section.</p>
      <button className="rf-again-btn" onClick={() => { setSuccess(false); setForm({ name:'', email:'', role:'', company:'', quote:'', relation:'' }); setPhoto(null); setPreview(null) }}>
        Add Another
      </button>
    </div>
  )

  return (
    <form className="rf-form" onSubmit={submit}>
      {/* Photo picker */}
      <div className="rf-photo-area">
        {preview
          ? <div className="rf-photo-preview-wrap">
              <img src={preview} alt="preview" className="rf-photo-preview" />
              <button type="button" className="rf-photo-remove" onClick={removePhoto}>✕</button>
            </div>
          : <button type="button" className="rf-photo-placeholder" onClick={() => fileRef.current?.click()}>
              <span className="rf-ph-icon">📷</span>
              <span className="rf-ph-label">Add Photo</span>
              <span className="rf-ph-sub">Optional · JPG/PNG/GIF</span>
            </button>
        }
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" className="rf-file-input" onChange={pickPhoto} />
      </div>

      {/* Fields */}
      <div className="rf-fields">
        <div className="rf-row">
          <RFField label="Full Name *" required>
            <input className="rf-input" placeholder="Rahul Sharma" value={form.name} onChange={e => upd('name', e.target.value)} required />
          </RFField>
          <RFField label="Email">
            <input className="rf-input" type="email" placeholder="rahul@company.com" value={form.email} onChange={e => upd('email', e.target.value)} />
          </RFField>
        </div>
        <div className="rf-row">
          <RFField label="Their Role / Title">
            <input className="rf-input" placeholder="Engineering Manager" value={form.role} onChange={e => upd('role', e.target.value)} />
          </RFField>
          <RFField label="Company">
            <input className="rf-input" placeholder="Zoho Corp" value={form.company} onChange={e => upd('company', e.target.value)} />
          </RFField>
        </div>
        <RFField label="Relationship">
          <select className="rf-input rf-select" value={form.relation} onChange={e => upd('relation', e.target.value)}>
            <option value="">Select…</option>
            <option>Direct Manager</option>
            <option>Team Lead</option>
            <option>Colleague / Peer</option>
            <option>Mentor</option>
            <option>Client</option>
            <option>Professor / Teacher</option>
          </select>
        </RFField>
        <RFField label="Their Quote / Testimonial *" required>
          <textarea
            className="rf-input rf-ta"
            rows={4}
            placeholder="What did they say about working with you? Be specific — mention a project or skill..."
            value={form.quote}
            onChange={e => upd('quote', e.target.value)}
            required
          />
          <span className="rf-char">{form.quote.length} chars</span>
        </RFField>
      </div>

      {error && <p className="rf-error">{error}</p>}

      <button className={`rf-submit ${loading ? 'loading' : ''}`} type="submit" disabled={loading}>
        {loading ? <><Spin /> Saving…</> : '⭐ Add Referral'}
      </button>
    </form>
  )
}

function RFField({ label, children }) {
  return (
    <div className="rf-field">
      <label className="rf-label">{label}</label>
      {children}
    </div>
  )
}

function Spin() { return <span className="rf-spinner" /> }
