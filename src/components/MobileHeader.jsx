import { LogOut } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useApp } from '../context/AppContext'
import { useAuth, initialsOf } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function MobileHeader() {
  const { navigate, page } = useApp()
  const { user, logout } = useAuth()
  const toast = useToast()

  const onLogout = async () => {
    await logout()
    navigate('landing')
    toast({ type: 'info', title: 'Logged out', message: 'See you at your next session 👋' })
  }

  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 -mx-4 mb-4 flex items-center justify-between bg-bg/70 px-4 py-3 backdrop-blur-xl md:hidden">
      <Logo size="sm" onClick={() => navigate('landing')} />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <>
            <button
              onClick={onLogout}
              className="grid h-10 w-10 place-items-center rounded-xl text-muted"
              style={{ border: '1px solid rgb(var(--line) / 0.12)' }}
              aria-label="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => navigate('profile')}
              aria-label={`Open profile for ${user.fullName}`}
              className={`grid h-10 w-10 place-items-center rounded-xl bg-brand font-display text-sm font-bold text-[#06080a] ${
                page === 'profile' ? 'ring-2 ring-cyan ring-offset-2 ring-offset-bg' : ''
              }`}
            >
              {initialsOf(user.fullName)}
            </button>
          </>
        ) : (
          <button onClick={() => navigate('login')} className="btn-primary !px-4 !py-2.5">
            Log in
          </button>
        )}
      </div>
    </header>
  )
}
