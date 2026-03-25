import { useState, useEffect, useRef, useCallback } from 'react'
import './BlogPanel.css'

const CATEGORIES = ['All', 'Tech', 'AI / ML', 'Projects', 'Life', 'Tutorial', 'Opinion']
// apiBase passed as prop

// ── UTILS ─────────────────────────────────────────────────────────
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function readTime(text) {
  const words = text?.split(' ').length || 0
  return Math.max(1, Math.ceil(words / 200)) + ' min read'
}
function resolveMediaUrl(apiBase, src) {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  return `${apiBase}${src.startsWith('/') ? src : `/${src}`}`
}

// ─── MAIN PANEL ────────────────────────────────────────────────────
export default function BlogPanel({ apiBase }) {
  const [view, setView]         = useState('list')   // list | single | write
  const [blogs, setBlogs]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [cat, setCat]           = useState('All')
  const [search, setSearch]     = useState('')
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('blog_token') || '')

  // Secret login — 9 clicks within 1s each
  const [loginOpen, setLoginOpen] = useState(false)
  const clickTimes = useRef([])
  const handleSecretClick = useCallback(() => {
    const now = Date.now()
    clickTimes.current.push(now)
    // Keep only clicks within last 9 seconds
    clickTimes.current = clickTimes.current.filter(t => now - t < 9000)
    // Check if last 9 clicks each within 1s of previous
    if (clickTimes.current.length >= 9) {
      const last9 = clickTimes.current.slice(-9)
      const allFast = last9.every((t, i) => i === 0 || t - last9[i-1] <= 1000)
      if (allFast) {
        clickTimes.current = []
        setLoginOpen(true)
      }
    }
  }, [])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${apiBase}/blogs`)
      const d = await r.json()
      setBlogs(d)
    } catch { setBlogs([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBlogs() }, [])

  const filtered = blogs.filter(b => {
    const matchCat = cat === 'All' || b.category === cat
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const openBlog = (blog) => { setSelected(blog); setView('single') }
  const goBack   = () => { setView('list'); setSelected(null) }

  return (
    <div className="blog-panel" onClick={handleSecretClick}>

      {/* Secret Login Modal */}
      {loginOpen && (
        <LoginModal
          apiBase={apiBase}
          onSuccess={(token) => { setAdminToken(token); sessionStorage.setItem('blog_token', token); setLoginOpen(false) }}
          onClose={() => setLoginOpen(false)}
        />
      )}

      {/* Header */}
      <div className="blog-header">
        <div className="blog-header-left">
          {view !== 'list' && (
            <button className="back-btn" onClick={goBack}>← Back</button>
          )}
          <div>
            <h2 className="blog-title">Blog</h2>
            <p className="blog-subtitle">Thoughts, tutorials & projects</p>
          </div>
        </div>
        <div className="blog-header-right">
          {adminToken && view === 'list' && (
            <button className="write-btn" onClick={() => setView('write')}>✏️ Write Post</button>
          )}
          {adminToken && (
            <div className="admin-pill">🔐 Admin</div>
          )}
        </div>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="blog-list-view">
          {/* Search + Filter */}
          <div className="blog-controls">
            <div className="blog-search">
              <SearchIcon />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts…"
                className="blog-search-input"
              />
              {search && <button onClick={() => setSearch('')} className="search-clear-btn">✕</button>}
            </div>
            <div className="cat-tabs">
              {CATEGORIES.map(c => (
                <button key={c} className={`cat-tab ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="blog-loading">
              {[1,2,3].map(i => <div key={i} className="blog-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="blog-empty">
              <span>📝</span>
              <p>{blogs.length === 0 ? 'No posts yet. Check back soon!' : 'No posts match your search.'}</p>
            </div>
          ) : (
            <div className="blog-grid">
              {filtered.map((b, i) => (
                <BlogCard key={b.id} blog={b} index={i} onClick={() => openBlog(b)} adminToken={adminToken} onDeleted={fetchBlogs} apiBase={apiBase} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SINGLE POST VIEW */}
      {view === 'single' && selected && (
        <SinglePost blog={selected} apiBase={apiBase} adminToken={adminToken} onDeleted={() => { fetchBlogs(); goBack() }} />
      )}

      {/* WRITE POST VIEW */}
      {view === 'write' && adminToken && (
        <WritePost
          apiBase={apiBase}
          token={adminToken}
          onPublished={() => { fetchBlogs(); setView('list') }}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  )
}

// ─── BLOG CARD ─────────────────────────────────────────────────────
function BlogCard({ blog, index, onClick, adminToken, onDeleted, apiBase }) {
  const [deleting, setDeleting] = useState(false)
  const imageUrl = resolveMediaUrl(apiBase, blog.image_url)
  const preview = blog.description?.replace(/\s+/g, ' ').trim() || ''

  const deleteBlog = async (e) => {
    e.stopPropagation()
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    try {
      await fetch(`${apiBase}/blogs/${blog.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
      onDeleted()
    } catch { setDeleting(false) }
  }

  return (
    <div className="blog-card" style={{ animationDelay: `${index * 0.06}s` }} onClick={onClick}>
      {imageUrl ? (
        <div className="blog-card-img">
          <img src={imageUrl} alt={blog.title} onError={e => e.target.parentElement.style.display='none'} />
          <div className="blog-card-img-overlay" />
        </div>
      ) : (
        <div className="blog-card-cover-fallback">
          <span className="blog-card-cover-pill">{blog.category}</span>
          <p>{preview.slice(0, 110)}{preview.length > 110 ? '…' : ''}</p>
        </div>
      )}
      <div className="blog-card-body">
        <div className="blog-card-top">
          <span className="blog-cat-tag">{blog.category}</span>
          {adminToken && (
            <button className="blog-del-btn" onClick={deleteBlog} disabled={deleting} title="Delete post">
              {deleting ? '…' : '🗑'}
            </button>
          )}
        </div>
        <h3 className="blog-card-title">{blog.title}</h3>
        <p className="blog-card-desc">{preview.slice(0, 140)}{preview.length > 140 ? '…' : ''}</p>
        <div className="blog-card-footer">
          <span className="blog-date">{fmtDate(blog.created_at)}</span>
          <span className="blog-read-time">{readTime(blog.description)}</span>
          <div className="blog-stats">
            <span className="blog-stat">❤️ {blog.likes || 0}</span>
            <span className="blog-stat">💬 {blog.comment_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SINGLE POST ────────────────────────────────────────────────────
function SinglePost({ blog, apiBase, adminToken, onDeleted }) {
  const [likes, setLikes]       = useState(blog.likes || 0)
  const [liked, setLiked]       = useState(false)
  const [comments, setComments] = useState([])
  const [comment, setComment]   = useState('')
  const [commenter, setCommenter] = useState('')
  const [posting, setPosting]   = useState(false)
  const [loadingC, setLoadingC] = useState(true)
  const [likeAnim, setLikeAnim] = useState(false)
  const imageUrl = resolveMediaUrl(apiBase, blog.image_url)
  const postParagraphs = blog.description?.split(/\n{2,}/).filter(Boolean) || []

  const fetchComments = async () => {
    setLoadingC(true)
    try {
      const r = await fetch(`${apiBase}/blogs/${blog.id}/comments`)
      const d = await r.json()
      setComments(d)
    } catch {}
    finally { setLoadingC(false) }
  }

  useEffect(() => {
    fetchComments()
    // Check if already liked (localStorage per blog)
    setLiked(!!localStorage.getItem(`liked_blog_${blog.id}`))
  }, [blog.id])

  const handleLike = async () => {
    if (liked) return
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 600)
    setLiked(true)
    setLikes(l => l + 1)
    localStorage.setItem(`liked_blog_${blog.id}`, '1')
    try {
      await fetch(`${apiBase}/blogs/${blog.id}/like`, { method: 'POST' })
    } catch {}
  }

  const postComment = async () => {
    if (!comment.trim() || posting) return
    setPosting(true)
    try {
      const r = await fetch(`${apiBase}/blogs/${blog.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: commenter.trim() || 'Anonymous', body: comment.trim() })
      })
      if (r.ok) {
        setComment('')
        setCommenter('')
        fetchComments()
      }
    } catch {}
    finally { setPosting(false) }
  }

  const listenBlog = () => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const text = `${blog.title}. ${blog.description}`
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.9
    window.speechSynthesis.speak(utt)
  }

  const stopListen = () => window.speechSynthesis?.cancel()

  return (
    <div className="single-post">
      {imageUrl && (
        <div className="post-hero-img">
          <img src={imageUrl} alt={blog.title} onError={e => e.target.parentElement.style.display='none'} />
          <div className="post-hero-overlay" />
        </div>
      )}

      <div className="post-content">
        <div className="post-meta-row">
          <span className="blog-cat-tag">{blog.category}</span>
          <span className="blog-date">{fmtDate(blog.created_at)}</span>
          <span className="blog-read-time">{readTime(blog.description)}</span>
        </div>

        <h1 className="post-title">{blog.title}</h1>

        <div className="post-actions">
          <button className={`like-btn ${liked ? 'liked' : ''} ${likeAnim ? 'pop' : ''}`} onClick={handleLike} disabled={liked}>
            <span className="like-icon">❤️</span>
            <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
          </button>
          <button className="listen-btn" onClick={listenBlog} title="Listen to this post">
            🔊 Listen
          </button>
          <button className="listen-btn" onClick={stopListen} title="Stop">⏹ Stop</button>
          {adminToken && (
            <button className="del-post-btn" onClick={onDeleted}>🗑 Delete</button>
          )}
        </div>

        <div className="post-body">
          {postParagraphs.length > 0 ? postParagraphs.map((paragraph, index) => (
            <p key={index} className="post-paragraph">{paragraph}</p>
          )) : <p className="post-paragraph">{blog.description}</p>}
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3 className="comments-title">💬 Comments ({comments.length})</h3>

          {/* Add comment */}
          <div className="add-comment">
            <input
              className="comment-name-input"
              placeholder="Your name (optional)"
              value={commenter}
              onChange={e => setCommenter(e.target.value)}
              maxLength={40}
            />
            <textarea
              className="comment-textarea"
              placeholder="Leave a comment…"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <button className="comment-post-btn" onClick={postComment} disabled={!comment.trim() || posting}>
              {posting ? 'Posting…' : '→ Post Comment'}
            </button>
          </div>

          {/* Comments list */}
          {loadingC ? (
            <div className="comments-loading">Loading comments…</div>
          ) : comments.length === 0 ? (
            <div className="no-comments">No comments yet — be the first! 💬</div>
          ) : (
            <div className="comments-list">
              {comments.map((c, i) => (
                <div key={c.id} className="comment-item" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="comment-avatar">{(c.name || 'A')[0].toUpperCase()}</div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-name">{c.name || 'Anonymous'}</span>
                      <span className="comment-date">{fmtDate(c.created_at)}</span>
                    </div>
                    <p className="comment-text">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── WRITE POST ─────────────────────────────────────────────────────
function WritePost({ apiBase, token, onPublished, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'Tech', image_url: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [imgFile, setImgFile] = useState(null)
  const [imgPrev, setImgPrev] = useState('')

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleImgFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    setImgPrev(URL.createObjectURL(file))
  }

  const publish = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      let imageUrl = form.image_url
      // If file selected, upload first
      if (imgFile) {
        const fd = new FormData()
        fd.append('file', imgFile)
        const ur = await fetch(`${apiBase}/blogs/upload-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        })
        if (ur.ok) {
          const ud = await ur.json()
          imageUrl = ud.url
        }
      }
      const r = await fetch(`${apiBase}/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, image_url: imageUrl })
      })
      if (!r.ok) throw new Error('Failed to publish')
      onPublished()
    } catch (e) {
      setError(e.message || 'Failed to publish')
    } finally { setLoading(false) }
  }

  return (
    <div className="write-post">
      <div className="write-header">
        <h3 className="write-title">✏️ New Blog Post</h3>
        <button className="cancel-btn" onClick={onCancel}>✕ Cancel</button>
      </div>

      <div className="write-form">
        <div className="wf-field">
          <label>Title *</label>
          <input className="wf-input" placeholder="Post title…" value={form.title} onChange={e => upd('title', e.target.value)} maxLength={120} />
        </div>

        <div className="wf-row">
          <div className="wf-field">
            <label>Category</label>
            <select className="wf-select" value={form.category} onChange={e => upd('category', e.target.value)}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="wf-field">
          <label>Description / Content *</label>
          <textarea
            className="wf-textarea"
            placeholder="Write your blog post here…"
            value={form.description}
            onChange={e => upd('description', e.target.value)}
            rows={10}
          />
          <span className="wf-char-count">{form.description.length} chars · {readTime(form.description)}</span>
        </div>

        <div className="wf-field">
          <label>Cover Image</label>
          <div className="img-upload-area">
            <label className="img-upload-btn">
              📷 Upload Image
              <input type="file" accept="image/*" onChange={handleImgFile} style={{ display:'none' }} />
            </label>
            <span className="img-or">or</span>
            <input className="wf-input" placeholder="Paste image URL…" value={form.image_url} onChange={e => { upd('image_url', e.target.value); setImgPrev(e.target.value) }} />
          </div>
          {imgPrev && (
            <div className="img-preview">
              <img src={imgPrev} alt="preview" onError={() => setImgPrev('')} />
              <button className="img-remove" onClick={() => { setImgFile(null); setImgPrev(''); upd('image_url', '') }}>✕</button>
            </div>
          )}
        </div>

        {error && <div className="wf-error">⚠️ {error}</div>}

        <button className="publish-btn" onClick={publish} disabled={loading || !form.title.trim() || !form.description.trim()}>
          {loading ? 'Publishing…' : '🚀 Publish Post'}
        </button>
      </div>
    </div>
  )
}

// ─── LOGIN MODAL ────────────────────────────────────────────────────
function LoginModal({ apiBase, onSuccess, onClose }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const login = async () => {
    if (!username.trim() || !password.trim()) { setError('Enter username and password'); return }
    setLoading(true)
    setError('')
    try {
      const r = await fetch(`${apiBase}/blog-admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const d = await r.json()
      if (r.ok && d.token) {
        onSuccess(d.token)
      } else {
        setError(d.detail || 'Invalid credentials')
      }
    } catch {
      setError('Server error — is backend running?')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="login-modal">
        <div className="login-header">
          <span className="login-icon">🔐</span>
          <h3>Admin Login</h3>
          <button className="login-close" onClick={onClose}>✕</button>
        </div>
        <div className="login-body">
          <input
            className="login-input"
            autoFocus
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
          />
          {error && <p className="login-error">⚠️ {error}</p>}
          <button className="login-btn" onClick={login} disabled={loading}>
            {loading ? 'Logging in…' : 'Login →'}
          </button>
          <p className="login-hint">🤫 Secret admin area</p>
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
