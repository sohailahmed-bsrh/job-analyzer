import { apiFetch } from './apiClient'

export const generationService = {
  resume: (jobId, payload) => apiFetch(`/jobs/${jobId}/generate/resume`, { method: 'POST', body: JSON.stringify(payload) }),
  coverLetter: (jobId, payload) => apiFetch(`/jobs/${jobId}/generate/cover-letter`, { method: 'POST', body: JSON.stringify(payload) }),
  document: (id) => apiFetch(`/documents/${id}`),
  exportPdf: async (id) => {
    const workspaceId = localStorage.getItem('workspaceId');
    const headers = {};
    if (workspaceId) headers['X-Workspace-Id'] = workspaceId;
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5186/api/v1'}/documents/${id}/export/pdf`, { headers });
    if (!response.ok) throw new Error('Unable to export PDF.');
    return response.blob();
  },
}
