const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5186/api'

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

async function rawFetch(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const body = options.body
  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  
  const workspaceId = localStorage.getItem('workspaceId')
  if (workspaceId) {
    headers.set('X-Workspace-Id', workspaceId)
  }

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers })
}

export async function apiFetch(path, options = {}) {
  const response = await rawFetch(path, options)
  return parseResponse(response)
}

export { API_BASE_URL }
