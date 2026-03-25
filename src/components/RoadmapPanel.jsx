import { useState } from 'react'
import './RoadmapPanel.css'

const NOW = {
  title: 'Learning and Exploring New AI Features',
  desc: 'Right now I am focused on exploring new AI features, testing ideas quickly, and turning promising experiments into real product experiences.',
  tech: ['Generative AI', 'Automation', 'Product Thinking', 'Experiments'],
  progress: 82,
  started: 'Present',
}

const ROADMAP = [
  { id: 1, phase: '2022', title: 'Selfthought Exploring', desc: 'Started the journey by learning on my own, exploring technology deeply, and building the basics through curiosity and consistency.', items: ['Began self-taught programming', 'Explored core concepts independently', 'Built the foundation through practice'] },
  { id: 2, phase: 'Step 2', title: 'Doing Some Project', desc: 'Moved from learning into building by creating projects and using them to sharpen problem-solving and execution.', items: ['Worked on some projects', 'Added static projects for the timeline', 'Learned by building real things'] },
  { id: 3, phase: 'Step 3', title: 'Hired Team tweaks', desc: 'Stepped into professional work, adapted quickly, and learned how to deliver inside a real product team.', items: ['Joined Team Tweaks', 'Started working in a professional environment', 'Learned team collaboration and delivery'] },
  { id: 4, phase: 'Step 4', title: 'Worked on More Projects', desc: 'Expanded across more projects, more business cases, and more technology stacks while improving speed and ownership.', items: ['Worked on more projects', 'Handled different requirements and domains', 'Built confidence across stacks'] },
  { id: 5, phase: 'Step 5', title: 'Self Learning Generative AI', desc: 'Started exploring Generative AI independently and connected AI ideas with practical software engineering work.', items: ['Self learned Generative AI', 'Explored AI integrations', 'Started applying AI in product thinking'] },
  { id: 6, phase: 'Step 6', title: 'Promoted as lead', desc: 'Took on stronger ownership, supported delivery, and grew into a more leadership-driven role.', items: ['Promoted as lead', 'Handled more responsibility', 'Balanced execution with coordination'] },
  { id: 7, phase: 'Step 7', title: 'Learning and exploring new AI features', desc: 'Currently pushing deeper into new AI capabilities and exploring how emerging features can become useful real-world experiences.', items: ['Exploring new AI features', 'Testing ideas quickly', 'Building toward smarter experiences'] },
]

export default function RoadmapPanel() {
  const [openId, setOpenId] = useState(6)

  return (
    <div className="rm-panel">
      <div className="rm-header">
        <div>
          <h2 className="rm-title">My Career Roadmap</h2>
          <p className="rm-subtitle">The journey so far, the milestones, and what I am exploring now</p>
        </div>
        <div className="rm-live-dot"><span className="live-ping" />Live</div>
      </div>

      <div className="now-card">
        <div className="now-badge">Building Now</div>
        <h3>{NOW.title}</h3>
        <p>{NOW.desc}</p>
        <div className="tag-row">{NOW.tech.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}</div>
        <div className="progress-row"><span>Started {NOW.started}</span><strong>{NOW.progress}%</strong></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${NOW.progress}%` }} /></div>
      </div>

      <div className="rm-section-label">Career Journey</div>
      <div className="phase-list">
        {ROADMAP.map(item => (
          <div key={item.id} className="phase-card">
            <button className="phase-head" onClick={() => setOpenId(openId === item.id ? null : item.id)}>
              <div>
                <div className="phase-label">{item.phase}</div>
                <div className="phase-title">{item.title}</div>
              </div>
              <div className="phase-right">{item.id === openId ? '▲' : '▼'}</div>
            </button>
            {openId === item.id && (
              <div className="phase-body">
                <p>{item.desc}</p>
                {item.items.map(point => <div key={point} className="phase-item"><span>•</span>{point}</div>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
