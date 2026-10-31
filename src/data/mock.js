// Mock data for the screens that are not connected to the database yet
// (Progress, Class Booking, Profile extras) and the decorative landing-page preview.
// Landing stats, Dashboard, Workout Library and Live Workout read real data from /api.

export const user = {
  name: 'Alex Rivera',
  firstName: 'Alex',
  initials: 'AR',
  handle: '@alexlifts',
  membership: 'Elite',
  memberSince: 'March 2024',
  homeGym: 'UV Gym — Downtown',
  streak: 12,
  bestStreak: 21,
  level: 18,
  xp: 7420,
  xpNext: 9000,
  totals: { workouts: 214, hours: 186, classes: 47, prs: 23 },
}

// Illustration only: the product preview card in the landing-page hero
export const heroPreview = {
  id: 'push-power',
  name: 'Push Power',
  focus: 'Chest · Shoulders · Triceps',
  duration: 48,
  kcal: 420,
  difficulty: 'Intermediate',
  exercises: [
    { id: 'bench', name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 80, rest: 90 },
    { id: 'incline-db', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 28, rest: 75 },
    { id: 'ohp', name: 'Overhead Press', sets: 3, reps: 8, weight: 45, rest: 90 },
    { id: 'lateral', name: 'Cable Lateral Raise', sets: 3, reps: 15, weight: 8, rest: 45 },
    { id: 'dips', name: 'Weighted Dips', sets: 3, reps: 10, weight: 10, rest: 60 },
  ],
}


// Estimated 1RM in kg, weekly
export const strengthHistory = [
  { week: 'Jul 7', bench: 82, squat: 112, deadlift: 140 },
  { week: 'Jul 14', bench: 83, squat: 115, deadlift: 142 },
  { week: 'Jul 21', bench: 85, squat: 117, deadlift: 145 },
  { week: 'Jul 28', bench: 84, squat: 118, deadlift: 147 },
  { week: 'Aug 4', bench: 87, squat: 121, deadlift: 150 },
  { week: 'Aug 11', bench: 88, squat: 123, deadlift: 152 },
  { week: 'Aug 18', bench: 88, squat: 126, deadlift: 155 },
  { week: 'Aug 25', bench: 90, squat: 128, deadlift: 157 },
  { week: 'Sep 1', bench: 91, squat: 131, deadlift: 160 },
  { week: 'Sep 8', bench: 93, squat: 132, deadlift: 162 },
  { week: 'Sep 15', bench: 94, squat: 135, deadlift: 166 },
  { week: 'Sep 22', bench: 95, squat: 137, deadlift: 168 },
  { week: 'Sep 29', bench: 97, squat: 140, deadlift: 171 },
  { week: 'Oct 6', bench: 98, squat: 142, deadlift: 175 },
  { week: 'Oct 13', bench: 100, squat: 145, deadlift: 178 },
]

export const personalRecords = [
  { lift: 'Deadlift', value: 180, unit: 'kg', date: 'Oct 14, 2026', delta: '+5 kg', tier: 'gold' },
  { lift: 'Back Squat', value: 145, unit: 'kg', date: 'Oct 11, 2026', delta: '+2.5 kg', tier: 'gold' },
  { lift: 'Bench Press', value: 100, unit: 'kg', date: 'Oct 13, 2026', delta: '+2 kg', tier: 'gold' },
  { lift: 'Overhead Press', value: 62.5, unit: 'kg', date: 'Sep 30, 2026', delta: '+2.5 kg', tier: 'silver' },
  { lift: 'Pull-Ups', value: 18, unit: 'reps', date: 'Sep 24, 2026', delta: '+2 reps', tier: 'silver' },
  { lift: '5K Row', value: '19:42', unit: '', date: 'Aug 29, 2026', delta: '−0:38', tier: 'bronze' },
]

export const classTypes = ['Yoga', 'HIIT', 'Spin', 'Boxing']

// The current Mon–Sun week, so "Today" always lines up with the real date
export const days = (() => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((key, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { key, short: key[0].toUpperCase() + key.slice(1), date: d.getDate() }
  })
})()

const C = (id, day, type, name, time, duration, coach, spots, capacity, intensity) => ({
  id, day, type, name, time, duration, coach, spots, capacity, intensity,
})

