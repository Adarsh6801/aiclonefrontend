import { useState, useRef, useEffect } from 'react'
import {
  PROFILE_HEADER, SKILLS, PROJECTS,
  EXPERIENCE, TESTIMONIALS, CERTIFICATIONS, EDUCATION
} from '../data/portfolio-data'
import './HirePanel.css'
import ReferralForm from './ReferralForm'
import FeedbackForm from './FeedbackForm'

// ─── STORY DATA (edit here to update your story) ───────────────────────────────
const STORY_CHAPTERS = [
  { id:1, year:'2020', emoji:'💻', title:'The Beginning',           color:'#7c6dfa', body:'Wrote my first line of code — a simple "Hello World" in Python. Never looked back. Stayed up till 3am every night just building random things and breaking them.' },
  { id:2, year:'2021', emoji:'🔥', title:'Falling in Love with Web', color:'#f06292', body:'Discovered React and it changed everything. Built my first full-stack project — a task manager. Ugly as sin but it worked. That feeling of shipping something real? Addictive.' },
  { id:3, year:'2022', emoji:'🚀', title:'Going Deeper',             color:'#26d4b0', body:'Started learning backend seriously — FastAPI, databases, REST APIs. Built 5+ projects. Realised I love the full picture — from database schema to pixel-perfect UI.' },
  { id:4, year:'2023', emoji:'🤖', title:'AI Obsession Begins',     color:'#fbbf24', body:'ChatGPT dropped and I went down the rabbit hole. Spent months learning LLMs, prompt engineering, and AI integrations. Started building AI-powered tools for fun.' },
  { id:5, year:'2024', emoji:'🧠', title:'Building the Future',     color:'#7c6dfa', body:'Built this AI Clone — my digital twin. Integrated Llama 4, games, blog, roadmap and everything. Currently shipping projects that combine AI + great UX. The journey is just beginning.' },
]


