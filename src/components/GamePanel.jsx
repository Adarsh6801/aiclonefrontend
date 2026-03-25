import { useState, useEffect } from 'react'
import './GamePanel.css'

const S = { INTRO: 'intro', SETUP: 'setup', THINK: 'think', PLAYING: 'playing', GUESSING: 'guessing', RESULT: 'result', OVER: 'over' }

const AKI_FACE = {
  idle:      '🧞',
  thinking:  '🔮',
  confident: '😏',
  unsure:    '🤨',
  guessing:  '🎯',
  won:       '😈',
  lost:      '😤',
}

const AKI_MSGS = [
  "Hmm… let me start reading your mind 🔮",
  "Interesting… keep going…",
  "I'm starting to see something…",
  "My crystal ball is warming up…",
  "The clues are coming together…",
  "Oh I think I know… or do I? 😏",
  "Getting warmer… much warmer…",
  "I can feel it… almost there…",
  "I'm 80% sure I have it…",
  "Just a couple more to be certain…",
  "I think I know exactly who it is!",
  "Final question before my big reveal…",
]

export default function GamePanel({ apiBase, scores, setScores }) {
  const [stage, setStage]           = useState(S.INTRO)
  const [playerName, setPlayerName] = useState('')
  const [sessionId, setSessionId]   = useState('')
  const [greeting, setGreeting]     = useState('')
  const [qas, setQas]               = useState([])
  const [currentQ, setCurrentQ]     = useState('')
  const [answer, setAnswer]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [aiGuess, setAiGuess]       = useState('')
  const [aiConf, setAiConf]         = useState('')
  const [aiReason, setAiReason]     = useState('')
  const [actualName, setActualName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [roundResult, setRoundResult]     = useState(null)
  const [akiFace, setAkiFace]       = useState(AKI_FACE.idle)
  const [akiMsg, setAkiMsg]         = useState('')
  const [questionKey, setQuestionKey] = useState(0)
  const [selectedAns, setSelectedAns] = useState(null)
  const [guessingAnim, setGuessingAnim] = useState(false)

  const qNum    = qas.length
  const maxQ    = 35
  const progress = Math.min((qNum / maxQ) * 100, 100)

  useEffect(() => {
    if (stage === S.PLAYING) {
      const face = qNum < 3 ? AKI_FACE.thinking : qNum < 7 ? AKI_FACE.unsure : AKI_FACE.confident
      setAkiFace(face)
      setAkiMsg(AKI_MSGS[qNum] || 'Almost there…')
    }
  }, [qNum, stage])

  // ── START GAME
  const startGame = async () => {
    if (!playerName.trim()) return
    setStage(S.THINK)
    setLoading(true)
    try {
      const r = await fetch(`${apiBase}/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName })
      })
      const d = await r.json()
      setSessionId(d.session_id)
      setGreeting(d.greeting)
      setCurrentQ(d.first_question)
      setQas([])
    } catch {
      setSessionId('local')
      setGreeting(`Okay ${playerName}, think of someone famous — don't tell me!`)
      setCurrentQ('Is the person you\'re thinking of currently alive?')
      setQas([])
    } finally {
      setLoading(false)
      setTimeout(() => {
        setStage(S.PLAYING)
        setAkiFace(AKI_FACE.thinking)
        setAkiMsg(AKI_MSGS[0])
      }, 2400)
    }
  }

  // ── SUBMIT ANSWER
  const submitAnswer = async (ans) => {
    if (!ans || loading) return
    setSelectedAns(ans)
    setLoading(true)
    setAnswer('')
    const clue = `${currentQ} → ${ans}`
    const newQas = [...qas, { q: currentQ, a: ans }]
    setQas(newQas)
    const allClues = newQas.map(item => `${item.q} → ${item.a}`)

    try {
      const r = await fetch(`${apiBase}/game/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, question_number: newQas.length, clue, all_clues: allClues })
      })
      const d = await r.json()
      if (d.is_final) {
        setAiGuess(d.ai_guess || '')
        setAiConf(d.confidence || 'medium')
        setAiReason(d.reasoning || '')
        setAkiFace(AKI_FACE.guessing)
        setAkiMsg('I have my answer… brace yourself!')
        setGuessingAnim(true)
        setTimeout(() => { setGuessingAnim(false); setStage(S.RESULT) }, 3000)
      } else {
        setCurrentQ(d.next_question)
        setQuestionKey(k => k + 1)
        setSelectedAns(null)
      }
    } catch {
      setCurrentQ('Is this person from India?')
      setQuestionKey(k => k + 1)
      setSelectedAns(null)
    } finally { setLoading(false) }
  }

  // ── RESOLVE
  const resolve = (aiWon, name = '') => {
    if (aiWon) {
      setScores(s => ({ ...s, ai: s.ai + 1 }))
      setRoundResult('ai')
      setAkiFace(AKI_FACE.won)
    } else {
      setScores(s => ({ ...s, you: s.you + 1 }))
      setRoundResult('you')
      setActualName(name)
      setAkiFace(AKI_FACE.lost)
    }
    setStage(S.OVER)
  }

  // ── RESET
  const playAgain = () => {
    setStage(S.SETUP)
    setQas([])
    setCurrentQ('')
    setAiGuess('')
    setAiConf('')
    setAiReason('')
    setActualName('')
    setShowNameInput(false)
    setRoundResult(null)
    setAkiFace(AKI_FACE.idle)
    setAkiMsg('')
    setSelectedAns(null)
    setGuessingAnim(false)
  }

  const ANS_OPTS = [
    { label: 'Yes',          val: 'Yes',            icon: '✅' },
    { label: 'No',           val: 'No',             icon: '❌' },
    { label: 'Probably',     val: 'Probably',       icon: '🤔' },
    { label: 'Probably not', val: 'Probably not',   icon: '🙅' },
    { label: "Don't know",   val: "I don't know",   icon: '🤷' },
  ]

  return (
    <div className="game-panel">

      {/* SCOREBOARD */}
      <div className="scoreboard">
        <div className="sb-side">
          <div className="sb-label">🤖 Adarsh</div>
          <div className="sb-score ai">{scores.ai}</div>
        </div>
        <div className="sb-divider"><span>VS</span><div className="sb-star">⚔️</div></div>
        <div className="sb-side">
          <div className="sb-score you">{scores.you}</div>
          <div className="sb-label">🧑 {playerName || 'You'}</div>
        </div>
      </div>

      {/* INTRO */}
      {stage === S.INTRO && (
        <div className="game-card intro-card">
          <div className="aki-avatar-large">🧞</div>
          <h2 className="game-title">I Can Read Your Mind</h2>
          <p className="game-desc">
            Think of any famous person. I&apos;ll keep narrowing with smarter yes/no questions until I&apos;m genuinely confident about the answer. Let&apos;s see how long you can keep me guessing.
          </p>
          <div className="rules-grid">
            {[
              ['🧠', 'Think of anyone famous'],
              ['❓', 'Answer yes/no honestly'],
              ['🎯', 'I play for accuracy'],
              ['🏆', 'Can you stump the AI?'],
            ].map(([icon, text]) => (
              <div key={text} className="rule-chip"><span>{icon}</span>{text}</div>
            ))}
          </div>
          <button className="game-cta" onClick={() => setStage(S.SETUP)}>Challenge Me →</button>
        </div>
      )}

      {/* SETUP */}
      {stage === S.SETUP && (
        <div className="game-card setup-card">
          <div className="aki-avatar-large">🧞</div>
          <h2 className="game-title">Who Are You?</h2>
          <p className="game-desc">Tell me your name — then secretly think of a famous person. Don't tell me who!</p>
          <input
            className="g-input"
            autoFocus
            placeholder="Your name…"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && startGame()}
            maxLength={30}
          />
          <div className="think-note">
            <span>💡</span>
            <span>Lock in your famous person now — no changing your mind later!</span>
          </div>
          <button className="game-cta" onClick={startGame} disabled={!playerName.trim() || loading}>
            {loading ? 'Opening the portal…' : "I'm Ready — Let's Go! →"}
          </button>
        </div>
      )}

      {/* THINK (transition animation) */}
      {stage === S.THINK && (
        <div className="game-card think-card">
          <div className="aki-avatar-large pulsing">🔮</div>
          <h2 className="game-title">Opening My Mind…</h2>
          <p className="game-desc">{greeting || `Okay ${playerName}, think carefully. I'm already reading the signals…`}</p>
          <div className="think-waves">
            <div className="wave" /><div className="wave" /><div className="wave" />
          </div>
          <p className="think-sub">Calibrating psychic powers…</p>
        </div>
      )}

      {/* PLAYING */}
      {stage === S.PLAYING && (
        <div className="game-card playing-card">

          {/* Akinator character row */}
          <div className="aki-header">
            <div className="aki-avatar-play">{akiFace}</div>
            <div className="aki-speech-bubble">{akiMsg}</div>
          </div>

          {/* Progress */}
          <div className="progress-row">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">Q{qNum + 1}/{maxQ}</span>
          </div>

          {/* Confidence dots */}
          <div className="conf-meter">
            <span className="conf-label">Confidence:</span>
            <div className="conf-dots">
              {Array.from({length: 12}, (_, i) => (
                <div key={i} className={`conf-dot ${i < qNum ? (qNum >= 9 ? 'hot' : qNum >= 5 ? 'warm' : 'cool') : ''}`} />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="q-card" key={questionKey}>
            <div className="q-num-badge">Question {qNum + 1}</div>
            <p className="q-text">{loading ? 'Thinking of my next question…' : currentQ}</p>
          </div>

          {/* Answer buttons */}
          <div className="answer-grid">
            {ANS_OPTS.map(({ label, val, icon }) => (
              <button
                key={val}
                className={`ans-btn ${selectedAns === val ? 'selected' : ''}`}
                disabled={loading}
                onClick={() => submitAnswer(val)}
              >
                <span className="ans-icon">{icon}</span>
                <span className="ans-label">{label}</span>
              </button>
            ))}
          </div>

          {/* Clue trail */}
          {qas.length > 0 && (
            <div className="clue-trail">
              <p className="trail-head">📜 Clues so far ({qas.length})</p>
              <div className="trail-list">
                {qas.slice(-4).map((item, i) => (
                  <div key={i} className="trail-item">
                    <span className="trail-q">{item.q}</span>
                    <span className="trail-a">{item.a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GUESSING ANIMATION */}
      {guessingAnim && (
        <div className="game-card guessing-card">
          <div className="aki-avatar-large pulsing">🎯</div>
          <h2 className="game-title">I've got it…</h2>
          <div className="guess-rings">
            <div className="guess-ring" /><div className="guess-ring d1" /><div className="guess-ring d2" />
          </div>
          <p className="game-desc">Preparing my final answer…</p>
        </div>
      )}

      {/* RESULT */}
      {stage === S.RESULT && !guessingAnim && (
        <div className="game-card result-card">
          <p className="result-intro-line">After {qas.length} questions, I think you were thinking of…</p>

          <div className={`reveal-box ${aiConf}`}>
            <div className="reveal-glow" />
            <div className="reveal-icon">🎯</div>
            <div className="reveal-name">{aiGuess}</div>
            {aiReason && <div className="reveal-reason">"{aiReason}"</div>}
            <div className="reveal-conf-row">
              <span>Confidence:</span>
              <span className={`conf-pill ${aiConf}`}>
                {aiConf === 'high' ? '⭐⭐⭐ High' : aiConf === 'medium' ? '⭐⭐ Medium' : '⭐ Low'}
              </span>
            </div>
          </div>

          {!showNameInput ? (
            <div className="verdict-row">
              <button className="verdict-btn yes-btn" onClick={() => resolve(true)}>
                <span>✅</span><span>Yes, correct!</span>
              </button>
              <button className="verdict-btn no-btn" onClick={() => setShowNameInput(true)}>
                <span>❌</span><span>Nope, I win!</span>
              </button>
            </div>
          ) : (
            <div className="reveal-actual">
              <p className="reveal-ask">🤔 Who were you actually thinking of?</p>
              <div className="custom-ans">
                <input
                  className="g-input"
                  autoFocus
                  placeholder="The actual answer…"
                  value={actualName}
                  onChange={e => setActualName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && actualName.trim() && resolve(false, actualName.trim())}
                />
                <button className="ans-send" disabled={!actualName.trim()} onClick={() => resolve(false, actualName.trim())}>→</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROUND OVER */}
      {stage === S.OVER && (
        <div className="game-card over-card">
          <div className={`round-result-banner ${roundResult}`}>
            <div className="result-icon">{roundResult === 'ai' ? '🤖' : '🎉'}</div>
            {roundResult === 'ai' ? (
              <><h3>I Got It!</h3><p>My psychic powers prevail! Too powerful 😈</p></>
            ) : (
              <><h3>You Stumped Me!</h3><p>It was <strong>{actualName}</strong>! Well played, {playerName}! 🏆</p></>
            )}
          </div>

          <div className="final-board">
            <div className="fb-col ai-col"><div className="fb-label">🤖 AI</div><div className="fb-num">{scores.ai}</div></div>
            <div className="fb-divider">:</div>
            <div className="fb-col you-col"><div className="fb-num">{scores.you}</div><div className="fb-label">🧑 {playerName}</div></div>
          </div>

          <div className="over-actions">
            <button className="game-cta" onClick={playAgain}>Play Again →</button>
            <button className="game-cta secondary" onClick={() => { setStage(S.INTRO); setRoundResult(null) }}>Main Menu</button>
          </div>
        </div>
      )}
    </div>
  )
}
