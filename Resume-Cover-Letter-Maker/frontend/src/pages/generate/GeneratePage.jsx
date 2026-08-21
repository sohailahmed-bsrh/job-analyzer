import { useState, useRef, useEffect } from 'react'
import { Copy, Download, FileText, Mail, WandSparkles, AlertCircle, ChevronDown, Check } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { generationService } from '../../services/generationService'
import { Button } from '../../components/ui/Button'
import { InlineNotice } from '../../components/ui/Toast'
import './generate.css'

export function GeneratePage() {
  const [params] = useSearchParams()
  const jobId = params.get('jobId')
  const [cvTemplateId, setCvTemplateId] = useState(localStorage.getItem('cvTemplateId') || 'ATS-1')
  const [clTemplateId, setClTemplateId] = useState(localStorage.getItem('clTemplateId') || 'CL-1')
  const [cvTone, setCvTone] = useState('PROFESSIONAL')
  const [clTone, setClTone] = useState('PROFESSIONAL')
  
  // Re-read from local storage when page becomes active in case it changed via routing
  useEffect(() => {
    setCvTemplateId(localStorage.getItem('cvTemplateId') || 'ATS-1')
    setClTemplateId(localStorage.getItem('clTemplateId') || 'CL-1')
  }, [params])
  const [toneDropdownOpen, setToneDropdownOpen] = useState(false)
  const [resume, setResume] = useState(null)
  const [letter, setLetter] = useState(null)
  const [error, setError] = useState('')
  const [loadingCV, setLoadingCV] = useState(false)
  const [loadingCL, setLoadingCL] = useState(false)
  const [copyStates, setCopyStates] = useState({})
  const [downloadStates, setDownloadStates] = useState({})
  
  const cvToneRef = useRef(null)
  const clToneRef = useRef(null)
  
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false)
  const [clDropdownOpen, setClDropdownOpen] = useState(false)

  const navigate = useNavigate()

  const cvPreviewRef = useRef(null)
  const clPreviewRef = useRef(null)
  const [cvScale, setCvScale] = useState(1)
  const [clScale, setClScale] = useState(1)

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === cvPreviewRef.current) setCvScale(entry.contentRect.width / 794)
        if (entry.target === clPreviewRef.current) setClScale(entry.contentRect.width / 794)
      }
    })
    if (cvPreviewRef.current) observer.observe(cvPreviewRef.current)
    if (clPreviewRef.current) observer.observe(clPreviewRef.current)
    return () => observer.disconnect()
  }, [resume, letter])

  useEffect(() => {
    function handleClickOutside(e) {
      if (cvToneRef.current && !cvToneRef.current.contains(e.target)) setCvDropdownOpen(false)
      if (clToneRef.current && !clToneRef.current.contains(e.target)) setClDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function generateResume() {
    setError('')
    setLoadingCV(true)
    try {
      const r = await generationService.resume(jobId, { template: cvTemplateId, tone: cvTone })
      setResume(r.document)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoadingCV(false)
    }
  }

  async function generateCoverLetter() {
    setError('')
    setLoadingCL(true)
    try {
      const c = await generationService.coverLetter(jobId, { template: clTemplateId, tone: clTone })
      setLetter(c.document)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoadingCL(false)
    }
  }

  async function download(doc) {
    try {
      setDownloadStates(prev => ({ ...prev, [doc.id]: true }))
      const blob = await generationService.exportPdf(doc.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const templateToUse = doc.type === 'RESUME' ? cvTemplateId : clTemplateId
      a.download = `${doc.type.toLowerCase()}-${templateToUse.toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch(e) {
      setError(e.message)
    } finally {
      setDownloadStates(prev => ({ ...prev, [doc.id]: false }))
    }
  }

  async function copy(doc) {
    await navigator.clipboard.writeText(doc.plainText)
    setCopyStates(prev => ({ ...prev, [doc.id]: true }))
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [doc.id]: false }))
    }, 2000)
  }

  const tones = [
    { value: 'PROFESSIONAL', label: 'Professional & Formal' },
    { value: 'FRIENDLY', label: 'Friendly & Approachable' },
    { value: 'DIRECT', label: 'Direct & Confident' }
  ]

  if (!jobId) return <div className="page"><div className="container"><InlineNotice tone="error">No job selected.</InlineNotice></div></div>

  return (
    <div className="page generate-page">
      <div className="container">
        
        <div className="page-header text-center animate-entrance">
          <div className="eyebrow mb-4">Final Polish</div>
          <h1 className="text-display mt-4">Generate Documents</h1>
          <p className="muted mx-auto max-w-md mt-4">Build your Resume and Cover Letter independently.</p>
        </div>

        {error && (
          <div className="mb-4 animate-entrance delay-2">
            <div className="card card-pad" style={{ background: 'var(--danger-soft)', borderColor: 'var(--danger)', color: 'var(--danger)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <AlertCircle size={24} style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem' }}>Generation Error</h4>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="document-grid animate-entrance delay-3" style={{ display: 'block' }}>
          
          <div className="generation-step-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '32px 0 16px' }}>
            <div style={{ background: 'var(--accent)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
            <h2 className="text-display" style={{ margin: 0, fontSize: '1.5rem' }}>Create Your Resume</h2>
          </div>
          
          {/* Resume Generator Panel */}
          <div className="document-card card mb-8">
            <div className="doc-head" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h3 className="text-display">Resume</h3>
                  <p className="muted text-sm">{resume?.title || 'Not generated yet'}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/generate/templates?jobId=${jobId}&type=CV`)}>
                  Template: {cvTemplateId}
                </Button>
              </div>
            </div>
            
            <div className="generation-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', background: 'var(--surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div className="tone-selector" style={{ flex: 1, margin: 0 }}>
                <span className="field-label" style={{ display: 'block', marginBottom: '6px' }}>Document Tone</span>
                <div className="tone-custom-wrapper" ref={cvToneRef}>
                  <div 
                    className="tone-custom-trigger" 
                    onClick={() => setCvDropdownOpen(!cvDropdownOpen)}
                    tabIndex={0}
                  >
                    <span>{tones.find(t => t.value === cvTone)?.label}</span>
                    <ChevronDown size={18} style={{ color: 'var(--text-subtle)', transform: cvDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                  {cvDropdownOpen && (
                    <div className="tone-custom-options">
                      {tones.map(t => (
                        <div 
                          key={t.value} 
                          className={`tone-option ${cvTone === t.value ? 'selected' : ''}`}
                          onClick={() => { setCvTone(t.value); setCvDropdownOpen(false) }}
                        >
                          {t.label}
                          {cvTone === t.value && <Check size={16} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button variant="primary" size="lg" icon={loadingCV ? null : <WandSparkles size={16}/>} onClick={generateResume} loading={loadingCV} style={{ marginTop: '24px' }}>
                {loadingCV ? 'Generating...' : 'Generate Resume'}
              </Button>
            </div>
            
            <div className="doc-preview-wrapper">
              {resume ? (
                <div className="paper-iframe-container" ref={cvPreviewRef}>
                  <iframe 
                    srcDoc={resume.html || `<pre>${resume.plainText}</pre>`} 
                    title="Resume Preview"
                    style={{ transform: `scale(${cvScale})` }}
                  />
                </div>
              ) : (
                <div className="doc-empty">
                  <div className="empty-icon-wrap"><FileText size={32}/></div>
                  <p>Click "Generate Resume" to create your tailored CV.</p>
                </div>
              )}
            </div>
            
            {resume && (
              <div className="doc-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="ghost" onClick={() => navigate(`/documents/${resume.id}`)}>Full Preview</Button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="sm" variant="secondary" icon={copyStates[resume.id] ? <Check size={16}/> : <Copy size={16}/>} onClick={() => copy(resume)}>
                    {copyStates[resume.id] ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" variant="secondary" icon={<Download size={16}/>} onClick={() => download(resume)} loading={downloadStates[resume.id]}>
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="generation-step-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '48px 0 16px' }}>
            <div style={{ background: 'var(--accent)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
            <h2 className="text-display" style={{ margin: 0, fontSize: '1.5rem' }}>Create Your Cover Letter</h2>
          </div>

          {/* Cover Letter Generator Panel */}
          <div className="document-card card">
            <div className="doc-head" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h3 className="text-display">Cover Letter</h3>
                  <p className="muted text-sm">{letter?.title || 'Not generated yet'}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/generate/templates?jobId=${jobId}&type=CL`)}>
                  Template: {clTemplateId}
                </Button>
              </div>
            </div>
            
            <div className="generation-controls" style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', background: 'var(--surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div className="tone-selector" style={{ flex: 1, margin: 0 }}>
                <span className="field-label" style={{ display: 'block', marginBottom: '6px' }}>Document Tone</span>
                <div className="tone-custom-wrapper" ref={clToneRef}>
                  <div 
                    className="tone-custom-trigger" 
                    onClick={() => setClDropdownOpen(!clDropdownOpen)}
                    tabIndex={0}
                  >
                    <span>{tones.find(t => t.value === clTone)?.label}</span>
                    <ChevronDown size={18} style={{ color: 'var(--text-subtle)', transform: clDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>
                  {clDropdownOpen && (
                    <div className="tone-custom-options">
                      {tones.map(t => (
                        <div 
                          key={t.value} 
                          className={`tone-option ${clTone === t.value ? 'selected' : ''}`}
                          onClick={() => { setClTone(t.value); setClDropdownOpen(false) }}
                        >
                          {t.label}
                          {clTone === t.value && <Check size={16} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button variant="primary" size="lg" icon={loadingCL ? null : <WandSparkles size={16}/>} onClick={generateCoverLetter} loading={loadingCL} style={{ marginTop: '24px' }}>
                {loadingCL ? 'Generating...' : 'Generate Letter'}
              </Button>
            </div>
            
            <div className="doc-preview-wrapper">
              {letter ? (
                <div className="paper-iframe-container" ref={clPreviewRef}>
                  <iframe 
                    srcDoc={letter.html || `<pre>${letter.plainText}</pre>`} 
                    title="Cover Letter Preview"
                    style={{ transform: `scale(${clScale})` }}
                  />
                </div>
              ) : (
                <div className="doc-empty">
                  <div className="empty-icon-wrap"><Mail size={32}/></div>
                  <p>Click "Generate Letter" to create your tailored Cover Letter.</p>
                </div>
              )}
            </div>
            
            {letter && (
              <div className="doc-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="ghost" onClick={() => navigate(`/documents/${letter.id}`)}>Full Preview</Button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="sm" variant="secondary" icon={copyStates[letter.id] ? <Check size={16}/> : <Copy size={16}/>} onClick={() => copy(letter)}>
                    {copyStates[letter.id] ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" variant="secondary" icon={<Download size={16}/>} onClick={() => download(letter)} loading={downloadStates[letter.id]}>
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
