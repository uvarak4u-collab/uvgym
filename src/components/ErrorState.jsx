import { motion } from 'framer-motion'
import { DatabaseZap, RotateCcw, WifiOff, AlertTriangle } from 'lucide-react'

/** Friendly full-card error with a retry button. Knows about "database unreachable". */
export default function ErrorState({ error, onRetry, compact = false }) {
  const dbDown = error?.isDbDown
  const Icon = error?.code === 'SERVER_UNREACHABLE' ? WifiOff : dbDown ? DatabaseZap : AlertTriangle
  const title =
    error?.code === 'SERVER_UNREACHABLE'
      ? 'Can’t reach the server'
      : error?.code === 'DB_NOT_READY'
        ? 'Database not set up yet'
        : dbDown
          ? 'Database is taking a breather'
          : 'Something went wrong'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass flex flex-col items-center text-center ${compact ? 'p-6' : 'px-6 py-12'}`}
      role="alert"
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-danger/30 blur-xl" />
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-danger/15">
          <Icon className="h-6 w-6 text-danger" />
        </div>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{error?.message ?? 'Please try again in a moment.'}</p>
      {onRetry && (
        <button className="btn-ghost mt-5" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      )}
    </motion.div>
  )
}
