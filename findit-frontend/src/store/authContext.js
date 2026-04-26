import { createContext } from 'react'

const AuthContext = createContext({
  user:            null,
  token:           '',
  isAuthenticated: false,
  isAdmin:         false,
  login:           (token, user) => {},
  logout:          () => {},
})

export default AuthContext