export const classes = [
  C('c1', 'mon', 'Yoga', 'Sunrise Flow', '06:30', 45, 'Maya Chen', 6, 20, 'Low'),
  C('c2', 'mon', 'HIIT', 'Metcon Blast', '12:15', 30, 'Jordan Blake', 3, 16, 'High'),
  C('c3', 'mon', 'Spin', 'Climb & Sprint', '18:00', 45, 'Sam Ortiz', 11, 24, 'Medium'),
  C('c4', 'mon', 'Boxing', 'Fight Club Basics', '19:30', 60, 'Dre Walker', 0, 14, 'High'),
  C('c5', 'tue', 'Spin', 'Rhythm Ride', '07:00', 45, 'Sam Ortiz', 8, 24, 'Medium'),
  C('c6', 'tue', 'Boxing', 'Heavy Bag Rounds', '17:30', 50, 'Dre Walker', 5, 14, 'High'),
  C('c7', 'tue', 'Yoga', 'Mobility Reset', '20:00', 40, 'Maya Chen', 14, 20, 'Low'),
  C('c8', 'wed', 'HIIT', 'Tabata Inferno', '06:45', 30, 'Jordan Blake', 2, 16, 'High'),
  C('c9', 'wed', 'Yoga', 'Power Vinyasa', '12:00', 60, 'Priya Nair', 9, 20, 'Medium'),
  C('c10', 'wed', 'Spin', 'Hill Repeats', '18:30', 45, 'Lena Fox', 0, 24, 'High'),
  C('c11', 'thu', 'Boxing', 'Pad Work & Footwork', '07:00', 50, 'Dre Walker', 7, 14, 'Medium'),
  C('c12', 'thu', 'HIIT', 'EMOM Engine', '18:00', 40, 'Jordan Blake', 6, 16, 'High'),
  C('c13', 'thu', 'Yoga', 'Yin & Breath', '20:15', 50, 'Priya Nair', 12, 20, 'Low'),
  C('c14', 'fri', 'Spin', 'Friday Night Ride', '18:00', 45, 'Lena Fox', 4, 24, 'High'),
  C('c15', 'fri', 'HIIT', 'Partner WOD', '07:00', 45, 'Jordan Blake', 10, 16, 'Medium'),
  C('c16', 'sat', 'Boxing', 'Saturday Sparring Prep', '10:00', 60, 'Dre Walker', 1, 14, 'High'),
  C('c17', 'sat', 'Yoga', 'Weekend Slow Flow', '09:00', 60, 'Maya Chen', 15, 20, 'Low'),
  C('c18', 'sat', 'Spin', 'Endurance 60', '11:30', 60, 'Sam Ortiz', 9, 24, 'Medium'),
  C('c19', 'sun', 'Yoga', 'Recovery Stretch', '10:00', 45, 'Priya Nair', 18, 20, 'Low'),
]

export const achievements = [
  { id: 'a1', name: 'First Rep', desc: 'Complete your first workout', icon: 'Zap', unlocked: true },
  { id: 'a2', name: 'On Fire', desc: '7-day workout streak', icon: 'Flame', unlocked: true },
  { id: 'a3', name: 'Century Club', desc: '100 workouts logged', icon: 'Medal', unlocked: true },
  { id: 'a4', name: 'Iron Will', desc: 'Deadlift 1.5× bodyweight', icon: 'Dumbbell', unlocked: true },
  { id: 'a5', name: 'Early Bird', desc: '10 workouts before 7am', icon: 'Sunrise', unlocked: true },
  { id: 'a6', name: 'Class Act', desc: 'Attend 25 group classes', icon: 'Users', unlocked: true },
  { id: 'a7', name: 'Unstoppable', desc: '30-day workout streak', icon: 'Rocket', unlocked: false, progress: 12, goal: 30 },
  { id: 'a8', name: 'Two Plates', desc: 'Bench press 100 kg', icon: 'Trophy', unlocked: true },
  { id: 'a9', name: 'Marathoner', desc: 'Row 42 km in a month', icon: 'Timer', unlocked: false, progress: 28, goal: 42 },
]

export const quotes = [
  { text: 'The only bad workout is the one that didn’t happen.', author: 'Unknown' },
  { text: 'Strength doesn’t come from what you can do. It comes from overcoming the things you once thought you couldn’t.', author: 'Rikki Rogers' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln (attrib.)' },
  { text: 'Success isn’t always about greatness. It’s about consistency.', author: 'Dwayne Johnson' },
  { text: 'Take care of your body. It’s the only place you have to live.', author: 'Jim Rohn' },
  { text: 'You don’t have to be extreme, just consistent.', author: 'Unknown' },
  { text: 'Sweat is just fat crying.', author: 'Gym wisdom' },
]

export const quoteOfTheDay = () => {
  const d = new Date()
  const dayIndex = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)
  return quotes[dayIndex % quotes.length]
}
