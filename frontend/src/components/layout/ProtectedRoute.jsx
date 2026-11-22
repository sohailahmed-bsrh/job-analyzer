import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../app/providers/AuthProvider'

export function ProtectedRoute() {
  const { ready, isAuthenticated } = useAuth()
  const location = useLocation()
  if (!ready) return <div className="page-center"><div className="spinner" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
