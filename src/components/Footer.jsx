import { Heart } from 'lucide-react'
import { PulseMark } from './Logo'

export default function Footer({ className = '' }) {
  return (
    <footer className={`mt-16 border-t border-line/10 py-8 text-sm text-muted ${className}`}>
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <PulseMark className="h-7 w-7" />
          <span className="font-display font-semibold text-fg">UV Gym</span>
          <span className="hidden sm:inline">· Train smarter. Get stronger.</span>
        </div>
        <p className="flex items-center gap-1.5">
          © {new Date().getFullYear()} UV Gym. Built with <Heart className="h-3.5 w-3.5 fill-danger text-danger" /> for lifters.
        </p>
      </div>
    </footer>
  )
}
