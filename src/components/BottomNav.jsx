import { motion } from 'framer-motion'
import { NAV } from './nav'
import { useApp } from '../context/AppContext'

const ITEMS = ['dashboard', 'library', 'workout', 'progress', 'classes'].map((k) => NAV.find((n) => n.key === k))

export default function BottomNav() {
  const { page, navigate } = useApp()
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+10px)] md:hidden"
    >
      <div className="glass mx-auto flex max-w-md items-end justify-between !rounded-[26px] px-2 py-2">
        {ITEMS.map(({ key, short, icon: Icon }) => {
          const active = page === key
          if (key === 'workout') {
            return (
              <button
                key={key}
                onClick={() => navigate(key)}
                aria-label="Live workout"
                aria-current={active ? 'page' : undefined}
                className="relative -mt-7 flex flex-col items-center gap-1"
              >
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-[#06080a] shadow-glow ring-4 ring-bg"
                >
                  <Icon className="h-6 w-6" />
                </motion.span>
                <span className={`text-[10px] font-semibold ${active ? 'text-accent' : 'text-muted'}`}>{short}</span>
              </button>
            )
          }
          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex w-14 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors ${
                active ? 'text-accent' : 'text-muted'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="bottom-pill"
                  className="absolute inset-0 rounded-2xl bg-lime/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <Icon className="relative h-5 w-5" />
              <span className="relative text-[10px] font-semibold">{short}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
