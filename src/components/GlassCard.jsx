import { motion } from 'framer-motion'
import { fadeUp, hoverLift } from '../lib/motion'

export default function GlassCard({ children, className = '', hover = false, glow = false, as = 'div', ...rest }) {
  const Comp = motion[as] ?? motion.div
  return (
    <Comp
      variants={fadeUp}
      whileHover={hover ? hoverLift : undefined}
      className={`glass relative p-5 sm:p-6 ${glow ? 'shadow-glow' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Comp>
  )
}
