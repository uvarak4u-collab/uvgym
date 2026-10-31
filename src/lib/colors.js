// Chart series colors, validated for CVD separation + contrast against each theme's surface.
// Identity is never color-alone: charts also ship a legend and direct end labels.
export const SERIES = {
  dark: { bench: '#73A512', squat: '#0EA2BD', deadlift: '#8F6EF2' },
  light: { bench: '#65A30D', squat: '#0891B2', deadlift: '#7C3AED' },
}

export const chartChrome = (theme) =>
  theme === 'dark'
    ? { grid: 'rgba(255,255,255,0.06)', axis: '#8B96A5', cursor: 'rgba(255,255,255,0.18)', surface: '#14181F' }
    : { grid: 'rgba(15,23,42,0.07)', axis: '#545E6C', cursor: 'rgba(15,23,42,0.2)', surface: '#FFFFFF' }

export const tone = {
  lime: 'rgb(var(--lime))',
  cyan: 'rgb(var(--cyan))',
  violet: 'rgb(var(--violet))',
}
