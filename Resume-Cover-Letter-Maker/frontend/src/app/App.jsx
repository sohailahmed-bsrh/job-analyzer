import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from '../components/layout/SiteLayout'
import { HomePage } from '../pages/home/HomePage'
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
        <Route path="/candidate" element={<CandidatePage />} />
        <Route path="/job-analysis" element={<JobAnalysisPage />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
        <Route path="/generate/templates" element={<TemplatePage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/documents/:id" element={<DocumentPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
