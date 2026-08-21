from pathlib import Path

files = {}

def add(path, content):
    files[path] = content.strip() + "\n"

add('package.json', r'''
{
  "name": "resume-cover-letter-maker",
  "private": true,
  "workspaces": ["frontend", "server"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w frontend\" \"npm run dev -w server\"",
    "dev:frontend": "npm run dev -w frontend",
    "dev:server": "npm run dev -w server",
    "build": "npm run build -w frontend",
    "lint": "npm run lint -w frontend && npm run lint -w server",
    "test": "npm run test -w server",
    "db:generate": "npm run db:generate -w server",
    "db:migrate": "npm run db:migrate -w server",
    "db:studio": "npm run db:studio -w server"
  },
  "devDependencies": {
    "concurrently": "^9.2.0"
  }
}
''')

add('README.md', r'''
# Resume & Cover Letter Maker — CareerBridge

A production-oriented full-stack rebuild of the CareerBridge Resume & Cover Letter Maker brief.

## What this project is designed to do

1. Let a candidate upload an existing CV (PDF/DOCX) or build a profile manually.
2. Accept a job advertisement as pasted text or a public URL.
3. Analyze the job and candidate profile with Gemini using structured output.
4. Compare skills, experience, education, and job requirements deterministically.
5. Offer actionable AI suggestions for missing or weak resume evidence before generation.
6. Let the candidate edit/approve their information.
7. Generate a tailored resume and cover letter for the selected job.
8. Let the candidate choose a resume design: ATS, Simple, or Europass-inspired.
9. Show preview, copy, and PDF download actions.
10. Persist users, profiles, jobs, analyses, documents, and generation history in PostgreSQL through Prisma.

## Source brief used

The provided project brief states that the original goal is to read a job ad, understand company requirements, generate a matching resume and cover letter, support tone variation, and make results easy to copy/download. The source also asks for clean code, test examples, and a working application. See the supplied PDF, pages 1–4. fileciteturn0file0

The page 3 flow is preserved and expanded from:
`User opens app → enters details/job ad → analyzes job → writes resume/cover letter → copy/download`.

## Architecture decisions

- Frontend: React + Vite, separate from the backend.
- Backend: Node.js + Express 5, REST API with controllers → services → repositories/infrastructure boundaries.
- Database: PostgreSQL + Prisma ORM.
- AI: Google GenAI JavaScript SDK (`@google/genai`) with structured JSON output.
- Job URL ingestion: Gemini URL Context for public URLs, with explicit accessibility/limitations handling.
- Resume parsing: PDF/DOCX parsers isolated behind a parser service.
- PDF export: Puppeteer from server-side HTML templates.
- Auth: JWT access token + persistent session/refresh-token model, never storing raw passwords.

## Folder map

```text
resume-cover-letter-maker/
├─ frontend/                 # React/Vite browser app
│  └─ src/
│     ├─ app/                # app shell, routing, providers
│     ├─ components/         # reusable UI + feature components
│     ├─ pages/              # each route/page isolated
│     ├─ services/            # API clients / domain calls
│     ├─ store/               # browser workflow/auth state
│     ├─ styles/              # global tokens and animations
│     └─ assets/
├─ server/                   # Node/Express API
│  ├─ prisma/                # source of truth for DB models + migrations
│  └─ src/
│     ├─ api/                # route registration, controllers, validators
│     ├─ modules/             # auth, candidate, jobs, analysis, generation...
│     ├─ infrastructure/     # Prisma, Gemini, storage, parsers, PDF
│     ├─ config/             # environment/config validation
│     └─ utils/               # errors, logger, async helpers
├─ docs/                     # architecture, API contract, QA checklist
└─ README.md
```

## Runtime flow

`Landing → Auth → Candidate onboarding → Job input → Job analysis → Match → AI suggestions → Candidate edits/approval → Template selection → Resume/Cover Letter generation → Preview → Copy/Download`

## Safety / correctness gates

- Job input is normalized to one explicit contract: `sourceType = TEXT | URL`.
- URL mode requires a syntactically valid public HTTP(S) URL.
- Job analysis cannot produce a “good” result without meaningful requirements data.
- Match score is never calculated as 95% from `0/0` skills.
- AI output is validated before persistence.
- Generated resume content cannot invent experience; it is constrained to candidate evidence.
- Authentication is enforced server-side for user-owned resources.

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment files

Copy:

- `frontend/.env.example` → `frontend/.env`
- `server/.env.example` → `server/.env`

Fill in PostgreSQL and Gemini credentials.

### 3. Initialize Prisma

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run the app

```bash
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000`

## Progress log

### Phase A — requirements and architecture
- Read the provided project brief.
- Preserved the brief’s core flow and deliverables.
- Expanded the simple original Python/Streamlit concept into the requested React/Node architecture.
- Added auth, database persistence, CV upload/manual entry, job URL/text, deterministic matching, suggestions, templates, generation, copy/download, responsive design, and a documentation trail.

### Phase B — frontend foundation
- Created a route/page structure where each page has its own folder and files.
- Added shared design tokens, accessible buttons, inputs, cards, empty states, and responsive layouts.
- Added subtle entrance/hover animation only where it supports the experience.

### Phase C — backend foundation
- Created Express app, API route registry, error handling, auth middleware, validation, module service boundaries, Prisma schema, Gemini provider abstraction, file parsing abstraction, and PDF export abstraction.

### Phase D — hardening carried forward from the existing project history
- Keep `field` + `sourceType` contracts aligned across frontend → API → service.
- Keep Gemini model configuration explicit (`modelId`) to prevent undefined model errors during generation.
- Preserve browser verification for TEXT and URL flows before any later phase is considered complete.
''')

add('docs/ARCHITECTURE.md', r'''
# Architecture

## Domain boundaries

### Auth
Owns registration, login, session lifecycle, and access control.

### Candidate
Owns profile data, education, experience, skills, and source documents.

### Jobs
Owns job text/URL, normalized job records, source metadata, and accessibility errors.

### Analysis
Owns AI extraction of job requirements and deterministic candidate/job matching.

### Suggestions
Owns evidence-gap suggestions and approve/add actions.

### Generation
Owns resume and cover-letter generation. AI output is structured and validated before save.

### Documents
Owns template choice, preview payloads, copy text, and PDF export.

## Request pipeline

Browser → REST route → auth middleware → validator → controller → service → provider/repository → response serializer.

No page directly calls Prisma or Gemini.

## Why this structure

A route-specific bug can be traced without searching the whole project:

`frontend/pages/job-analysis` → `frontend/services/jobService.js` → `server/api/routes/job.routes.js` → `job.controller.js` → `job.service.js` → `gemini.provider.js`.
''')

add('docs/API.md', r'''
# API contract

Base path: `/api/v1`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Candidate

- `GET /candidate/profile`
- `PUT /candidate/profile`
- `POST /candidate/resume-upload`

## Jobs

- `POST /jobs`
- `GET /jobs/:id`
- `POST /jobs/:id/analyze`

### Job input contract

```json
{
  "sourceType": "TEXT",
  "content": "Full job advertisement..."
}
```

or

```json
{
  "sourceType": "URL",
  "content": "https://example.com/job"
}
```

The frontend never sends `jobAdvertisement`, `jobAd`, or a second field name for the same concept.

## Match

- `POST /jobs/:id/match`

## Suggestions

- `GET /jobs/:id/suggestions`
- `POST /jobs/:id/suggestions/:suggestionId/approve`

## Generation

- `POST /jobs/:id/generate/resume`
- `POST /jobs/:id/generate/cover-letter`
- `GET /documents/:id`
- `POST /documents/:id/export/pdf`
''')

add('docs/QA_CHECKLIST.md', r'''
# QA checklist

## Frontend

- [ ] Buttons are actual `<button>` elements or accessible links.
- [ ] Inputs have labels and validation.
- [ ] Mobile layout works at narrow widths.
- [ ] Loading states and errors are visible.
- [ ] Copy action reports success/failure.
- [ ] Download action returns a real PDF.

## Auth

- [ ] Register works.
- [ ] Login works.
- [ ] Protected routes reject unauthenticated users.
- [ ] Logout invalidates the refresh/session token.

## CV input

- [ ] Manual profile saves.
- [ ] PDF upload parses text.
- [ ] DOCX upload parses text.
- [ ] Review step shows extracted data before approval.

## Job input

- [ ] TEXT source accepts valid non-empty job ads.
- [ ] URL source accepts public HTTP(S) URLs.
- [ ] Invalid URLs are rejected before AI call.
- [ ] Unreachable/private/blocked URL gets a clear error.
- [ ] The exact same `content + sourceType` contract reaches the server.

## Analysis

- [ ] AI output passes schema validation.
- [ ] Required skills/experience/education are displayed.
- [ ] No fabricated requirements appear without evidence.
- [ ] 0/0 skills does not produce an inflated score.

## Generation

- [ ] ATS template is machine-readable.
- [ ] Simple template is clean and professional.
- [ ] Europass-inspired template is visually structured.
- [ ] Resume uses candidate evidence only.
- [ ] Cover letter references the target job without inventing company facts.
- [ ] PDF export is readable and paginated.
''')

# FRONTEND
add('frontend/package.json', r'''
{
  "name": "careerbridge-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.8.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.31.0",
    "@vitejs/plugin-react": "^4.7.0",
    "eslint": "^9.31.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "vite": "^7.1.2"
  }
}
''')

add('frontend/vite.config.js', r'''
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
''')

add('frontend/index.html', r'''
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0b1220" />
    <meta name="description" content="CareerBridge AI Resume and Cover Letter Maker" />
    <title>CareerBridge — Resume & Cover Letter Maker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
''')

add('frontend/.env.example', 'VITE_API_BASE_URL=http://localhost:4000/api/v1')

add('frontend/src/main.jsx', r'''
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import { AuthProvider } from './app/providers/AuthProvider'
import './styles/tokens.css'
import './styles/globals.css'
import './styles/animations.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
''')

add('frontend/src/app/App.jsx', r'''
import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from '../components/layout/SiteLayout'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { HomePage } from '../pages/home/HomePage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { CandidatePage } from '../pages/candidate/CandidatePage'
import { JobAnalysisPage } from '../pages/job-analysis/JobAnalysisPage'
import { SuggestionsPage } from '../pages/suggestions/SuggestionsPage'
import { TemplatePage } from '../pages/generate/TemplatePage'
import { GeneratePage } from '../pages/generate/GeneratePage'
import { DocumentPage } from '../pages/documents/DocumentPage'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/candidate" element={<CandidatePage />} />
          <Route path="/job-analysis" element={<JobAnalysisPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/generate/templates" element={<TemplatePage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/documents/:id" element={<DocumentPage />} />
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
''')

add('frontend/src/app/providers/AuthProvider.jsx', r'''
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    authService.me()
      .then((data) => {
        if (active) setUser(data.user)
      })
      .catch(() => {})
      .finally(() => active && setReady(true))
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({
    user,
    ready,
    isAuthenticated: Boolean(user),
    async login(credentials) {
      const data = await authService.login(credentials)
      setUser(data.user)
      return data
    },
    async register(payload) {
      const data = await authService.register(payload)
      setUser(data.user)
      return data
    },
    async logout() {
      await authService.logout()
      setUser(null)
    },
  }), [ready, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
''')

add('frontend/src/services/apiClient.js', r'''
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'

async function parseResponse(response) {
  const text = await response.text()
  let payload = null
  try { payload = text ? JSON.parse(text) : null } catch { payload = null }
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || 'Request failed.'
    const error = new Error(message)
    error.status = response.status
    error.details = payload?.error?.details
    throw error
  }
  return payload
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const body = options.body
  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
  return parseResponse(response)
}

export { API_BASE_URL }
''')

add('frontend/src/services/authService.js', r'''
import { apiFetch } from './apiClient'

export const authService = {
  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/me'),
}
''')

