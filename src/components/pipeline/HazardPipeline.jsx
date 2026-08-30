import { useMemo, useState } from 'react'
import { TOP15, refineTop3, HAZARD_PARAMS } from '../../data/mockData'
import { SectionHeading, Chip, scoreHex, scoreTone } from '../ui/Ui'
import TileField from './TileField'
import AuthorizationConsole from './AuthorizationConsole'

const STEPS = [
  { n: 1, label: 'Automated Scoring', sub: '100+ Tiles → Top 15' },
  { n: 2, label: 'HITL Selection', sub: 'Top 15 → Select 5' },
  { n: 3, label: 'Refinement', sub: '5 Sites → Top 3' },
  { n: 4, label: 'Authorization', sub: 'Landing Command' },
]

function Stepper({ step, maxReached, onJump }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {STEPS.map((s) => {
        const active = step === s.n
        const reachable = s.n <= maxReached
        return (
          <button
            key={s.n}
            disabled={!reachable}
            onClick={() => reachable && onJump(s.n)}
            className={`relative rounded-md border px-3 py-2.5 text-left transition-all ${
              active
                ? 'border-cyan-glow bg-cyan-glow/10 shadow-glow'
                : reachable
                  ? 'border-edge bg-panel hover:border-cyan-glow/50'
                  : 'border-edge/60 bg-panel/40 opacity-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] font-bold ${
                  s.n < maxReached
                    ? 'bg-safe text-space-950'
                    : active
                      ? 'bg-cyan-glow text-space-950'
                      : 'bg-space-700 text-slate-400'
                }`}
              >
                {s.n < maxReached ? '✓' : s.n}
              </span>
              <span className="font-display text-xs font-bold tracking-wide text-slate-100">{s.label}</span>
            </div>
            <div className="mt-1 pl-7 font-mono text-[10px] tracking-wider text-slate-500">{s.sub}</div>
          </button>
        )
      })}
    </div>
  )
}

