import { useState } from 'react'
import { motion } from 'framer-motion'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Trophy, TrendingUp, Medal, Award, LineChart as LineIcon, Table2, Weight } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import PageHeader from '../components/PageHeader'
import AnimatedCounter from '../components/AnimatedCounter'
import { useApp } from '../context/AppContext'
import { SERIES, chartChrome } from '../lib/colors'
import { stagger } from '../lib/motion'
import { personalRecords, strengthHistory, user } from '../data/mock'

const LIFTS = [
  { key: 'bench', label: 'Bench' },
  { key: 'squat', label: 'Squat' },
  { key: 'deadlift', label: 'Deadlift' },
]

const TIERS = {
  gold: { grad: 'from-amber-200 via-amber-400 to-amber-600', glow: 'shadow-[0_0_28px_-4px_rgb(251_191_36/.65)]', icon: Trophy, name: 'Gold' },
  silver: { grad: 'from-slate-100 via-slate-300 to-slate-500', glow: 'shadow-[0_0_24px_-6px_rgb(203_213_225/.6)]', icon: Medal, name: 'Silver' },
  bronze: { grad: 'from-orange-200 via-orange-400 to-amber-700', glow: 'shadow-[0_0_24px_-6px_rgb(234_88_12/.55)]', icon: Award, name: 'Bronze' },
}

function StrengthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass min-w-[150px] !rounded-xl px-3 py-2.5 text-xs">
      <p className="mb-1.5 font-semibold">Week of {label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-2 text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {LIFTS.find((l) => l.key === p.dataKey)?.label}
          </span>
          <span className="font-semibold tabular-nums text-fg">{p.value} kg</span>
        </p>
      ))}
    </div>
  )
}