add('frontend/src/services/candidateService.js', r'''
import { apiFetch } from './apiClient'

export const candidateService = {
  getProfile: () => apiFetch('/candidate/profile'),
  saveProfile: (payload) => apiFetch('/candidate/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  uploadResume: (file) => {
    const body = new FormData()
    body.append('file', file)
    return apiFetch('/candidate/resume-upload', { method: 'POST', body })
  },
}
''')

add('frontend/src/services/jobService.js', r'''
import { apiFetch } from './apiClient'

export const jobService = {
  create: (payload) => apiFetch('/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id) => apiFetch(`/jobs/${id}`),
  analyze: (id) => apiFetch(`/jobs/${id}/analyze`, { method: 'POST' }),
  match: (id) => apiFetch(`/jobs/${id}/match`, { method: 'POST' }),
  suggestions: (id) => apiFetch(`/jobs/${id}/suggestions`),
  approveSuggestion: (jobId, suggestionId) => apiFetch(`/jobs/${jobId}/suggestions/${suggestionId}/approve`, { method: 'POST' }),
}
''')

add('frontend/src/services/generationService.js', r'''
import { apiFetch } from './apiClient'

export const generationService = {
  resume: (jobId, payload) => apiFetch(`/jobs/${jobId}/generate/resume`, { method: 'POST', body: JSON.stringify(payload) }),
  coverLetter: (jobId, payload) => apiFetch(`/jobs/${jobId}/generate/cover-letter`, { method: 'POST', body: JSON.stringify(payload) }),
  document: (id) => apiFetch(`/documents/${id}`),
  exportPdf: async (id) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'}/documents/${id}/export/pdf`, { credentials: 'include' })
    if (!response.ok) throw new Error('Unable to export PDF.')
    return response.blob()
  },
}
''')

add('frontend/src/components/layout/SiteLayout.jsx', r'''
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { FileText, LogIn, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../../app/providers/AuthProvider'
import './SiteLayout.css'

export function SiteLayout() {
  const { user, ready, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>CareerBridge</span>
        </Link>
        <nav className="topnav" aria-label="Main navigation">
          {ready && user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/candidate">My CV</Link>
              <button className="text-button" onClick={handleLogout}><LogOut size={16} /> Sign out</button>
            </>
          ) : ready ? (
            <Link className="nav-login" to="/login"><LogIn size={16} /> Sign in</Link>
          ) : null}
        </nav>
      </header>
      <main><Outlet /></main>
      <footer className="footer">
        <div><FileText size={16} /> CareerBridge Resume & Cover Letter Maker</div>
        <span>Built for focused, job-specific applications.</span>
      </footer>
    </div>
  )
}
''')

add('frontend/src/components/layout/SiteLayout.css', r'''
.topbar { position: sticky; top: 0; z-index: 20; display: flex; justify-content: space-between; align-items: center; padding: 16px 28px; border-bottom: 1px solid var(--border); background: rgba(248,250,252,.88); backdrop-filter: blur(18px); }
.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--text-strong); text-decoration: none; font-weight: 800; letter-spacing: -.02em; }
.brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--ink); color: white; }
.topnav { display: flex; align-items: center; gap: 18px; }
.topnav a, .text-button { color: var(--text-muted); text-decoration: none; font-size: .92rem; background: none; border: 0; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
.topnav a:hover, .text-button:hover { color: var(--text-strong); }
.nav-login { font-weight: 700; color: var(--ink) !important; }
.footer { display: flex; justify-content: space-between; gap: 20px; padding: 28px; color: var(--text-subtle); font-size: .82rem; border-top: 1px solid var(--border); margin-top: 40px; }
.footer > div { display: inline-flex; align-items: center; gap: 8px; }
@media (max-width: 640px) { .topbar { padding: 14px 16px; } .topnav { gap: 10px; } .topnav a:nth-child(2) { display: none; } .footer { flex-direction: column; padding: 22px 16px; } }
''')

add('frontend/src/components/layout/ProtectedRoute.jsx', r'''
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'

export function ProtectedRoute() {
  const { ready, isAuthenticated } = useAuth()
  const location = useLocation()
  if (!ready) return <div className="page-center"><div className="spinner" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
''')

add('frontend/src/components/ui/Button.jsx', r'''
export function Button({ children, variant='primary', size='md', icon, type='button', disabled=false, ...props }) {
  return <button type={type} className={`btn btn-${variant} btn-${size}`} disabled={disabled} {...props}>{icon}{children}</button>
}
''')

add('frontend/src/components/ui/Input.jsx', r'''
export function Input({ label, error, hint, ...props }) {
  return <label className="field">
    <span>{label}</span>
    <input {...props} aria-invalid={Boolean(error)} />
    {hint && !error ? <small>{hint}</small> : null}
    {error ? <small className="field-error">{error}</small> : null}
  </label>
}

export function Textarea({ label, error, hint, ...props }) {
  return <label className="field">
    <span>{label}</span>
    <textarea {...props} aria-invalid={Boolean(error)} />
    {hint && !error ? <small>{hint}</small> : null}
    {error ? <small className="field-error">{error}</small> : null}
  </label>
}
''')

add('frontend/src/components/ui/SectionTitle.jsx', r'''
export function SectionTitle({ eyebrow, title, description, action }) {
  return <div className="section-title">
    <div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>
    {action ? <div>{action}</div> : null}
  </div>
}
''')

add('frontend/src/components/ui/LoadingState.jsx', r'''
export function LoadingState({ label='Working…' }) {
  return <div className="loading-state"><div className="spinner" /><span>{label}</span></div>
}
''')

add('frontend/src/components/ui/Toast.jsx', r'''
export function InlineNotice({ tone='info', children }) {
  return <div className={`notice notice-${tone}`} role="status">{children}</div>
}
''')

add('frontend/src/components/ui/ui.css', r'''
.btn { border: 0; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-weight: 800; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease, background .2s ease; }
.btn:hover:not(:disabled) { transform: translateY(-1px); }
.btn:disabled { opacity: .55; cursor: not-allowed; }
.btn-primary { color: #fff; background: var(--ink); box-shadow: 0 10px 20px rgba(15,23,42,.11); }
.btn-secondary { color: var(--text-strong); background: #fff; border: 1px solid var(--border-strong); }
.btn-ghost { color: var(--text-muted); background: transparent; }
.btn-sm { min-height: 36px; padding: 0 12px; font-size: .84rem; }
.btn-md { min-height: 44px; padding: 0 16px; font-size: .9rem; }
.btn-lg { min-height: 52px; padding: 0 20px; font-size: .96rem; }
.field { display: grid; gap: 8px; }
.field > span { font-size: .86rem; font-weight: 700; color: var(--text-strong); }
.field input, .field textarea, .field select { width: 100%; border: 1px solid var(--border-strong); border-radius: 12px; background: #fff; color: var(--text-strong); padding: 12px 14px; font: inherit; outline: none; transition: border .2s, box-shadow .2s; box-sizing: border-box; }
.field textarea { min-height: 150px; resize: vertical; }
.field input:focus, .field textarea:focus, .field select:focus { border-color: #64748b; box-shadow: 0 0 0 4px rgba(100,116,139,.1); }
.field small { color: var(--text-subtle); font-size: .75rem; }
.field-error { color: #b91c1c !important; }
.section-title { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 22px; }
.section-title h2 { margin: 4px 0 7px; font-size: clamp(1.45rem, 3vw, 2rem); letter-spacing: -.03em; }
.section-title p { margin: 0; color: var(--text-muted); max-width: 680px; line-height: 1.65; }
.eyebrow { color: var(--text-subtle); text-transform: uppercase; letter-spacing: .12em; font-size: .7rem; font-weight: 800; }
.page-center { min-height: 65vh; display: grid; place-items: center; }
.spinner { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #cbd5e1; border-top-color: var(--ink); animation: spin .8s linear infinite; }
.loading-state { display: flex; align-items: center; gap: 10px; color: var(--text-muted); }
.notice { border-radius: 14px; padding: 12px 14px; font-size: .86rem; line-height: 1.45; }
.notice-info { background: #f1f5f9; color: #334155; }
.notice-success { background: #ecfdf5; color: #166534; }
.notice-error { background: #fef2f2; color: #991b1b; }
''')

add('frontend/src/styles/tokens.css', r'''
:root {
  --ink: #0f172a;
  --text-strong: #111827;
  --text-muted: #475569;
  --text-subtle: #64748b;
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --border: #e2e8f0;
  --border-strong: #cbd5e1;
  --accent: #0f766e;
  --accent-soft: #ccfbf1;
  --radius: 18px;
  --shadow: 0 18px 48px rgba(15,23,42,.08);
}
''')

add('frontend/src/styles/globals.css', r'''
@import '../components/ui/ui.css';
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; min-width: 320px; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--surface-soft); color: var(--text-strong); }
button, input, textarea, select { font: inherit; }
main { min-height: calc(100vh - 110px); }
a { color: inherit; }
.container { width: min(1160px, calc(100% - 40px)); margin: 0 auto; }
.page { padding: 56px 0; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); }
.card-pad { padding: 26px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.stack { display: grid; gap: 16px; }
.row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.muted { color: var(--text-muted); }
@media (max-width: 780px) { .container { width: min(100% - 28px, 720px); } .page { padding: 36px 0; } .grid-2, .grid-3 { grid-template-columns: 1fr; } .card-pad { padding: 20px; } }
''')

add('frontend/src/styles/animations.css', r'''
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes softpulse { 0%,100% { opacity: .7; } 50% { opacity: 1; } }
.animate-rise { animation: rise .55s ease both; }
.delay-1 { animation-delay: .07s; }
.delay-2 { animation-delay: .14s; }
.delay-3 { animation-delay: .21s; }
.soft-pulse { animation: softpulse 1.8s ease-in-out infinite; }
''')

# Pages
add('frontend/src/pages/home/HomePage.jsx', r'''
import { ArrowRight, Check, FileUp, Sparkles, Target, WandSparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import './home.css'

export function HomePage() {
  return <div>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy animate-rise">
          <div className="hero-kicker"><Sparkles size={15} /> Job-specific applications, not one-size-fits-all CVs.</div>
          <h1>Build a sharper CV for the job you actually want.</h1>
          <p>Upload your CV or build it manually. Add a job ad. CareerBridge maps the role requirements to your evidence, suggests improvements, then generates a tailored resume and cover letter.</p>
          <div className="hero-actions"><Link className="hero-primary" to="/register">Start building <ArrowRight size={17} /></Link><Link className="hero-secondary" to="/login">Sign in</Link></div>
          <div className="hero-proof"><span><Check size={15} /> ATS-aware</span><span><Check size={15} /> Evidence-first</span><span><Check size={15} /> Copy + PDF</span></div>
        </div>
        <div className="hero-panel animate-rise delay-1">
          <div className="mock-window">
            <div className="mock-top"><span /><span /><span /><b>Job match</b><small>LIVE WORKFLOW</small></div>
            <div className="mock-body">
              <div className="mock-stat"><span>Match strength</span><strong>—</strong><small>Calculated after real profile + job analysis</small></div>
              <div className="mock-steps"><div className="mock-step active"><span>01</span><div><b>Candidate profile</b><small>Upload or enter your CV details</small></div></div><div className="mock-step"><span>02</span><div><b>Job analysis</b><small>Required skills, experience, education</small></div></div><div className="mock-step"><span>03</span><div><b>Tailored documents</b><small>Select ATS, Simple or Europass-inspired</small></div></div></div>
              <div className="mock-footer"><Target size={17} /><div><b>Suggestions stay editable.</b><small>You approve what gets added to your profile.</small></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="feature-section"><div className="container"><div className="grid-3">
      <div className="feature-card animate-rise"><div className="feature-icon"><FileUp size={20} /></div><h3>Upload or type</h3><p>Start from your PDF/DOCX CV, or enter your profile manually and keep full control.</p></div>
      <div className="feature-card animate-rise delay-1"><div className="feature-icon"><Target size={20} /></div><h3>Understand the job</h3><p>Analyze required skills, experience, education, responsibilities, and ATS keywords.</p></div>
      <div className="feature-card animate-rise delay-2"><div className="feature-icon"><WandSparkles size={20} /></div><h3>Generate with evidence</h3><p>Turn approved candidate evidence into a targeted resume and professional cover letter.</p></div>
    </div></div></section>
  </div>
}
''')

