import { useId } from 'react'
import { motion } from 'framer-motion'

const COLORS = {
  lime: ['--lime', '--cyan'],
  cyan: ['--cyan', '--cyan'],
  violet: ['--violet', '--violet'],
  danger: ['--danger', '--danger'],
}

/**
 * Circular progress ring that fills up when it enters the viewport.
 * `progress` is 0..1. Pass `animateOnMount={false}` + changing progress for live timers.
 */
export default function ProgressRing({ progress, size = 120, stroke = 10, color = 'lime', children, live = false, className = '' }) {
  const id = 'ring' + useId().replace(/:/g, '')
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const p = Math.max(0, Math.min(1, progress))
  const [a, b] = COLORS[color] ?? COLORS.lime

  return (
    <div className={`relative grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: `rgb(var(${a}))` }} />
            <stop offset="1" style={{ stopColor: `rgb(var(${b}))` }} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: 'rgb(var(--line) / 0.08)' }} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={live ? false : { strokeDashoffset: c }}
          whileInView={live ? undefined : { strokeDashoffset: c * (1 - p) }}
          animate={live ? { strokeDashoffset: c * (1 - p) } : undefined}
          viewport={{ once: true }}
          transition={live ? { duration: 0.95, ease: 'linear' } : { duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 6px rgb(var(${a}) / 0.55))` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
