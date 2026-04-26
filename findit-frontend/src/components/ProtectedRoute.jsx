import { Navigate } from 'react-router-dom'
import useAuth from '../store/useAuth'

/**
 * Wraps routes that require authentication.
 * @param {React.ReactNode} children
 * @param {boolean} adminOnly - if true, also requires user.role === "admin"
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/home" replace />
  }

  return children
}
