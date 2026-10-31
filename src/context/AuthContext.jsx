import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [streak, setStreak] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)

  // silent: re-fetch in the background (e.g. after finishing a workout) without a loading state
  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setStatus('loading')
    try {
      const { user, streak } = await api('/auth/me')
      setUser(user)
      setStreak(streak)
      setError(null)
      setStatus('ready')
    } catch (err) {
      if (silent) return
      setUser(null)
      // 401 just means "logged out"; anything else (DB down, server down) is worth showing
      if (err.status === 401) {
        setError(null)
        setStatus('ready')
      } else {
        setError(err)
        setStatus('error')
      }
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (email, password) => {
    const { user } = await api('/auth/login', { method: 'POST', body: { email, password } })
    setUser(user)
    setStatus('ready')
    setError(null)
    refresh({ silent: true }) // pick up the streak
    return user
  }, [refresh])

  const signup = useCallback(async (fields) => {
    const { user } = await api('/auth/signup', { method: 'POST', body: fields })
    setUser(user)
    setStreak({ current: 0, best: 0 })
    setStatus('ready')
    setError(null)
    return user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
      setStreak(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, streak, setStreak, status, error, refresh, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?'
