import { motion } from 'framer-motion'
import { fadeUp } from '../lib/motion'

export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <motion.header variants={fadeUp} className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div>
        {eyebrow && <p className="label mb-2 text-accent">{eyebrow}</p>}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </motion.header>
  )
}
