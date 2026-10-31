import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AppContext = createContext(null)

export const ROUTES = ['landing', 'login', 'signup', 'dashboard', 'library', 'workout', 'progress', 'classes', 'profile']
/** Screens that need a logged-in user */
export const PROTECTED = ['dashboard', 'library', 'workout', 'profile']

const readRoute = () => {
  const r = window.location.hash.replace(/^#\/?/, '')
  return ROUTES.includes(r) ? r : 'landing'
}

const readTheme = () => {
  try {
    return localStorage.getItem('uvgym-theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function AppProvider({ children }) {
  const [page, setPage] = useState(readRoute)
  const [theme, setTheme] = useState(readTheme)
  const [bookings, setBookings] = useState(['c7']) // one pre-booked class (Classes screen is still mock data)
  const [returnTo, setReturnTo] = useState(null) // where to go after logging in

  useEffect(() => {
    const onHash = () => setPage(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#07090c' : '#f2f5ee')
    try {
      localStorage.setItem('uvgym-theme', theme)
    } catch {
      /* storage unavailable — theme still works for this session */
    }
  }, [theme])

  const navigate = useCallback((to, { replace = false } = {}) => {
    const hash = to === 'landing' ? '#/' : `#/${to}`
    if (replace) window.history.replaceState(null, '', hash)
    else window.location.hash = hash
    setPage(to)
    window.scrollTo({ top: 0, behavior: replace ? 'auto' : 'smooth' })
  }, [])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const book = useCallback((id) => setBookings((b) => (b.includes(id) ? b : [...b, id])), [])
  const cancel = useCallback((id) => setBookings((b) => b.filter((x) => x !== id)), [])

  return (
    <AppContext.Provider value={{ page, navigate, theme, toggleTheme, bookings, book, cancel, returnTo, setReturnTo }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
