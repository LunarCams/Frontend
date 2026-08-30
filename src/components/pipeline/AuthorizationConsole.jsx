import { useEffect, useRef, useState } from 'react'
import { AUTH, DESCENT_PHASES } from '../../data/mockData'
import { Chip, LiveDot, scoreHex } from '../ui/Ui'

const PHASE = {
  IDLE: 'IDLE',
  ARMED: 'ARMED',
  DESCENDING: 'DESCENDING',
  TOUCHDOWN: 'TOUCHDOWN',
  ROVER: 'ROVER',
}

export default function AuthorizationConsole({ finalists, finalSite, onPick }) {
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [phase, setPhase] = useState(PHASE.IDLE)
  const [descentIdx, setDescentIdx] = useState(-1)
  const [progress, setProgress] = useState(0)
  const timers = useRef([])

  const selected = finalists.find((t) => t.id === finalSite) || null

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const authorize = () => {
    if (!selected) {
      setError('Select a final touchdown site first.')
      return
    }
    if (pass !== AUTH.passkey) {
      setError('Invalid authorization passkey. Command dispatch blocked.')
      return
    }
    setError('')
    setPhase(PHASE.ARMED)
    // begin descent sequence
    timers.current.push(setTimeout(() => runDescent(), 900))
  }

  const runDescent = () => {
    setPhase(PHASE.DESCENDING)
    DESCENT_PHASES.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setDescentIdx(i)
          setProgress(Math.round(((i + 1) / DESCENT_PHASES.length) * 100))
          if (i === DESCENT_PHASES.length - 1) {
            timers.current.push(setTimeout(() => setPhase(PHASE.TOUCHDOWN), 1100))
            timers.current.push(setTimeout(() => setPhase(PHASE.ROVER), 2600))
          }
        }, 1200 * (i + 1)),
      )
    })
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase(PHASE.IDLE)
    setDescentIdx(-1)
    setProgress(0)
    setPass('')
    setError('')
  }

  const armed = phase !== PHASE.IDLE

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,1.1fr]">
      {/* LEFT: selection + passkey */}
      <div className="space-y-4">
        <h3 className="font-display text-sm font-bold tracking-wide text-slate-200">
          Flight Director Landing Authorization
        </h3>

        <div>
          <div className="telemetry-key mb-2">Select Final Touchdown Site</div>
          <div className="grid grid-cols-3 gap-2">
            {finalists.map((t) => {
              const active = finalSite === t.id
              return (
                <button
                  key={t.id}
                  disabled={armed}
                  onClick={() => onPick(t.id)}
                  className={`rounded-md border p-2.5 text-left transition-all ${
                    active ? 'border-cyan-glow bg-cyan-glow/10 shadow-glow' : 'border-edge bg-panel hover:border-cyan-glow/50'
                  } ${armed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-300">{t.id}</span>
                    {t.finalRank === 1 && <span className="text-[9px] text-amber-glow">★</span>}
                  </div>
                  <div className="mt-1 font-mono text-lg font-bold" style={{ color: scoreHex(t.rescored) }}>
                    {t.rescored}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-md border border-edge bg-space-950/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="telemetry-key">Operational Security Passkey</span>
            <Chip tone="slate">DEMO: {AUTH.passkey}</Chip>
          </div>
          <PasskeyInput
            value={pass}
            length={AUTH.passkey.length}
            disabled={armed}
            onChange={(v) => setPass(v)}
          />
          <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-slate-500">
            <span>DIRECTOR: {AUTH.directorId}</span>
            <span>CLR: {AUTH.clearance}</span>
          </div>
          {error && <div className="mt-2 text-xs font-medium text-hazard">⚠ {error}</div>}
        </div>

        {!armed ? (
          <button className="btn-danger w-full py-3 text-base" onClick={authorize}>
            ⬢ ISSUE LANDING AUTHORIZATION COMMAND
          </button>
        ) : (
          <button className="btn-ghost w-full" onClick={reset}>
            ↻ Reset Sequence
          </button>
        )}
        <p className="text-center font-mono text-[10px] tracking-wider text-slate-600">
          ZERO UNAUTHENTICATED COMMAND DISPATCHES · CRYPTOGRAPHIC CONFIRMATION REQUIRED
        </p>
      </div>

      {/* RIGHT: descent + telemetry */}
      <div className="rounded-md border border-edge bg-space-950/60 p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-sm font-bold tracking-wide text-slate-200">Descent & Deployment</span>
          <StatusBadge phase={phase} />
        </div>

        {/* trajectory */}
        <div className="relative mb-4 h-40 overflow-hidden rounded-md border border-edge bg-space-950">
          <TrajectoryViz phase={phase} progress={progress} site={selected} />
        </div>

        {/* descent phases */}
        <div className="space-y-1.5">
          {DESCENT_PHASES.map((p, i) => {
            const active = descentIdx === i && phase === PHASE.DESCENDING
            const passed = descentIdx > i || phase === PHASE.TOUCHDOWN || phase === PHASE.ROVER
            return (
              <div
                key={p.t}
                className={`flex items-center gap-3 rounded px-2 py-1.5 transition-all ${
                  active ? 'bg-cyan-glow/10' : ''
                }`}
              >
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full text-[9px] ${
                    passed ? 'bg-safe text-space-950' : active ? 'bg-cyan-glow text-space-950 animate-pulseDot' : 'bg-space-700 text-slate-500'
                  }`}
                >
                  {passed ? '✓' : i + 1}
                </span>
                <div className="flex-1">
                  <div className={`font-mono text-xs ${passed || active ? 'text-slate-200' : 'text-slate-500'}`}>
                    {p.t}
                  </div>
                  <div className="text-[10px] text-slate-500">{p.d}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* progress + telemetry */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between font-mono text-[10px] text-slate-500">
            <span>DESCENT PROGRESS</span>
            <span className="text-cyan-glow">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-space-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-glow to-safe transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {phase === PHASE.ROVER && (
          <div className="mt-4 animate-flicker rounded-md border border-safe/40 bg-safe/10 p-4 text-center">
            <div className="font-display text-sm font-bold tracking-wide text-safe">
              ✓ TOUCHDOWN CONFIRMED · {selected?.id}
            </div>
            <div className="mt-1 font-mono text-[11px] text-slate-300">
              Vikram-NG stable · Rover egress ramp deployed
            </div>
            <div className="mt-2 inline-flex">
              <Chip tone="safe">
                <LiveDot /> PRAGYAN-II ROLLING OUT
              </Chip>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Segmented passkey field: a single hidden input captures keystrokes while
// `length` boxes render the masked state, so filled dots always line up.
function PasskeyInput({ value, length = 4, disabled, onChange }) {
  const ref = useRef(null)
  const [focused, setFocused] = useState(false)
  const cells = Array.from({ length })

  return (
    <div
      className={`relative flex justify-center gap-2 ${disabled ? 'opacity-50' : 'cursor-text'}`}
      onClick={() => !disabled && ref.current?.focus()}
    >
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
        aria-label="Operational security passkey"
      />
      {cells.map((_, i) => {
        const filled = i < value.length
        const isCaret = focused && !disabled && i === value.length
        return (
          <div
            key={i}
            className={`grid h-14 w-12 place-items-center rounded-md border bg-space-950 transition-all ${
              isCaret ? 'border-cyan-glow shadow-glow' : filled ? 'border-cyan-glow/60' : 'border-edge'
            }`}
          >
            {filled ? (
              <span className="h-3 w-3 rounded-full bg-cyan-glow" />
            ) : isCaret ? (
              <span className="h-6 w-px animate-pulseDot bg-cyan-glow" />
            ) : (
              <span className="h-3 w-3 rounded-full bg-space-700" />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StatusBadge({ phase }) {
  const map = {
    IDLE: ['slate', 'AWAITING AUTH'],
    ARMED: ['amber', 'COMMAND ARMED'],
    DESCENDING: ['cyan', 'DESCENDING'],
    TOUCHDOWN: ['safe', 'TOUCHDOWN'],
    ROVER: ['safe', 'ROVER DEPLOYED'],
  }
  const [tone, label] = map[phase]
  return (
    <Chip tone={tone}>
      <LiveDot tone={tone === 'slate' ? 'amber' : tone} /> {label}
    </Chip>
  )
}

// Simple SVG trajectory: lander arcs down toward the target site.
function TrajectoryViz({ phase, progress, site }) {
  const active = phase === 'DESCENDING' || phase === 'ARMED'
  const done = phase === 'TOUCHDOWN' || phase === 'ROVER'
  const t = done ? 1 : progress / 100
  // path from top-left to bottom-centre
  const x = 20 + t * 130
  const y = 15 + t * t * 110
  return (
    <svg viewBox="0 0 300 160" className="h-full w-full">
      {/* surface */}
      <defs>
        <linearGradient id="reg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2236" />
          <stop offset="1" stopColor="#0a0e18" />
        </linearGradient>
      </defs>
      <path d="M0 130 Q 80 118 150 128 T 300 126 V160 H0 Z" fill="url(#reg)" />
      <path d="M0 130 Q 80 118 150 128 T 300 126" fill="none" stroke="#26304a" strokeWidth="1" />

      {/* target site marker */}
      <g transform="translate(150 126)">
        <circle r="10" fill="none" stroke="#22d3ee" strokeWidth="1.2" opacity={done ? 1 : 0.5} />
        <circle r="3" fill="#fbbf24" />
        <text x="14" y="4" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#22d3ee">
          {site ? site.id : 'LZ-?'}
        </text>
      </g>

      {/* trajectory path */}
      <path
        d="M20 15 Q 60 60 150 126"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity={active || done ? 0.6 : 0.15}
      />

      {/* lander */}
      {(active || done) && (
        <g transform={`translate(${x} ${y})`}>
          <polygon points="0,-6 5,4 -5,4" fill="#e2e8f0" />
          {phase === 'DESCENDING' && (
            <line x1="0" y1="5" x2="0" y2="14" stroke="#fb923c" strokeWidth="2" opacity="0.8" />
          )}
        </g>
      )}
    </svg>
  )
}
