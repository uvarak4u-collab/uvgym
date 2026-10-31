import { useEffect } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import MobileHeader from './components/MobileHeader'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import ErrorState from './components/ErrorState'
import { SkeletonCard } from './components/Skeleton'
import { PROTECTED, useApp } from './context/AppContext'
import { useAuth } from './context/AuthContext'
import { page as pageMotion } from './lib/motion'
import Landing from './pages/Landing'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import LiveWorkout from './pages/LiveWorkout'
import Progress from './pages/Progress'
import Classes from './pages/Classes'
import Profile from './pages/Profile'

const PAGES = {
  dashboard: Dashboard,
  library: Library,
  workout: LiveWorkout,
  progress: Progress,
  classes: Classes,
  profile: Profile,
}

const FULLSCREEN = ['landing', 'login', 'signup']

function AuthGate({ children }) {
  const { status, error, refresh, user } = useAuth()
  if (status === 'loading') {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonCard className="h-72 lg:col-span-2" />
        <SkeletonCard className="h-72" />
      </div>
    )
  }
  if (status === 'error') return <ErrorState error={error} onRetry={refresh} />
  return user ? children : null // logged out → App redirects to login
}

export default function App() {
  const { page, navigate, returnTo, setReturnTo } = useApp()
  const { user, status } = useAuth()
  const needsAuth = PROTECTED.includes(page)
  const Page = PAGES[page]

  // Logged out on a protected screen → login (and come back afterwards)
  useEffect(() => {
    if (needsAuth && status === 'ready' && !user) {
      setReturnTo(page)
      navigate('login', { replace: true })
    }
  }, [needsAuth, status, user, page, navigate, setReturnTo])

  // Already logged in on login/sign-up → straight to the app
  useEffect(() => {
    if ((page === 'login' || page === 'signup') && user) {
      navigate(returnTo ?? 'dashboard', { replace: true })
      setReturnTo(null)
    }
  }, [page, user, returnTo, navigate, setReturnTo])

  return (
    <MotionConfig reducedMotion="user">
      <div className="aurora" aria-hidden="true" />
      <AnimatePresence mode="wait">
        {FULLSCREEN.includes(page) ? (
          <motion.div key={page === 'landing' ? 'landing' : 'auth'} {...pageMotion}>
            {page === 'landing' ? <Landing /> : <AuthPage mode={page} />}
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Sidebar />
            <div className="md:pl-72">
              <main className="mx-auto max-w-6xl px-4 pb-32 sm:px-6 md:pb-6 md:pt-8">
                <MobileHeader />
                <ErrorBoundary key={page}>
                  <AnimatePresence mode="wait">
                    <motion.div key={page} {...pageMotion}>
                      {needsAuth ? (
                        <AuthGate>
                          <Page />
                        </AuthGate>
                      ) : (
                        <Page />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </ErrorBoundary>
                <Footer />
              </main>
            </div>
            <BottomNav />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