add('frontend/src/pages/home/home.css', r'''
.hero { padding: 72px 0 48px; overflow: hidden; }
.hero-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 56px; align-items: center; }
.hero-kicker { display: inline-flex; gap: 7px; align-items: center; padding: 7px 10px; border: 1px solid var(--border); border-radius: 999px; color: var(--text-muted); background: #fff; font-size: .77rem; font-weight: 700; }
.hero h1 { margin: 20px 0 18px; max-width: 690px; font-size: clamp(2.5rem, 5.7vw, 5.1rem); line-height: .96; letter-spacing: -.065em; }
.hero p { margin: 0; max-width: 670px; color: var(--text-muted); font-size: 1.05rem; line-height: 1.75; }
.hero-actions { display: flex; gap: 10px; margin-top: 30px; }
.hero-primary, .hero-secondary { min-height: 48px; padding: 0 17px; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; font-weight: 800; }
.hero-primary { background: var(--ink); color: white; }
.hero-secondary { border: 1px solid var(--border-strong); background: #fff; }
.hero-proof { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 22px; color: var(--text-subtle); font-size: .8rem; font-weight: 700; }
.hero-proof span { display: inline-flex; align-items: center; gap: 6px; }
.mock-window { border: 1px solid #dbe4ec; border-radius: 24px; background: #fff; box-shadow: 0 34px 90px rgba(15,23,42,.13); overflow: hidden; }
.mock-top { display: grid; grid-template-columns: repeat(3, 8px) 1fr auto; align-items: center; gap: 6px; padding: 14px 16px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: .76rem; }
.mock-top span { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; }.mock-top b { margin-left: 10px; }.mock-top small { color: var(--text-subtle); letter-spacing: .1em; font-size: .58rem; }
.mock-body { padding: 22px; }.mock-stat { padding: 18px; border-radius: 18px; background: linear-gradient(145deg, #f8fafc, #f1f5f9); }.mock-stat span, .mock-stat small { display:block; color:var(--text-subtle); font-size:.75rem; }.mock-stat strong { display:block; font-size: 3rem; margin: 4px 0; letter-spacing: -.06em; }
.mock-steps { display: grid; gap: 10px; margin-top: 16px; }.mock-step { display:flex; align-items:center; gap:12px; padding:12px; border:1px solid var(--border); border-radius:14px; }.mock-step > span { width:32px; height:32px; display:grid; place-items:center; border-radius:10px; background:#f1f5f9; color:var(--text-subtle); font-size:.72rem; font-weight:800; }.mock-step.active { border-color:#99f6e4; background:#f0fdfa; }.mock-step.active > span { background:#ccfbf1; color:#0f766e; }.mock-step b, .mock-step small { display:block; }.mock-step b { font-size:.84rem; }.mock-step small { color:var(--text-subtle); font-size:.72rem; margin-top:3px; }.mock-footer { display:flex; gap:10px; margin-top:16px; padding:12px 14px; border-radius:13px; background:#0f172a; color:#fff; }.mock-footer div { display:grid; gap:2px; }.mock-footer small { color:#cbd5e1; font-size:.7rem; }
.feature-section { padding: 32px 0 72px; }.feature-card { padding: 22px; background:#fff; border:1px solid var(--border); border-radius:18px; }.feature-icon { width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:var(--accent-soft);color:var(--accent); }.feature-card h3 { margin:16px 0 8px; }.feature-card p { margin:0; color:var(--text-muted); line-height:1.65; font-size:.9rem; }
@media (max-width: 900px) { .hero-grid { grid-template-columns:1fr; gap:38px; }.hero h1 { font-size:clamp(2.7rem, 11vw, 4.4rem); } }
''')

add('frontend/src/pages/auth/LoginPage.jsx', r'''
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { InlineNotice } from '../../components/ui/Toast'
import { useAuth } from '../../app/providers/AuthProvider'
import './auth.css'

export function LoginPage() {
  const { login } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [form, setForm] = useState({ email:'', password:'' }); const [error,setError]=useState(''); const [loading,setLoading]=useState(false)
  async function submit(e){ e.preventDefault(); setError(''); setLoading(true); try { await login(form); navigate(location.state?.from || '/dashboard', {replace:true}) } catch(err){ setError(err.message) } finally { setLoading(false) } }
  return <div className="auth-page"><div className="auth-card card card-pad"><div className="auth-head"><div className="eyebrow">Welcome back</div><h1>Sign in</h1><p>Continue your application workflow.</p></div>{error?<InlineNotice tone="error">{error}</InlineNotice>:null}<form className="stack" onSubmit={submit}><Input label="Email" type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/><Input label="Password" type="password" autoComplete="current-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><Button type="submit" size="lg" disabled={loading}>{loading?'Signing in…':'Sign in'}</Button></form><div className="auth-switch">New here? <Link to="/register">Create an account</Link></div></div></div>
}
''')

add('frontend/src/pages/auth/RegisterPage.jsx', r'''
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { InlineNotice } from '../../components/ui/Toast'
import { useAuth } from '../../app/providers/AuthProvider'
import './auth.css'

export function RegisterPage(){
  const { register }=useAuth(); const navigate=useNavigate(); const [form,setForm]=useState({name:'',email:'',password:''}); const [error,setError]=useState(''); const [loading,setLoading]=useState(false)
  async function submit(e){e.preventDefault();setError(''); if(form.password.length<8){setError('Password must be at least 8 characters.');return} setLoading(true);try{await register(form);navigate('/dashboard',{replace:true})}catch(err){setError(err.message)}finally{setLoading(false)}}
  return <div className="auth-page"><div className="auth-card card card-pad"><div className="auth-head"><div className="eyebrow">CareerBridge</div><h1>Create your workspace</h1><p>Your account keeps your profile, jobs, and generated documents together.</p></div>{error?<InlineNotice tone="error">{error}</InlineNotice>:null}<form className="stack" onSubmit={submit}><Input label="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/><Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/><Input label="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required hint="Use at least 8 characters."/><Button type="submit" size="lg" disabled={loading}>{loading?'Creating…':'Create account'}</Button></form><div className="auth-switch">Already registered? <Link to="/login">Sign in</Link></div></div></div>
}
''')

add('frontend/src/pages/auth/auth.css', r'''
.auth-page { min-height: 75vh; display:grid; place-items:center; padding:42px 16px; }.auth-card { width:min(480px,100%); display:grid; gap:18px; }.auth-head h1{margin:4px 0 8px;font-size:2.1rem;letter-spacing:-.04em}.auth-head p{margin:0;color:var(--text-muted);line-height:1.6}.auth-switch{font-size:.86rem;color:var(--text-muted);text-align:center}.auth-switch a{font-weight:800;color:var(--ink)}
''')

add('frontend/src/pages/dashboard/DashboardPage.jsx', r'''
import { ArrowRight, BriefcaseBusiness, FileText, Plus, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'
import { SectionTitle } from '../../components/ui/SectionTitle'
import './dashboard.css'

export function DashboardPage(){ const {user}=useAuth(); return <div className="page"><div className="container"><SectionTitle eyebrow="Workspace" title={`Good to see you, ${user?.name?.split(' ')[0] || 'there'}.`} description="Build your candidate profile, analyze a job, then generate documents from approved evidence."/><div className="dashboard-grid"><Link className="dash-card card" to="/candidate"><div className="dash-icon"><UserRound size={20}/></div><div><h3>Candidate profile</h3><p>Upload a CV or enter details manually.</p></div><ArrowRight/></Link><Link className="dash-card card" to="/job-analysis"><div className="dash-icon"><BriefcaseBusiness size={20}/></div><div><h3>Analyze a job</h3><p>Paste a job ad or use a public URL.</p></div><ArrowRight/></Link><Link className="dash-card card" to="/generate/templates"><div className="dash-icon"><FileText size={20}/></div><div><h3>Choose a template</h3><p>ATS, Simple, or Europass-inspired.</p></div><ArrowRight/></Link></div><div className="quick-start card card-pad"><div><div className="eyebrow">Recommended next step</div><h3>Start with your candidate profile.</h3><p>Good source data produces more defensible job matching and better generated documents.</p></div><Link className="hero-primary" to="/candidate">Set up profile <Plus size={16}/></Link></div></div></div> }
''')

add('frontend/src/pages/dashboard/dashboard.css', r'''
.dashboard-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.dash-card{padding:22px;text-decoration:none;display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:start}.dash-icon{width:40px;height:40px;border-radius:13px;background:#f1f5f9;display:grid;place-items:center}.dash-card h3{margin:1px 0 6px}.dash-card p{margin:0;color:var(--text-muted);font-size:.84rem;line-height:1.5}.quick-start{margin-top:18px;display:flex;justify-content:space-between;gap:24px;align-items:center}.quick-start h3{margin:4px 0}.quick-start p{margin:0;color:var(--text-muted);max-width:650px;line-height:1.6}.hero-primary{background:var(--ink);color:#fff;text-decoration:none;display:inline-flex;align-items:center;gap:8px;padding:0 15px;min-height:44px;border-radius:12px;font-weight:800;white-space:nowrap}@media(max-width:900px){.dashboard-grid{grid-template-columns:1fr}.quick-start{align-items:flex-start;flex-direction:column}}
''')

add('frontend/src/pages/candidate/CandidatePage.jsx', r'''
import { useEffect, useState } from 'react'
import { FileUp, Save, Sparkles } from 'lucide-react'
import { candidateService } from '../../services/candidateService'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { InlineNotice } from '../../components/ui/Toast'
import { LoadingState } from '../../components/ui/LoadingState'
import { SectionTitle } from '../../components/ui/SectionTitle'
import './candidate.css'

const empty = { name:'', headline:'', location:'', summary:'', education:[], experience:[], skills:[] }

export function CandidatePage(){
  const [profile,setProfile]=useState(empty); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [uploading,setUploading]=useState(false); const [notice,setNotice]=useState(''); const [error,setError]=useState('')
  useEffect(()=>{candidateService.getProfile().then(r=>setProfile({...empty,...r.profile})).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[])
  function patch(k,v){setProfile(p=>({...p,[k]:v}))}
  async function save(){setSaving(true);setError('');try{await candidateService.saveProfile(profile);setNotice('Profile saved.')}catch(e){setError(e.message)}finally{setSaving(false)}}
  async function upload(e){const file=e.target.files?.[0];if(!file)return;setUploading(true);setError('');setNotice('');try{const r=await candidateService.uploadResume(file);setProfile(p=>({...p,...r.profile}));setNotice('CV extracted. Review the fields and save them when you are happy.')}catch(err){setError(err.message)}finally{setUploading(false);e.target.value=''}}
  if(loading)return <div className="page-center"><LoadingState label="Loading profile…"/></div>
  return <div className="page"><div className="container"><SectionTitle eyebrow="Candidate profile" title="Your source of truth." description="Upload first or enter manually. Keep achievements factual—the generation layer will work only from approved evidence."/><div className="candidate-toolbar card card-pad"><label className="upload-button"><FileUp size={17}/> {uploading?'Extracting…':'Upload CV'}<input type="file" accept=".pdf,.docx" hidden onChange={upload} disabled={uploading}/></label><span className="upload-help">PDF or DOCX · extraction is reviewed before it becomes profile data</span></div>{error?<div style={{marginTop:14}}><InlineNotice tone="error">{error}</InlineNotice></div>:null}{notice?<div style={{marginTop:14}}><InlineNotice tone="success"><Sparkles size={15}/> {notice}</InlineNotice></div>:null}<div className="candidate-layout"><div className="card card-pad stack"><div className="eyebrow">Identity</div><div className="grid-2"><Input label="Full name" value={profile.name} onChange={e=>patch('name',e.target.value)}/><Input label="Professional headline" value={profile.headline} onChange={e=>patch('headline',e.target.value)} placeholder="AI Engineer · Data Scientist"/></div><Input label="Location" value={profile.location} onChange={e=>patch('location',e.target.value)} placeholder="City, Country"/><Textarea label="Professional summary" value={profile.summary} onChange={e=>patch('summary',e.target.value)} placeholder="A concise, factual summary of your experience and strengths."/><Button icon={<Save size={16}/>} onClick={save} disabled={saving}>{saving?'Saving…':'Save profile'}</Button></div><div className="card card-pad"><div className="eyebrow">Skills</div><textarea className="skill-editor" value={profile.skills.join('\n')} onChange={e=>patch('skills',e.target.value.split('\n').map(s=>s.trim()).filter(Boolean))} placeholder="One skill per line"/><p className="small-note">Use one skill per line. Later analysis will compare these against the job requirements.</p></div></div></div></div>
}
''')

