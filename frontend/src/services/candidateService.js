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
