import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, Dumbbell, Footprints, BicepsFlexed, Shield, HeartPulse, PersonStanding, Plus, Check, Timer, SearchX, X, LayoutGrid, Loader2, Play, PartyPopper,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { Skeleton, SkeletonCard, LoadingLabel } from '../components/Skeleton'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { stagger, fadeUp } from '../lib/motion'

const GROUP_META = {
  Chest: { icon: Shield, tint: 'from-lime/25 to-lime/0', text: 'text-accent' },
  Back: { icon: PersonStanding, tint: 'from-cyan/25 to-cyan/0', text: 'text-cyan' },
  Legs: { icon: Footprints, tint: 'from-violet/25 to-violet/0', text: 'text-violet' },
  Arms: { icon: BicepsFlexed, tint: 'from-amber-400/25 to-amber-400/0', text: 'text-amber-500' },
  Core: { icon: Dumbbell, tint: 'from-rose-400/25 to-rose-400/0', text: 'text-danger' },
  Cardio: { icon: HeartPulse, tint: 'from-sky-400/25 to-sky-400/0', text: 'text-sky-500' },
}

const DIFF = {
  Beginner: { level: 1, cls: 'bg-lime/15 text-accent' },
  Intermediate: { level: 2, cls: 'bg-cyan/15 text-cyan' },
  Advanced: { level: 3, cls: 'bg-violet/15 text-violet' },
}

const fmtRest = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`)

function ExerciseCard({ ex, added, pending, locked, onToggle }) {
  const meta = GROUP_META[ex.muscleGroup]
  const Icon = meta.icon
  const diff = DIFF[ex.difficulty]
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -5 }}
      className={`glass group relative flex flex-col overflow-hidden p-5 ${added ? 'ring-1 ring-lime/40' : ''}`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${meta.tint}`} />
      <div className="relative flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-surface/80 ring-1 ring-line/10 ${meta.text}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className={`chip border-0 font-semibold ${diff.cls}`}>
          <span className="flex gap-0.5">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`h-2.5 w-1 rounded-full ${n <= diff.level ? 'bg-current' : 'bg-current opacity-25'}`} />
            ))}
          </span>
          {ex.difficulty}
        </span>
      </div>

      <h3 className="relative mt-4 text-lg font-semibold leading-tight">{ex.name}</h3>
      <p className="relative mt-0.5 text-xs text-muted">{ex.muscleGroup}</p>
      <p className="relative mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-muted">{ex.description}</p>

      <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-fg/[0.04] p-3 text-center">
        <div>
          <p className="font-display text-xl font-bold">{ex.sets}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted">Sets</p>
        </div>
        <div className="border-x border-line/10">
          <p className="truncate font-display text-xl font-bold" title={ex.reps}>{ex.reps}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted">Reps</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-0.5 font-display text-xl font-bold">
            <Timer className="h-3.5 w-3.5 text-cyan" />{fmtRest(ex.restSeconds)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted">Rest</p>
        </div>
      </div>

      <button
        onClick={() => onToggle(ex)}
        disabled={pending || locked}
        className={`relative mt-4 w-full ${
          locked
            ? `btn cursor-default disabled:opacity-100 ${added ? 'bg-lime/15 text-accent' : 'bg-fg/[0.04] text-muted'}`
            : added
              ? 'btn bg-lime/15 text-accent hover:bg-danger/10 hover:text-danger group/btn'
              : 'btn-ghost'
        }`}
        aria-pressed={added}
        aria-label={added ? `Remove ${ex.name} from today's workout` : `Add ${ex.name} to today's workout`}
      >
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : added && locked ? (
          <><Check className="h-4 w-4" /> Done today</>
        ) : added ? (
          <>
            <span className="flex items-center gap-2 group-hover/btn:hidden"><Check className="h-4 w-4" /> In today’s workout</span>
            <span className="hidden items-center gap-2 group-hover/btn:flex"><X className="h-4 w-4" /> Remove</span>
          </>
        ) : locked ? (
          'Today’s workout is done'
        ) : (
          <><Plus className="h-4 w-4" /> Add to today’s workout</>
        )}
      </button>
    </motion.article>
  )
}

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <LoadingLabel>Loading exercises…</LoadingLabel>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} className="h-[330px]">
          <div className="flex justify-between">
            <Skeleton className="h-11 w-11 !rounded-2xl" />
            <Skeleton className="h-6 w-24 !rounded-full" />
          </div>
          <Skeleton className="mt-5 h-5 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/3" />
          <Skeleton className="mt-4 h-10 w-full" />
          <Skeleton className="mt-4 h-16 w-full !rounded-2xl" />
          <Skeleton className="mt-4 h-11 w-full !rounded-2xl" />
        </SkeletonCard>
      ))}
    </div>
  )
}