export default function Progress() {
  const { theme } = useApp()
  const colors = SERIES[theme]
  const chrome = chartChrome(theme)
  const [focus, setFocus] = useState(null)
  const [view, setView] = useState('chart')

  const first = strengthHistory[0]
  const last = strengthHistory[strengthHistory.length - 1]
  const totalNow = last.bench + last.squat + last.deadlift
  const totalThen = first.bench + first.squat + first.deadlift
  const gainPct = ((totalNow - totalThen) / totalThen) * 100
  const lastIdx = strengthHistory.length - 1

  const endLabel = (lift) => (props) => {
    const { x, y, index, value } = props
    if (index !== lastIdx) return null
    return (
      <text x={x + 8} y={y + 4} fontSize={12} fontWeight={600} fill={chrome.axis} opacity={!focus || focus === lift.key ? 1 : 0.35}>
        {lift.label} {value}
      </text>
    )
  }

  return (
    <motion.div variants={stagger()} initial="initial" animate="animate">
      <PageHeader eyebrow="Progress" title="Strength that shows" subtitle="Estimated one-rep max for your big three, plus every record you’ve smashed." />

      {/* Summary tiles */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: TrendingUp, label: 'Strength gain', value: gainPct, decimals: 1, prefix: '+', suffix: '%', sub: 'since July' },
          { icon: Weight, label: 'Big-3 total', value: totalNow, suffix: ' kg', sub: `+${totalNow - totalThen} kg in 15 wks` },
          { icon: Trophy, label: 'Personal records', value: user.totals.prs, sub: '3 this month' },
          { icon: LineIcon, label: 'Workouts logged', value: user.totals.workouts, sub: `${user.totals.hours} hours total` },
        ].map((s) => (
          <GlassCard key={s.label} hover className="!p-5">
            <s.icon className="h-5 w-5 text-accent" />
            <p className="mt-3 font-display text-3xl font-bold">
              <AnimatedCounter value={s.value} decimals={s.decimals ?? 0} prefix={s.prefix} suffix={s.suffix} />
            </p>
            <p className="text-sm font-medium">{s.label}</p>
            <p className="text-xs text-muted">{s.sub}</p>
          </GlassCard>
        ))}
      </div>

      {/* Strength chart */}
      <GlassCard className="mb-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label">Strength gains</p>
            <h3 className="mt-1 text-xl font-semibold">Estimated 1RM over time (kg)</h3>
          </div>
          <div className="flex gap-1 rounded-xl bg-fg/[0.05] p-1" role="tablist" aria-label="Chart or table view">
            {[['chart', LineIcon, 'Chart'], ['table', Table2, 'Table']].map(([v, Icon, label]) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${view === v ? 'bg-surface text-fg shadow' : 'text-muted hover:text-fg'}`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend (doubles as focus filter) */}
        <div className="mb-3 flex flex-wrap gap-2">
          {LIFTS.map((l) => {
            const on = !focus || focus === l.key
            return (
              <button
                key={l.key}
                onClick={() => setFocus(focus === l.key ? null : l.key)}
                aria-pressed={focus === l.key}
                className={`chip transition ${on ? 'text-fg' : 'text-muted opacity-50'} ${focus === l.key ? 'bg-fg/[0.06]' : ''}`}
              >
                <span className="h-0.5 w-4 rounded-full" style={{ background: colors[l.key] }} />
                {l.label}
                <span className="tabular-nums text-muted">+{last[l.key] - first[l.key]} kg</span>
              </button>
            )
          })}
        </div>

        {view === 'chart' ? (
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthHistory} margin={{ top: 10, right: 92, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={chrome.grid} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chrome.axis }} minTickGap={24} dy={8} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: chrome.axis }} domain={[60, 200]} ticks={[60, 100, 140, 180]} width={48} />
                <Tooltip content={<StrengthTooltip />} cursor={{ stroke: chrome.cursor, strokeWidth: 1 }} />
                {LIFTS.map((l, i) => (
                  <Line
                    key={l.key}
                    type="monotone"
                    dataKey={l.key}
                    stroke={colors[l.key]}
                    strokeWidth={focus === l.key ? 3 : 2}
                    strokeOpacity={!focus || focus === l.key ? 1 : 0.25}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: chrome.surface, fill: colors[l.key] }}
                    label={endLabel(l)}
                    animationDuration={1600}
                    animationBegin={i * 200}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="max-h-80 overflow-auto rounded-2xl ring-1 ring-line/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Week</th>
                  {LIFTS.map((l) => <th key={l.key} className="px-4 py-3 text-right font-semibold">{l.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {strengthHistory.map((r) => (
                  <tr key={r.week} className="border-t border-line/5">
                    <td className="px-4 py-2.5 text-muted">{r.week}</td>
                    {LIFTS.map((l) => <td key={l.key} className="px-4 py-2.5 text-right tabular-nums">{r[l.key]} kg</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* PRs */}
      <div className="mb-4 mt-8 flex items-end justify-between">
        <div>
          <p className="label">Hall of fame</p>
          <h2 className="mt-1 text-2xl font-bold">Personal records</h2>
        </div>
      </div>
      <motion.div variants={stagger(0.07)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {personalRecords.map((pr) => {
          const t = TIERS[pr.tier]
          return (
            <GlassCard key={pr.lift} hover className="group flex items-center gap-4 overflow-hidden">
              <motion.div
                whileHover={{ rotate: [0, -12, 12, 0] }}
                transition={{ duration: 0.5 }}
                className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.grad} ${t.glow}`}
              >
                <t.icon className="h-8 w-8 text-black/70" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted">{pr.lift}</p>
                <p className="font-display text-3xl font-bold leading-tight">
                  {pr.value}
                  <span className="ml-1 text-base font-medium text-muted">{pr.unit}</span>
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                  <span className="font-semibold text-accent">{pr.delta}</span> · {pr.date}
                </p>
              </div>
              <span className="label absolute right-4 top-4 !text-[10px]">{t.name}</span>
            </GlassCard>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
