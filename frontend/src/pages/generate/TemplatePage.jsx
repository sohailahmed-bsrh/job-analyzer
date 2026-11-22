import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check, X, ArrowRight, LayoutTemplate } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import './generate.css'

const cvTemplates = [
  { id: 'ATS-1', label: 'ATS Format 1', category: 'ATS-Friendly', image: '/templates/ats friendly/WhatsApp Image 2026-08-19 at 6.24.09 PM.jpeg', desc: 'Clean layout.' },
  { id: 'ATS-2', label: 'ATS Format 2', category: 'ATS-Friendly', image: '/templates/ats friendly/WhatsApp Image 2026-08-19 at 6.24.10 PM (1).jpeg', desc: 'Minimalist structure.' },
  { id: 'ATS-3', label: 'ATS Format 3', category: 'ATS-Friendly', image: '/templates/ats friendly/WhatsApp Image 2026-08-19 at 6.24.10 PM (2).jpeg', desc: 'Optimized spacing.' },
  { id: 'ATS-4', label: 'ATS Format 4', category: 'ATS-Friendly', image: '/templates/ats friendly/WhatsApp Image 2026-08-19 at 6.24.10 PM.jpeg', desc: 'Standard margins.' },
  { id: 'ATS-5', label: 'ATS Format 5', category: 'ATS-Friendly', image: '/templates/ats friendly/WhatsApp Image 2026-08-19 at 6.24.11 PM (1).jpeg', desc: 'Parsing focus.' },
  { id: 'ATS-6', label: 'ATS Format 6', category: 'ATS-Friendly', image: '/templates/ats friendly/WhatsApp Image 2026-08-19 at 6.24.11 PM.jpeg', desc: 'Direct flow.' },
  { id: 'EUROPASS-1', label: 'Europass 1', category: 'Europass', image: '/templates/europass/WhatsApp Image 2026-08-19 at 6.22.35 PM (1).jpeg', desc: 'Standard European format.' },
  { id: 'EUROPASS-2', label: 'Europass 2', category: 'Europass', image: '/templates/europass/WhatsApp Image 2026-08-19 at 6.22.35 PM (2).jpeg', desc: 'Structured European layout.' },
  { id: 'EUROPASS-3', label: 'Europass 3', category: 'Europass', image: '/templates/europass/WhatsApp Image 2026-08-19 at 6.22.35 PM (3).jpeg', desc: 'Prominent metadata block.' },
  { id: 'EUROPASS-4', label: 'Europass 4', category: 'Europass', image: '/templates/europass/WhatsApp Image 2026-08-19 at 6.22.35 PM.jpeg', desc: 'Modern European style.' },
  { id: 'PRO-1', label: 'Professional 1', category: 'Professional', image: '/templates/professional cv/WhatsApp Image 2026-08-19 at 6.25.09 PM.jpeg', desc: 'Bold headers.' },
  { id: 'PRO-2', label: 'Professional 2', category: 'Professional', image: '/templates/professional cv/WhatsApp Image 2026-08-19 at 6.25.10 PM (1).jpeg', desc: 'Clean sidebar.' },
  { id: 'PRO-3', label: 'Professional 3', category: 'Professional', image: '/templates/professional cv/WhatsApp Image 2026-08-19 at 6.25.10 PM (2).jpeg', desc: 'Accent colors.' },
  { id: 'PRO-4', label: 'Professional 4', category: 'Professional', image: '/templates/professional cv/WhatsApp Image 2026-08-19 at 6.25.10 PM.jpeg', desc: 'Executive layout.' },
  { id: 'PRO-5', label: 'Professional 5', category: 'Professional', image: '/templates/professional cv/WhatsApp Image 2026-08-19 at 6.25.11 PM (1).jpeg', desc: 'Creative headers.' },
  { id: 'PRO-6', label: 'Professional 6', category: 'Professional', image: '/templates/professional cv/WhatsApp Image 2026-08-19 at 6.25.11 PM.jpeg', desc: 'Modern edge.' },
  { id: 'PRO-7', label: 'Professional 7', category: 'Professional', image: '/templates/professional cv/WhatsApp Image 2026-08-19 at 6.25.12 PM.jpeg', desc: 'Two column split.' },
]

