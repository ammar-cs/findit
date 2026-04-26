import { useContext } from 'react'
import AuthContext from './authContext'

/**
 * Hook to consume AuthContext.
 * Must be used inside AuthProvider.
 */
export default function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
