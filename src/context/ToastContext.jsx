import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const STYLES = {
  success: { Icon: CheckCircle2, ring: 'text-accent', bar: 'bg-lime' },
  error: { Icon: AlertTriangle, ring: 'text-danger', bar: 'bg-danger' },
  info: { Icon: Info, ring: 'text-cyan', bar: 'bg-cyan' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    ({ title, message, type = 'success', duration = 3200 }) => {
      const id = ++idRef.current
      setToasts((t) => [...t.slice(-2), { id, title, message, type, duration }])
      setTimeout(() => dismiss(id), duration)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] md:items-end md:pr-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { Icon, ring, bar } = STYLES[t.type] ?? STYLES.info
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="glass pointer-events-auto relative w-full max-w-sm overflow-hidden !rounded-2xl p-4 pr-10"
                role="status"
              >
                <div className="flex gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ring}`} />
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold">{t.title}</p>
                    {t.message && <p className="mt-0.5 text-sm text-muted">{t.message}</p>}
                  </div>
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-fg/5 hover:text-fg"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
                <motion.span
                  className={`absolute bottom-0 left-0 h-0.5 ${bar}`}
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: t.duration / 1000, ease: 'linear' }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