add('frontend/src/pages/candidate/candidate.css', r'''
.candidate-toolbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.upload-button{min-height:44px;padding:0 14px;border-radius:12px;background:var(--ink);color:#fff;display:inline-flex;align-items:center;gap:8px;font-weight:800;cursor:pointer}.upload-help,.small-note{color:var(--text-subtle);font-size:.78rem}.candidate-layout{margin-top:18px;display:grid;grid-template-columns:1.35fr .65fr;gap:18px}.skill-editor{width:100%;min-height:260px;border:1px solid var(--border-strong);border-radius:12px;padding:12px 14px;resize:vertical;font:inherit}@media(max-width:900px){.candidate-layout{grid-template-columns:1fr}}
''')

add('frontend/src/pages/job-analysis/JobAnalysisPage.jsx', r'''
import { useState } from 'react'
import { ArrowRight, Link2, Type } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../../services/jobService'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { InlineNotice } from '../../components/ui/Toast'
import './job-analysis.css'

export function JobAnalysisPage(){
  const navigate=useNavigate(); const [sourceType,setSourceType]=useState('TEXT'); const [content,setContent]=useState(''); const [title,setTitle]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false)
  async function submit(e){e.preventDefault();setError('');const value=content.trim();if(!value){setError('Please provide a job advertisement.');return}if(sourceType==='URL'&&!/^https?:\/\//i.test(value)){setError('Please provide a valid public HTTP(S) job URL.');return}setLoading(true);try{const {job}=await jobService.create({sourceType,content:value,title:title.trim()||undefined});await jobService.analyze(job.id);await jobService.match(job.id);navigate(`/suggestions?jobId=${job.id}`)}catch(err){setError(err.message)}finally{setLoading(false)}}
  return <div className="page"><div className="container narrow"><div className="job-intro"><div className="eyebrow">Job analyzer</div><h1>Give the workflow a real job ad.</h1><p>Paste the advertisement text or provide a public URL. The same `content + sourceType` contract is used end-to-end.</p></div><div className="source-switch"><button className={sourceType==='TEXT'?'active':''} onClick={()=>setSourceType('TEXT')}><Type size={16}/> Job description</button><button className={sourceType==='URL'?'active':''} onClick={()=>setSourceType('URL')}><Link2 size={16}/> Public URL</button></div>{error?<InlineNotice tone="error">{error}</InlineNotice>:null}<form className="card card-pad stack" onSubmit={submit}><Input label="Optional job title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Senior AI Engineer"/>{sourceType==='TEXT'?<Textarea label="Job advertisement" value={content} onChange={e=>setContent(e.target.value)} placeholder="Paste the complete job description here…" required/>:<Input label="Public job URL" type="url" value={content} onChange={e=>setContent(e.target.value)} placeholder="https://company.com/careers/job" required hint="Private/local/tunnel URLs will not work with URL Context."/>}<Button type="submit" size="lg" disabled={loading}>{loading?'Analyzing…':'Analyze and continue'}<ArrowRight size={17}/></Button></form></div></div>
}
''')

add('frontend/src/pages/job-analysis/job-analysis.css', r'''
.narrow{max-width:800px}.job-intro{margin-bottom:22px}.job-intro h1{font-size:clamp(2rem,5vw,3.4rem);letter-spacing:-.05em;margin:4px 0 12px}.job-intro p{color:var(--text-muted);line-height:1.7}.source-switch{display:flex;gap:8px;margin-bottom:14px}.source-switch button{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border-strong);background:#fff;border-radius:999px;padding:9px 13px;cursor:pointer;font-weight:800;font-size:.8rem;color:var(--text-muted)}.source-switch button.active{background:var(--ink);border-color:var(--ink);color:#fff}
''')

add('frontend/src/pages/suggestions/SuggestionsPage.jsx', r'''
import { useEffect, useState } from 'react'
import { Check, Lightbulb, PenLine, Sparkles } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { jobService } from '../../services/jobService'
import { SectionTitle } from '../../components/ui/SectionTitle'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { InlineNotice } from '../../components/ui/Toast'
import './suggestions.css'

export function SuggestionsPage(){
 const [params]=useSearchParams();const jobId=params.get('jobId');const [data,setData]=useState(null);const [error,setError]=useState('');
 useEffect(()=>{if(!jobId)return;Promise.all([jobService.get(jobId),jobService.suggestions(jobId)]).then(([job,suggestions])=>setData({...job.job,suggestions:suggestions.suggestions})).catch(e=>setError(e.message))},[jobId])
 async function approve(id){try{await jobService.approveSuggestion(jobId,id);setData(d=>({...d,suggestions:d.suggestions.map(s=>s.id===id?{...s,status:'APPROVED'}:s)}))}catch(e){setError(e.message)}}
 if(!jobId)return <div className="page"><div className="container"><InlineNotice tone="error">No job selected.</InlineNotice></div></div>
 if(!data&&!error)return <div className="page-center"><LoadingState label="Loading job analysis…"/></div>
 return <div className="page"><div className="container"><SectionTitle eyebrow="Analysis complete" title="Here is what the job is asking for." description="Review the match, then approve only the suggestions that you genuinely support. Approved suggestions become available to generation."/><div className="analysis-summary card card-pad"><div className="score-box"><span>Match</span><strong>{data.matchScore == null ? '—' : `${Math.round(data.matchScore)}%`}</strong><small>{data.matchScore == null ? 'Insufficient evidence' : data.matchExplanation}</small></div><div className="req-list"><div><b>Required skills</b><div className="chip-wrap">{(data.requiredSkills||[]).map(s=><span className="chip" key={s}>{s}</span>)}</div></div><div><b>Education</b><p>{data.educationRequirement||'No explicit degree requirement found.'}</p></div><div><b>Experience</b><p>{data.experienceRequirement||'No explicit experience requirement found.'}</p></div></div></div>{error?<div style={{marginTop:14}}><InlineNotice tone="error">{error}</InlineNotice></div>:null}<div className="suggestions-head"><div><div className="eyebrow">AI suggestions</div><h3>Close the evidence gaps before generation</h3></div><Link className="continue-link" to={`/generate/templates?jobId=${jobId}`}>Choose template <PenLine size={15}/></Link></div><div className="suggestion-grid">{(data.suggestions||[]).length ? data.suggestions.map(s=><div className="suggestion card" key={s.id}><div className="suggestion-icon"><Lightbulb size={18}/></div><div><h4>{s.title}</h4><p>{s.reason}</p>{s.proposedEvidence?<div className="evidence"><Sparkles size={14}/><span>{s.proposedEvidence}</span></div>:null}<div className="row"><span className={`status status-${String(s.status).toLowerCase()}`}>{s.status}</span><Button size="sm" variant={s.status==='APPROVED'?'secondary':'primary'} disabled={s.status==='APPROVED'} onClick={()=>approve(s.id)} icon={s.status==='APPROVED'?<Check size={14}/>:<PenLine size={14}/>}>{s.status==='APPROVED'?'Approved':'Approve'}</Button></div></div></div>):<div className="empty-card card"><h3>No additional suggestions.</h3><p>Your current profile already covers the evidence the analyzer found important.</p></div>}</div></div></div>
}
''')

add('frontend/src/pages/suggestions/suggestions.css', r'''
.analysis-summary{display:grid;grid-template-columns:260px 1fr;gap:26px}.score-box{padding:22px;border-radius:18px;background:var(--ink);color:#fff}.score-box span,.score-box small{display:block;color:#cbd5e1;font-size:.75rem}.score-box strong{display:block;font-size:3.8rem;letter-spacing:-.06em;margin:7px 0}.score-box small{line-height:1.5}.req-list{display:grid;gap:18px}.req-list p{margin:5px 0 0;color:var(--text-muted);line-height:1.55}.chip-wrap{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.chip{font-size:.75rem;background:#f1f5f9;border:1px solid var(--border);padding:6px 9px;border-radius:999px}.suggestions-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin:32px 0 14px}.suggestions-head h3{margin:5px 0 0;font-size:1.35rem;letter-spacing:-.02em}.continue-link{display:inline-flex;align-items:center;gap:6px;text-decoration:none;background:#fff;border:1px solid var(--border-strong);padding:9px 12px;border-radius:11px;font-weight:800;font-size:.78rem}.suggestion-grid{display:grid;gap:12px}.suggestion{padding:18px;display:grid;grid-template-columns:auto 1fr;gap:13px}.suggestion-icon{width:38px;height:38px;border-radius:12px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center}.suggestion h4{margin:2px 0 6px}.suggestion p{margin:0;color:var(--text-muted);line-height:1.55;font-size:.88rem}.evidence{display:flex;gap:8px;margin:11px 0;padding:10px 11px;border-radius:12px;background:#f8fafc;font-size:.78rem;color:var(--text-muted)}.status{display:inline-flex;align-items:center;height:32px;padding:0 9px;border-radius:999px;background:#f1f5f9;color:var(--text-subtle);font-size:.7rem;font-weight:800}.status-approved{background:#ecfdf5;color:#166534}.empty-card{padding:26px}.empty-card p{color:var(--text-muted)}@media(max-width:780px){.analysis-summary{grid-template-columns:1fr}.suggestions-head{align-items:flex-start;flex-direction:column}}
''')

add('frontend/src/pages/generate/TemplatePage.jsx', r'''
import { Check, FileText, LayoutTemplate, ScanText } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { SectionTitle } from '../../components/ui/SectionTitle'
import './generate.css'

const templates=[
 {id:'ATS',label:'ATS',icon:<ScanText size={20}/>,desc:'Single-column, parsing-friendly structure with restrained decoration.'},
 {id:'SIMPLE',label:'Simple',icon:<FileText size={20}/>,desc:'Clean contemporary resume with strong hierarchy and generous spacing.'},
 {id:'EUROPASS',label:'Europass',icon:<LayoutTemplate size={20}/>,desc:'Europass-inspired structured sections and profile metadata.'},
]
export function TemplatePage(){const [params]=useSearchParams();const jobId=params.get('jobId');const navigate=useNavigate();const [selected,setSelected]=useState('ATS');return <div className="page"><div className="container"><SectionTitle eyebrow="Design choice" title="Pick the resume structure first." description="The selected template changes the visual structure of the generated resume. Your content remains evidence-bound."/><div className="template-grid">{templates.map(t=><button key={t.id} className={`template-card card ${selected===t.id?'selected':''}`} onClick={()=>setSelected(t.id)}><div className="template-top"><span className="template-icon">{t.icon}</span>{selected===t.id?<span className="chosen"><Check size={13}/> Selected</span>:null}</div><h3>{t.label}</h3><p>{t.desc}</p><div className={`template-preview ${t.id.toLowerCase()}`}><span></span><span></span><span></span><div></div><div></div></div></button>)}</div><div className="generate-cta card card-pad"><div><div className="eyebrow">Ready?</div><h3>Generate from your approved evidence.</h3><p>Choose your tone and document set on the next screen.</p></div><Button size="lg" onClick={()=>navigate(`/generate?jobId=${jobId}&template=${selected}`)}>Continue</Button></div></div></div>}
''')

