import { apiFetch } from './apiClient'

export const authService = {
  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  loginWithGoogle: (credential) => apiFetch('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/me'),
}
