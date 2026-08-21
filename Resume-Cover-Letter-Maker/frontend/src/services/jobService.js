import { apiFetch } from './apiClient'

export const jobService = {
  create: (payload) => apiFetch('/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id) => apiFetch(`/jobs/${id}`),
  analyze: (id) => apiFetch(`/jobs/${id}/analyze`, { method: 'POST' }),
  match: (id) => apiFetch(`/jobs/${id}/match`, { method: 'POST' }),
  suggestions: (id) => apiFetch(`/jobs/${id}/suggestions`),
  approveSuggestion: (jobId, suggestionId) => apiFetch(`/jobs/${jobId}/suggestions/${suggestionId}/approve`, { method: 'POST' }),
}