// ─── NAV CONFIG ────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview',     icon: '👤', label: 'Overview'   },
  { id: 'skills',       icon: '🛠', label: 'Skills'     },
  { id: 'projects',     icon: '🚀', label: 'Projects'   },
  { id: 'experience',   icon: '💼', label: 'Experience' },
  { id: 'references',   icon: '⭐', label: 'References' },
  { id: 'jdmatch',      icon: '🎯', label: 'JD Match'   },
  { id: 'contact',      icon: '📬', label: 'Contact'    },
  { id: 'ask',          icon: '💬', label: 'Ask AI'     },
]

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function HirePanel({ apiBase }) {
  const [active, setActive]     = useState('overview')
  const [expProj, setExpProj]   = useState(null)

  return (
    <div className="hp-root">
      {/* Side rail */}
      <nav className="hp-rail">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`rail-btn ${active === s.id ? 'active' : ''}`}
            onClick={() => setActive(s.id)}
            title={s.label}
          >
            <span className="rail-ico">{s.icon}</span>
            <span className="rail-lbl">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Body */}
      <div className="hp-body" key={active}>
        {active === 'overview'   && <OverviewSection   goTo={setActive} />}
        {active === 'skills'     && <SkillsSection />}
        {active === 'projects'   && <ProjectsSection   expProj={expProj} setExpProj={setExpProj} />}
        {active === 'experience' && <ExperienceSection />}
        {active === 'references' && <ReferencesSection apiBase={apiBase} />}
        {active === 'jdmatch'    && <JDMatchSection    apiBase={apiBase} />}
        {active === 'contact'    && <ContactSection    apiBase={apiBase} />}
        {active === 'ask'        && <AskAISection      apiBase={apiBase} />}
      </div>
    </div>
  )
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function OverviewSection({ goTo }) {
  const p        = PROFILE_HEADER
  const initials = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="section-wrap">
      {/* ── HERO ── */}
      <div className="hero-card">
        <div className="hero-orb" />
        <div className="hero-orb hero-orb2" />

        <div className="hero-inner">
          {/* Avatar */}
          <div className="av-wrap">
            {p.avatar
              ? <img src={p.avatar} alt={p.name} className="av-img" />
              : <div className="av-init">{initials}</div>}
            {p.available && <div className="ow-ring" />}
          </div>

          {/* Info */}
          <div className="hero-info">
            <div className="hero-top">
              <h1 className="hero-name">{p.name}</h1>
              {p.available
                ? <span className="badge badge-green">✅ Open to Work</span>
                : <span className="badge badge-blue">🌟 Available for Projects</span>}
            </div>
            <p className="hero-title">{p.title}</p>
            <p className="hero-quote">"{p.tagline}"</p>

            <div className="hero-meta-row">
              {p.location && <span className="meta-pill">📍 {p.location}</span>}
              {p.notice   && <span className="meta-pill">⏱ {p.notice} Notice</span>}
              {p.ctc      && <span className="meta-pill">💰 {p.ctc}</span>}
            </div>

            <div className="hero-links">
              {p.email    && <a href={`mailto:${p.email}`}    className="hlink email-l">✉️ Email</a>}
              {p.linkedin && <a href={`https://${p.linkedin}`} target="_blank" rel="noreferrer" className="hlink li-l">in LinkedIn</a>}
              {p.github   && <a href={`https://${p.github}`}   target="_blank" rel="noreferrer" className="hlink gh-l">🐙 GitHub</a>}
              {p.portfolio && <a href={p.portfolio} target="_blank" rel="noreferrer" className="hlink port-l">🌐 Portfolio</a>}
            </div>
          </div>

          {/* Resume download */}
          <a
            href={p.resumeUrl || '#'}
            download
            className="dl-resume-btn"
            onClick={e => {
              if (!p.resumeUrl) {
                e.preventDefault()
                alert('Add your resume PDF URL to portfolio-data.js → PROFILE_HEADER.resumeUrl')
              }
            }}
          >
            <DownloadIcon />
            Download CV
          </a>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-row">
        {[
          { n: "3" + '+ yrs', l: 'Experience' },
          { n: "11" + '+',       l: 'Projects'   },
          { n: SKILLS.length + '+',         l: 'Skills'     },
          { n: CERTIFICATIONS.length,       l: 'Certs'      },
          // { n: TESTIMONIALS.length,         l: 'References' },
        ].map(s => (
          <div key={s.l} className="stat-card">
            <span className="stat-num">{s.n}</span>
            <span className="stat-lbl">{s.l}</span>
          </div>
        ))}
      </div>

      {/* ── EDUCATION ── */}
      <div className="edu-card">
        <span className="edu-ico">🎓</span>
        <div>
          <p className="edu-degree">{EDUCATION.degree} — {EDUCATION.field}</p>
          <p className="edu-sub">{EDUCATION.college} · {EDUCATION.location} · {EDUCATION.year}</p>
          {EDUCATION.grade && <p className="edu-grade">{EDUCATION.grade}</p>}
        </div>
      </div>

      {/* ── QUICK NAV ── */}
      <div className="qnav-grid">
        {[
          { id:'skills',     ico:'🛠', lbl:'Skills',      sub:'Animated skill bars'      },
          { id:'projects',   ico:'🚀', lbl:'Projects',    sub:'Featured work & code'     },
          { id:'references', ico:'⭐', lbl:'References',  sub:'Manager testimonials'     },
          { id:'jdmatch',    ico:'🎯', lbl:'JD Matcher',  sub:'AI-powered match score'   },
          { id:'contact',    ico:'📬', lbl:'Contact',     sub:'Send me a message'        },
          { id:'ask',        ico:'💬', lbl:'Ask AI',      sub:'Chat with my clone'       },
        ].map(n => (
          <button key={n.id} className="qnav-card" onClick={() => goTo(n.id)}>
            <span className="qnav-ico">{n.ico}</span>
            <div className="qnav-text">
              <span className="qnav-lbl">{n.lbl}</span>
              <span className="qnav-sub">{n.sub}</span>
            </div>
            <span className="qnav-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}


// ─── STORY SECTION ────────────────────────────────────────────────────────────
function StorySection() {
  const [active, setActive] = useState(null)
  return (
    <div className="story-section">
      <div className="story-head">
        <span className="story-head-ico">📖</span>
        <div>
          <h3 className="story-head-title">My Story</h3>
          <p className="story-head-sub">The journey that brought me here</p>
        </div>
      </div>
      <div className="story-timeline">
        {STORY_CHAPTERS.map((ch, i) => (
          <div
            key={ch.id}
            className={`story-item ${active === ch.id ? 'open' : ''}`}
            style={{ '--sc': ch.color }}
            onClick={() => setActive(active === ch.id ? null : ch.id)}
          >
            <div className="story-dot-wrap">
              <div className="story-dot">{ch.emoji}</div>
              {i < STORY_CHAPTERS.length - 1 && <div className="story-line" />}
            </div>
            <div className="story-content">
              <div className="story-meta">
                <span className="story-year">{ch.year}</span>
                <span className="story-title">{ch.title}</span>
                <span className="story-chevron">{active === ch.id ? '▲' : '▼'}</span>
              </div>
              {active === ch.id && (
                <p className="story-body">{ch.body}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────
function SkillsSection() {
  const cats = [...new Set(SKILLS.map(s => s.category))]
  return (
    <div className="section-wrap">
      <SectionHead icon="🛠" title="Skills & Technologies" sub="Self-assessed skill levels — honest ratings" />

      {cats.map(cat => (
        <div key={cat} className="skill-block">
          <h3 className="skill-cat">{cat}</h3>
          <div className="skill-list">
            {SKILLS.filter(s => s.category === cat).map((sk, i) => (
              <div key={sk.name} className="skill-row" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="skill-lbl">
                  <span className="sk-ico">{sk.icon}</span>
                  <span className="sk-name">{sk.name}</span>
                </div>
                <div className="skill-track">
                  <div
                    className="skill-fill"
                    style={{ '--pct': `${sk.level}%`, animationDelay: `${i * 0.05 + 0.2}s` }}
                  />
                </div>
                <span className="skill-pct">{sk.level}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {CERTIFICATIONS.length > 0 && (
        <div className="skill-block">
          <h3 className="skill-cat">Certifications</h3>
          <div className="cert-list">
            {CERTIFICATIONS.map((c, i) => (
              <div key={i} className="cert-row">
                <span className="cert-ico">{c.icon}</span>
                <div className="cert-info">
                  <p className="cert-name">{c.name}</p>
                  <p className="cert-by">{c.issuer} · {c.year}</p>
                </div>
                {c.link && <a href={c.link} target="_blank" rel="noreferrer" className="cert-link">↗ Verify</a>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
function ProjectsSection({ expProj, setExpProj }) {
  const featured = PROJECTS.filter(p => p.featured)
  const rest     = PROJECTS.filter(p => !p.featured)
  return (
    <div className="section-wrap">
      <SectionHead icon="🚀" title="Projects" sub="Things I built — click any card to expand" />
      {featured.length > 0 && (
        <>
          <p className="grp-lbl">⭐ Featured</p>
          <div className="proj-grid">
            {featured.map(p => <ProjCard key={p.id} p={p} open={expProj === p.id} toggle={() => setExpProj(expProj === p.id ? null : p.id)} />)}
          </div>
        </>
      )}
      {rest.length > 0 && (
        <>
          <p className="grp-lbl" style={{marginTop:18}}>Other Work</p>
          <div className="proj-grid">
            {rest.map(p => <ProjCard key={p.id} p={p} open={expProj === p.id} toggle={() => setExpProj(expProj === p.id ? null : p.id)} />)}
          </div>
        </>
      )}
    </div>
  )
}

function ProjCard({ p, open, toggle }) {
  return (
    <div className={`proj-card ${open ? 'open' : ''}`}>
      <div className="proj-thumb" onClick={toggle}>
        {p.image
          ? <img src={p.image} alt={p.name} className="proj-img" />
          : (
            <div className="proj-placeholder">
              <div className="pp-pulse" />
              <span className="pp-ico">🚀</span>
              <span className="pp-name">{p.name}</span>
            </div>
          )
        }
        {p.featured && <span className="feat-pill">⭐ Featured</span>}
        <div className="proj-hover-overlay">{open ? '▲ Collapse' : '▼ Expand'}</div>
      </div>

      <div className="proj-body">
        <h3 className="proj-name">{p.name}</h3>
        <p className="proj-tag">{p.tagline}</p>

        {open && (
          <div className="proj-detail">
            <p className="proj-desc">{p.description}</p>
            {p.highlights?.length > 0 && (
              <ul className="proj-bullets">
                {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="proj-techs">
          {p.tech.map(t => <span key={t} className="tech-tag">{t}</span>)}
        </div>

        <div className="proj-btns">
          <button className="proj-toggle-btn" onClick={toggle}>{open ? '▲ Less' : '▼ More'}</button>
          {p.github && <a href={`https://${p.github}`} target="_blank" rel="noreferrer" className="proj-ext gh">🐙 Code</a>}
          {p.live   && <a href={p.live}                target="_blank" rel="noreferrer" className="proj-ext live">🌐 Live</a>}
        </div>
      </div>
    </div>
  )
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────
function ExperienceSection() {
  return (
    <div className="section-wrap">
      <SectionHead icon="💼" title="Work Experience" sub="My professional journey" />
      <div className="timeline">
        {EXPERIENCE.map((e, i) => (
          <div key={e.id} className="tl-item" style={{ '--ac': e.color }}>
            <div className="tl-dot" />
            {i < EXPERIENCE.length - 1 && <div className="tl-line" />}
            <div className="tl-card">
              <div className="exp-head">
                {e.logo
                  ? <img src={e.logo} alt={e.company} className="exp-logo-img" />
                  : <div className="exp-logo-ph" style={{ background: e.color + '22', color: e.color }}>{e.company[0]}</div>
                }
                <div className="exp-meta">
                  <h3 className="exp-role">{e.role}</h3>
                  <p className="exp-co">{e.company}</p>
                  <div className="exp-pills">
                    <span className="exp-dur">{e.duration}</span>
                    <span className="exp-type">{e.type}</span>
                    <span className="exp-loc">📍 {e.location}</span>
                  </div>
                </div>
              </div>
              <ul className="exp-pts">
                {e.points.map((pt, j) => <li key={j}>{pt}</li>)}
              </ul>
              <div className="exp-techs">
                {e.tech.map(t => <span key={t} className="exp-tech">{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── REFERENCES ───────────────────────────────────────────────────────────────
function ReferencesSection({ apiBase }) {
  const [tab, setTab]           = useState('view')      // view | add | feedback
  const [dbRefs, setDbRefs]     = useState([])
  const [fbStats, setFbStats]   = useState(null)
  const [loadingRefs, setLoadingRefs] = useState(true)

  const fetchRefs = async () => {
    setLoadingRefs(true)
    try {
      const r = await fetch(`${apiBase}/referrals`)
      const d = await r.json()
      setDbRefs(d)
    } catch { /* silently ignore if offline */ }
    finally { setLoadingRefs(false) }
  }

  const fetchStats = async () => {
    try {
      const r = await fetch(`${apiBase}/feedback/stats`)
      const d = await r.json()
      setFbStats(d)
    } catch {}
  }

  useEffect(() => { fetchRefs(); fetchStats() }, [])

  // Merge static testimonials from portfolio-data + live DB referrals
  const allRefs = [
    ...TESTIMONIALS.map(t => ({ ...t, source: 'static' })),
    ...dbRefs.map(r => ({
      id:       'db-' + r.id,
      name:     r.name,
      role:     r.role,
      company:  r.company,
      quote:    r.quote,
      photo:    r.photo_path ? `${apiBase}${r.photo_path}` : null,
      initials: r.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
      color:    '#7c6dfa',
      relation: r.relation,
      verified: false,
      source:   'db',
    }))
  ]

  return (
    <div className="section-wrap">
      <SectionHead icon="⭐" title="References & Testimonials" sub="Real feedback from people I have worked with" />

      {/* Feedback stats banner */}
      {fbStats && fbStats.count > 0 && (
        <div className="fb-stats-banner">
          <span className="fb-stats-stars">{'★'.repeat(Math.round(fbStats.avg_rating))}{'☆'.repeat(5 - Math.round(fbStats.avg_rating))}</span>
          <span className="fb-stats-text"><strong>{fbStats.avg_rating}/5</strong> average from {fbStats.count} anonymous feedback{fbStats.count !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Tab switcher */}
      <div className="ref-tabs">
        <button className={`ref-tab ${tab === 'view'     ? 'active' : ''}`} onClick={() => setTab('view')}>
          ⭐ View All ({allRefs.length})
        </button>
        <button className={`ref-tab ${tab === 'add'      ? 'active' : ''}`} onClick={() => setTab('add')}>
          ➕ Add Referral
        </button>
        <button className={`ref-tab ${tab === 'feedback' ? 'active' : ''}`} onClick={() => setTab('feedback')}>
          📝 Leave Feedback
        </button>
      </div>

      {/* VIEW */}
      {tab === 'view' && (
        <>
          {loadingRefs
            ? <div className="ref-loading"><div className="ref-spin" />Loading referrals…</div>
            : allRefs.length === 0
              ? <div className="ref-empty">No referrals yet — add the first one! ✨</div>
              : <div className="ref-grid">
                  {allRefs.map(t => <RefCard key={t.id} t={t} />)}
                </div>
          }
        </>
      )}

      {/* ADD REFERRAL */}
      {tab === 'add' && (
        <div className="ref-form-wrap">
          <div className="ref-form-header">
            <h3 className="ref-form-title">Add a Referral</h3>
            <p className="ref-form-sub">Add a manager, colleague, or client testimonial. Photo is optional.</p>
          </div>
          <ReferralForm apiBase={apiBase} onAdded={() => { fetchRefs(); setTab('view') }} />
        </div>
      )}

      {/* FEEDBACK */}
      {tab === 'feedback' && (
        <div className="ref-form-wrap">
          <div className="ref-form-header">
            <h3 className="ref-form-title">Leave Anonymous Feedback</h3>
            <p className="ref-form-sub">Share your honest experience — no name needed. Helps me improve!</p>
          </div>
          <FeedbackForm apiBase={apiBase} onAdded={fetchStats} />
        </div>
      )}
    </div>
  )
}

function RefCard({ t }) {
  const [imgErr, setImgErr] = useState(false)
  const COLORS = ['#7c6dfa','#f06292','#26d4b0','#fbbf24','#6daffe','#a78bfa']
  const color  = t.color || COLORS[t.name?.charCodeAt(0) % COLORS.length] || '#7c6dfa'
  const initials = t.initials || t.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '??'

  return (
    <div className={`ref-card ${t.source === 'db' ? 'db-card' : ''}`}>
      {t.source === 'db' && <span className="ref-new-badge">New</span>}
      <span className="ref-qmark">"</span>
      <p className="ref-quote">{t.quote}</p>
      <div className="ref-foot">
        <div className="ref-person">
          {t.photo && !imgErr
            ? <img src={t.photo} alt={t.name} className="ref-photo" onError={() => setImgErr(true)} />
            : <div className="ref-init" style={{ background: color + '33', color }}>{initials}</div>
          }
          <div className="ref-info">
            <div className="ref-name-row">
              <span className="ref-name">{t.name}</span>
              {t.verified && <span className="ref-verified">✓</span>}
            </div>
            {t.role    && <span className="ref-role">{t.role}</span>}
            {t.company && <span className="ref-co">{t.company}</span>}
          </div>
        </div>
        {t.relation && <span className="ref-relation">{t.relation}</span>}
      </div>
    </div>
  )
}

// ─── JD MATCH (AI-POWERED) ────────────────────────────────────────────────────
function JDMatchSection({ apiBase }) {
  const [jd, setJd]           = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  const analyse = async () => {
    if (!jd.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const r = await fetch(`${apiBase}/jd-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: jd }),
      })
      if (!r.ok) throw new Error(`Server error ${r.status}`)
      const d = await r.json()
      setResult(d)
    } catch (e) {
      setError('Could not analyse — make sure FastAPI is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = result
    ? result.score >= 80 ? '#4ade80'
    : result.score >= 60 ? '#fbbf24'
    : '#f06292'
    : 'var(--violet)'

  const circumference = 2 * Math.PI * 52

  return (
    <div className="section-wrap">
      <SectionHead icon="🎯" title="JD Matcher" sub="AI analyses how well you match a job description — powered by Llama 4" />

      <div className="jd-input-card">
        <label className="field-label">Paste the Job Description</label>
        <textarea
          className="jd-ta"
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Copy and paste the full job description here — requirements, responsibilities, tech stack, everything..."
          rows={8}
        />
        <button
          className={`analyse-btn ${jd.trim() && !loading ? 'ready' : ''}`}
          onClick={analyse}
          disabled={!jd.trim() || loading}
        >
          {loading ? <><Spinner /> Analysing with AI…</> : '🎯 Analyse My Match'}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </div>

      {result && (
        <div className="jd-result">
          {/* Score ring */}
          <div className="score-card">
            <svg className="score-svg" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={scoreColor} strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - result.score / 100)}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1.2s ease' }}
              />
              <text x="60" y="56" textAnchor="middle" fill={scoreColor} fontSize="24" fontWeight="800" fontFamily="Syne, sans-serif">{result.score}%</text>
              <text x="60" y="71" textAnchor="middle" fill="var(--txt-secondary)" fontSize="9" fontFamily="DM Sans, sans-serif">MATCH SCORE</text>
            </svg>
            <div className="score-right">
              <p className="score-verdict" style={{ color: scoreColor }}>{result.verdict}</p>
              <p className="score-summary">{result.summary}</p>
              {result.interview_tips?.length > 0 && (
                <div className="interview-tips">
                  <p className="tips-label">💡 Interview Tips</p>
                  {result.interview_tips.map((tip, i) => <p key={i} className="tip-item">→ {tip}</p>)}
                </div>
              )}
            </div>
          </div>

          {/* Matched skills */}
          {result.matched_skills?.length > 0 && (
            <ResultBlock title={`✅ Skills I have (${result.matched_skills.length})`} color="green">
              <div className="chip-row">
                {result.matched_skills.map((s, i) => <span key={i} className="chip chip-green">{s}</span>)}
              </div>
            </ResultBlock>
          )}

          {/* Strengths */}
          {result.strengths_for_role?.length > 0 && (
            <ResultBlock title="🔥 Why I'm a strong fit" color="violet">
              <ul className="result-list">
                {result.strengths_for_role.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </ResultBlock>
          )}

          {/* Missing skills */}
          {result.missing_skills?.length > 0 && (
            <ResultBlock title={`⚡ Skills to upskill (${result.missing_skills.length})`} color="amber">
              <div className="chip-row">
                {result.missing_skills.map((s, i) => <span key={i} className="chip chip-amber">{s}</span>)}
              </div>
            </ResultBlock>
          )}

          {/* Relevant projects */}
          {result.relevant_projects?.length > 0 && (
            <ResultBlock title="🚀 Most relevant projects for this role" color="blue">
              <div className="chip-row">
                {result.relevant_projects.map((p, i) => <span key={i} className="chip chip-blue">{p}</span>)}
              </div>
            </ResultBlock>
          )}

          {/* Improvement areas */}
          {result.improvement_areas?.length > 0 && (
            <ResultBlock title="📈 Areas to strengthen" color="muted">
              <ul className="result-list muted">
                {result.improvement_areas.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </ResultBlock>
          )}
        </div>
      )}
    </div>
  )
}

function ResultBlock({ title, color, children }) {
  const colors = {
    green:  'rgba(74,222,128,0.1)',
    violet: 'rgba(124,109,250,0.1)',
    amber:  'rgba(251,191,36,0.1)',
    blue:   'rgba(109,175,254,0.1)',
    muted:  'var(--bg-elevated)',
  }
  const borders = {
    green:  'rgba(74,222,128,0.3)',
    violet: 'rgba(124,109,250,0.3)',
    amber:  'rgba(251,191,36,0.3)',
    blue:   'rgba(109,175,254,0.3)',
    muted:  'var(--border-subtle)',
  }
  return (
    <div className="result-block" style={{ background: colors[color], borderColor: borders[color] }}>
      <p className="result-block-title">{title}</p>
      {children}
    </div>
  )
}

// ─── CONTACT (API-POWERED) ────────────────────────────────────────────────────
function ContactSection({ apiBase }) {
  const p = PROFILE_HEADER
  const [form, setForm]       = useState({ name:'', email:'', company:'', message:'' })
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [aiReply, setAiReply] = useState('')
  const [error, setError]     = useState('')

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setError('')
    try {
      const r = await fetch(`${apiBase}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) throw new Error()
      const d = await r.json()
      setAiReply(d.reply || '')
      setDone(true)
    } catch {
      setError('Could not send — make sure FastAPI is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const METHODS = [
    { ico:'✉️', lbl:'Email',    val:p.email,    href:`mailto:${p.email}` },
    { ico:'📞', lbl:'Phone',    val:p.phone,    href:`tel:${p.phone}` },
    { ico:'in', lbl:'LinkedIn', val:p.linkedin, href:`https://${p.linkedin}` },
    { ico:'🐙', lbl:'GitHub',   val:p.github,   href:`https://${p.github}` },
  ].filter(m => m.val)

  return (
    <div className="section-wrap">
      <SectionHead icon="📬" title="Get in Touch" sub="I usually respond within 24 hours" />

      {/* Contact method pills */}
      <div className="contact-methods">
        {METHODS.map(m => (
          <a key={m.lbl} href={m.href} target="_blank" rel="noreferrer" className="contact-pill">
            <span className="cp-ico">{m.ico}</span>
            <div className="cp-info">
              <span className="cp-lbl">{m.lbl}</span>
              <span className="cp-val">{m.val}</span>
            </div>
            <span className="cp-arrow">↗</span>
          </a>
        ))}
      </div>

      {/* Message form */}
      {!done ? (
        <form className="contact-form" onSubmit={submit}>
          <p className="form-title">Send a Message</p>
          <div className="form-row">
            <Field label="Your Name *">
              <input className="form-input" placeholder="Rahul Sharma" value={form.name} onChange={e => upd('name', e.target.value)} required />
            </Field>
            <Field label="Email *">
              <input className="form-input" type="email" placeholder="rahul@company.com" value={form.email} onChange={e => upd('email', e.target.value)} required />
            </Field>
          </div>
          <Field label="Company / Role">
            <input className="form-input" placeholder="e.g. Zoho · HR Manager" value={form.company} onChange={e => upd('company', e.target.value)} />
          </Field>
          <Field label="Message *">
            <textarea className="form-ta" rows={4} placeholder="Hi! We have an opening for a React developer…" value={form.message} onChange={e => upd('message', e.target.value)} required />
          </Field>
          {error && <p className="error-msg">{error}</p>}
          <button className={`submit-btn ${loading ? 'loading' : ''}`} type="submit" disabled={loading}>
            {loading ? <><Spinner /> Sending…</> : '📤 Send Message'}
          </button>
          <p className="form-note">Every submission is saved to <strong>contacts.xlsx</strong> in your backend folder. <a href={`${apiBase}/contacts/download`} target="_blank" rel="noreferrer" className="form-dl-link">⬇ Download sheet</a></p>
        </form>
      ) : (
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h3>Message Received!</h3>
          <p>Thanks for reaching out. Here's a message from the candidate:</p>
          {aiReply && <div className="ai-reply-bubble">{aiReply}</div>}
          <button className="reset-btn" onClick={() => { setDone(false); setForm({ name:'', email:'', company:'', message:'' }) }}>
            Send Another
          </button>
        </div>
      )}

      {/* Resume CTA */}
      <div className="resume-cta">
        <div className="resume-cta-left">
          <span>📄</span>
          <div>
            <p className="rta-title">Download My Resume</p>
            <p className="rta-sub">PDF · Latest version</p>
          </div>
        </div>
        <a
          href={p.resumeUrl || '#'}
          download
          className="resume-dl-btn"
          onClick={e => { if (!p.resumeUrl) { e.preventDefault(); alert('Add resumeUrl to portfolio-data.js → PROFILE_HEADER.resumeUrl') } }}
        >
          <DownloadIcon /> Download PDF
        </a>
      </div>
    </div>
  )
}

// ─── ASK AI ───────────────────────────────────────────────────────────────────
const QUICK_Q = [
  { l:'👋 Intro',    t:'Tell me about yourself' },
  { l:'🛠 Skills',   t:'What are your main technical skills?' },
  { l:'🚀 Projects', t:'Tell me about your best project' },
  { l:'💰 Salary',   t:'What is your expected salary?' },
  { l:'🌟 Why you?', t:'Why should we hire you?' },
  { l:'💪 Strength', t:'What is your greatest strength?' },
  { l:'🔥 Hard one', t:'Tell me about a challenging project' },
  { l:'📍 Location', t:'Open to relocation or remote work?' },
]

function AskAISection({ apiBase }) {
  const [msgs, setMsgs]       = useState([{
    id:1, role:'ai',
    text:"Hi! I'm the AI representative for this candidate 👋 Ask me anything about their skills, experience, projects, or availability. I answer exactly as they would.",
    ts: fmtTime()
  }])
  const [input, setInput]     = useState('')
  const [company, setCompany] = useState('')
  const [typing, setTyping]   = useState(false)
  const [showQ, setShowQ]     = useState(true)
  const bottomRef             = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs, typing])

  const send = async text => {
    if (!text.trim() || typing) return
    setShowQ(false)
    setMsgs(prev => [...prev, { id: Date.now(), role:'user', text, ts: fmtTime() }])
    setInput('')
    setTyping(true)
    try {
      const history = msgs.slice(-8).map(m => ({ role: m.role==='user' ? 'user':'assistant', content: m.text }))
      const r = await fetch(`${apiBase}/hire`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ question:text, history, company }),
      })
      const d = await r.json()
      setMsgs(prev => [...prev, { id: Date.now()+1, role:'ai', text: d.reply, ts: fmtTime() }])
    } catch {
      setMsgs(prev => [...prev, { id:Date.now()+1, role:'ai', text:"Backend offline — make sure FastAPI is running on port 8000.", ts: fmtTime() }])
    } finally { setTyping(false) }
  }

  return (
    <div className="ask-wrap">
      <div className="ask-topbar">
        <span className="ask-tb-lbl">🏢 Company:</span>
        <input className="ask-tb-input" placeholder="e.g. Google, Zoho, Infosys…" value={company} onChange={e => setCompany(e.target.value)} />
      </div>

      <div className="ask-msgs">
        <div className="ask-msgs-inner">
          {msgs.map((m, idx) => (
            <div key={m.id} className={`ask-msg ${m.role}`} style={{ animationDelay:`${idx * 0.04}s` }}>
              {m.role==='ai'   && <div className="msg-av ai-av">AI</div>}
              <div className="msg-body">
                <div className="msg-bubble">{m.text}</div>
                <span className="msg-ts">{m.ts}</span>
              </div>
              {m.role==='user' && <div className="msg-av hr-av">HR</div>}
            </div>
          ))}
          {typing && (
            <div className="ask-msg ai">
              <div className="msg-av ai-av">AI</div>
              <div className="msg-body">
                <div className="msg-bubble typing-bub">
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {showQ && (
        <div className="ask-quickgrid">
          {QUICK_Q.map(q => <button key={q.l} className="ask-qbtn" onClick={() => send(q.t)}>{q.l}</button>)}
        </div>
      )}

      <div className="ask-inputrow">
        <div className="ask-inputbox">
          <textarea
            className="ask-ta" rows={1} value={input}
            onChange={e => { setInput(e.target.value); autoGrow(e.target) }}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Ask a recruiter question…"
          />
          <button className={`ask-send ${input.trim() ? 'ready':''}`} onClick={() => send(input)}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2 8L14 2L9 14L8 9L2 8Z" fill="currentColor" opacity="0.9"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SHARED UTILS ─────────────────────────────────────────────────────────────
function SectionHead({ icon, title, sub }) {
  return (
    <div className="sec-head">
      <span className="sec-head-ico">{icon}</span>
      <div><h2 className="sec-head-title">{title}</h2>{sub && <p className="sec-head-sub">{sub}</p>}</div>
    </div>
  )
}
function Field({ label, children }) {
  return <div className="form-field"><label className="field-label">{label}</label>{children}</div>
}
function Spinner() {
  return <span className="spinner" />
}
function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function fmtTime() { return new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }) }
function autoGrow(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 100) + 'px' }
