import confetti from 'canvas-confetti'

const COLORS = ['#C6FF3D', '#22D3EE', '#A78BFA', '#FFFFFF', '#FDE047']

export function celebrate() {
  const end = Date.now() + 2200
  confetti({ particleCount: 140, spread: 90, startVelocity: 45, origin: { y: 0.6 }, colors: COLORS, scalar: 1.1 })
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: COLORS })
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: COLORS })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 120, startVelocity: 30, origin: { y: 0.3 }, colors: COLORS, shapes: ['star'], scalar: 1.3 })
  }, 700)
}
