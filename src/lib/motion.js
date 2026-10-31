export const ease = [0.22, 1, 0.36, 1]

export const page = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease } },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.2 } },
}

export const stagger = (delay = 0.06) => ({
  initial: {},
  animate: { transition: { staggerChildren: delay, delayChildren: 0.05 } },
})

export const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}

export const hoverLift = { y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }
