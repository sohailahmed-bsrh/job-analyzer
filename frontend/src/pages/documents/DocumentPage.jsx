import { useEffect, useState } from 'react'
import { Copy, Download, ArrowLeft, FileText, Check } from 'lucide-react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { generationService } from '../../services/generationService'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { InlineNotice } from '../../components/ui/Toast'
import './documents.css'

export function DocumentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    generationService.document(id)
      .then(r => setDoc(r.document))
      .catch(e => setError(e.message))
  }, [id])

  async function copy() {
    if (!doc) return
    await navigator.clipboard.writeText(doc.plainText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function download() {
    try {
      const blob = await generationService.exportPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${doc.type.toLowerCase()}-${doc.template?.toLowerCase() || 'export'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch(e) {
      setError(e.message)
    }
  }

  if (!doc && !error) return <div className="page"><div className="container"><LoadingState label="Loading document..." /></div></div>
  if (error && !doc) return <div className="page"><div className="container"><InlineNotice tone="error">{error}</InlineNotice></div></div>

  return (
    <div className="page document-page">
      <div className="container document-container">
        
        <button className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Generation
        </button>

        {error && <div className="mb-4"><InlineNotice tone="error">{error}</InlineNotice></div>}

        <div className="document-header card card-pad">
          <div className="doc-header-info">
            <div className="doc-icon-wrap">
              <FileText size={24} className="text-accent" />
            </div>
            <div>
              <div className="doc-type-badge">{doc.type}</div>
              <h1 className="text-display">{doc.title}</h1>
              <p className="muted">Template: <strong>{doc.template || 'Default'}</strong></p>
            </div>
          </div>
          <div className="doc-header-actions">
            <Button variant="secondary" icon={copied ? <Check size={18}/> : <Copy size={18}/>} onClick={copy}>
              {copied ? 'Copied!' : 'Copy Text'}
            </Button>
            <Button icon={<Download size={18}/>} onClick={download}>
              Download PDF
            </Button>
          </div>
        </div>

        <article className="document-sheet card card-pad">
          <div className="sheet-content">
            <pre>{doc.plainText}</pre>
          </div>
        </article>

      </div>
    </div>
  )
}
