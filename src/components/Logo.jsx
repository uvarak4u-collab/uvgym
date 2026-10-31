import { useId } from 'react'
import { motion } from 'framer-motion'

export function PulseMark({ className = 'h-9 w-9' }) {
  const id = 'pulse' + useId().replace(/:/g, '')
  return (
    <span className={`relative isolate grid place-items-center rounded-xl bg-[#0B0E12] ring-1 ring-white/10 ${className}`}>
      <span className="absolute inset-0 -z-10 rounded-xl bg-brand opacity-40 blur-md" />
      <svg viewBox="0 0 64 64" className="h-[72%] w-[72%]" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#C6FF3D" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <motion.path
          d="M2 34h15l6-14 9 28 7-18 4 8h19"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
    </span>
  )
}

export default function Logo({ size = 'md', onClick }) {
  const text = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-xl'
  return (
    <button onClick={onClick} className="group flex min-h-10 items-center gap-2.5" aria-label="UV Gym home">
      <PulseMark className={size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'} />
      <span className={`font-display font-bold tracking-tight ${text}`}>
        <span className="text-gradient animate-shimmer">UV</span>
        <span className="text-fg"> Gym</span>
      </span>
    </button>
  )
}
