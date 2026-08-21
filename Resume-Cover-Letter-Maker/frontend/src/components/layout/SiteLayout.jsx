import { Link, Outlet, useLocation } from 'react-router-dom'
import { FileText, Sparkles, Check, ChevronRight } from 'lucide-react'
import './SiteLayout.css'

function Stepper() {
  const location = useLocation()
  const path = location.pathname

  if (path === '/') return null

  const steps = [
    { id: 1, label: 'Profile', path: '/candidate', match: '/candidate' },
    { id: 2, label: 'Job', path: '/job-analysis', match: '/job-analysis' },
    { id: 3, label: 'Analysis', path: '/suggestions', match: '/suggestions' },
    { id: 4, label: 'Generate', path: '/generate/templates', match: '/generate' }
  ]

  let currentStepIndex = steps.findIndex(s => path.startsWith(s.match))
  if (currentStepIndex === -1) currentStepIndex = 0

  return (
    <div className="stepper-container">
      <div className="stepper">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex
          const isPast = idx < currentStepIndex

          return (
            <div key={step.id} className="stepper-item">
              <Link
                to={step.path}
                className={`step-link ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
              >
                <span className="step-indicator">
                  {isPast ? <Check size={14} /> : step.id}
                </span>
                <span className="step-label">{step.label}</span>
              </Link>
              {idx < steps.length - 1 && (
                <ChevronRight size={14} className="step-separator" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SiteLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/">
            <img src="/sohail.png" alt="Devsil Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <Stepper />
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="footer">
        <div><FileText size={16} /> Devsil Resume & Cover Letter Maker</div>
        <span>Built for focused, job-specific applications.</span>
      </footer>
    </div>
  )
}
