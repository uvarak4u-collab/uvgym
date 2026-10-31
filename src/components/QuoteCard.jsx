import { Quote } from 'lucide-react'
import GlassCard from './GlassCard'
import { quoteOfTheDay } from '../data/mock'

export default function QuoteCard({ className = '' }) {
  const q = quoteOfTheDay()
  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      <Quote className="absolute -right-2 -top-2 h-24 w-24 rotate-180 text-accent opacity-[0.07]" />
      <p className="label mb-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_10px_rgb(var(--lime))]" />
        Quote of the day
      </p>
      <blockquote className="font-display text-lg font-medium leading-snug sm:text-xl">“{q.text}”</blockquote>
      <p className="mt-3 text-sm text-muted">— {q.author}</p>
    </GlassCard>
  )
}
