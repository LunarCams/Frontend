import { useEffect, useState } from 'react'
import { MISSION, BOOT_LOG } from '../../data/mockData'
import { Chip, LiveDot } from '../ui/Ui'

function BootLog() {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= BOOT_LOG.length) return
    const id = setTimeout(() => setN((x) => x + 1), 420)
    return () => clearTimeout(id)
  }, [n])
  return (
    <div className="rounded-md border border-edge bg-space-950/70 p-3 font-mono text-[11px] leading-relaxed">
      {BOOT_LOG.slice(0, n).map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-safe">›</span>
          <span className="text-slate-400">{l}</span>
        </div>
      ))}
      {n < BOOT_LOG.length && <span className="text-cyan-glow">▋</span>}
    </div>
  )
}

const STATS = [
  { k: '3', l: 'Payloads Fused', s: 'OHRC · TMC-2 · IIRS' },
  { k: '108', l: 'Tiles Scored', s: '< 2.5s inference' },
  { k: '0.42px', l: 'Registration RMSE', s: 'sub-pixel' },
  { k: 'Top 3', l: 'Landing Finalists', s: 'HITL verified' },
]

export default function Hero({ onNavigate }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-edge bg-panel/30">
      {/* glow backdrop */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-cyan-glow/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-isro/10 blur-3xl" />

      <div className="px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr,1fr] lg:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Chip tone="amber">SIH26166 · SPACE DOMAIN</Chip>
              <Chip tone="cyan">
                <LiveDot /> {MISSION.phase}
              </Chip>
              <Chip tone="slate">V1 PROTOTYPE</Chip>
            </div>
            <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-slate-50 sm:text-4xl xl:text-5xl">
              Autonomous Lunar{' '}
              <span className="bg-gradient-to-r from-cyan-glow to-isro bg-clip-text text-transparent">
                Landing Site Selector
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Multi-modal image registration, autonomous hazard assessment and a human-in-the-loop
              tactical pipeline — turning raw Chandrayaan-2 optical data into mission-critical landing
              intelligence with flight-director oversight fail-safes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => onNavigate('pipeline')}>
                ▶ Enter Decision Pipeline
              </button>
              <button className="btn-ghost" onClick={() => onNavigate('ingestion')}>
                View Sensor Feeds
              </button>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.l} className="rounded-md border border-edge bg-panel/60 p-3">
                  <dt className="font-display text-2xl font-bold text-cyan-glow">{s.k}</dt>
                  <dd className="mt-0.5 text-xs font-semibold text-slate-300">{s.l}</dd>
                  <dd className="font-mono text-[10px] text-slate-500">{s.s}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* mission card */}
          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-sm font-bold tracking-wide text-slate-100">Mission Profile</span>
              <LiveDot tone="cyan" label="TELEMETRY" />
            </div>
            <dl className="space-y-2 border-b border-edge pb-4 text-sm">
              <Row k="Vehicle" v={MISSION.vehicle} />
              <Row k="Target" v={MISSION.targetRegion} />
              <Row k="Orbit" v={MISSION.orbit} />
            </dl>
            <div className="mt-4">
              <BootLog />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="telemetry-key shrink-0">{k}</dt>
      <dd className="text-right font-mono text-xs text-slate-200">{v}</dd>
    </div>
  )
}
