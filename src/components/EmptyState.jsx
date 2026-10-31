import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center"
      style={{ border: '1.5px dashed rgb(var(--line) / 0.14)' }}
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-brand opacity-30 blur-xl" />
        <div className="glass relative grid h-14 w-14 place-items-center !rounded-2xl">
          <Icon className="h-6 w-6 text-accent" />
        </div>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