add('frontend/src/pages/generate/GeneratePage.jsx', r'''
import { useState } from 'react'
import { Copy, Download, FileText, Mail, WandSparkles } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { generationService } from '../../services/generationService'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { InlineNotice } from '../../components/ui/Toast'
import { SectionTitle } from '../../components/ui/SectionTitle'
import './generate.css'

export function GeneratePage(){const [params]=useSearchParams();const jobId=params.get('jobId');const template=params.get('template')||'ATS';const [tone,setTone]=useState('PROFESSIONAL');const [resume,setResume]=useState(null);const [letter,setLetter]=useState(null);const [error,setError]=useState('');const [loading,setLoading]=useState(false);const navigate=useNavigate();
 async function generate(){setError('');setLoading(true);try{const [r,c]=await Promise.all([generationService.resume(jobId,{template,tone}),generationService.coverLetter(jobId,{tone})]);setResume(r.document);setLetter(c.document)}catch(e){setError(e.message)}finally{setLoading(false)}}
 async function download(doc){try{const blob=await generationService.exportPdf(doc.id);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${doc.type.toLowerCase()}-${template.toLowerCase()}.pdf`;a.click();URL.revokeObjectURL(url)}catch(e){setError(e.message)}}
 async function copy(text){await navigator.clipboard.writeText(text);setError('Copied to clipboard.')}
 if(!jobId)return <div className="page"><div className="container"><InlineNotice tone="error">No job selected.</InlineNotice></div></div>
 return <div className="page"><div className="container"><SectionTitle eyebrow="Generate" title="Create the final application package." description={`Template: ${template}. Select a tone, generate, review, then copy or download.`}/><div className="generation-toolbar card card-pad"><label className="field"><span>Tone</span><select value={tone} onChange={e=>setTone(e.target.value)}><option value="PROFESSIONAL">Professional</option><option value="FRIENDLY">Friendly</option><option value="DIRECT">Direct</option></select></label><Button size="lg" icon={<WandSparkles size={17}/>} onClick={generate} disabled={loading}>{loading?'Generating…':'Generate documents'}</Button></div>{error?<div style={{marginTop:14}}><InlineNotice tone={error==='Copied to clipboard.'?'success':'error'}>{error}</InlineNotice></div>:null}<div className="document-grid">{[[resume,'Resume',FileText],[letter,'Cover letter',Mail]].map(([doc,label,Icon])=><div className="document-card card" key={label}><div className="doc-head"><div><div className="eyebrow">{label}</div><h3>{doc?.title||'Not generated yet'}</h3></div><div className="row">{doc?<><Button size="sm" variant="secondary" icon={<Copy size={14}/>} onClick={()=>copy(doc.plainText)}>Copy</Button><Button size="sm" icon={<Download size={14}/>} onClick={()=>download(doc)}>PDF</Button></>:null}</div></div><div className="doc-preview">{doc?<pre>{doc.plainText}</pre>:<div className="doc-empty"><Icon size={25}/><p>Generate this document to preview it here.</p></div>}</div>{doc?<Button variant="ghost" onClick={()=>navigate(`/documents/${doc.id}`)}>Open full preview</Button>:null}</div>)}</div></div></div>
}
''')

add('frontend/src/pages/generate/generate.css', r'''
.template-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.template-card{padding:18px;text-align:left;cursor:pointer;position:relative}.template-card.selected{border-color:#0f766e;box-shadow:0 0 0 3px rgba(20,184,166,.1),var(--shadow)}.template-top{display:flex;justify-content:space-between;align-items:center}.template-icon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:#f1f5f9}.chosen{font-size:.68rem;font-weight:800;display:inline-flex;align-items:center;gap:4px;color:#166534;background:#ecfdf5;padding:5px 8px;border-radius:999px}.template-card h3{margin:18px 0 7px}.template-card p{margin:0;color:var(--text-muted);font-size:.8rem;line-height:1.55;min-height:63px}.template-preview{margin-top:16px;border:1px solid var(--border);background:#fff;border-radius:12px;padding:12px;height:135px;overflow:hidden}.template-preview>span{display:block;height:7px;width:45%;background:#0f172a;border-radius:4px;margin-bottom:7px}.template-preview>span:nth-child(2){width:65%;background:#cbd5e1}.template-preview>span:nth-child(3){width:35%;background:#e2e8f0}.template-preview>div{height:6px;background:#e2e8f0;border-radius:3px;margin-top:12px}.template-preview.ats>div{width:90%}.template-preview.simple{display:grid;grid-template-columns:1fr 1fr;gap:6px}.template-preview.simple>span{grid-column:1/-1}.template-preview.europass{display:grid;grid-template-columns:32% 1fr;gap:8px}.template-preview.europass>span:first-child{grid-column:1/-1;width:55%}.template-preview.europass>span:nth-child(2),.template-preview.europass>span:nth-child(3){grid-column:1}.template-preview.europass>div{grid-column:2}.generate-cta{margin-top:18px;display:flex;justify-content:space-between;align-items:center;gap:20px}.generate-cta h3{margin:4px 0}.generate-cta p{margin:0;color:var(--text-muted)}.generation-toolbar{display:flex;justify-content:space-between;align-items:end;gap:20px}.generation-toolbar .field{min-width:230px}.document-grid{margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:18px}.document-card{padding:18px}.doc-head{display:flex;justify-content:space-between;align-items:start;gap:10px}.doc-head h3{margin:4px 0 0}.doc-preview{margin-top:16px;border:1px solid var(--border);border-radius:14px;background:#f8fafc;padding:16px;min-height:440px;max-height:620px;overflow:auto}.doc-preview pre{font: .78rem/1.65 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word;margin:0}.doc-empty{height:390px;display:grid;place-items:center;align-content:center;gap:10px;color:var(--text-subtle);text-align:center}.doc-empty p{max-width:230px}@media(max-width:900px){.template-grid,.document-grid{grid-template-columns:1fr}.generate-cta,.generation-toolbar{align-items:flex-start;flex-direction:column}}
''')

add('frontend/src/pages/documents/DocumentPage.jsx', r'''
import { useEffect, useState } from 'react'
import { Copy, Download, ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { generationService } from '../../services/generationService'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { InlineNotice } from '../../components/ui/Toast'
import './documents.css'

export function DocumentPage(){const {id}=useParams();const [doc,setDoc]=useState(null);const [error,setError]=useState('');useEffect(()=>{generationService.document(id).then(r=>setDoc(r.document)).catch(e=>setError(e.message))},[id]);async function copy(){await navigator.clipboard.writeText(doc.plainText);setError('Copied to clipboard.')}async function download(){const blob=await generationService.exportPdf(id);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${doc.type.toLowerCase()}.pdf`;a.click();URL.revokeObjectURL(url)}if(!doc&&!error)return <div className="page-center"><LoadingState/></div>;return <div className="page"><div className="container document-page"><Link className="back-link" to="/generate"><ArrowLeft size={15}/> Back</Link>{error?<InlineNotice tone="error">{error}</InlineNotice>:null}<div className="document-header card card-pad"><div><div className="eyebrow">{doc.type}</div><h1>{doc.title}</h1><p>Template: {doc.template || '—'}</p></div><div className="row"><Button variant="secondary" icon={<Copy size={15}/>} onClick={copy}>Copy</Button><Button icon={<Download size={15}/>} onClick={download}>Download PDF</Button></div></div><article className="document-sheet card card-pad"><pre>{doc.plainText}</pre></article></div></div>}
''')

add('frontend/src/pages/documents/documents.css', r'''
.document-page{display:grid;gap:16px;max-width:950px}.back-link{display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:var(--text-muted);font-size:.8rem;font-weight:700}.document-header{display:flex;justify-content:space-between;align-items:start;gap:18px}.document-header h1{margin:5px 0 6px;font-size:2rem;letter-spacing:-.04em}.document-header p{margin:0;color:var(--text-muted);font-size:.82rem}.document-sheet{min-height:900px;background:#fff}.document-sheet pre{margin:0;white-space:pre-wrap;word-break:break-word;font: .9rem/1.8 ui-monospace,SFMono-Regular,Menlo,monospace}@media(max-width:780px){.document-header{flex-direction:column}.document-sheet{min-height:0}}
''')

add('frontend/src/pages/not-found/NotFoundPage.jsx', r'''
import { Link } from 'react-router-dom'
export function NotFoundPage(){return <div className="page-center"><div className="card card-pad"><div className="eyebrow">404</div><h1>That page is not here.</h1><p className="muted">Return to the homepage and continue from there.</p><Link className="hero-primary" to="/">Back home</Link></div></div>}
''')

# SERVER
add('server/package.json', r'''
{
  "name": "careerbridge-server",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "lint": "eslint .",
    "test": "node --test",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@google/genai": "^1.21.0",
    "@prisma/adapter-pg": "^7.0.0",
    "bcryptjs": "^3.0.2",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.1",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "mammoth": "^1.10.0",
    "multer": "^2.0.2",
    "pdf-parse": "^1.1.1",
    "pg": "^8.16.3",
    "zod": "^4.0.15"
  },
  "devDependencies": {
    "eslint": "^9.31.0",
    "prisma": "^7.0.0"
  }
}
''')

add('server/.env.example', r'''
NODE_ENV=development
PORT=4000
WEB_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/careerbridge?schema=public
GEMINI_API_KEY=replace_me
GEMINI_MODEL=gemini-3.1-pro-preview
JWT_ACCESS_SECRET=replace_with_long_random_secret
JWT_REFRESH_SECRET=replace_with_long_random_secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=30
MAX_UPLOAD_MB=8
UPLOAD_DIR=./storage/uploads
''')

add('server/prisma.config.ts', r'''
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
})
''')

add('server/prisma/schema.prisma', r'''
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum JobSourceType { TEXT URL }
enum SuggestionStatus { PENDING APPROVED DISMISSED }
enum DocumentType { RESUME COVER_LETTER }
enum ResumeTemplate { ATS SIMPLE EUROPASS }
enum Tone { PROFESSIONAL FRIENDLY DIRECT }
enum DocumentStatus { DRAFT GENERATED FAILED }

model User {
  id              String           @id @default(cuid())
  email           String           @unique
  passwordHash    String
  name            String
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  sessions        Session[]
  profile         CandidateProfile?
  jobs            Job[]
  documents       GeneratedDocument[]
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshHash  String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}

model CandidateProfile {
  id          String        @id @default(cuid())
  userId      String        @unique
  name        String
  headline    String?
  location    String?
  summary     String?
  rawText     String?
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  education   Education[]
  experience  Experience[]
  skills      Skill[]
  sources     CandidateSource[]
  suggestions CandidateSuggestion[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model CandidateSource {
  id          String           @id @default(cuid())
  profileId   String
  fileName    String
  mimeType    String
  storageKey  String
  extractedAt DateTime?
  createdAt   DateTime         @default(now())
  profile     CandidateProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@index([profileId])
}

model Education {
  id          String           @id @default(cuid())
  profileId   String
  institution String
  degree      String
  field       String?
  startDate   String?
  endDate     String?
  details     String?
  profile     CandidateProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@index([profileId])
}

model Experience {
  id          String           @id @default(cuid())
  profileId   String
  company     String
  title       String
  startDate   String?
  endDate     String?
  description String?
  profile     CandidateProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@index([profileId])
}

model Skill {
  id        String           @id @default(cuid())
  profileId String
  name      String
  level     String?
  profile   CandidateProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@unique([profileId, name])
}

model Job {
  id                    String             @id @default(cuid())
  userId                String
  title                 String?
  sourceType            JobSourceType
  sourceContent         String
  normalizedDescription String?
  sourceUrl             String?
  sourceStatus          String?
  analysisStatus        String?
  user                  User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  analysis              JobAnalysis?
  suggestions           CandidateSuggestion[]
  documents             GeneratedDocument[]
  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  @@index([userId, createdAt])
}

model JobAnalysis {
  id                     String   @id @default(cuid())
  jobId                  String   @unique
  companyName            String?
  roleTitle              String?
  summary                String?
  responsibilities       Json
  requiredSkills         Json
  preferredSkills        Json
  experienceRequirement  String?
  educationRequirement   String?
  atsKeywords            Json
  confidence             Float?
  rawModelJson           Json?
  job                    Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}

model MatchResult {
  id                 String   @id @default(cuid())
  jobId              String
  score              Float?
  matchedSkills      Json
  missingSkills      Json
  evidenceGaps       Json
  explanation        String?
  createdAt          DateTime @default(now())
  job                Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@index([jobId, createdAt])
}

model CandidateSuggestion {
  id             String           @id @default(cuid())
  profileId      String
  jobId          String
  title          String
  reason         String
  proposedEvidence String?
  targetSection  String
  status         SuggestionStatus @default(PENDING)
  profile        CandidateProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  job            Job              @relation(fields: [jobId], references: [id], onDelete: Cascade)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  @@index([jobId, status])
  @@index([profileId])
}

model GeneratedDocument {
  id           String         @id @default(cuid())
  userId       String
  jobId        String
  type         DocumentType
  template     ResumeTemplate?
  tone         Tone?
  status       DocumentStatus @default(DRAFT)
  title        String
  plainText    String
  html         String?
  model        String?
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  job          Job            @relation(fields: [jobId], references: [id], onDelete: Cascade)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([userId, createdAt])
  @@index([jobId, type])
}
''')

