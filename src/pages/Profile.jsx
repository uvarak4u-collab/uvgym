import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Crown, MapPin, CalendarDays, Zap, Flame, Medal, Dumbbell, Sunrise, Users, Rocket, Trophy, Timer, Lock, Moon, Bell, Ruler, Share2,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import AnimatedCounter from '../components/AnimatedCounter'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { useAuth, initialsOf } from '../context/AuthContext'
import { achievements, user } from '../data/mock'
import { stagger, fadeUp } from '../lib/motion'

const ICONS = { Zap, Flame, Medal, Dumbbell, Sunrise, Users, Rocket, Trophy, Timer }

function Switch({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className="grid h-11 w-14 shrink-0 place-items-center rounded-full"
    >
      <span className={`relative h-7 w-12 rounded-full transition-colors ${on ? 'bg-brand shadow-glow' : 'bg-fg/15'}`}>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${on ? 'right-1' : 'left-1'}`}
        />
      </span>
    </button>
  )
}

export default function Profile() {
  const { theme, toggleTheme } = useApp()
  const { user: account } = useAuth() // real account; level, badges and totals below are still mock
  const memberSince = new Date(account.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const toast = useToast()
  const [notify, setNotify] = useState(true)
  const [metric, setMetric] = useState(true)
  const unlocked = achievements.filter((a) => a.unlocked).length

  return (
    <motion.div variants={stagger()} initial="initial" animate="animate">
      {/* Hero */}
      <GlassCard className="mb-4 overflow-hidden !p-0">
        <div className="relative h-32 overflow-hidden bg-brand sm:h-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,.45),transparent_50%)]" />
          <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 400 100" aria-hidden="true">
            <path d="M0 60 H90 L105 60 L115 25 L130 90 L142 40 L152 60 H250 L265 60 L275 15 L290 95 L302 35 L312 60 H400" fill="none" stroke="#06080a" strokeWidth="2" />
          </svg>
        </div>
        <div className="relative px-5 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
            <div className="relative w-fit">
              <motion.div
                className="absolute -inset-1.5 rounded-[30px] bg-[conic-gradient(from_0deg,rgb(var(--lime)),rgb(var(--cyan)),rgb(var(--violet)),rgb(var(--lime)))]"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative grid h-28 w-28 place-items-center rounded-[26px] bg-surface font-display text-4xl font-bold ring-4 ring-bg sm:h-32 sm:w-32">
                <span className="text-gradient">{initialsOf(account.fullName)}</span>
              </div>
              <span className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-xs font-bold text-[#2a1a00] ring-4 ring-bg">
                {user.level}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{account.fullName}</h1>
                <span className="chip border-0 bg-gradient-to-r from-amber-300/25 to-amber-500/25 font-semibold text-amber-500">
                  <Crown className="h-3.5 w-3.5 fill-current" /> {user.membership} member
                </span>
              </div>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                <span>{account.email}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.homeGym}</span>
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Since {memberSince}</span>
              </p>
            </div>
            <button
              className="btn-ghost self-start sm:self-end"
              onClick={() => toast({ type: 'info', title: 'Profile link copied', message: 'Share your progress with your gym buddies.' })}
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">Level {user.level} · Iron Athlete</span>
              <span className="tabular-nums text-muted">{user.xp.toLocaleString()} / {user.xpNext.toLocaleString()} XP</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-fg/[0.07]">
              <motion.div
                className="h-full rounded-full bg-brand shadow-[0_0_16px_rgb(var(--lime)/.6)]"
                initial={{ width: 0 }}
                animate={{ width: `${(user.xp / user.xpNext) * 100}%` }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ['Workouts', user.totals.workouts, Dumbbell],
          ['Hours trained', user.totals.hours, Timer],
          ['Classes', user.totals.classes, Users],
          ['PRs', user.totals.prs, Trophy],
        ].map(([label, value, Icon]) => (
          <GlassCard key={label} hover className="!p-5 text-center">
            <Icon className="mx-auto h-5 w-5 text-accent" />
            <p className="mt-2 font-display text-3xl font-bold"><AnimatedCounter value={value} /></p>
            <p className="text-xs text-muted">{label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Achievements */}
      <motion.div variants={fadeUp} className="mb-4 flex items-end justify-between">
        <div>
          <p className="label">Achievements</p>
          <h2 className="mt-1 text-2xl font-bold">Badges earned</h2>
        </div>
        <span className="chip bg-lime/10 font-semibold text-accent">{unlocked}/{achievements.length} unlocked</span>
      </motion.div>
      <motion.div variants={stagger(0.05)} className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {achievements.map((a) => {
          const Icon = ICONS[a.icon] ?? Trophy
          return (
            <motion.div
              key={a.id}
              variants={fadeUp}
              whileHover={a.unlocked ? { y: -6, rotate: -1 } : { y: -2 }}
              className={`glass group relative flex flex-col items-center p-5 text-center ${a.unlocked ? '' : 'opacity-70'}`}
              title={a.desc}
            >
              <div className="relative">
                {a.unlocked && <div className="absolute inset-0 rounded-2xl bg-brand opacity-40 blur-lg transition group-hover:opacity-70" />}
                <div
                  className={`relative grid h-16 w-16 place-items-center rounded-2xl ${
                    a.unlocked ? 'bg-brand text-[#06080a]' : 'bg-fg/[0.06] text-muted'
                  }`}
                >
                  <Icon className="h-7 w-7" />
                  {!a.unlocked && (
                    <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-surface ring-2 ring-bg">
                      <Lock className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold">{a.name}</p>
              <p className="mt-0.5 text-xs text-muted">{a.desc}</p>
              {!a.unlocked && (
                <div className="mt-3 w-full">
                  <div className="h-1.5 overflow-hidden rounded-full bg-fg/10">
                    <div className="h-full rounded-full bg-cyan" style={{ width: `${(a.progress / a.goal) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] tabular-nums text-muted">{a.progress} / {a.goal}</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Settings */}
      <GlassCard className="max-w-2xl">
        <p className="label">Preferences</p>
        <h2 className="mt-1 text-xl font-semibold">Settings</h2>
        <ul className="mt-4 divide-y divide-line/10">
          {[
            { icon: Moon, title: 'Dark mode', sub: 'Easy on the eyes between sets', on: theme === 'dark', onChange: toggleTheme },
            {
              icon: Bell, title: 'Workout reminders', sub: 'A nudge when it’s time to train', on: notify,
              onChange: () => {
                setNotify((n) => !n)
                toast({ type: 'info', title: notify ? 'Reminders paused' : 'Reminders on', message: notify ? 'We’ll keep quiet for now.' : 'We’ll nudge you at 6:30 pm.' })
              },
            },
            { icon: Ruler, title: 'Metric units', sub: metric ? 'Kilograms & kilometres' : 'Pounds & miles', on: metric, onChange: () => setMetric((m) => !m) },
          ].map((s) => (
            <li key={s.title} className="flex items-center gap-4 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fg/[0.06]"><s.icon className="h-5 w-5 text-muted" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted">{s.sub}</p>
              </div>
              <Switch on={s.on} onChange={s.onChange} label={s.title} />
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  )
}
