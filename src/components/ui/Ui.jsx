// Small shared presentational primitives for the mission-control theme.

export function SectionHeading({ index, title, subtitle, right }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {index != null && (
          <span className="font-display text-xs text-cyan-glow/70 tracking-[0.3em]">
            {String(index).padStart(2, '0')}
          </span>
        )}
        <div>
          <h2 className="font-display text-lg font-bold tracking-wide text-slate-100 sm:text-xl">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

export function Chip({ children, tone = 'cyan', className = '' }) {
  const tones = {
    cyan: 'border-cyan-glow/40 text-cyan-glow bg-cyan-glow/10',
    amber: 'border-amber-glow/40 text-amber-glow bg-amber-glow/10',
    safe: 'border-safe/40 text-safe bg-safe/10',
    caution: 'border-caution/40 text-caution bg-caution/10',
    hazard: 'border-hazard/40 text-hazard bg-hazard/10',
    slate: 'border-slate-600 text-slate-300 bg-slate-500/10',
  }
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>
}

export function LiveDot({ tone = 'safe', label }) {
  const colors = { safe: 'bg-safe', amber: 'bg-amber-glow', hazard: 'bg-hazard', cyan: 'bg-cyan-glow' }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${colors[tone]} animate-pulseDot`} />
      {label && <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">{label}</span>}
    </span>
  )
}

export function Telemetry({ items }) {
  return (
    <dl className="space-y-1.5">
      {items.map((it) => (
        <div key={it.k} className="flex items-baseline justify-between gap-3">
          <dt className="telemetry-key shrink-0">{it.k}</dt>
          <dd className="telemetry-val text-right">{it.v}</dd>
        </div>
      ))}
    </dl>
  )
}

// Colour helper shared by tile/score UI.
export function scoreTone(score) {
  if (score >= 80) return 'safe'
  if (score >= 60) return 'caution'
  return 'hazard'
}
export function scoreHex(score) {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}
