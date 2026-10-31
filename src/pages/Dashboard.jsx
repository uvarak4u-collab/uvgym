import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Play, Flame, Timer, Zap, Dumbbell, CalendarDays, ChevronRight, CalendarX2, Target, CheckCircle2, Library, Layers } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import PageHeader from '../components/PageHeader'
import ProgressRing from '../components/ProgressRing'
import AnimatedCounter from '../components/AnimatedCounter'
import QuoteCard from '../components/QuoteCard'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard, LoadingLabel } from '../components/Skeleton'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../lib/useApi'
import { chartChrome } from '../lib/colors'
import { stagger } from '../lib/motion'
import { classes, days } from '../data/mock'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const RINGS = [
  { key: 'workouts', label: 'Workouts', unit: '', color: 'lime' },
  { key: 'minutes', label: 'Active min', unit: 'm', color: 'cyan' },
  { key: 'goalsHit', label: 'Goals hit', unit: '', color: 'violet' },
]

function ActivityTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const label = new Date(`${d.date}T00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  return (
    <div className="glass !rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold">{d.isToday ? `Today · ${label.split(', ')[1]}` : label}</p>
      {d.minutes ? (
        <>
          <p className="mt-0.5 text-muted"><span className="font-semibold text-fg">{d.minutes}</span> active min</p>
          <p className="text-muted"><span className="font-semibold text-fg">{d.workouts}</span> workout{d.workouts === 1 ? '' : 's'} completed</p>
        </>
      ) : (
        <p className="mt-0.5 text-muted">Rest day</p>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div>
      <LoadingLabel>Loading your dashboard…</LoadingLabel>
      <div className="mb-8">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-3 h-10 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonCard className="h-[440px] lg:col-span-2" />
        <SkeletonCard className="h-[440px]" />
        <SkeletonCard className="h-[280px] lg:col-span-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-6 w-40" />
          <div className="mt-6 grid grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="mx-auto aspect-square w-full max-w-[112px] !rounded-full" />)}
          </div>
        </SkeletonCard>
        <SkeletonCard className="h-[280px]" />
      </div>
    </div>
  )
}

function subtitleFor(rings) {
  const left = rings.workouts.goal - rings.workouts.value
  if (left <= 0) return 'Weekly workout goal smashed. Anything extra this week is a bonus 💪'
  if (left === 1) return 'You’re 1 workout away from hitting your weekly goal. Let’s make it count.'
  return `${left} workouts to go this week. One session at a time.`
}

function TodayCard({ workout, navigate }) {
  if (!workout || workout.exercises.length === 0) {
    return (
      <GlassCard className="overflow-hidden lg:col-span-2">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
        <p className="label relative text-accent">Today’s workout</p>
        <div className="relative mt-4">
          <EmptyState
            icon={Dumbbell}
            title="No workout yet today"
            message="Pick one from the Library! Add a few exercises and your plan appears right here."
            action={
              <button onClick={() => navigate('library')} className="btn-primary">
                <Library className="h-4 w-4" /> Open Workout Library
              </button>
            }
          />
        </div>
      </GlassCard>
    )
  }

  const done = workout.status === 'completed'
  const inProgress = workout.status === 'in_progress'

  return (
    <GlassCard className="overflow-hidden lg:col-span-2" hover>
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
      <Dumbbell className="pointer-events-none absolute -bottom-8 right-4 h-40 w-40 -rotate-12 text-fg opacity-[0.04]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="label text-accent">Today’s workout</p>
          {done ? (
            <span className="chip border-0 bg-lime/15 font-semibold text-accent"><CheckCircle2 className="h-3.5 w-3.5" /> Completed</span>
          ) : inProgress ? (
            <span className="chip border-0 bg-cyan/15 font-semibold text-cyan">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" /> In progress
            </span>
          ) : (
            <span className="chip bg-fg/5">{workout.difficulty}</span>
          )}
        </div>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{workout.name}</h2>
        <p className="text-muted">{workout.focus}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip bg-fg/5">
            <Timer className="h-3.5 w-3.5 text-cyan" /> {done ? `${workout.durationMinutes} min` : `~${workout.estimatedMinutes} min`}
          </span>
          <span className="chip bg-fg/5"><Layers className="h-3.5 w-3.5 text-orange-400" /> {workout.doneSets}/{workout.totalSets} sets</span>
          <span className="chip bg-fg/5"><Zap className="h-3.5 w-3.5 text-accent" /> {workout.exercises.length} exercise{workout.exercises.length === 1 ? '' : 's'}</span>
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {workout.exercises.map((e, i) => {
            const allDone = e.sets.length > 0 && e.sets.every((s) => s.completed)
            return (
              <li key={e.workoutExerciseId} className="flex items-center gap-3 rounded-xl bg-fg/[0.03] px-3 py-2.5 text-sm">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${allDone ? 'bg-brand text-[#06080a]' : 'bg-fg/10 text-muted'}`}>
                  {allDone ? '✓' : i + 1}
                </span>
                <span className={`min-w-0 flex-1 truncate ${allDone ? 'text-muted line-through decoration-lime/60' : ''}`}>{e.name}</span>
                <span className="shrink-0 tabular-nums text-muted">{e.sets.length}×{e.reps}</span>
              </li>
            )
          })}
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('workout')}
            className={`${done ? 'btn-ghost' : 'btn-primary'} w-full !py-4 !text-base sm:w-auto sm:!px-10`}
          >
            {done ? <><CheckCircle2 className="h-5 w-5" /> See summary</> : <><Play className="h-5 w-5 fill-current" /> {inProgress ? 'Resume' : 'Start'}</>}
          </motion.button>
          {!done && (
            <button onClick={() => navigate('library')} className="btn-ghost !py-4">
              <Library className="h-4 w-4" /> Add exercises
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

export default function Dashboard() {
  const { navigate, theme, bookings } = useApp()
  const { setStreak } = useAuth()
  const { data, error, loading, reload } = useApi('/dashboard')
  const chrome = chartChrome(theme)

  // Keep the sidebar streak in sync with the freshest numbers
  useEffect(() => {
    if (data?.streak) setStreak(data.streak)
  }, [data, setStreak])

  if (loading && !data) return <DashboardSkeleton />
  if (error && !data) return <ErrorState error={error} onRetry={reload} />

  const { user, todayWorkout, activity, week, streak, rings } = data
  const totalMin = activity.reduce((s, d) => s + d.minutes, 0)
  const booked = classes.filter((c) => bookings.includes(c.id))
  const bestGap = streak.best - streak.current

  return (
    <motion.div variants={stagger()} initial="initial" animate="animate">
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        title={<>{greeting()}, <span className="text-gradient">{user.fullName.split(' ')[0]}</span></>}
        subtitle={subtitleFor(rings)}
        action={
          todayWorkout?.exercises.length > 0 && todayWorkout.status !== 'completed' ? (
            <button onClick={() => navigate('workout')} className="btn-primary hidden sm:inline-flex">
              <Play className="h-4 w-4 fill-current" /> Quick start
            </button>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <TodayCard workout={todayWorkout} navigate={navigate} />

        {/* Streak */}
        <GlassCard hover className="overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-rose-500/10" />
          <div className="relative flex h-full flex-col">
            <p className="label">Current streak</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-2xl ${streak.current ? 'bg-orange-500/40' : 'bg-orange-500/15'}`} />
                <Flame className={`relative h-16 w-16 fill-orange-400 text-orange-500 ${streak.current ? 'animate-flicker' : 'opacity-50'}`} />
              </div>
              <div>
                <p className="font-display text-6xl font-bold leading-none">
                  <AnimatedCounter value={streak.current} duration={1.2} />
                </p>
                <p className="mt-1 text-sm text-muted">{streak.current === 1 ? 'day' : 'days'} in a row</p>
              </div>
            </div>
            <div className="mt-auto pt-6">
              <div className="flex justify-between gap-1">
                {week.map((d, i) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.06, type: 'spring' }}
                      className={`grid h-8 w-full max-w-[36px] place-items-center rounded-lg ${
                        d.trained ? 'bg-gradient-to-b from-orange-400 to-rose-500 text-white shadow-[0_4px_14px_-4px_rgb(249_115_22/.7)]' : 'bg-fg/[0.06] text-muted'
                      } ${d.isToday && !d.trained ? 'ring-1 ring-orange-400/50' : ''}`}
                      title={d.trained ? `${d.day}: trained` : d.day}
                    >
                      {d.trained ? <Flame className="h-3.5 w-3.5 fill-current" /> : <span className="h-1 w-1 rounded-full bg-current" />}
                    </motion.span>
                    <span className={`text-[10px] ${d.isToday ? 'font-bold text-fg' : 'text-muted'}`}>{d.day[0]}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted">
                {streak.current === 0
                  ? 'Finish today’s workout to start a new streak.'
                  : bestGap > 0
                    ? <>Personal best: <span className="font-semibold text-fg">{streak.best} days</span> · {bestGap} to beat it!</>
                    : <>You’re at your <span className="font-semibold text-fg">personal best</span>. Keep it lit! 🔥</>}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Progress rings */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="label">This week</p>
              <h3 className="mt-1 text-xl font-semibold">Weekly goals</h3>
            </div>
            <Target className="h-5 w-5 text-muted" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-6">
            {RINGS.map((r) => {
              const g = rings[r.key]
              return (
                <div key={r.key} className="flex flex-col items-center text-center">
                  <ProgressRing progress={g.goal ? g.value / g.goal : 0} size={112} stroke={10} color={r.color} className="scale-[0.82] sm:scale-100">
                    <div>
                      <p className="font-display text-2xl font-bold leading-none">
                        <AnimatedCounter value={g.value} />
                        <span className="text-sm text-muted">{r.unit}</span>
                      </p>
                      <p className="mt-1 text-[11px] text-muted">of {g.goal}{r.unit}</p>
                    </div>
                  </ProgressRing>
                  <p className="mt-1 text-sm font-medium sm:mt-3">{r.label}</p>
                  <p className="text-xs text-muted">{Math.min(100, Math.round((g.value / g.goal) * 100))}%</p>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            Goals: {rings.workouts.goal} workouts and {rings.minutes.goal} active minutes per week
          </p>
        </GlassCard>

        <QuoteCard />

        {/* Weekly activity chart */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="label">Last 7 days</p>
              <h3 className="mt-1 text-xl font-semibold">Active minutes per day</h3>
            </div>
            <p className="text-sm text-muted">
              <span className="font-display text-2xl font-bold text-fg"><AnimatedCounter value={totalMin} /></span> min in 7 days
            </p>
          </div>
          <div className="relative h-56 sm:h-64">
            {totalMin === 0 && (
              <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                <p className="glass !rounded-2xl px-4 py-2 text-sm text-muted">No finished workouts yet — your bars appear here 📊</p>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barCategoryGap="28%">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme === 'dark' ? '#C6FF3D' : '#84CC16'} />
                    <stop offset="100%" stopColor={theme === 'dark' ? '#22D3EE' : '#0891B2'} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={chrome.grid} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={({ x, y, index }) => {
                    const d = activity[index]
                    return (
                      <text x={x} y={y + 14} textAnchor="middle" fontSize={12} fill={chrome.axis} fontWeight={d?.isToday ? 700 : 400}>
                        {d?.isToday ? 'Today' : d?.day}
                      </text>
                    )
                  }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chrome.axis }} width={44} allowDecimals={false} domain={[0, (max) => Math.max(30, max)]} />
                <Tooltip content={<ActivityTooltip />} cursor={{ fill: chrome.cursor, opacity: 0.25, radius: 8 }} />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={1300} animationEasing="ease-out">
                  {activity.map((d) => (
                    <Cell key={d.date} fill="url(#barGrad)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Upcoming classes (Class Booking is still mock data) */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="label">Up next</p>
              <h3 className="mt-1 text-xl font-semibold">Your classes</h3>
            </div>
            <button onClick={() => navigate('classes')} className="-mr-2 flex min-h-10 items-center px-2 text-sm font-medium text-accent hover:underline">
              Book <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {booked.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              title="No classes booked"
              message="Grab a spot in Yoga, HIIT, Spin or Boxing — they fill up fast!"
              action={<button className="btn-ghost" onClick={() => navigate('classes')}>Browse schedule</button>}
            />
          ) : (
            <ul className="space-y-2">
              {booked.slice(0, 4).map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-fg/[0.04] p-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan/15 text-cyan">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted">
                      {days.find((d) => d.key === c.day)?.short} · {c.time} · {c.coach}
                    </p>
                  </div>
                  <span className="chip bg-lime/10 text-accent">{c.type}</span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </motion.div>
  )
}