add('server/src/config/env.js', r'''
import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-3.1-pro-preview'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  MAX_UPLOAD_MB: z.coerce.number().default(8),
  UPLOAD_DIR: z.string().default('./storage/uploads'),
})

export const env = schema.parse(process.env)
''')

add('server/src/infrastructure/db/prisma.js', r'''
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client/index.js'
import { env } from '../../config/env.js'

const { Pool } = pg
const pool = new Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })

export async function disconnectDb() {
  await prisma.$disconnect()
  await pool.end()
}
''')

add('server/src/utils/AppError.js', r'''
export class AppError extends Error {
  constructor(message, status=400, details=null, code='APP_ERROR') { super(message); this.status=status; this.details=details; this.code=code }
}
''')

add('server/src/utils/asyncHandler.js', r'''
export const asyncHandler = (handler) => (req,res,next) => Promise.resolve(handler(req,res,next)).catch(next)
''')

add('server/src/utils/crypto.js', r'''
import crypto from 'node:crypto'

export function randomToken(bytes=48){return crypto.randomBytes(bytes).toString('base64url')}
export function sha256(value){return crypto.createHash('sha256').update(value).digest('hex')}
''')

add('server/src/utils/serialize.js', r'''
export function publicUser(user){return {id:user.id,email:user.email,name:user.name}}
''')

add('server/src/api/middleware/errorHandler.js', r'''
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500
  res.status(status).json({ error: { code: err.code || 'INTERNAL_ERROR', message: status === 500 ? 'An unexpected server error occurred.' : err.message, details: err.details || null } })
}
''')

add('server/src/api/middleware/auth.js', r'''
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/AppError.js'

export function requireAuth(req,_res,next){
  try {
    const token=req.cookies?.accessToken || req.headers.authorization?.replace(/^Bearer\s+/i,'')
    if(!token) throw new AppError('Authentication required.',401,null,'AUTH_REQUIRED')
    const payload=jwt.verify(token,env.JWT_ACCESS_SECRET)
    req.auth={userId:payload.sub}
    next()
  } catch(err){ next(err instanceof AppError ? err : new AppError('Authentication required.',401,null,'AUTH_REQUIRED')) }
}
''')

add('server/src/api/middleware/validate.js', r'''
import { AppError } from '../../utils/AppError.js'
export function validate(schema, source='body'){return (req,_res,next)=>{const result=schema.safeParse(req[source]);if(!result.success)return next(new AppError('Invalid request.',422,result.error.flatten(),'VALIDATION_ERROR'));req[source]=result.data;next()}}
''')

add('server/src/modules/auth/auth.schemas.js', r'''
import { z } from 'zod'
export const registerSchema=z.object({name:z.string().trim().min(2).max(100),email:z.string().email(),password:z.string().min(8).max(128)})
export const loginSchema=z.object({email:z.string().email(),password:z.string().min(1).max(128)})
''')

add('server/src/modules/auth/auth.service.js', r'''
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../infrastructure/db/prisma.js'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/AppError.js'
import { randomToken, sha256 } from '../../utils/crypto.js'
import { publicUser } from '../../utils/serialize.js'

const refreshExpiry=()=>new Date(Date.now()+env.REFRESH_TOKEN_TTL_DAYS*86400000)
function accessToken(userId){return jwt.sign({},env.JWT_ACCESS_SECRET,{subject:userId,expiresIn:env.ACCESS_TOKEN_TTL})}

export async function register({name,email,password}){
  const existing=await prisma.user.findUnique({where:{email:email.toLowerCase()}})
  if(existing)throw new AppError('An account already exists for this email.',409,null,'EMAIL_EXISTS')
  const passwordHash=await bcrypt.hash(password,12)
  const user=await prisma.user.create({data:{name,email:email.toLowerCase(),passwordHash}})
  const refresh=randomToken();await prisma.session.create({data:{userId:user.id,refreshHash:sha256(refresh),expiresAt:refreshExpiry()}})
  return {user:publicUser(user),accessToken:accessToken(user.id),refreshToken:refresh}
}

export async function login({email,password}){
  const user=await prisma.user.findUnique({where:{email:email.toLowerCase()}})
  if(!user||!(await bcrypt.compare(password,user.passwordHash)))throw new AppError('Invalid email or password.',401,null,'INVALID_CREDENTIALS')
  const refresh=randomToken();await prisma.session.create({data:{userId:user.id,refreshHash:sha256(refresh),expiresAt:refreshExpiry()}})
  return {user:publicUser(user),accessToken:accessToken(user.id),refreshToken:refresh}
}

export async function refresh(refreshToken){
  if(!refreshToken)throw new AppError('Refresh token missing.',401,null,'AUTH_REQUIRED')
  const session=await prisma.session.findUnique({where:{refreshHash:sha256(refreshToken)},include:{user:true}})
  if(!session||session.expiresAt<new Date())throw new AppError('Session expired.',401,null,'SESSION_EXPIRED')
  const newRefresh=randomToken();await prisma.session.update({where:{id:session.id},data:{refreshHash:sha256(newRefresh),expiresAt:refreshExpiry()}})
  return {user:publicUser(session.user),accessToken:accessToken(session.userId),refreshToken:newRefresh}
}

export async function logout(refreshToken){if(refreshToken)await prisma.session.deleteMany({where:{refreshHash:sha256(refreshToken)}})}
''')

add('server/src/modules/auth/auth.controller.js', r'''
import { env } from '../../config/env.js'
import * as service from './auth.service.js'
import { asyncHandler } from '../../utils/asyncHandler.js'

const cookieOptions={httpOnly:true,sameSite:'lax',secure:env.NODE_ENV==='production',path:'/'}
function setCookies(res,data){res.cookie('accessToken',data.accessToken,{...cookieOptions,maxAge:15*60*1000});res.cookie('refreshToken',data.refreshToken,{...cookieOptions,maxAge:env.REFRESH_TOKEN_TTL_DAYS*86400000})}

export const register=asyncHandler(async(req,res)=>{const data=await service.register(req.body);setCookies(res,data);res.status(201).json({user:data.user})})
export const login=asyncHandler(async(req,res)=>{const data=await service.login(req.body);setCookies(res,data);res.json({user:data.user})})
export const refresh=asyncHandler(async(req,res)=>{const data=await service.refresh(req.cookies?.refreshToken);setCookies(res,data);res.json({user:data.user})})
export const logout=asyncHandler(async(req,res)=>{await service.logout(req.cookies?.refreshToken);res.clearCookie('accessToken',cookieOptions);res.clearCookie('refreshToken',cookieOptions);res.status(204).end()})
export const me=asyncHandler(async(req,res)=>{const user=await (await import('../../infrastructure/db/prisma.js')).prisma.user.findUnique({where:{id:req.auth.userId}});res.json({user:user?{id:user.id,email:user.email,name:user.name}:null})})
''')

add('server/src/modules/auth/auth.routes.js', r'''
import { Router } from 'express'
import * as controller from './auth.controller.js'
import { validate } from '../../api/middleware/validate.js'
import { requireAuth } from '../../api/middleware/auth.js'
import { loginSchema, registerSchema } from './auth.schemas.js'
export const authRouter=Router()
authRouter.post('/register',validate(registerSchema),controller.register)
authRouter.post('/login',validate(loginSchema),controller.login)
authRouter.post('/refresh',controller.refresh)
authRouter.post('/logout',controller.logout)
authRouter.get('/me',requireAuth,controller.me)
''')

add('server/src/modules/candidate/candidate.schemas.js', r'''
import { z } from 'zod'
const education=z.object({id:z.string().optional(),institution:z.string().min(1),degree:z.string().min(1),field:z.string().optional(),startDate:z.string().optional(),endDate:z.string().optional(),details:z.string().optional()})
const experience=z.object({id:z.string().optional(),company:z.string().min(1),title:z.string().min(1),startDate:z.string().optional(),endDate:z.string().optional(),description:z.string().optional()})
export const profileSchema=z.object({name:z.string().min(2),headline:z.string().optional(),location:z.string().optional(),summary:z.string().optional(),skills:z.array(z.string()).default([]),education:z.array(education).default([]),experience:z.array(experience).default([])})
''')

add('server/src/infrastructure/parsing/documentParser.js', r'''
import fs from 'node:fs/promises'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'

export async function extractText(filePath,mimeType){
  const buffer=await fs.readFile(filePath)
  if(mimeType==='application/pdf')return (await pdf(buffer)).text
  if(mimeType==='application/vnd.openxmlformats-officedocument.wordprocessingml.document')return (await mammoth.extractRawText({buffer})).value
  throw new Error('Unsupported file type.')
}
''')

add('server/src/infrastructure/storage/localStorage.js', r'''
import fs from 'node:fs/promises'
import path from 'node:path'
import { env } from '../../config/env.js'

export async function ensureStorage(){await fs.mkdir(env.UPLOAD_DIR,{recursive:true})}
export async function saveFile(file){const ext=path.extname(file.originalname);const key=`${Date.now()}-${crypto.randomUUID()}${ext}`;const target=path.join(env.UPLOAD_DIR,key);await fs.writeFile(target,file.buffer);return key}
''')

