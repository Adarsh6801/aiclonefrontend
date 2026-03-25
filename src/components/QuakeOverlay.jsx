// QuakeOverlay.jsx — dramatic earthquake overlay
import './QuakeOverlay.css'

export default function QuakeOverlay({ message }) {
  return (
    <div className="quake-overlay">
      <div className="quake-msg">{message}</div>
      <div className="cracks">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="crack" style={{ '--i': i }} />
        ))}
      </div>
      <div className="quake-vignette" />
    </div>
  )
}
