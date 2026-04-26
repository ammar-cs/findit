import { Navigate } from 'react-router-dom'
import useAuth from '../store/useAuth'

/**
 * Wraps routes that require admin role.
 * @param {React.ReactNode} children
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />
  }

  return children
}
