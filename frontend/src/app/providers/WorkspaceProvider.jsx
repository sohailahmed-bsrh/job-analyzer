import { createContext, useContext, useEffect, useState } from 'react'

const WorkspaceContext = createContext()

export function WorkspaceProvider({ children }) {
  const [workspaceId, setWorkspaceId] = useState(null)

  useEffect(() => {
    let id = localStorage.getItem('workspaceId')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('workspaceId', id)
    }
    setWorkspaceId(id)
  }, [])

  if (!workspaceId) return null

  return (
    <WorkspaceContext.Provider value={{ workspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider')
  return context
}
