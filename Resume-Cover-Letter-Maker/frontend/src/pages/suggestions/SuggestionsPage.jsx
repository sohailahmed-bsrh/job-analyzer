import { useEffect, useState } from 'react'
import { Check, Lightbulb, PenLine, Sparkles, ArrowRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { jobService } from '../../services/jobService'
import { SectionTitle } from '../../components/ui/SectionTitle'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { InlineNotice } from '../../components/ui/Toast'
import './suggestions.css'

export function SuggestionsPage() {
  const [params] = useSearchParams()
  const jobId = params.get('jobId')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!jobId) {
      setLoading(false)
      return
    }
    Promise.all([
      jobService.get(jobId),
      jobService.suggestions(jobId)
    ])
    .then(([job, suggestions]) => {
      // Look for the most recent match result attached to this job
      const matchObj = job.job.matchResults?.[job.job.matchResults.length - 1] || {}
      setData({
        ...job.job,
        matchScore: matchObj.score,
        matchExplanation: matchObj.explanation,
        suggestions: suggestions.suggestions
      })
    })
    .catch(e => setError(e.message))
    .finally(() => setLoading(false))
  }, [jobId])

  async function approve(id) {
    try {
      await jobService.approveSuggestion(jobId, id)
      setData(d => ({
        ...d,
        suggestions: d.suggestions.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s)
      }))
    } catch(e) {
      setError(e.message)
    }
  }

  if (!jobId) return <div className="page"><div className="container"><InlineNotice tone="error">No job selected.</InlineNotice></div></div>
  if (loading) return <div className="page"><div className="container"><LoadingState label="Loading job analysis and generating suggestions..." /></div></div>
  if (!data && error) return <div className="page"><div className="container"><InlineNotice tone="error">{error}</InlineNotice></div></div>

  const analysis = data?.analysis || {}

  return (
    <div className="page suggestions-page">
      <div className="container">
        
        <div className="page-header text-center mb-8">
          <div className="eyebrow mb-4">DEVSIL Analytics</div>
          <h1 className="text-display mt-4">Job Match Analysis</h1>
          <p className="muted mx-auto max-w-md mt-4">Review your match strength against the required skills. Approve actionable AI suggestions to seamlessly inject missing skills into your final documents.</p>
        </div>

        {error && <div className="mb-4"><InlineNotice tone="error">{error}</InlineNotice></div>}

        <div className="analysis-summary card card-pad">
          <div className="score-box text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)', borderRadius: 'var(--radius-lg)' }}>
            <span className="score-label" style={{ color: 'var(--text-subtle)' }}>Match Score</span>
            <strong className="score-value" style={{ fontSize: '4.5rem', color: '#fff', fontFamily: 'var(--font-display)', lineHeight: '1.2' }}>{data.matchScore == null ? '—' : `${Math.round(data.matchScore)}%`}</strong>
            <small className="score-hint" style={{ color: 'var(--text-subtle)' }}>{data.matchScore == null ? 'Insufficient evidence' : data.matchExplanation}</small>
          </div>
          
          <div className="req-list">
            <div>
              <h4 className="req-heading">Job Requirements Check</h4>
              <div className="chip-wrap mt-4">
                {(analysis.requiredSkills || []).length > 0 
                  ? (analysis.requiredSkills).map(s => {
                      // Determine if user has the skill
                      const hasSkill = data.skills?.some(userSkill => userSkill.toLowerCase() === s.toLowerCase());
                      const chipClass = hasSkill ? 'chip chip-success' : 'chip chip-warning';
                      const Icon = hasSkill ? Check : Sparkles;
                      return <span className={chipClass} key={s}><Icon size={14}/> {s}</span>;
                    })
                  : <span className="muted text-sm">No explicit skills found.</span>
                }
              </div>
            </div>
            <div className="grid-2 mt-4">
              <div className="card card-pad" style={{ background: 'var(--surface-soft)', border: 'none' }}>
                <h4 className="req-heading text-display">Education</h4>
                <p className="muted">{analysis.educationRequirement || 'No explicit degree requirement found.'}</p>
              </div>
              <div className="card card-pad" style={{ background: 'var(--surface-soft)', border: 'none' }}>
                <h4 className="req-heading text-display">Experience</h4>
                <p className="muted">{analysis.experienceRequirement || 'No explicit experience requirement found.'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="suggestions-header">
          <div>
            <h2 className="text-display section-title">AI Suggestions</h2>
            <p className="muted">Approve these additions to seamlessly inject missing skills into your generated documents.</p>
          </div>
        </div>

        <div className="suggestion-grid stack-lg">
          {(data.suggestions || []).length ? data.suggestions.map(s => (
            <div className={`suggestion-card card ${s.status === 'APPROVED' ? 'approved' : ''}`} key={s.id}>
              <div className="suggestion-icon-wrap">
                {s.status === 'APPROVED' ? <Check size={24} className="text-success" /> : <Lightbulb size={24} className="text-accent" />}
              </div>
              <div className="suggestion-content">
                <h4 className="text-display" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{s.title}</h4>
                <p className="muted" style={{ marginBottom: '16px' }}>{s.reason}</p>
                {s.proposedEvidence && (
                  <div className="evidence-box">
                    <Sparkles size={16} className="text-accent" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.proposedEvidence}</span>
                  </div>
                )}
              </div>
              <div className="suggestion-action" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Button 
                  size="md" 
                  variant={s.status === 'APPROVED' ? 'ghost' : 'secondary'} 
                  disabled={s.status === 'APPROVED'}
                  // In a real app, 'Dismiss' would have an endpoint. We just visually disabled it here for demo
                >
                  {s.status === 'APPROVED' ? 'Added' : 'Dismiss'}
                </Button>
                <Button 
                  size="md" 
                  variant={s.status === 'APPROVED' ? 'success' : 'primary'} 
                  disabled={s.status === 'APPROVED'} 
                  onClick={() => approve(s.id)} 
                  icon={s.status === 'APPROVED' ? <Check size={16}/> : <PenLine size={16}/>}
                >
                  {s.status === 'APPROVED' ? 'Added to CV' : 'Add to CV'}
                </Button>
              </div>
            </div>
          )) : (
            <div className="card card-pad text-center empty-suggestions">
              <Sparkles size={48} className="text-accent mb-4 mx-auto" />
              <h3 className="text-display mt-4">No actionable gaps found!</h3>
              <p className="muted mt-4">Your current profile already provides excellent coverage for this role.</p>
            </div>
          )}
        </div>

        <div className="divider mt-8 mb-8" />
        
        <div className="action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <Link to={`/job-analysis`} className="btn btn-ghost">
            ← Back to Job Input
          </Link>
          <Link to={`/generate/templates?jobId=${jobId}`} className="btn btn-primary btn-lg" style={{ background: 'var(--accent)', fontSize: '1.1rem' }}>
            Continue to Template Selection →
          </Link>
        </div>

      </div>
    </div>
  )
}
