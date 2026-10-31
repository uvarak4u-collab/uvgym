import { motion } from 'framer-motion'
import { Flame, LogOut, LogIn } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { NAV } from './nav'
import { useApp } from '../context/AppContext'
import { useAuth, initialsOf } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Sidebar() {
  const { page, navigate } = useApp()
  const { user, streak, logout } = useAuth()
  const toast = useToast()

  const onLogout = async () => {
    await logout()
    navigate('landing')
    toast({ type: 'info', title: 'Logged out', message: 'See you at your next session 👋' })
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 p-4 md:block">
      <div className="glass flex h-full flex-col p-5">
        <div className="mb-8 flex items-center justify-between px-1">
          <Logo onClick={() => navigate('landing')} />
          <ThemeToggle />
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = page === key
            return (
              <button
                key={key}
                onClick={() => navigate(key)}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  active ? 'text-[#06080a]' : 'text-muted hover:text-fg hover:bg-fg/5'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-pill"
                    className="absolute inset-0 rounded-2xl bg-brand shadow-glow"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon className="relative h-[18px] w-[18px] transition-transform group-hover:scale-110" />
                <span className="relative">{label}</span>
                {key === 'workout' && !active && (
                  <span className="relative ml-auto rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-bold text-accent">LIVE</span>
                )}
              </button>
            )
          })}
        </nav>

        {user && streak && (
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-orange-500/15 to-rose-500/10 p-4 ring-1 ring-orange-400/20">
            <div className="flex items-center gap-3">
              <Flame className={`h-8 w-8 fill-orange-400 text-orange-500 ${streak.current ? 'animate-flicker' : 'opacity-60'}`} />
              <div>
                <p className="font-display text-2xl font-bold leading-none">
                  {streak.current} {streak.current === 1 ? 'day' : 'days'}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {streak.current ? 'Current streak — keep it lit!' : 'Finish a workout to start a streak'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          {user ? (
            <>
              <button onClick={() => navigate('profile')} className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1.5 text-left hover:bg-fg/5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand font-display text-sm font-bold text-[#06080a]">
                  {initialsOf(user.fullName)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{user.fullName}</span>
                  <span className="block truncate text-xs text-muted">{user.email}</span>
                </span>
              </button>
              <button
                onClick={onLogout}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-danger/10 hover:text-danger"
                style={{ border: '1px solid rgb(var(--line) / 0.12)' }}
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </>
          ) : (
            <button onClick={() => navigate('login')} className="btn-primary flex-1">
              <LogIn className="h-4 w-4" /> Log in
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