add('server/src/modules/candidate/candidate.service.js', r'''
import fs from 'node:fs/promises'
import { prisma } from '../../infrastructure/db/prisma.js'
import { extractText } from '../../infrastructure/parsing/documentParser.js'
import { saveFile } from '../../infrastructure/storage/localStorage.js'
import { AppError } from '../../utils/AppError.js'

function payload(profile){return {name:profile.name,headline:profile.headline||'',location:profile.location||'',summary:profile.summary||'',skills:profile.skills.map(s=>s.name),education:profile.education,experience:profile.experience}}

export async function getProfile(userId){let profile=await prisma.candidateProfile.findUnique({where:{userId},include:{skills:true,education:true,experience:true}});if(!profile){profile=await prisma.candidateProfile.create({data:{userId,name:''},include:{skills:true,education:true,experience:true}})}return payload(profile)}
export async function saveProfile(userId,data){const profile=await prisma.candidateProfile.upsert({where:{userId},create:{userId,name:data.name,headline:data.headline,location:data.location,summary:data.summary},update:{name:data.name,headline:data.headline,location:data.location,summary:data.summary}})
 await prisma.$transaction([
  prisma.skill.deleteMany({where:{profileId:profile.id}}),
  prisma.skill.createMany({data:data.skills.map(name=>({profileId:profile.id,name}))}),
  prisma.education.deleteMany({where:{profileId:profile.id}}),
  prisma.experience.deleteMany({where:{profileId:profile.id}}),
  ...data.education.map(e=>prisma.education.create({data:{profileId:profile.id,institution:e.institution,degree:e.degree,field:e.field,startDate:e.startDate,endDate:e.endDate,details:e.details}})),
  ...data.experience.map(e=>prisma.experience.create({data:{profileId:profile.id,company:e.company,title:e.title,startDate:e.startDate,endDate:e.endDate,description:e.description}})),
 ])
 return getProfile(userId)
}

export async function processUpload(userId,file){
 const allowed=['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];if(!allowed.includes(file.mimetype))throw new AppError('Only PDF and DOCX files are supported.',422,null,'UNSUPPORTED_FILE')
 const key=await saveFile(file);const path=`${process.cwd()}/${process.env.UPLOAD_DIR||'./storage/uploads'}/${key}`;const rawText=await extractText(path,file.mimetype);if(!rawText.trim())throw new AppError('No readable text was found in this file.',422,null,'EMPTY_DOCUMENT')
 const existing=await prisma.candidateProfile.findUnique({where:{userId}});const profile=existing||await prisma.candidateProfile.create({data:{userId,name:''}})
 await prisma.candidateSource.create({data:{profileId:profile.id,fileName:file.originalname,mimeType:file.mimetype,storageKey:key,extractedAt:new Date()}})
 await prisma.candidateProfile.update({where:{id:profile.id},data:{rawText:rawText.slice(0,100000)}})
 // Keep upload parsing deterministic here. AI extraction into structured candidate fields can be added as a dedicated reviewed step.
 return {profile:await getProfile(userId),rawText:rawText.slice(0,100000)}
}
''')

add('server/src/modules/candidate/candidate.controller.js', r'''
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as service from './candidate.service.js'
export const getProfile=asyncHandler(async(req,res)=>res.json({profile:await service.getProfile(req.auth.userId)}))
export const saveProfile=asyncHandler(async(req,res)=>res.json({profile:await service.saveProfile(req.auth.userId,req.body)}))
export const uploadResume=asyncHandler(async(req,res)=>res.json(await service.processUpload(req.auth.userId,req.file)))
''')

add('server/src/modules/candidate/candidate.routes.js', r'''
import { Router } from 'express'
import multer from 'multer'
import { env } from '../../config/env.js'
import * as controller from './candidate.controller.js'
import { requireAuth } from '../../api/middleware/auth.js'
import { validate } from '../../api/middleware/validate.js'
import { profileSchema } from './candidate.schemas.js'
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:env.MAX_UPLOAD_MB*1024*1024}})
export const candidateRouter=Router();candidateRouter.use(requireAuth)
candidateRouter.get('/profile',controller.getProfile)
candidateRouter.put('/profile',validate(profileSchema),controller.saveProfile)
candidateRouter.post('/resume-upload',upload.single('file'),controller.uploadResume)
''')

add('server/src/infrastructure/ai/gemini.provider.js', r'''
import { GoogleGenAI } from '@google/genai'
import { env } from '../../config/env.js'
import { zodToJsonSchema } from '../../utils/zodJsonSchema.js'

export class GeminiProvider {
  constructor(){
    this.model=env.GEMINI_MODEL
    this.modelId=this.model
    this.client=new GoogleGenAI({apiKey:env.GEMINI_API_KEY})
  }

  async generateStructured({systemInstruction,contents,schema,tools=[]}){
    const response=await this.client.models.generateContent({
      model:this.modelId,
      contents,
      config:{
        systemInstruction,
        responseMimeType:'application/json',
        responseSchema:zodToJsonSchema(schema),
        tools,
      },
    })
    if(!response.text)throw new Error('Gemini returned an empty response.')
    return schema.parse(JSON.parse(response.text))
  }

  async generateText({systemInstruction,contents}){
    const response=await this.client.models.generateContent({model:this.modelId,contents,config:{systemInstruction}})
    if(!response.text)throw new Error('Gemini returned an empty response.')
    return response.text
  }
}
export const gemini=new GeminiProvider()
''')

add('server/src/utils/zodJsonSchema.js', r'''
// Minimal JSON-schema adapter for the subset used by this project.
// Keeps schemas colocated with Zod validators so output contracts are explicit.
export function zodToJsonSchema(schema){
  if(schema?._def?.typeName==='ZodObject'){
    const shape=schema._def.shape();const properties={};const required=[]
    for(const [key,value] of Object.entries(shape)){properties[key]=toSchema(value);if(!value.isOptional?.())required.push(key)}
    return {type:'object',properties,required,additionalProperties:false}
  }
  return toSchema(schema)
}
function toSchema(z){
  const def=z?._def; if(!def)return {type:'string'}
  if(def.typeName==='ZodArray')return {type:'array',items:toSchema(def.type)}
  if(def.typeName==='ZodString')return {type:'string'}
  if(def.typeName==='ZodNumber')return {type:'number'}
  if(def.typeName==='ZodBoolean')return {type:'boolean'}
  if(def.typeName==='ZodOptional')return toSchema(def.innerType)
  if(def.typeName==='ZodNullable')return {anyOf:[toSchema(def.innerType),{type:'null'}]}
  if(def.typeName==='ZodEnum')return {type:'string',enum:def.values}
  if(def.typeName==='ZodObject')return zodToJsonSchema(z)
  return {type:'string'}
}
''')

add('server/src/modules/jobs/job.schemas.js', r'''
import { z } from 'zod'
export const createJobSchema=z.object({sourceType:z.enum(['TEXT','URL']),content:z.string().trim().min(10).max(200000),title:z.string().trim().max(200).optional()})
''')

add('server/src/modules/jobs/job.analysis.schemas.js', r'''
import { z } from 'zod'
export const jobAnalysisSchema=z.object({
  companyName:z.string().nullable(),roleTitle:z.string().nullable(),summary:z.string().min(20),responsibilities:z.array(z.string()),requiredSkills:z.array(z.string()),preferredSkills:z.array(z.string()),experienceRequirement:z.string().nullable(),educationRequirement:z.string().nullable(),atsKeywords:z.array(z.string()),confidence:z.number().min(0).max(1)
})
export const suggestionSchema=z.object({title:z.string(),reason:z.string(),proposedEvidence:z.string().nullable(),targetSection:z.enum(['SUMMARY','SKILLS','EXPERIENCE','EDUCATION'])})
export const suggestionBatchSchema=z.object({suggestions:z.array(suggestionSchema).max(12)})
''')

add('server/src/modules/jobs/job.service.js', r'''
import { prisma } from '../../infrastructure/db/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { gemini } from '../../infrastructure/ai/gemini.provider.js'
import { jobAnalysisSchema, suggestionBatchSchema } from './job.analysis.schemas.js'

const urlPattern=/^https?:\/\/[^\s]+$/i
export async function createJob(userId,{sourceType,content,title}){
 if(sourceType==='URL'&&!urlPattern.test(content))throw new AppError('Please provide a valid public HTTP(S) job URL.',422,null,'INVALID_JOB_URL')
 const job=await prisma.job.create({data:{userId,sourceType,sourceContent:content,title:title||null,sourceUrl:sourceType==='URL'?content:null,sourceStatus:sourceType==='URL'?'PENDING':'DIRECT'}})
 return job
}
export async function getJob(userId,id){const job=await prisma.job.findFirst({where:{id,userId},include:{analysis:true}});if(!job)throw new AppError('Job not found.',404,null,'JOB_NOT_FOUND');return job}

export async function analyzeJob(userId,id){const job=await getJob(userId,id)
 const system=`You are a job advertisement analyst. Extract only what the job advertisement explicitly supports. Do not invent requirements. Return concise structured data for matching a candidate resume.`
 const contents=job.sourceType==='URL' ? [{role:'user',parts:[{text:`Analyze this public job URL: ${job.sourceContent}. Extract requirements from the page.`}]}] : [{role:'user',parts:[{text:`Analyze this job advertisement:\n\n${job.sourceContent}`}]}]
 const tools=job.sourceType==='URL'?[{urlContext:{}}]:[]
 const analysis=await gemini.generateStructured({systemInstruction:system,contents,schema:jobAnalysisSchema,tools})
 if(analysis.requiredSkills.length===0&&analysis.responsibilities.length===0&&analysis.experienceRequirement===null&&analysis.educationRequirement===null)throw new AppError('The job analysis did not contain enough meaningful requirements.',422,null,'WEAK_JOB_ANALYSIS')
 await prisma.jobAnalysis.upsert({where:{jobId:id},create:{jobId:id,...analysis,responsibilities:analysis.responsibilities,requiredSkills:analysis.requiredSkills,preferredSkills:analysis.preferredSkills,atsKeywords:analysis.atsKeywords,rawModelJson:analysis},update:{...analysis,responsibilities:analysis.responsibilities,requiredSkills:analysis.requiredSkills,preferredSkills:analysis.preferredSkills,atsKeywords:analysis.atsKeywords,rawModelJson:analysis}})
 await prisma.job.update({where:{id},data:{analysisStatus:'COMPLETED',normalizedDescription:analysis.summary,sourceStatus:'RESOLVED'}})
 return getJob(userId,id)
}

export async function buildSuggestions(userId,id){
 const job=await prisma.job.findFirst({where:{id,userId},include:{analysis:true}});if(!job?.analysis)throw new AppError('Analyze the job before generating suggestions.',409,null,'ANALYSIS_REQUIRED')
 const profile=await prisma.candidateProfile.findUnique({where:{userId},include:{skills:true,education:true,experience:true}});if(!profile)throw new AppError('Complete your candidate profile first.',409,null,'PROFILE_REQUIRED')
 const system=`You are a career coach. Suggest only factual additions the candidate can review. Never tell the user to invent experience. Identify evidence gaps against the job requirements and propose ways to clarify existing evidence.`
 const prompt={candidate:{summary:profile.summary,skills:profile.skills.map(s=>s.name),education:profile.education,experience:profile.experience},job:job.analysis}
 const batch=await gemini.generateStructured({systemInstruction:system,contents:`Candidate and job data:\n${JSON.stringify(prompt)}`,schema:suggestionBatchSchema})
 await prisma.candidateSuggestion.deleteMany({where:{jobId:id,status:'PENDING'}})
 await prisma.candidateSuggestion.createMany({data:batch.suggestions.map(s=>({profileId:profile.id,jobId:id,title:s.title,reason:s.reason,proposedEvidence:s.proposedEvidence,targetSection:s.targetSection}))})
 return listSuggestions(userId,id)
}
export async function listSuggestions(userId,id){const job=await getJob(userId,id);return prisma.candidateSuggestion.findMany({where:{jobId:job.id},orderBy:{createdAt:'asc'}})}
export async function approveSuggestion(userId,id,suggestionId){const job=await getJob(userId,id);const suggestion=await prisma.candidateSuggestion.updateMany({where:{id:suggestionId,jobId:job.id},data:{status:'APPROVED'}});if(!suggestion.count)throw new AppError('Suggestion not found.',404,null,'SUGGESTION_NOT_FOUND');return prisma.candidateSuggestion.findUnique({where:{id:suggestionId}})}

export async function matchJob(userId,id){
 const job=await prisma.job.findFirst({where:{id,userId},include:{analysis:true}});if(!job?.analysis)throw new AppError('Analyze the job first.',409,null,'ANALYSIS_REQUIRED')
 const profile=await prisma.candidateProfile.findUnique({where:{userId},include:{skills:true,education:true,experience:true}});if(!profile)throw new AppError('Complete your candidate profile first.',409,null,'PROFILE_REQUIRED')
 const candidateSkills=new Set(profile.skills.map(s=>s.name.toLowerCase()));const required=[...new Set((job.analysis.requiredSkills||[]).map(s=>String(s).toLowerCase()))]
 const matched=required.filter(s=>candidateSkills.has(s));const missing=required.filter(s=>!candidateSkills.has(s));
 // Never interpret 0/0 as 95%. When no explicit required skills exist, use an unavailable score.
 const score=required.length===0?null:(matched.length/required.length)*100
 const explanation=required.length===0?'No explicit skill requirements were extracted, so a skill match score is intentionally unavailable.':`${matched.length} of ${required.length} required skills are directly present in the candidate skill list.`
 await prisma.matchResult.create({data:{jobId:id,score,matchedSkills:matched,missingSkills:missing,evidenceGaps:missing,explanation}})
 if((await prisma.candidateSuggestion.count({where:{jobId:id}}))===0)await buildSuggestions(userId,id)
 return {score,matchedSkills:matched,missingSkills:missing,evidenceGaps:missing,explanation}
}
''')

