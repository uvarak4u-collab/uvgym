import { LayoutDashboard, Dumbbell, Timer, TrendingUp, CalendarDays, UserRound } from 'lucide-react'

export const NAV = [
  { key: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { key: 'library', label: 'Workout Library', short: 'Library', icon: Dumbbell },
  { key: 'workout', label: 'Live Workout', short: 'Train', icon: Timer },
  { key: 'progress', label: 'Progress', short: 'Progress', icon: TrendingUp },
  { key: 'classes', label: 'Class Booking', short: 'Classes', icon: CalendarDays },
  { key: 'profile', label: 'Profile', short: 'Profile', icon: UserRound },
]
