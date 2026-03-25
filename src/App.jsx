import { useState, useEffect, useRef, useCallback } from "react";
import ChatPanel from "./components/ChatPanel";
import GamePanel from "./components/GamePanel";
import HirePanel from "./components/HirePanel";
import RoadmapPanel from "./components/RoadmapPanel";
import LearnPanel from "./components/LearnPanel";
import BlogPanel from "./components/BlogPanel";
import ParticleCanvas from "./components/ParticleCanvas";
import QuakeOverlay from "./components/QuakeOverlay";
import "./styles/app.css";

// Artificial Intelligence (AI) is no longer a futuristic concept—it’s a present-day reality shaping how we live, work, and interact with technology. From smart assistants to self-driving cars, AI is rapidly transforming industries and redefining human potential.

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark",
  );
  const [tab, setTab] = useState("chat");
  const [scores, setScores] = useState({ ai: 0, you: 0 });

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: "Eda, what's up! I'm your Adarsh 👋 Ask me anything — I basically know everything about myself 😄",
      ts: now(),
    },
  ]);
  const [typing, setTyping] = useState(false);

  const quakeLock = useRef(false);
  const positions = useRef([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const [quaking, setQuaking] = useState(false);
  const [quakeMsg, setQuakeMsg] = useState("");

  const idleTimer = useRef(null);
  const idleFired = useRef(false);

  // ── THEME (persist) ────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ── EARTHQUAKE ─────────────────────────────────────────────────
  useEffect(() => {
    const WINDOW_MS = 300,
      THRESHOLD = 1800,
      COOLDOWN = 4200;
    const onMove = (e) => {
      if (quakeLock.current) return;
      const t = Date.now();
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      positions.current.push({ dist: Math.sqrt(dx * dx + dy * dy), t });
      positions.current = positions.current.filter((p) => t - p.t < WINDOW_MS);
      const total = positions.current.reduce((s, p) => s + p.dist, 0);
      if (total > THRESHOLD) {
        quakeLock.current = true;
        positions.current = [];
        doQuake();
        setTimeout(() => {
          quakeLock.current = false;
        }, COOLDOWN);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const doQuake = async () => {
    setQuaking(true);
    const fallbacks = [
      "AAAAAA WE ARE ALL DYING 😱",
      "SYSTEM MELTDOWN 🚨 RUN",
      "ENTHO SAMBHAVIKKUNU 😱 HELP",
      "I AM TOO YOUNG TO CRASH 💀",
      "WE ARE ENDING BRO 😱😱😱",
    ];
    setQuakeMsg(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    try {
      const r = await fetch(`${API}/quake-react`);
      const d = await r.json();
      if (d.message) setQuakeMsg(d.message);
    } catch {}
    setTimeout(() => {
      setQuaking(false);
      setQuakeMsg("");
    }, 3800);
  };

  // ── IDLE NUDGE ──────────────────────────────────────────────────
  const resetIdle = useCallback(() => {
    idleFired.current = false;
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(async () => {
      if (document.visibilityState !== "visible" || idleFired.current) return;
      idleFired.current = true;
      try {
        const r = await fetch(`${API}/idle-nudge`);
        const d = await r.json();
        pushAI(d.message, true);
      } catch {
        pushAI("eda, you still there? 👀", true);
      }
    }, 22000);
  }, []);

  useEffect(() => {
    const evts = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    evts.forEach((e) => window.addEventListener(e, resetIdle));
    resetIdle();
    return () => {
      evts.forEach((e) => window.removeEventListener(e, resetIdle));
      clearTimeout(idleTimer.current);
    };
  }, [resetIdle]);

  // ── CHAT ───────────────────────────────────────────────────────
  function pushAI(text, isNudge = false) {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "ai", text, ts: now(), isNudge },
    ]);
  }

  const sendMessage = async (text) => {
    if (!text.trim() || typing) return;
    resetIdle();
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text, ts: now() },
    ]);
    setTyping(true);
    try {
      const history = messages
        .slice(-8)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }));
      const r = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const d = await r.json();
      pushAI(d.reply);
    } catch {
      pushAI("Aayo, my brain glitched 🧠💥 Is FastAPI running on port 8000?");
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className={`app-root ${quaking ? "quaking" : ""}`} data-theme={theme}>
      <ParticleCanvas theme={theme} />
      {quaking && <QuakeOverlay message={quakeMsg} />}

      <div className="shell">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-orb">
              <span>AI</span>
              <div className="orb-ring" />
              <div className="orb-ring orb-ring-2" />
            </div>
            <div className="brand-text">
              <h1>Its Me Adarsh</h1>
              <span className="status-pill">● Online</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${tab === "chat" ? "active" : ""}`}
              onClick={() => setTab("chat")}
            >
              <IconChat />
              <span>Chat</span>
            </button>
            <button
              className={`nav-item ${tab === "game" ? "active" : ""}`}
              onClick={() => setTab("game")}
            >
              <IconGame />
              <span>Guess Who</span>
              {(scores.ai > 0 || scores.you > 0) && (
                <span className="score-badge">
                  {scores.ai}:{scores.you}
                </span>
              )}
              <span className="dev-badge">Dev</span>
            </button>
            <button
              className={`nav-item hire-nav ${tab === "hire" ? "active" : ""}`}
              onClick={() => setTab("hire")}
            >
              <IconHire />
              <span>Hire Me</span>
            </button>
            <button
              className={`nav-item ${tab === "roadmap" ? "active" : ""}`}
              onClick={() => setTab("roadmap")}
            >
              <IconRoadmap />
              <span>Roadmap</span>
              <span className="live-badge">Live</span>
            </button>
            <button
              className={`nav-item ${tab === "learn" ? "active" : ""}`}
              onClick={() => setTab("learn")}
            >
              <IconLearn />
              <span>Learn With Me</span>
            </button>
            <button
              className={`nav-item ${tab === "blog" ? "active" : ""}`}
              onClick={() => setTab("blog")}
            >
              <IconBlog />
              <span>Blog</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button
              className="theme-btn"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <IconSun /> : <IconMoon />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main-content">
          {tab === "chat" && (
            <ChatPanel
              messages={messages}
              typing={typing}
              onSend={sendMessage}
            />
          )}
          {tab === "game" && (
            <GamePanel apiBase={API} scores={scores} setScores={setScores} />
          )}
          {tab === "hire" && <HirePanel apiBase={API} />}
          {tab === "roadmap" && <RoadmapPanel apiBase={API} />}
          {tab === "learn" && <LearnPanel apiBase={API} />}
          {tab === "blog" && <BlogPanel apiBase={API} />}
        </main>
      </div>
    </div>
  );
}

function now() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function IconChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M14 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3l2 2 2-2h5a1 1 0 001-1V3a1 1 0 00-1-1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconGame() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="4"
        width="14"
        height="9"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5 8.5h3M6.5 7v3M10.5 8h1M10.5 9.5h1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconHire() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="2"
        y="4"
        width="12"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M8 8v3M6.5 9.5h3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconRoadmap() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 12L6 4l4 6 2-3 2 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconBlog() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5 6h6M5 9h4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconLearn() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2.5 3.5h4a2 2 0 012 2v7h-4a2 2 0 01-2-2v-7zM13.5 3.5h-4a2 2 0 00-2 2v7h4a2 2 0 002-2v-7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8 5.5v7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1.06 1.06M11.94 11.94L13 13M3 13l1.06-1.06M11.94 4.06L13 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M13.5 10A5.5 5.5 0 016 2.5a6 6 0 100 11 5.5 5.5 0 007.5-3.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
