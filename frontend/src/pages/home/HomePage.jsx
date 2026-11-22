import { ArrowRight, Check, FileUp, Sparkles, Target, WandSparkles, FileText, User, BriefcaseBusiness, SearchCheck, FilePen } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import './home.css'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-wrapper">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy animate-rise">
            <div className="hero-kicker">
              <Sparkles size={16} className="kicker-icon" /> 
              <span>Anonymous Workspace · No Login Required</span>
            </div>
            <h1 className="text-display">Build a sharper CV for the job you actually want.</h1>
            <p>
              Upload your CV or build it manually. Add a job ad. Devsil maps the role requirements to your evidence, suggests improvements, and generates a perfectly tailored resume and cover letter.
            </p>
            <div className="hero-actions">
              <button onClick={() => navigate('/candidate')} className="btn hero-primary">
                <FilePen size={20} /> Build My Resume <ArrowRight size={18} style={{ opacity: 0.7 }} />
              </button>
            </div>
            <div className="hero-proof">
              <span><Check size={16} /> ATS-aware</span>
              <span><Check size={16} /> Evidence-first</span>
              <span><Check size={16} /> PDF Export</span>
              <span><Check size={16} /> 100% Private</span>
            </div>
          </div>
          
          <div className="hero-panel animate-rise delay-1">
            <div className="mock-window">
              <div className="mock-top">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
                <b>Devsil Workflow</b>
              </div>
              <div className="mock-body">
                <div className="mock-stat">
                  <span>Match strength</span>
                  <strong>92%</strong>
                  <div className="progress-bar"><div className="progress-fill" style={{width: '92%'}}></div></div>
                  <small>Calculated after real profile + job analysis</small>
                </div>
                
                <div className="mock-steps">
                  <div className="mock-step completed">
                    <span className="step-num"><Check size={20} /></span>
                    <div>
                      <b>Candidate profile</b>
                      <small>Upload or enter your CV details</small>
                    </div>
                  </div>
                  <div className="mock-step active">
                    <span className="step-num"><BriefcaseBusiness size={20} /></span>
                    <div>
                      <b>Job analysis</b>
                      <small>Required skills, experience, education</small>
                    </div>
                  </div>
                  <div className="mock-step upcoming">
                    <span className="step-num"><WandSparkles size={20} /></span>
                    <div>
                      <b>Tailored documents</b>
                      <small>Select ATS, Simple or Europass-inspired</small>
                    </div>
                  </div>
                </div>
                
                <div className="mock-footer">
                  <Target size={20} className="footer-icon" />
                  <div>
                    <b>Suggestions stay editable.</b>
                    <small>You approve what gets added to your profile.</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="container">
          <div className="grid-3">
            <div className="feature-card animate-rise">
              <div className="feature-icon bg-indigo"><FileUp size={28} /></div>
              <h3 className="text-display">Upload or type</h3>
              <p>Start from your PDF/DOCX CV, or enter your profile manually and keep full control of your narrative.</p>
            </div>
            <div className="feature-card animate-rise delay-1">
              <div className="feature-icon bg-indigo"><SearchCheck size={28} /></div>
              <h3 className="text-display">Understand the job</h3>
              <p>Analyze required skills, experience, education, responsibilities, and critical ATS keywords in seconds.</p>
            </div>
            <div className="feature-card animate-rise delay-2">
              <div className="feature-icon bg-indigo"><WandSparkles size={28} /></div>
              <h3 className="text-display">Generate with evidence</h3>
              <p>Turn approved candidate evidence into a targeted resume and professional cover letter guaranteed to impress.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
