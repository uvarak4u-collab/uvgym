import { motion } from 'framer-motion'
import {
  Play, ArrowRight, Users, Dumbbell, CalendarDays, Flame, Trophy, Timer, TrendingUp, Sparkles, Star, Zap, HeartPulse, LogOut, DatabaseZap,
} from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import AnimatedCounter from '../components/AnimatedCounter'
import ProgressRing from '../components/ProgressRing'
import QuoteCard from '../components/QuoteCard'
import Footer from '../components/Footer'
import { Skeleton } from '../components/Skeleton'
import { useApp } from '../context/AppContext'
import { useAuth, initialsOf } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useApi } from '../lib/useApi'
import { heroPreview as todayWorkout } from '../data/mock'
import { ease, fadeUp, stagger } from '../lib/motion'

const FEATURES = [
  { icon: Sparkles, title: 'Smart workout plans', text: 'Daily sessions tuned to your goals, recovery and schedule.', to: 'dashboard' },
  { icon: Timer, title: 'Live workout mode', text: 'Tick off sets, auto-start rest timers, celebrate the finish.', to: 'workout' },
  { icon: TrendingUp, title: 'Progress you can see', text: 'Strength curves, PR trophies and weekly trends at a glance.', to: 'progress' },
  { icon: CalendarDays, title: 'Book classes in a tap', text: 'Yoga, HIIT, Spin and Boxing with live spots left.', to: 'classes' },
  { icon: Dumbbell, title: '30 coach-picked exercises', text: 'Filter by muscle group with sets, reps and difficulty.', to: 'library' },
  { icon: Trophy, title: 'Streaks & badges', text: 'Stay motivated with achievements that actually feel earned.', to: 'profile' },
]

const STATS = [
  { icon: Users, key: 'members', label: 'Members' },
  { icon: Dumbbell, key: 'workoutsCompleted', label: 'Workouts completed' },
  { icon: CalendarDays, key: 'classesThisWeek', label: 'Classes this week' },
]

