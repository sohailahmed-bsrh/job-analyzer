import { useState } from 'react'
import { ArrowRight, Link2, Type, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../../services/jobService'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { InlineNotice } from '../../components/ui/Toast'
import './job-analysis.css'

export function JobAnalysisPage() {
  const navigate = useNavigate()
  const [sourceType, setSourceType] = useState('TEXT')
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [limitNotice, setLimitNotice] = useState('')

  const MAX_CHARS = 5000;
  const MAX_WORDS = 800;

  const getWordCount = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const handleTextChange = (e) => {
    setLimitNotice('');
    setError('');
    let text = e.target.value;
    
    // Check if new text exceeds limits (especially on paste)
    if (text.length > MAX_CHARS || getWordCount(text) > MAX_WORDS) {
      // Need to truncate
      let truncated = text.substring(0, MAX_CHARS);
      let words = truncated.split(/\s+/);
      
      if (words.length > MAX_WORDS) {
        words = words.slice(0, MAX_WORDS);
        truncated = words.join(' ');
      }
      
      setContent(truncated);
      setLimitNotice('Job description limit reached. Content was truncated.');
      return;
    }
    
    setContent(text);
  };

  const charCount = content.length;
  const wordCount = getWordCount(content);
  
  const charPercent = (charCount / MAX_CHARS) * 100;
  const wordPercent = (wordCount / MAX_WORDS) * 100;
  const maxPercent = Math.max(charPercent, wordPercent);
  
  const getCounterState = () => {
    if (maxPercent >= 100) return 'danger';
    if (maxPercent > 90) return 'warning';
    return 'muted';
  };
  
  const isInputValid = () => {
    if (!content.trim()) return false;
    if (sourceType === 'TEXT' && (charCount > MAX_CHARS || wordCount > MAX_WORDS)) return false;
    return true;
  };

  async function submit(e) {
    e.preventDefault()
    setError('')
    const value = content.trim()
    
    if (!value) {
      setError('Please provide a job advertisement.')
      return
    }
    if (sourceType === 'URL' && !/^https?:\/\//i.test(value)) {
      setError('Please provide a valid public HTTP(S) job URL.')
      return
    }
    
    setLoading(true)
    try {
      const { job } = await jobService.create({ 
        sourceType, 
        content: value, 
        title: title.trim() || undefined 
      })
      await jobService.analyze(job.id)
      await jobService.match(job.id)
      navigate(`/suggestions?jobId=${job.id}`)
    } catch(err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page job-analysis-page">
      <div className="container narrow">
        
        <div className="page-header text-center mb-8">
          <div className="eyebrow mb-4">DEVSIL Analysis Engine</div>
          <h1 className="text-display mt-4">Target Your Next Role</h1>
          <p className="muted mx-auto max-w-md mt-4">Paste the job description or provide a public URL. DEVSIL will map the requirements against your profile to find skill gaps and recommend additions.</p>
        </div>

        <div className="segmented-control mx-auto mb-8">
          <button 
            type="button"
            className={`segment ${sourceType === 'TEXT' ? 'active' : ''}`} 
            onClick={() => { setSourceType('TEXT'); setContent(''); setError(''); }}
          >
            <Type size={18}/> Paste Text
          </button>
          <div className="segment-divider">OR</div>
          <button 
            type="button"
            className={`segment ${sourceType === 'URL' ? 'active' : ''}`} 
            onClick={() => { setSourceType('URL'); setContent(''); setError(''); }}
          >
            <Link2 size={18}/> Job URL
          </button>
        </div>

        {error && <div className="mb-4"><InlineNotice tone="error">{error}</InlineNotice></div>}
        {limitNotice && <div className="mb-4"><InlineNotice tone="warning">{limitNotice}</InlineNotice></div>}

        <form className="card card-pad stack-lg" onSubmit={submit}>
          
          <Input 
            label="Target Job Title (Optional)" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. Senior Frontend Developer"
          />
          
          {sourceType === 'TEXT' ? (
            <div className="field">
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-strong)', display: 'block', marginBottom: '8px' }}>Job Advertisement</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', marginTop: 0 }}>Paste the job advertisement below. Include responsibilities, requirements, and qualifications for the best analysis.</p>
              <textarea 
                value={content} 
                onChange={handleTextChange} 
                placeholder="Paste the complete job description here..." 
                required
                className={`job-textarea ${getCounterState()}`}
                style={{ 
                  width: '100%', 
                  minHeight: '280px', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-md)', 
                  border: `1px solid ${maxPercent >= 100 ? 'var(--danger)' : maxPercent > 90 ? 'var(--warning-strong)' : 'var(--border-strong)'}`, 
                  outline: 'none', 
                  fontFamily: 'inherit', 
                  resize: 'vertical',
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: maxPercent >= 100 ? 'var(--danger)' : maxPercent > 90 ? 'var(--warning-strong)' : 'var(--text-muted)' }}>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
                </span>
                <span style={{ color: maxPercent >= 100 ? 'var(--danger)' : maxPercent > 90 ? 'var(--warning-strong)' : 'var(--text-muted)' }}>
                  {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()} words
                </span>
              </div>
            </div>
          ) : (
            <Input 
              label="Public Job URL" 
              type="url" 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="https://company.com/careers/job" 
              required 
              hint="Note: Private, local, or intranet URLs will not work. Use plain text if the job is hidden behind a login."
            />
          )}

          {loading ? (
            <div className="analysis-loading-card card card-pad text-center mt-4">
              <h3 className="text-display mb-4" style={{ color: 'var(--accent)' }}>Analyzing your profile...</h3>
              <div className="loading-steps stack-sm text-left mx-auto" style={{ maxWidth: '280px' }}>
                <p className="row-center" style={{ justifyContent: 'flex-start' }}><Target size={16} color="var(--success)"/> Reading job requirements...</p>
                <p className="row-center" style={{ justifyContent: 'flex-start' }}><Target size={16} color="var(--success)"/> Comparing your skills...</p>
                <p className="row-center" style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}><Target size={16}/> Finding experience gaps...</p>
                <p className="row-center" style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}><Target size={16}/> Preparing AI recommendations...</p>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <Button type="submit" size="lg" disabled={!isInputValid()} className="w-full analyze-btn-primary" icon={<ArrowRight size={20} />} style={{ fontSize: '1.1rem', fontWeight: '700', padding: '16px', background: isInputValid() ? 'var(--accent)' : 'var(--surface-hover)' }}>
                ✨ Analyze Job & Continue
              </Button>
            </div>
          )}

        </form>

      </div>
    </div>
  )
}