const coverLetterTemplates = [
  { id: 'CL-1', label: 'Cover Letter 1', category: 'Cover Letter', image: '/templates/cover-letter/WhatsApp Image 2026-08-19 at 10.21.39 PM.jpeg', desc: 'Modern format.' },
  { id: 'CL-2', label: 'Cover Letter 2', category: 'Cover Letter', image: '/templates/cover-letter/WhatsApp Image 2026-08-19 at 10.21.41 PM.jpeg', desc: 'Classic layout.' },
  { id: 'CL-3', label: 'Cover Letter 3', category: 'Cover Letter', image: '/templates/cover-letter/WhatsApp Image 2026-08-19 at 10.21.42 PM (1).jpeg', desc: 'Creative accent.' },
  { id: 'CL-4', label: 'Cover Letter 4', category: 'Cover Letter', image: '/templates/cover-letter/WhatsApp Image 2026-08-19 at 10.21.42 PM.jpeg', desc: 'Executive formal.' },
]

export function TemplatePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const jobId = params.get('jobId')
  
  const type = params.get('type') || 'CV'
  
  const [selectedCV, setSelectedCV] = useState(localStorage.getItem('cvTemplateId') || 'ATS-1')
  const [selectedCL, setSelectedCL] = useState(localStorage.getItem('clTemplateId') || 'CL-1')
  
  const [previewTemplate, setPreviewTemplate] = useState(null)

  function handleSelectCV(id) {
    setSelectedCV(id)
    localStorage.setItem('cvTemplateId', id)
    setTimeout(() => {
      navigate(`/generate?jobId=${jobId}`)
    }, 300)
  }

  function handleSelectCL(id) {
    setSelectedCL(id)
    localStorage.setItem('clTemplateId', id)
    setTimeout(() => {
      navigate(`/generate?jobId=${jobId}`)
    }, 300)
  }

  const renderGallery = (items, selectedId, setSelection) => {
    const grouped = items.reduce((acc, t) => {
      acc[t.category] = acc[t.category] || []
      acc[t.category].push(t)
      return acc
    }, {})

    return Object.entries(grouped).map(([category, templates]) => (
      <div key={category} className="template-category-section mb-8">
        <h3 className="text-display" style={{ marginBottom: '16px', borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>{category.toUpperCase()}</h3>
        <div className="template-grid">
          {templates.map(t => (
            <div key={t.id} className={`template-card card ${selectedId === t.id ? 'selected' : ''}`} style={{ borderColor: selectedId === t.id ? 'var(--accent)' : 'var(--border)' }}>
              <div className="template-preview-img-wrap" onClick={() => setPreviewTemplate(t)}>
                <img src={t.image} alt={t.label} className="template-preview-img" />
                {selectedId === t.id && <div className="chosen-overlay"><Check size={32}/></div>}
                <div className="preview-hover-overlay">
                  <Button variant="secondary" size="sm" style={{ pointerEvents: 'none' }}>Click to Preview</Button>
                </div>
              </div>
              <div className="template-info">
                <span className="category-badge">{t.category}</span>
                <h3 className="text-display mt-2" style={{ fontSize: '1.1rem' }}>{t.label}</h3>
                <p className="muted text-sm">{t.desc}</p>
                <div className="action-row mt-4" style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                  <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(t)}>Preview</Button>
                  <Button variant={selectedId === t.id ? 'primary' : 'secondary'} size="sm" onClick={() => setSelection(t.id)}>
                    {selectedId === t.id ? <><Check size={14}/> Selected</> : 'Select'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))
  }
  return (
    <div className="page template-page">
      <div className="container">
        
        <div className="page-header text-center mb-8">
          <div className="eyebrow mb-4">DEVSIL Templates</div>
          <h1 className="text-display mt-4">Choose Your {type === 'CV' ? 'Resume' : 'Cover Letter'} Design</h1>
          <p className="muted mx-auto max-w-md mt-4">Select the perfect layout to match your professional brand.</p>
        </div>

        {type === 'CV' && renderGallery(cvTemplates, selectedCV, handleSelectCV)}
        {type === 'CL' && renderGallery(coverLetterTemplates, selectedCL, handleSelectCL)}
        
        <div className="divider mt-8 mb-8" />
        
      </div>

      {previewTemplate && (
        <div className="modal-backdrop" onClick={() => setPreviewTemplate(null)}>
          <div className="modal-content card" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header row-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-display">{previewTemplate.label} Preview</h2>
              <button className="icon-btn" onClick={() => setPreviewTemplate(null)}><X size={24}/></button>
            </div>
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--surface-soft)', display: 'grid', placeItems: 'center' }}>
              <img src={previewTemplate.image} alt={previewTemplate.label} style={{ maxWidth: '100%', maxHeight: '100vh', boxShadow: 'var(--shadow-lg)' }} />
            </div>
            <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>Close</Button>
              <Button variant="primary" onClick={() => {
                if (type === 'CV') handleSelectCV(previewTemplate.id)
                else handleSelectCL(previewTemplate.id)
                setPreviewTemplate(null)
              }}>
                Select This Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
