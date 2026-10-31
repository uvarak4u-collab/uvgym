import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Lock, UserRound, Minus, Plus, Timer, Dumbbell, Flame, Trophy, AlertTriangle, CalendarCheck } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { fadeUp, stagger } from '../lib/motion'

const PERKS = [
  { icon: Dumbbell, text: 'Build today’s workout from 30 coach-approved exercises' },
  { icon: Timer, text: 'Live mode with smart rest timers for every set' },
  { icon: Flame, text: 'Streaks, weekly goals and progress rings that keep you going' },
]

function Field({ icon: Icon, label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        {children}
      </span>
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

function Stepper({ value, onChange, min, max, step, format, label }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} className="btn-ghost h-10 w-10 !rounded-xl !p-0" aria-label={`Decrease ${label}`}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[88px] text-center font-display text-xl font-bold tabular-nums" aria-live="polite">
        {format(value)}
      </span>
      <button type="button" onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max} className="btn-ghost h-10 w-10 !rounded-xl !p-0" aria-label={`Increase ${label}`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const { navigate } = useApp()
  const { login, signup } = useAuth()
  const toast = useToast()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [goalWorkouts, setGoalWorkouts] = useState(4)
  const [goalMinutes, setGoalMinutes] = useState(180)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (isSignup && password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      const user = isSignup
        ? await signup({ fullName, email, password, weeklyGoalWorkouts: goalWorkouts, weeklyGoalMinutes: goalMinutes })
        : await login(email, password)
      const first = user.fullName.split(' ')[0]
      toast(
        isSignup
          ? { title: `Welcome to UV Gym, ${first}! 🎉`, message: 'Your account is ready. Let’s build today’s workout.' }
          : { title: `Welcome back, ${first} 💪`, message: 'Good to see you. Let’s get after it.' }
      )
    } catch (err) {
      setError(err.message)
      toast({ type: 'error', title: isSignup ? 'Couldn’t create your account' : 'Couldn’t log you in', message: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip px-4 pb-10 sm:px-6">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[700px]" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between pt-[calc(env(safe-area-inset-top,0px)+16px)]">
        <Logo onClick={() => navigate('landing')} />
        <ThemeToggle />
      </header>

      <div className="relative mx-auto mt-8 grid max-w-6xl items-center gap-10 sm:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16">
        {/* Pitch */}
        <motion.div variants={stagger(0.08)} initial="initial" animate="animate" className="hidden lg:block">
          <motion.p variants={fadeUp} className="label mb-4 text-accent">
            {isSignup ? 'Join the squad' : 'Welcome back'}
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-5xl font-bold leading-[1.02] tracking-[-0.03em] xl:text-6xl">
            {isSignup ? (
              <>Your strongest <span className="text-gradient animate-shimmer">season</span> starts today.</>
            ) : (
              <>Pick up right <span className="text-gradient animate-shimmer">where you left off.</span></>
            )}
          </motion.h1>
          <motion.ul variants={stagger(0.08)} className="mt-10 space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <motion.li key={text} variants={fadeUp} className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime/10 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-muted">{text}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div variants={fadeUp} className="glass mt-10 inline-flex animate-float items-center gap-3 !rounded-2xl px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_20px_rgb(251_191_36/.5)]">
              <Trophy className="h-5 w-5 text-[#2a1a00]" />
            </span>
            <span className="text-sm font-semibold">Every rep counts. Every streak shows.</span>
          </motion.div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="absolute -inset-8 rounded-full bg-brand opacity-[0.12] blur-3xl" />
          <form onSubmit={submit} className="glass relative p-6 sm:p-8" noValidate>
            <h2 className="text-3xl font-bold">{isSignup ? 'Create your account' : 'Log in'}</h2>
            <p className="mt-1.5 text-sm text-muted">
              {isSignup ? 'Free forever. Takes 30 seconds.' : 'Your streak is waiting for you.'}
            </p>

            <div className="mt-7 space-y-4">
              {isSignup && (
                <Field icon={UserRound} label="Your name">
                  <input className="input !pl-11" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" placeholder="Alex Rivera" required maxLength={80} />
                </Field>
              )}
              <Field icon={Mail} label="Email">
                <input className="input !pl-11" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required />
              </Field>
              <Field icon={Lock} label="Password" hint={isSignup ? 'At least 8 characters.' : undefined}>
                <input
                  className="input !pl-11 !pr-12"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  required
                  minLength={isSignup ? 8 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-muted hover:bg-fg/5 hover:text-fg"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>

              {isSignup && (
                <div className="rounded-2xl bg-fg/[0.04] p-4">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <CalendarCheck className="h-4 w-4 text-accent" /> Your weekly goals
                  </p>
                  <p className="mt-0.5 text-xs text-muted">These power your progress rings. You can aim higher anytime.</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="label mb-2">Workouts / week</p>
                      <Stepper label="weekly workouts" value={goalWorkouts} onChange={setGoalWorkouts} min={1} max={14} step={1} format={(v) => v} />
                    </div>
                    <div>
                      <p className="label mb-2">Active minutes / week</p>
                      <Stepper label="weekly minutes" value={goalMinutes} onChange={setGoalMinutes} min={30} max={1200} step={30} format={(v) => `${v}m`} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-start gap-2 overflow-hidden rounded-xl bg-danger/10 px-3 py-2.5 text-sm text-danger"
                  role="alert"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={busy} className="btn-primary mt-6 w-full !py-3.5 !text-base">
              {busy ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> {isSignup ? 'Creating account…' : 'Logging in…'}</>
              ) : (
                <>{isSignup ? 'Create account' : 'Log in'} <ArrowRight className="h-4 w-4" /></>
              )}
            </motion.button>

            <p className="mt-6 text-center text-sm text-muted">
              {isSignup ? 'Already a member?' : 'New to UV Gym?'}{' '}
              <button type="button" onClick={() => { setError(null); navigate(isSignup ? 'login' : 'signup') }} className="inline-flex min-h-10 items-center px-1 font-semibold text-accent hover:underline">
                {isSignup ? 'Log in' : 'Create an account'}
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
