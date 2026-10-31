import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pause, Play, SkipForward, RotateCcw, Trophy, Timer, Dumbbell, Flag, Plus, Minus, ChevronDown, Layers, Library, Loader2, CheckCircle2 } from 'lucide-react'
import ProgressRing from '../components/ProgressRing'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard, LoadingLabel } from '../components/Skeleton'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { celebrate } from '../lib/confetti'
import { stagger, fadeUp } from '../lib/motion'

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function LiveSkeleton() {
  return (
    <div>
      <LoadingLabel>Loading today’s workout…</LoadingLabel>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-10 w-64 max-w-full" />
      <Skeleton className="mt-8 h-2.5 w-full !rounded-full" />
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <SkeletonCard className="h-[460px]">
          <Skeleton className="mx-auto mt-8 aspect-square w-full max-w-[264px] !rounded-full" />
        </SkeletonCard>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} className="h-[76px] !p-4"><Skeleton className="h-full w-full" /></SkeletonCard>)}
        </div>
      </div>
    </div>
  )
}

export default function LiveWorkout() {
  const { navigate } = useApp()
  const { refresh: refreshAuth } = useAuth()
  const toast = useToast()
  const { data, error, loading, reload, setData } = useApi('/workouts')
  const workout = data?.workout ?? null
  const exercises = useMemo(() => workout?.exercises ?? [], [workout])

  const [overrides, setOverrides] = useState({}) // setId → completed, while a save is in flight
  const [open, setOpen] = useState(null)
  const [restLeft, setRestLeft] = useState(0)
  const [restTotal, setRestTotal] = useState(0)
  const [paused, setPaused] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const prevRest = useRef(0)
  const quietRestEnd = useRef(false) // timer cleared by Finish/Restart, not a real "rest over"
  const saveQueue = useRef(Promise.resolve()) // keeps set saves in the order they were tapped
  const startedFor = useRef(null)

  const complete = workout?.status === 'completed'
  const isDone = useCallback((s) => (s.id in overrides ? overrides[s.id] : s.completed), [overrides])
  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)
  const doneCount = exercises.reduce((n, e) => n + e.sets.filter(isDone).length, 0)

  // Open the first unfinished exercise once, when the workout first loads (later the user is in control)
  const autoOpened = useRef(false)
  useEffect(() => {
    if (!exercises.length || autoOpened.current) return
    autoOpened.current = true
    const first = exercises.find((e) => e.sets.some((s) => !s.completed)) ?? exercises[0]
    setOpen(first.workoutExerciseId)
  }, [exercises])

  // Opening Live Workout starts the clock on a planned workout
  useEffect(() => {
    if (!workout || workout.status !== 'planned' || !exercises.length || startedFor.current === workout.id) return
    startedFor.current = workout.id
    api('/workouts', { method: 'POST', body: { action: 'start', workoutId: workout.id } })
      .then((res) => setData({ workout: res.workout }))
      .catch((err) => toast({ type: 'error', title: 'Couldn’t start the clock', message: err.message }))
  }, [workout, exercises.length, setData, toast])

  // Workout clock
  useEffect(() => {
    if (complete || !workout?.startedAt) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [complete, workout?.startedAt])

  // Rest countdown
  useEffect(() => {
    if (restLeft <= 0 || paused) return
    const t = setTimeout(() => setRestLeft((l) => Math.max(0, l - 1)), 1000)
    return () => clearTimeout(t)
  }, [restLeft, paused])

  // Rest finished
  useEffect(() => {
    if (prevRest.current > 0 && restLeft === 0 && !complete && !quietRestEnd.current) {
      toast({ type: 'info', title: 'Rest over — time to lift!', message: 'Next set is waiting. You’ve got this.' })
      navigator.vibrate?.([120, 60, 120])
    }
    if (restLeft === 0) quietRestEnd.current = false
    prevRest.current = restLeft
  }, [restLeft, complete, toast])

  const enqueue = (task) => {
    const run = saveQueue.current.then(task, task)
    saveQueue.current = run.catch(() => {})
    return run
  }

  const finish = async () => {
    if (!workout || finishing) return
    setFinishing(true)
    quietRestEnd.current = restLeft > 0
    setRestLeft(0)
    try {
      await saveQueue.current // make sure every ticked set is saved first
      const res = await api('/workouts', { method: 'POST', body: { action: 'finish', workoutId: workout.id } })
      setData({ workout: res.workout })
      setShowModal(true)
      celebrate()
      toast({ title: 'Workout complete! 🎉', message: `${res.durationMinutes} min saved. Your dashboard is updated.` })
      refreshAuth({ silent: true }) // streak in the sidebar
    } catch (err) {
      toast({ type: 'error', title: 'Couldn’t save your workout', message: err.message })
    } finally {
      setFinishing(false)
    }
  }

  const toggleSet = (ex, set) => {
    if (complete || finishing) return
    const next = !isDone(set)
    const nextOverrides = { ...overrides, [set.id]: next }
    setOverrides(nextOverrides)

    // Save in the background; on failure roll back and say so
    enqueue(async () => {
      try {
        await api('/sets', { method: 'PATCH', body: { setId: set.id, completed: next } })
        setData((d) => ({
          workout: {
            ...d.workout,
            status: d.workout.status === 'planned' ? 'in_progress' : d.workout.status,
            exercises: d.workout.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => (s.id === set.id ? { ...s, completed: next } : s)) })),
          },
        }))
      } catch (err) {
        toast({ type: 'error', title: 'That set didn’t save', message: err.message })
        throw err
      } finally {
        setOverrides(({ [set.id]: _, ...rest }) => rest)
      }
    })

    if (!next) return
    const doneWith = (s) => (s.id in nextOverrides ? nextOverrides[s.id] : s.completed)
    const allDone = exercises.every((e) => e.sets.every(doneWith))
    if (allDone) {
      finish()
      return
    }

    // Rest timer uses this exercise's rest time
    quietRestEnd.current = false
    setRestTotal(ex.restSeconds)
    setRestLeft(ex.restSeconds)
    setPaused(false)

    // Auto-advance to the next exercise when this one is finished
    if (ex.sets.every(doneWith)) {
      const nextEx = exercises.find((e) => e.sets.some((s) => !doneWith(s)))
      if (nextEx) {
        setOpen(nextEx.workoutExerciseId)
        toast({ title: `${ex.name} done ✅`, message: `Up next: ${nextEx.name}` })
      }
    }
  }

  const finishEarly = () => {
    if (doneCount === 0) {
      toast({ type: 'error', title: 'Not so fast!', message: 'Log at least one set before finishing — even one rep counts.' })
      return
    }
    finish()
  }

  const restart = async () => {
    if (!workout || complete) return
    try {
      await saveQueue.current
      const res = await api('/workouts', { method: 'POST', body: { action: 'restart', workoutId: workout.id } })
      setOverrides({})
      setData({ workout: res.workout })
      quietRestEnd.current = restLeft > 0
      setRestLeft(0)
      setRestTotal(0)
      setOpen(res.workout.exercises[0]?.workoutExerciseId ?? null)
      toast({ type: 'info', title: 'Fresh start', message: 'All sets cleared and the clock restarted.' })
    } catch (err) {
      toast({ type: 'error', title: 'Couldn’t restart', message: err.message })
    }
  }

  const adjustRest = (d) => {
    setRestLeft((l) => Math.max(0, l + d))
    setRestTotal((t) => Math.max(t + d, 1))
  }

  if (loading && !data) return <LiveSkeleton />
  if (error && !data) return <ErrorState error={error} onRetry={reload} />
  if (!workout || exercises.length === 0) {
    return (
      <motion.div variants={stagger()} initial="initial" animate="animate">
        <motion.div variants={fadeUp} className="mb-6">
          <p className="label text-accent">Live workout</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Ready when you are</h1>
        </motion.div>
        <EmptyState
          icon={Dumbbell}
          title="No workout yet today"
          message="Pick one from the Library! Add a few exercises and they’ll show up here, ready to tick off."
          action={
            <button className="btn-primary" onClick={() => navigate('library')}>
              <Library className="h-4 w-4" /> Open Workout Library
            </button>
          }
        />
      </motion.div>
    )
  }

  const elapsed = complete
    ? workout.durationMinutes * 60
    : workout.startedAt
      ? Math.max(0, Math.floor((now - new Date(workout.startedAt).getTime()) / 1000))
      : 0
  const pct = totalSets ? doneCount / totalSets : 0
  const resting = restLeft > 0
  const currentEx = exercises.find((e) => e.workoutExerciseId === open) ?? exercises[0]
  const nextSetIdx = currentEx.sets.findIndex((s) => !isDone(s))

  return (
    <motion.div variants={stagger()} initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label flex items-center gap-2 text-accent">
            {complete ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
              </span>
            )}
            {complete ? 'Workout complete' : 'Live workout'}
          </p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{workout.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip bg-fg/5 !py-2 font-display !text-sm tabular-nums" title={complete ? 'Total duration' : 'Time since you started'}>
            <Timer className="h-4 w-4 text-cyan" /> {complete ? `${workout.durationMinutes} min` : fmt(elapsed)}
          </span>
          {!complete && (
            <>
              <button onClick={restart} className="btn-ghost !px-3 !py-2" aria-label="Restart workout" title="Restart">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={finishEarly} className="btn-ghost !py-2" disabled={finishing}>
                {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />} Finish
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Overall progress */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">{doneCount} of {totalSets} sets</span>
          <span className="font-semibold text-accent">{Math.round(pct * 100)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-fg/[0.07]">
          <motion.div
            className="h-full rounded-full bg-brand shadow-[0_0_16px_rgb(var(--lime)/.6)]"
            initial={false}
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Rest timer */}
        <motion.div variants={fadeUp} className="lg:sticky lg:top-6 lg:self-start">
          <div className="glass relative overflow-hidden p-6 sm:p-8">
            <div className={`pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-colors duration-700 ${resting ? 'bg-cyan/25' : 'bg-lime/20'}`} />
            <p className="label relative text-center">{resting ? (paused ? 'Paused' : 'Rest timer') : complete ? 'Done' : finishing ? 'Saving…' : 'Ready'}</p>

            <div className="relative mx-auto mt-4 w-fit">
              <ProgressRing live progress={resting ? restLeft / restTotal : 1} size={264} stroke={16} color={resting ? 'cyan' : 'lime'} className="max-w-full">
                <AnimatePresence mode="wait">
                  {resting ? (
                    <motion.div key="rest" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <p className="font-display text-6xl font-bold tabular-nums tracking-tight">{fmt(restLeft)}</p>
                      <p className="mt-1 text-sm text-muted">Breathe. Recover.</p>
                    </motion.div>
                  ) : (
                    <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="px-8">
                      {complete ? (
                        <>
                          <Trophy className="mx-auto h-14 w-14 text-amber-400 drop-shadow-[0_0_16px_rgb(251_191_36/.6)]" />
                          <p className="mt-2 text-sm text-muted">Saved · {workout.durationMinutes} min</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-muted">{nextSetIdx >= 0 ? `Set ${nextSetIdx + 1} of ${currentEx.sets.length}` : 'All sets done'}</p>
                          <p className="mt-1 font-display text-xl font-bold leading-tight">{currentEx.name}</p>
                          <p className="mt-2 font-display text-3xl font-bold text-accent">
                            × {currentEx.reps}
                          </p>
                          <p className="mt-1 text-xs text-muted">{currentEx.restSeconds}s rest after each set</p>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </ProgressRing>
            </div>

            <div className="relative mt-6 flex items-center justify-center gap-3">
              <button onClick={() => adjustRest(-15)} disabled={!resting} className="btn-ghost h-12 w-12 !rounded-full !p-0" aria-label="Subtract 15 seconds">
                <Minus className="h-4 w-4" />
              </button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() =>
                  resting ? setPaused((p) => !p) : (setRestTotal(currentEx.restSeconds), setRestLeft(currentEx.restSeconds), setPaused(false))
                }
                disabled={complete}
                className="btn-primary h-16 w-16 !rounded-full !p-0"
                aria-label={resting ? (paused ? 'Resume rest' : 'Pause rest') : `Start ${currentEx.restSeconds} second rest`}
              >
                {resting && !paused ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-0.5 h-6 w-6 fill-current" />}
              </motion.button>
              <button onClick={() => adjustRest(15)} disabled={!resting} className="btn-ghost h-12 w-12 !rounded-full !p-0" aria-label="Add 15 seconds">
                <Plus className="h-4 w-4" />
              </button>
              <button onClick={() => setRestLeft(0)} disabled={!resting} className="btn-ghost h-12 w-12 !rounded-full !p-0" aria-label="Skip rest">
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
            <p className="relative mt-4 text-center text-xs text-muted">
              {complete ? 'Nice work. See you next session!' : 'Tick a set and the rest timer starts automatically.'}
            </p>
          </div>
        </motion.div>

        {/* Exercise list */}
        <motion.div variants={fadeUp} className="space-y-3">
          {exercises.map((ex, idx) => {
            const setsDone = ex.sets.filter(isDone).length
            const allDone = setsDone === ex.sets.length
            const isOpen = open === ex.workoutExerciseId
            return (
              <motion.div
                key={ex.workoutExerciseId}
                layout
                className={`glass overflow-hidden !rounded-2xl transition-shadow ${isOpen ? 'shadow-glow ring-1 ring-lime/40' : ''}`}
              >
                <button onClick={() => setOpen(isOpen ? null : ex.workoutExerciseId)} className="flex w-full items-center gap-4 p-4 text-left" aria-expanded={isOpen}>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display font-bold transition-colors ${allDone ? 'bg-brand text-[#06080a]' : 'bg-fg/[0.06] text-muted'}`}>
                    {allDone ? <Check className="h-5 w-5" strokeWidth={3} /> : idx + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate font-semibold ${allDone ? 'text-muted line-through decoration-lime/60' : ''}`}>{ex.name}</span>
                    <span className="block text-xs text-muted">
                      {ex.sets.length} × {ex.reps} · {ex.muscleGroup} · {ex.restSeconds}s rest
                    </span>
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-muted">{setsDone}/{ex.sets.length}</span>
                  <ChevronDown className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div className="space-y-2 px-4 pb-4">
                        {ex.sets.map((set) => {
                          const checked = isDone(set)
                          return (
                            <motion.button
                              key={set.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleSet(ex, set)}
                              disabled={complete || finishing}
                              aria-pressed={checked}
                              aria-label={`Set ${set.setNumber} of ${ex.name}`}
                              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors ${
                                checked ? 'bg-lime/10' : 'bg-fg/[0.04] hover:bg-fg/[0.07]'
                              }`}
                            >
                              <span className="w-12 text-xs font-semibold uppercase tracking-wider text-muted">Set {set.setNumber}</span>
                              <span className={`flex-1 font-display font-semibold tabular-nums ${checked ? 'text-muted' : ''}`}>× {ex.reps}</span>
                              <motion.span
                                animate={checked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                                className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-colors ${
                                  checked ? 'border-transparent bg-brand text-[#06080a] shadow-glow' : 'border-line/20 text-transparent'
                                }`}
                              >
                                <Check className="h-4 w-4" strokeWidth={3} />
                              </motion.span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Completion modal — portaled so page-transition transforms don't trap position: fixed */}
      {createPortal(
        <AnimatePresence>
          {showModal && complete && (
            <motion.div className="fixed inset-0 z-50 grid place-items-center bg-bg/70 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                initial={{ scale: 0.8, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
                className="glass relative w-full max-w-md overflow-hidden p-8 text-center"
                role="dialog"
                aria-modal="true"
                aria-labelledby="done-title"
              >
                <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-400/30 blur-3xl" />
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3, stiffness: 200 }}
                  className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_40px_rgb(251_191_36/.55)]"
                >
                  <Trophy className="h-10 w-10 text-[#2a1a00]" />
                </motion.div>
                <h2 id="done-title" className="relative mt-6 text-3xl font-bold">Workout crushed!</h2>
                <p className="relative mt-2 text-muted">That’s how champions are built. It’s saved to your history 🔥</p>

                <div className="relative mt-6 grid grid-cols-3 gap-2">
                  {[
                    { icon: Timer, v: `${workout.durationMinutes}m`, l: 'Duration' },
                    { icon: Dumbbell, v: exercises.length, l: 'Exercises' },
                    { icon: Layers, v: doneCount, l: 'Sets' },
                  ].map(({ icon: Icon, v, l }) => (
                    <div key={l} className="rounded-2xl bg-fg/[0.05] p-3">
                      <Icon className="mx-auto h-4 w-4 text-accent" />
                      <p className="mt-1 font-display text-xl font-bold tabular-nums">{v}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted">{l}</p>
                    </div>
                  ))}
                </div>

                <div className="relative mt-6 flex flex-col gap-2 sm:flex-row">
                  <button className="btn-primary flex-1" onClick={() => navigate('dashboard')}>See my dashboard</button>
                  <button className="btn-ghost flex-1" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  )
}
