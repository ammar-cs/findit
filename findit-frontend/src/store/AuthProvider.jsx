import { useState } from 'react'
import AuthContext from './authContext'

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) ?? null
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') ?? '')
  const [user,  setUser]  = useState(() => readUser())

  /**
   * Called after a successful signin.
   * Backend returns { token, user: { id, username, name, email, role } }
   * @param {string} authToken
   * @param {object} userData
   */
  const login = (authToken, userData) => {
    localStorage.setItem('token', authToken)
    localStorage.setItem('user',  JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
  }

  const isAuthenticated = !!token
  const isAdmin         = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
