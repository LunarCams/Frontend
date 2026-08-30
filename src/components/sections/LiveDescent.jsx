import { useEffect, useState } from 'react'
import { LIVE_FEEDS } from '../../data/mockData'
import DescentFeed from '../visuals/DescentFeed'
import DEMHazardMap from '../visuals/DEMHazardMap'
import { SectionHeading, Chip, LiveDot } from '../ui/Ui'

// A small animated readout that jitters realistically around a base value.
function useJitter(base, spread, decimals = 1) {
  const [v, setV] = useState(base)
  useEffect(() => {
    const id = setInterval(() => {
      setV(+(base + (Math.random() - 0.5) * spread).toFixed(decimals))
    }, 500)
    return () => clearInterval(id)
  }, [base, spread, decimals])
  return v
}

function OverlayTag({ children, className = '' }) {
  return (
    <div
      className={`rounded bg-space-950/75 px-2 py-1 font-mono text-[11px] tracking-wider text-cyan-glow backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  )
}

export default function LiveDescent() {
  const { ldi, dem } = LIVE_FEEDS
  const velocity = useJitter(ldi.velocity, 0.2)
  const altitude = useJitter(1240, 12, 0)
  const safeArea = useJitter(dem.safeArea, 0.6)
  const fps = 30

  return (
    <section id="descent" className="scroll-mt-24">
      <SectionHeading
        index={2}
        title="Live Video & Real-Time Descent Stream Grid"
        subtitle="Simulated Lander Descent Imager optical-flow tracking with a live color-coded slope hazard mesh."
        right={<Chip tone="hazard"><LiveDot tone="hazard" /> DESCENT SIM</Chip>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LDI feed */}
        <div className="panel overflow-hidden">
          <div className="panel-header">
            <span className="font-display text-sm font-bold tracking-wide text-slate-100">{ldi.name}</span>
            <LiveDot tone="safe" label={ldi.status} />
          </div>
          <div className="relative aspect-video w-full bg-space-950">
            <DescentFeed className="h-full w-full" />
            <div className="pointer-events-none absolute inset-0 grid-scanlines" />
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              <OverlayTag>FPS: {fps}</OverlayTag>
              <OverlayTag>ALT: {altitude} m</OverlayTag>
            </div>
            <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
              <OverlayTag className="text-amber-glow">V: {velocity} m/s</OverlayTag>
              <OverlayTag>OPT-FLOW: LOCK</OverlayTag>
            </div>
            <div className="absolute bottom-3 left-3">
              <OverlayTag className="text-hazard">● REC</OverlayTag>
            </div>
            <div className="absolute bottom-3 right-3">
              <OverlayTag>LDI-CAM · 30Hz</OverlayTag>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-edge">
            <Readout label="Frame Rate" value={`${fps} FPS`} />
            <Readout label="Descent Velocity" value={`${velocity} m/s`} tone="amber" />
            <Readout label="Optical Flow" value="TRACKING" tone="safe" />
          </div>
        </div>

        {/* DEM hazard map */}
        <div className="panel overflow-hidden">
          <div className="panel-header">
            <span className="font-display text-sm font-bold tracking-wide text-slate-100">{dem.name}</span>
            <LiveDot tone="hazard" label={`HAZARD ${dem.hazardMode}`} />
          </div>
          <div className="relative aspect-video w-full bg-space-950">
            <DEMHazardMap className="h-full w-full" />
            <div className="absolute left-3 top-3">
              <OverlayTag className="text-safe">SAFE AREA: {safeArea}%</OverlayTag>
            </div>
            {/* legend */}
            <div className="absolute bottom-3 left-3 flex flex-col gap-1 rounded bg-space-950/75 p-2 backdrop-blur-sm">
              <LegendRow color="#22c55e" label="SAFE · < 10°" />
              <LegendRow color="#f59e0b" label="CAUTION · 10–12°" />
              <LegendRow color="#ef4444" label="HAZARD · > 12°" />
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-edge">
            <Readout label="Safe Terrain" value={`${safeArea}%`} tone="safe" />
            <Readout label="Slope Ceiling" value="12.0°" tone="amber" />
            <Readout label="Mesh Update" value="REALTIME" />
          </div>
        </div>
      </div>
    </section>
  )
}

function Readout({ label, value, tone = 'cyan' }) {
  const color = { cyan: 'text-cyan-glow', amber: 'text-amber-glow', safe: 'text-safe' }[tone]
  return (
    <div className="px-4 py-3">
      <div className="telemetry-key">{label}</div>
      <div className={`mt-0.5 font-mono text-base font-bold ${color}`}>{value}</div>
    </div>
  )
}

function LegendRow({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      <span className="font-mono text-[10px] tracking-wider text-slate-300">{label}</span>
    </div>
  )
}