function NavAccount() {
  const { user, logout } = useAuth()
  const { navigate } = useApp()
  const toast = useToast()

  if (!user) {
    return (
      <>
        <button onClick={() => navigate('login')} className="btn-ghost hidden !px-4 !py-2.5 sm:inline-flex">
          Log in
        </button>
        <button onClick={() => navigate('signup')} className="btn-primary !px-4 !py-2.5">
          Sign up <ArrowRight className="h-4 w-4" />
        </button>
      </>
    )
  }
  return (
    <>
      <button onClick={() => navigate('dashboard')} className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-3 hover:bg-fg/5" title="Open dashboard">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-display text-xs font-bold text-[#06080a]">{initialsOf(user.fullName)}</span>
        <span className="hidden max-w-[140px] truncate text-sm font-semibold sm:block">{user.fullName}</span>
      </button>
      <button
        onClick={async () => {
          await logout()
          toast({ type: 'info', title: 'Logged out', message: 'See you at your next session 👋' })
        }}
        className="grid h-10 w-10 place-items-center rounded-xl text-muted transition hover:bg-fg/5 hover:text-fg"
        style={{ border: '1px solid rgb(var(--line) / 0.12)' }}
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="h-[18px] w-[18px]" />
      </button>
    </>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-10 rounded-full bg-brand opacity-20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.25 }}
        className="glass relative overflow-hidden p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="label">Today’s session</p>
            <h3 className="mt-1 text-2xl font-bold">{todayWorkout.name}</h3>
            <p className="text-sm text-muted">{todayWorkout.focus}</p>
          </div>
          <span className="chip bg-lime/10 font-semibold text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> Live
          </span>
        </div>

        <div className="mt-6 flex items-center gap-6">
          <ProgressRing progress={0.72} size={132} stroke={12}>
            <div>
              <p className="font-display text-3xl font-bold">72%</p>
              <p className="text-[11px] text-muted">complete</p>
            </div>
          </ProgressRing>
          <div className="flex-1 space-y-3">
            {todayWorkout.exercises.slice(0, 3).map((e, i) => (
              <div key={e.id} className="flex items-center gap-3">
                <span className={`grid h-6 w-6 place-items-center rounded-lg text-[10px] font-bold ${i < 2 ? 'bg-brand text-[#06080a]' : 'bg-fg/10 text-muted'}`}>
                  {i < 2 ? '✓' : i + 1}
                </span>
                <span className={`truncate text-sm ${i < 2 ? 'text-muted line-through' : 'font-medium'}`}>{e.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-fg/[0.04] p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5"><HeartPulse className="h-4 w-4 text-danger" /> Heart rate</span>
            <span className="font-display text-base font-semibold text-fg">142 <span className="text-xs text-muted">bpm</span></span>
          </div>
          <svg viewBox="0 0 300 50" className="h-12 w-full" aria-hidden="true">
            <motion.path
              d="M0 30 H60 L72 30 L80 10 L92 46 L102 18 L110 30 H170 L182 30 L190 6 L202 46 L212 20 L220 30 H300"
              fill="none"
              stroke="rgb(var(--lime))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 }}
              style={{ filter: 'drop-shadow(0 0 6px rgb(var(--lime) / .7))' }}
            />
          </svg>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.6, ease }}
        className="absolute -top-6 right-2 sm:-right-8"
      >
        <div className="glass flex animate-float items-center gap-2 !rounded-2xl px-4 py-3">
          <Flame className="h-5 w-5 animate-flicker fill-orange-400 text-orange-500" />
          <span className="text-sm font-semibold">12-day streak</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.6, ease }}
        className="absolute -bottom-6 left-2 sm:-left-10"
      >
        <div className="glass flex animate-float items-center gap-3 !rounded-2xl px-4 py-3 [animation-delay:-3s]">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_20px_rgb(251_191_36/.5)]">
            <Trophy className="h-5 w-5 text-[#2a1a00]" />
          </span>
          <div>
            <p className="text-xs text-muted">New PR</p>
            <p className="text-sm font-semibold">Deadlift · 180 kg</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Landing() {
  const { navigate } = useApp()
  const { user } = useAuth()
  const stats = useApi('/stats')
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  // Logged out → sign up first; logged in → straight to the dashboard
  const startWorkout = () => navigate(user ? 'dashboard' : 'signup')

  return (
    <div className="relative overflow-x-clip">
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[900px]" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 px-4 pt-[env(safe-area-inset-top,0px)] sm:px-6">
        <div className="glass mx-auto mt-3 flex max-w-6xl items-center justify-between !rounded-2xl px-4 py-2.5">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <nav className="hidden items-center gap-1 text-sm text-muted md:flex">
            {[['features', 'Features'], ['stats', 'Community'], ['quote', 'Motivation']].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="rounded-xl px-3 py-2 transition hover:bg-fg/5 hover:text-fg">
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NavAccount />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid grid-cols-1 items-center gap-16 pb-20 pt-12 sm:pt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
          <motion.div variants={stagger(0.1)} initial="initial" animate="animate">
            <motion.div variants={fadeUp} className="chip mb-6 bg-surface/50 backdrop-blur">
              <Zap className="h-3.5 w-3.5 fill-lime text-accent" />
              <span className="text-muted">New:</span> Live workout mode with smart rest timers
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-[clamp(2.75rem,8vw,5.25rem)] font-bold leading-[0.95] tracking-[-0.03em]">
              Train smarter.
              <br />
              <span className="text-gradient animate-shimmer">Get stronger.</span>
              <span className="mt-3 block text-[0.42em] font-semibold tracking-tight text-muted">
                with <span className="text-fg">UV Gym</span> — your coach in your pocket.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-lg text-base text-muted sm:text-lg">
              Plan workouts, crush every set with live timers, book classes in seconds and watch your strength climb —
              all in one beautifully simple app.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={startWorkout}
                className="btn-primary !px-7 !py-4 !text-base"
              >
                <Play className="h-5 w-5 fill-current" /> Start Your Workout
              </motion.button>
              <button onClick={() => navigate('dashboard')} className="btn-ghost !px-7 !py-4 !text-base">
                Explore dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {['from-green-300 to-emerald-500', 'from-sky-300 to-blue-500', 'from-purple-300 to-fuchsia-500', 'from-amber-300 to-orange-500'].map((g, i) => (
                  <span key={g} className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${g} text-xs font-bold text-[#06080a] ring-4 ring-bg`}>
                    {['JK', 'MS', 'TL', 'RB'][i]}
                  </span>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  <span className="ml-1.5 font-semibold text-fg">Free</span>
                </div>
                <p className="text-muted">Join in 30 seconds — no card needed</p>
              </div>
            </motion.div>
          </motion.div>

          <HeroVisual />
        </section>

        {/* Stats */}
        <motion.section
          id="stats"
          variants={stagger(0.12)}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="grid scroll-mt-28 gap-4 sm:grid-cols-3"
        >
          {STATS.map(({ icon: Icon, key, label }) => (
            <motion.div key={label} variants={fadeUp} whileHover={{ y: -4 }} className="glass group relative overflow-hidden p-6">
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-lime/10 blur-2xl transition group-hover:bg-lime/20" />
              <Icon className="h-6 w-6 text-accent" />
              <div className="mt-4 flex h-12 items-center font-display text-4xl font-bold sm:h-[60px] sm:text-5xl">
                {stats.data ? (
                  <AnimatedCounter key={stats.data[key]} value={stats.data[key]} duration={2} />
                ) : stats.error ? (
                  <span className="text-muted">—</span>
                ) : (
                  <Skeleton className="h-10 w-32 sm:h-12" />
                )}
              </div>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </motion.div>
          ))}
          {stats.error && (
            <motion.p variants={fadeUp} className="flex items-center gap-2 text-sm text-muted sm:col-span-3">
              <DatabaseZap className="h-4 w-4 text-danger" />
              Live community stats are unavailable right now.
              <button onClick={stats.reload} className="inline-flex min-h-10 items-center font-semibold text-accent hover:underline">Try again</button>
            </motion.p>
          )}
        </motion.section>

        {/* Features */}
        <section id="features" className="scroll-mt-28 pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 max-w-2xl">
            <p className="label mb-3 text-accent">Everything you need</p>
            <h2 className="text-3xl font-bold sm:text-5xl">One app. Every rep, every class, every win.</h2>
          </motion.div>
          <motion.div
            variants={stagger(0.07)}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, title, text, to }) => (
              <motion.button
                key={title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                onClick={() => navigate(to)}
                className="glass group p-6 text-left transition-shadow hover:shadow-glow"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime/10 text-accent transition group-hover:bg-brand group-hover:text-[#06080a]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted">{text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition group-hover:opacity-100">
                  Open <ArrowRight className="h-4 w-4" />
                </span>
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* Quote + CTA */}
        <section id="quote" className="grid scroll-mt-28 gap-4 pt-24 lg:grid-cols-[1fr_1.2fr]">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }}>
            <QuoteCard className="h-full" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-brand p-8 text-[#06080a] sm:p-10"
          >
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
            <Dumbbell className="absolute -bottom-6 right-6 h-36 w-36 -rotate-12 opacity-10" />
            <h2 className="relative text-3xl font-bold sm:text-4xl">Your next PR is one session away.</h2>
            <p className="relative mt-3 max-w-md text-[#06080a]/70">
              {user
                ? `Ready when you are, ${user.fullName.split(' ')[0]}. Today’s plan is one tap away.`
                : 'Create your free account, pick your exercises and start lifting in under a minute.'}
            </p>
            <button
              onClick={startWorkout}
              className="btn relative mt-6 bg-[#06080a] !px-6 !py-3.5 text-white hover:-translate-y-0.5 hover:bg-black"
            >
              <Play className="h-4 w-4 fill-current" /> Start Your Workout
            </button>
          </motion.div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
