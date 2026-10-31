import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'

export default function AnimatedCounter({ value, duration = 1.6, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView || !ref.current) return
    const node = ref.current
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = prefix + v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
      },
    })
    return () => controls.stop()
  }, [inView, value, duration, decimals, prefix, suffix])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}0{suffix}
    </span>
  )
}