export default function Library() {
  const toast = useToast()
  const { navigate } = useApp()
  const lib = useApi('/exercises')
  const today = useApi('/workouts')
  const [group, setGroup] = useState('All')
  const [query, setQuery] = useState('')
  const [optimistic, setOptimistic] = useState({}) // exerciseId → true/false while saving
  const [pending, setPending] = useState({})

  const exercises = lib.data?.exercises ?? []
  const groups = ['All', ...(lib.data?.muscleGroups ?? [])]
  const workout = today.data?.workout
  const locked = workout?.status === 'completed'
  const savedIds = useMemo(() => new Set(workout?.exercises.map((e) => e.exerciseId) ?? []), [workout])
  const isAdded = (id) => (id in optimistic ? optimistic[id] : savedIds.has(id))
  const addedCount = exercises.filter((e) => isAdded(e.id)).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exercises.filter(
      (e) => (group === 'All' || e.muscleGroup === group) && (!q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
    )
  }, [exercises, group, query])

  const toggle = async (ex) => {
    const adding = !isAdded(ex.id)
    // Optimistic: flip the button immediately, roll back if the server says no
    setOptimistic((o) => ({ ...o, [ex.id]: adding }))
    setPending((p) => ({ ...p, [ex.id]: true }))
    try {
      const res = await api('/workouts', { method: 'POST', body: { action: adding ? 'add' : 'remove', exerciseId: ex.id } })
      today.setData({ workout: res.workout })
      toast(
        adding
          ? { title: 'Added to today’s workout 💪', message: `${ex.name} · ${ex.sets} × ${ex.reps}` }
          : { type: 'info', title: 'Removed from today’s workout', message: ex.name }
      )
    } catch (err) {
      toast({ type: 'error', title: adding ? 'Couldn’t add that exercise' : 'Couldn’t remove that exercise', message: err.message })
    } finally {
      setOptimistic(({ [ex.id]: _, ...rest }) => rest)
      setPending(({ [ex.id]: _, ...rest }) => rest)
    }
  }

  const reset = () => {
    setGroup('All')
    setQuery('')
  }

  const loading = (lib.loading && !lib.data) || (today.loading && !today.data)
  const error = lib.error ?? today.error

  return (
    <motion.div variants={stagger()} initial="initial" animate="animate">
      <PageHeader
        eyebrow="Workout library"
        title="Find your next move"
        subtitle={
          exercises.length
            ? `${exercises.length} coach-approved exercises. Filter by muscle group and build today’s workout.`
            : 'Coach-approved exercises. Filter by muscle group and build today’s workout.'
        }
        action={
          addedCount > 0 && !locked ? (
            <div className="flex items-center gap-2">
              <span className="chip bg-lime/10 font-semibold text-accent">{addedCount} in today’s workout</span>
              <button className="btn-primary !py-2.5" onClick={() => navigate('workout')}>
                <Play className="h-4 w-4 fill-current" /> Start
              </button>
            </div>
          ) : null
        }
      />

      {locked && (
        <motion.div variants={fadeUp} className="glass mb-6 flex items-center gap-3 !rounded-2xl p-4">
          <PartyPopper className="h-5 w-5 shrink-0 text-accent" />
          <p className="text-sm">
            <span className="font-semibold">Today’s workout is done — great job!</span>{' '}
            <span className="text-muted">Come back tomorrow to plan your next session.</span>
          </p>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="sticky top-[64px] z-20 -mx-4 mb-6 space-y-3 bg-bg/70 px-4 py-3 backdrop-blur-xl md:top-0 md:mx-0 md:rounded-2xl md:px-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="input !pl-11 !pr-10"
            aria-label="Search exercises"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-muted hover:text-fg" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="Muscle group">
          {(groups.length > 1 ? groups : ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']).map((g) => {
            const active = group === g
            const count = g === 'All' ? exercises.length : exercises.filter((e) => e.muscleGroup === g).length
            const Icon = g === 'All' ? LayoutGrid : GROUP_META[g].icon
            return (
              <button
                key={g}
                role="tab"
                aria-selected={active}
                onClick={() => setGroup(g)}
                className={`chip relative !px-4 !py-2 !text-sm ${active ? 'border-transparent text-[#06080a]' : 'text-muted hover:text-fg'}`}
              >
                {active && <motion.span layoutId="group-pill" className="absolute inset-0 rounded-full bg-brand shadow-glow" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{g}</span>
                {exercises.length > 0 && <span className={`relative text-xs ${active ? 'opacity-70' : 'opacity-60'}`}>{count}</span>}
              </button>
            )
          })}
        </div>
      </motion.div>

      {loading ? (
        <LibrarySkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={() => { lib.reload(); today.reload() }} />
      ) : exercises.length === 0 ? (
        <EmptyState icon={Dumbbell} title="The library is empty" message="No exercises in the database yet. Run “npm run db:setup” to load the starter set." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No exercises match that"
          message={`We couldn’t find “${query}” in ${group === 'All' ? 'any group' : group}. Try another word or clear the filters.`}
          action={<button className="btn-primary" onClick={reset}>Clear filters</button>}
        />
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filtered.map((ex) => (
              <ExerciseCard key={ex.id} ex={ex} added={isAdded(ex.id)} pending={!!pending[ex.id]} locked={locked} onToggle={toggle} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