add('server/src/modules/jobs/job.controller.js', r'''
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as service from './job.service.js'
export const create=asyncHandler(async(req,res)=>res.status(201).json({job:await service.createJob(req.auth.userId,req.body)}))
export const get=asyncHandler(async(req,res)=>res.json({job:await service.getJob(req.auth.userId,req.params.id)}))
export const analyze=asyncHandler(async(req,res)=>res.json({job:await service.analyzeJob(req.auth.userId,req.params.id)}))
export const match=asyncHandler(async(req,res)=>res.json({match:await service.matchJob(req.auth.userId,req.params.id)}))
export const suggestions=asyncHandler(async(req,res)=>res.json({suggestions:await service.listSuggestions(req.auth.userId,req.params.id)}))
export const approveSuggestion=asyncHandler(async(req,res)=>res.json({suggestion:await service.approveSuggestion(req.auth.userId,req.params.id,req.params.suggestionId)}))
''')

add('server/src/modules/jobs/job.routes.js', r'''
import { Router } from 'express'
import * as controller from './job.controller.js'
import { requireAuth } from '../../api/middleware/auth.js'
import { validate } from '../../api/middleware/validate.js'
import { createJobSchema } from './job.schemas.js'
export const jobRouter=Router();jobRouter.use(requireAuth)
jobRouter.post('/',validate(createJobSchema),controller.create)
jobRouter.get('/:id',controller.get)
jobRouter.post('/:id/analyze',controller.analyze)
jobRouter.post('/:id/match',controller.match)
jobRouter.get('/:id/suggestions',controller.suggestions)
jobRouter.post('/:id/suggestions/:suggestionId/approve',controller.approveSuggestion)
''')

add('server/src/modules/generation/generation.schemas.js', r'''
import { z } from 'zod'
export const resumeGenerationSchema=z.object({template:z.enum(['ATS','SIMPLE','EUROPASS']),tone:z.enum(['PROFESSIONAL','FRIENDLY','DIRECT'])})
export const coverLetterGenerationSchema=z.object({tone:z.enum(['PROFESSIONAL','FRIENDLY','DIRECT'])})
const resumeJson=z.object({title:z.string(),summary:z.string(),skills:z.array(z.string()),experience:z.array(z.object({company:z.string(),title:z.string(),dates:z.string(),bullets:z.array(z.string())})),education:z.array(z.object({institution:z.string(),degree:z.string(),dates:z.string()}))})
const letterJson=z.object({title:z.string(),body:z.string()})
export const resumeOutputSchema=resumeJson;export const coverLetterOutputSchema=letterJson
''')

add('server/src/modules/generation/generation.service.js', r'''
import { prisma } from '../../infrastructure/db/prisma.js'
import { gemini } from '../../infrastructure/ai/gemini.provider.js'
import { resumeOutputSchema, coverLetterOutputSchema } from './generation.schemas.js'
import { AppError } from '../../utils/AppError.js'

async function context(userId,jobId){const [profile,job]=await Promise.all([prisma.candidateProfile.findUnique({where:{userId},include:{skills:true,education:true,experience:true}}),prisma.job.findFirst({where:{id:jobId,userId},include:{analysis:true}})]);if(!profile||!job?.analysis)throw new AppError('Candidate profile and analyzed job are required.',409,null,'GENERATION_PREREQUISITES');const approvals=await prisma.candidateSuggestion.findMany({where:{jobId,status:'APPROVED'}});return {profile,job,approvals}}
function resumeText(data){const sections=[data.title,'\nSUMMARY\n',data.summary,'\nSKILLS\n',data.skills.join(' · '),'\nEXPERIENCE\n'];for(const e of data.experience)sections.push(`\n${e.title} — ${e.company}\n${e.dates}\n${e.bullets.map(b=>`• ${b}`).join('\n')}`);sections.push('\nEDUCATION\n');for(const e of data.education)sections.push(`${e.degree} — ${e.institution} (${e.dates})\n`);return sections.join('\n')}

export async function generateResume(userId,jobId,{template,tone}){const {profile,job,approvals}=await context(userId,jobId);const prompt=`Create a job-tailored resume using only candidate evidence. Never fabricate employers, dates, degrees, technologies, metrics, or responsibilities. Rephrase truthful evidence to align with job terminology. Template: ${template}. Tone: ${tone}. Candidate: ${JSON.stringify(profile)} Approved suggestions: ${JSON.stringify(approvals)} Job: ${JSON.stringify(job.analysis)}`;const result=await gemini.generateStructured({systemInstruction:'You are an expert resume writer. Output only structured JSON matching the schema. Every factual claim must be grounded in candidate data.',contents:prompt,schema:resumeOutputSchema});const plainText=resumeText(result);const doc=await prisma.generatedDocument.create({data:{userId,jobId,type:'RESUME',template,tone,status:'GENERATED',title:result.title,plainText,html:`<pre>${plainText.replaceAll('&','&amp;').replaceAll('<','&lt;')}</pre>`,model:gemini.modelId}});return doc}
export async function generateCoverLetter(userId,jobId,{tone}){const {profile,job}=await context(userId,jobId);const prompt=`Write a concise cover letter for this role. Do not invent company facts or candidate experience. Use the candidate's genuine background and the job requirements. Tone: ${tone}. Candidate: ${JSON.stringify(profile)} Job: ${JSON.stringify(job.analysis)}`;const result=await gemini.generateStructured({systemInstruction:'You are a professional cover-letter writer. Return structured JSON with a title and body.',contents:prompt,schema:coverLetterOutputSchema});const doc=await prisma.generatedDocument.create({data:{userId,jobId,type:'COVER_LETTER',tone,status:'GENERATED',title:result.title,plainText:result.body,html:`<p>${result.body.replaceAll('\n','<br/>')}</p>`,model:gemini.modelId}});return doc}
export async function getDocument(userId,id){const doc=await prisma.generatedDocument.findFirst({where:{id,userId}});if(!doc)throw new AppError('Document not found.',404,null,'DOCUMENT_NOT_FOUND');return doc}
''')

add('server/src/modules/generation/generation.controller.js', r'''
import { asyncHandler } from '../../utils/asyncHandler.js'
import * as service from './generation.service.js'
import { prisma } from '../../infrastructure/db/prisma.js'
import { renderPdf } from '../../infrastructure/pdf/pdfExport.js'
export const resume=asyncHandler(async(req,res)=>res.status(201).json({document:await service.generateResume(req.auth.userId,req.params.id,req.body)}))
export const coverLetter=asyncHandler(async(req,res)=>res.status(201).json({document:await service.generateCoverLetter(req.auth.userId,req.params.id,req.body)}))
export const getDocument=asyncHandler(async(req,res)=>res.json({document:await service.getDocument(req.auth.userId,req.params.id)}))
export const exportPdf=asyncHandler(async(req,res)=>{const doc=await service.getDocument(req.auth.userId,req.params.id);const pdf=await renderPdf(doc);res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition',`attachment; filename="${doc.type.toLowerCase()}-${doc.id}.pdf"`);res.send(pdf)})
''')

add('server/src/infrastructure/pdf/pdfExport.js', r'''
import { chromium } from 'playwright'

export async function renderPdf(document){
  // Playwright is used here as a browser renderer; install it before production use.
  const browser=await chromium.launch({headless:true});try{const page=await browser.newPage({viewport:{width:900,height:1200}});const body=document.type==='RESUME'?document.html||`<pre>${escape(document.plainText)}</pre>`:`<article style="font-family:Arial;white-space:pre-wrap;line-height:1.7">${escape(document.plainText)}</article>`;await page.setContent(`<!doctype html><html><head><style>body{font-family:Arial,sans-serif;margin:48px;color:#111827}pre{font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.55}</style></head><body>${body}</body></html>`);return await page.pdf({format:'A4',printBackground:true,margin:{top:'18mm',bottom:'18mm',left:'18mm',right:'18mm'}})}finally{await browser.close()}}
function escape(value){return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
''')

# Add playwright dependency correction note by updating server package later

add('server/src/modules/generation/generation.routes.js', r'''
import { Router } from 'express'
import * as controller from './generation.controller.js'
import { requireAuth } from '../../api/middleware/auth.js'
import { validate } from '../../api/middleware/validate.js'
import { resumeGenerationSchema, coverLetterGenerationSchema } from './generation.schemas.js'
export const generationRouter=Router();generationRouter.use(requireAuth)
generationRouter.post('/jobs/:id/generate/resume',validate(resumeGenerationSchema),controller.resume)
generationRouter.post('/jobs/:id/generate/cover-letter',validate(coverLetterGenerationSchema),controller.coverLetter)
generationRouter.get('/documents/:id',controller.getDocument)
generationRouter.get('/documents/:id/export/pdf',controller.exportPdf)
''')

add('server/src/api/routes/index.js', r'''
import { Router } from 'express'
import { authRouter } from '../../modules/auth/auth.routes.js'
import { candidateRouter } from '../../modules/candidate/candidate.routes.js'
import { jobRouter } from '../../modules/jobs/job.routes.js'
import { generationRouter } from '../../modules/generation/generation.routes.js'
export const apiRouter=Router()
apiRouter.use('/auth',authRouter)
apiRouter.use('/candidate',candidateRouter)
apiRouter.use('/jobs',jobRouter)
apiRouter.use('/',generationRouter)
''')

add('server/src/app.js', r'''
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { apiRouter } from './api/routes/index.js'
import { env } from './config/env.js'
import { errorHandler } from './api/middleware/errorHandler.js'
import { ensureStorage } from './infrastructure/storage/localStorage.js'

export async function createApp(){
 const app=express();await ensureStorage()
 app.disable('x-powered-by')
 app.use(cors({origin:env.WEB_ORIGIN,credentials:true}))
 app.use(express.json({limit:'1mb'}));app.use(express.urlencoded({extended:true}));app.use(cookieParser())
 app.get('/health',(_req,res)=>res.json({ok:true,service:'careerbridge-server'}))
 app.use('/api/v1',apiRouter)
 app.use(errorHandler)
 return app
}
''')

add('server/src/server.js', r'''
import { createApp } from './app.js'
import { env } from './config/env.js'
import { disconnectDb } from './infrastructure/db/prisma.js'
const app=await createApp();const server=app.listen(env.PORT,()=>console.log(`CareerBridge API listening on ${env.PORT}`))
async function shutdown(){server.close(async()=>{await disconnectDb();process.exit(0)})}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown)
''')

add('server/tests/matchScore.test.js', r'''
import test from 'node:test'
import assert from 'node:assert/strict'

test('0 required skills must not produce a fake high score',()=>{
  const required=[]
  const score=required.length===0?null:(0/required.length)*100
  assert.equal(score,null)
})
''')

# Fix Playwright dependency and a Node crypto import in storage.
files['server/package.json']=files['server/package.json'].replace('"pdf-parse": "^1.1.1",','"pdf-parse": "^1.1.1",\n    "playwright": "^1.55.0",')
files['server/src/infrastructure/storage/localStorage.js']=files['server/src/infrastructure/storage/localStorage.js'].replace("import path from 'node:path'", "import path from 'node:path'\nimport crypto from 'node:crypto'")

for path, content in files.items():
    p=Path(path);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content,encoding='utf-8')

print(f'created {len(files)} files')
