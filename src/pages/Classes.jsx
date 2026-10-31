import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flower2, Zap, Bike, Swords, Clock, User, Loader2, Check, CalendarX2, CalendarCheck, Ban, LayoutGrid } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import GlassCard from '../components/GlassCard'
import EmptyState from '../components/EmptyState'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { classTypes, classes, days } from '../data/mock'
import { stagger, fadeUp } from '../lib/motion'

const TYPE = {
  Yoga: { icon: Flower2, cls: 'text-violet bg-violet/15', bar: 'bg-violet' },
  HIIT: { icon: Zap, cls: 'text-accent bg-lime/15', bar: 'bg-lime' },
  Spin: { icon: Bike, cls: 'text-cyan bg-cyan/15', bar: 'bg-cyan' },
  Boxing: { icon: Swords, cls: 'text-danger bg-danger/15', bar: 'bg-danger' },
}

const INTENSITY = { Low: 1, Medium: 2, High: 3 }
const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()

function ClassCard({ c }) {
  const { bookings, book, cancel } = useApp()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const booked = bookings.includes(c.id)
  const spots = Math.max(0, c.spots - (booked ? 1 : 0))
  const full = c.spots === 0 && !booked
  const meta = TYPE[c.type]
  const fill = 1 - spots / c.capacity

  const onBook = () => {
    if (full) {
      toast({ type: 'error', title: `${c.name} is full`, message: 'Sorry! We’ll ping you the moment a spot opens up.' })
      return
    }
    if (booked) {
      cancel(c.id)
      toast({ type: 'info', title: 'Booking cancelled', message: `Your spot in ${c.name} is free for someone else.` })
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      book(c.id)
      toast({ title: 'You’re booked! 🎉', message: `${c.name} · ${days.find((d) => d.key === c.day)?.short} ${c.time} with ${c.coach}` })
    }, 650)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4 }}
      className={`glass relative flex flex-col gap-4 overflow-hidden p-5 lg:flex-row lg:items-center ${booked ? 'ring-1 ring-lime/40' : ''}`}
    >
      {booked && <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-lime/[0.07] to-transparent" />}

      <div className="relative flex items-center gap-4 lg:w-28 lg:flex-col lg:items-start lg:gap-1">
        <p className="font-display text-2xl font-bold tabular-nums">{c.time}</p>
        <p className="flex items-center gap-1 text-xs text-muted"><Clock className="h-3.5 w-3.5" /> {c.duration} min</p>
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`chip border-0 font-semibold ${meta.cls}`}>
            <meta.icon className="h-3.5 w-3.5" /> {c.type}
          </span>
          <span className="flex items-center gap-0.5" title={`${c.intensity} intensity`} aria-label={`${c.intensity} intensity`}>
            {[1, 2, 3].map((n) => (
              <Zap key={n} className={`h-3.5 w-3.5 ${n <= INTENSITY[c.intensity] ? 'fill-amber-400 text-amber-400' : 'text-muted opacity-30'}`} />
            ))}
          </span>
        </div>
        <h3 className="mt-2 truncate text-lg font-semibold">{c.name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted"><User className="h-3.5 w-3.5" /> {c.coach}</p>

        <div className="mt-3 max-w-xs">
          <div className="h-1.5 overflow-hidden rounded-full bg-fg/[0.07]">
            <motion.div
              className={`h-full rounded-full ${spots <= 3 ? 'bg-amber-400' : meta.bar}`}
              initial={{ width: 0 }}
              animate={{ width: `${fill * 100}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className={`mt-1.5 text-xs font-medium ${spots === 0 ? 'text-danger' : spots <= 3 ? 'text-amber-500' : 'text-muted'}`}>
            {spots === 0 ? (booked ? 'Full — you got the last spot!' : 'Class full') : spots <= 3 ? `Only ${spots} spot${spots > 1 ? 's' : ''} left!` : `${spots} of ${c.capacity} spots left`}
          </p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onBook}
        disabled={loading}
        className={`relative lg:w-36 ${
          booked ? 'btn bg-lime/15 text-accent hover:bg-danger/15 hover:text-danger group' : full ? 'btn-ghost text-muted' : 'btn-primary'
        }`}
        aria-label={booked ? `Cancel booking for ${c.name}` : full ? `${c.name} is full` : `Book ${c.name}`}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</>
        ) : booked ? (
          <>
            <span className="flex items-center gap-2 group-hover:hidden"><Check className="h-4 w-4" strokeWidth={3} /> Booked</span>
            <span className="hidden items-center gap-2 group-hover:flex"><Ban className="h-4 w-4" /> Cancel</span>
          </>
        ) : full ? (
          <><Ban className="h-4 w-4" /> Full</>
        ) : (
          'Book'
        )}
      </motion.button>
    </motion.div>
  )
}

export default function Classes() {
  const { bookings } = useApp()
  const [day, setDay] = useState(days.some((d) => d.key === todayKey) ? todayKey : 'mon')
  const [type, setType] = useState('All')

  const list = classes
    .filter((c) => c.day === day && (type === 'All' || c.type === type))
    .sort((a, b) => a.time.localeCompare(b.time))
  const myClasses = classes.filter((c) => bookings.includes(c.id))

  return (
    <motion.div variants={stagger()} initial="initial" animate="animate">
      <PageHeader
        eyebrow="Class booking"
        title="Sweat with the squad"
        subtitle="Yoga, HIIT, Spin and Boxing all week. Book in one tap, cancel anytime."
        action={<span className="chip bg-cyan/10 font-semibold text-cyan"><CalendarCheck className="h-3.5 w-3.5" /> {bookings.length} booked</span>}
      />

      {/* Day strip */}
      <motion.div variants={fadeUp} className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {days.map((d) => {
          const active = d.key === day
          const count = classes.filter((c) => c.day === d.key).length
          const hasBooking = classes.some((c) => c.day === d.key && bookings.includes(c.id))
          return (
            <button
              key={d.key}
              onClick={() => setDay(d.key)}
              className={`relative flex min-w-[64px] flex-1 flex-col items-center rounded-2xl px-3 py-3 transition ${active ? 'text-[#06080a]' : 'glass !rounded-2xl text-fg hover:-translate-y-0.5'}`}
              aria-pressed={active}
            >
              {active && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-2xl bg-brand shadow-glow" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <span className={`relative text-xs font-medium ${active ? '' : 'text-muted'}`}>{d.key === todayKey ? 'Today' : d.short}</span>
              <span className="relative font-display text-2xl font-bold">{d.date}</span>
              <span className="relative mt-1 flex items-center gap-1">
                {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                  <span key={i} className={`h-1 w-1 rounded-full ${active ? 'bg-black/50' : 'bg-muted/60'}`} />
                ))}
              </span>
              {hasBooking && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan ring-2 ring-bg" />}
            </button>
          )
        })}
      </motion.div>

      {/* Type filter */}
      <motion.div variants={fadeUp} className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {['All', ...classTypes].map((t) => {
          const Icon = t === 'All' ? LayoutGrid : TYPE[t].icon
          const active = type === t
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              aria-pressed={active}
              className={`chip !px-4 !py-2 !text-sm ${active ? 'border-transparent bg-fg text-bg' : 'text-muted hover:text-fg'}`}
            >
              <Icon className="h-4 w-4" /> {t}
            </button>
          )
        })}
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <motion.div variants={fadeUp} className="space-y-3">
          {list.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              title={`No ${type === 'All' ? '' : type + ' '}classes this day`}
              message="Rest days build muscle too. Try another day or switch the class type."
              action={<button className="btn-ghost" onClick={() => setType('All')}>Show all classes</button>}
            />
          ) : (
            <AnimatePresence>
              {list.map((c) => <ClassCard key={c.id} c={c} />)}
            </AnimatePresence>
          )}
        </motion.div>

        <GlassCard className="self-start xl:sticky xl:top-6">
          <p className="label">Your week</p>
          <h3 className="mt-1 text-xl font-semibold">My bookings</h3>
          <div className="mt-4">
            {myClasses.length === 0 ? (
              <EmptyState icon={CalendarX2} title="Nothing booked yet" message="Your booked classes show up here. Pick one and lock in your spot!" />
            ) : (
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {myClasses.map((c) => {
                    const M = TYPE[c.type]
                    return (
                      <motion.li
                        key={c.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 rounded-2xl bg-fg/[0.04] p-3"
                      >
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${M.cls}`}>
                          <M.icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.name}</p>
                          <p className="text-xs text-muted">{days.find((d) => d.key === c.day)?.short} {days.find((d) => d.key === c.day)?.date} · {c.time}</p>
                        </div>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  )
}