function HazardBars({ tile }) {
  const bars = [
    { label: 'Slope', v: tile.slope, max: 20, invert: true, unit: '°' },
    { label: 'Boulder', v: tile.boulder, max: 60, invert: true, unit: '' },
    { label: 'Shadow', v: tile.shadow, max: 80, invert: true, unit: '%' },
    { label: 'Thermal', v: tile.thermal * 100, max: 100, invert: false, unit: '' },
  ]
  return (
    <div className="space-y-1">
      {bars.map((b) => {
        const pct = Math.min(100, (b.v / b.max) * 100)
        const good = b.invert ? 100 - pct : pct
        return (
          <div key={b.label} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-[10px] uppercase tracking-wider text-slate-500">{b.label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-space-700">
              <div
                className="h-full rounded-full"
                style={{ width: `${good}%`, backgroundColor: scoreHex(good) }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TileCard({ tile, selected, onToggle, rankKey = 'rank', selectable }) {
  return (
    <button
      onClick={onToggle}
      disabled={!selectable}
      className={`panel w-full p-3 text-left transition-all ${
        selected ? 'border-cyan-glow bg-cyan-glow/5 shadow-glow' : 'hover:border-cyan-glow/50'
      } ${!selectable ? 'cursor-default' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="grid h-6 w-6 place-items-center rounded font-mono text-xs font-bold text-space-950"
            style={{ backgroundColor: scoreHex(tile.score) }}
          >
            {tile[rankKey]}
          </span>
          <div>
            <div className="font-mono text-sm font-bold text-slate-100">{tile.id}</div>
            <div className="font-mono text-[10px] text-slate-500">
              {tile.lat}°S · {tile.lon}°E
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-bold" style={{ color: scoreHex(tile.score) }}>
            {tile.score}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500">safety</div>
        </div>
      </div>
      <div className="mt-3">
        <HazardBars tile={tile} />
      </div>
      {selected && (
        <div className="mt-2 flex items-center justify-center gap-1.5 rounded bg-cyan-glow/10 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-glow">
          ✓ Selected for drill-down
        </div>
      )}
    </button>
  )
}

export default function HazardPipeline() {
  const [step, setStep] = useState(1)
  const [maxReached, setMaxReached] = useState(1)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [selected, setSelected] = useState([])

  const goTo = (n) => {
    setStep(n)
    setMaxReached((m) => Math.max(m, n))
  }

  const runScan = () => {
    setScanning(true)
    setScanned(false)
    setTimeout(() => {
      setScanning(false)
      setScanned(true)
    }, 2400) // matches PRD "< 2.5s for 100 tiles"
  }

  const top15Ids = useMemo(() => TOP15.map((t) => t.id), [])
  const selectedTiles = useMemo(() => TOP15.filter((t) => selected.includes(t.id)), [selected])
  const top3 = useMemo(
    () => (selectedTiles.length === 5 ? refineTop3(selectedTiles) : []),
    [selectedTiles],
  )
  const [finalSite, setFinalSite] = useState(null)

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 5 ? [...prev, id] : prev,
    )
  }

  return (
    <section id="pipeline" className="scroll-mt-24">
      <SectionHeading
        index={3}
        title="End-to-End Decision Pipeline"
        subtitle="Two-stage hybrid: automated hazard scoring → human-in-the-loop drill-down → flight-director authorization."
        right={<Chip tone="amber">HITL</Chip>}
      />

      <Stepper step={step} maxReached={maxReached} onJump={goTo} />

      <div className="panel min-h-[420px] p-4 sm:p-6">
        {/* ---------------- STEP 1 ---------------- */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr,1fr]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold tracking-wide text-slate-200">
                  DL/CV Batch Inference · 108 Multi-Modal Tiles
                </h3>
                <Chip tone={scanned ? 'safe' : 'slate'}>
                  {scanning ? 'SCORING…' : scanned ? 'COMPLETE' : 'STANDBY'}
                </Chip>
              </div>
              <TileField running={scanning} done={scanned} highlightIds={top15Ids} />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button className="btn-primary" onClick={runScan} disabled={scanning}>
                  {scanning ? 'Running Inference…' : scanned ? '↻ Re-run Scoring' : '▶ Run Hazard Scoring'}
                </button>
                {scanned && (
                  <button className="btn-ghost" onClick={() => goTo(2)}>
                    Proceed to HITL Selection →
                  </button>
                )}
                <span className="font-mono text-[11px] text-slate-500">
                  latency&nbsp;
                  <span className="text-cyan-glow">{scanned ? '2.41s' : '—'}</span>
                  &nbsp;/ 108 tiles
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-md border border-edge bg-space-950/60 p-4">
                <div className="telemetry-key mb-2">Hazard Parameters Evaluated</div>
                <div className="space-y-2">
                  {HAZARD_PARAMS.map((p) => (
                    <div key={p.key} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{p.label}</span>
                      <span className="font-mono text-xs text-cyan-glow">{p.threshold}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Legend color="#22c55e" label="Safe ≥ 80" />
                <Legend color="#f59e0b" label="Caution" />
                <Legend color="#ef4444" label="Hazard < 60" />
              </div>
              {scanned && (
                <div className="rounded-md border border-cyan-glow/30 bg-cyan-glow/5 p-4">
                  <div className="font-mono text-xs text-cyan-glow">▚ 15 SAFEST ZONES ISOLATED</div>
                  <p className="mt-1 text-xs text-slate-400">
                    Highlighted tiles ranked by weighted safety score (0–100). Advance to inspect and
                    down-select 5 candidates.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- STEP 2 ---------------- */}
        {step === 2 && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-sm font-bold tracking-wide text-slate-200">
                Human-in-the-Loop · Select 5 Candidate Sites
              </h3>
              <div className="flex items-center gap-3">
                <Chip tone={selected.length === 5 ? 'safe' : 'amber'}>{selected.length} / 5 SELECTED</Chip>
                <button className="btn-ghost" onClick={() => setSelected([])} disabled={!selected.length}>
                  Clear
                </button>
                <button className="btn-primary" disabled={selected.length !== 5} onClick={() => goTo(3)}>
                  Refine to Top 3 →
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TOP15.map((t) => (
                <TileCard
                  key={t.id}
                  tile={t}
                  selected={selected.includes(t.id)}
                  onToggle={() => toggleSelect(t.id)}
                  selectable={selected.length < 5 || selected.includes(t.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ---------------- STEP 3 ---------------- */}
        {step === 3 && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-sm font-bold tracking-wide text-slate-200">
                Shadow-Invariant Re-scoring · Top 3 Finalists
              </h3>
              <button className="btn-primary" onClick={() => goTo(4)}>
                Proceed to Authorization →
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {top3.map((t) => (
                <div
                  key={t.id}
                  className={`panel p-4 ${t.finalRank === 1 ? 'border-cyan-glow shadow-glow' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <Chip tone={t.finalRank === 1 ? 'cyan' : 'slate'}>
                      {t.finalRank === 1 ? '★ OPTIMAL' : `RANK ${t.finalRank}`}
                    </Chip>
                    <span className="font-mono text-sm text-slate-400">{t.id}</span>
                  </div>
                  <div className="my-3 flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-bold" style={{ color: scoreHex(t.rescored) }}>
                      {t.rescored}
                    </span>
                    <span className="text-xs text-slate-500">re-scored safety</span>
                  </div>
                  {/* landing ellipse viz */}
                  <div className="relative my-3 grid h-28 place-items-center overflow-hidden rounded-md border border-edge bg-space-950">
                    <div
                      className="rounded-full border-2 border-cyan-glow/70"
                      style={{
                        width: `${Math.min(90, t.ellipse.semiMajor / 3)}%`,
                        height: `${Math.min(70, t.ellipse.semiMinor / 3)}%`,
                        boxShadow: '0 0 18px rgba(34,211,238,0.35) inset',
                      }}
                    />
                    <span className="absolute h-1.5 w-1.5 rounded-full bg-amber-glow shadow-glow-amber" />
                    <span className="absolute bottom-1 right-2 font-mono text-[9px] text-slate-500">
                      LANDING ELLIPSE
                    </span>
                  </div>
                  <dl className="space-y-1 font-mono text-[11px]">
                    <Row k="Ellipse (a×b)" v={`${t.ellipse.semiMajor}×${t.ellipse.semiMinor} m`} />
                    <Row k="Confidence" v={`${t.ellipse.confidence}%`} />
                    <Row k="Slope" v={`${t.slope}°`} />
                    <Row k="Coords" v={`${t.lat}°S ${t.lon}°E`} />
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- STEP 4 ---------------- */}
        {step === 4 && (
          <AuthorizationConsole
            finalists={top3}
            finalSite={finalSite}
            onPick={setFinalSite}
          />
        )}
      </div>
    </section>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 rounded border border-edge bg-space-950/60 px-2 py-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      <span className="font-mono text-[10px] tracking-wider text-slate-300">{label}</span>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-cyan-glow">{v}</dd>
    </div>
  )
}
