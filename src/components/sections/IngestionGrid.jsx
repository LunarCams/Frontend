import { SENSORS, SOLAR_GEOMETRY } from '../../data/mockData'
import ProceduralCanvas from '../visuals/ProceduralCanvas'
import { SectionHeading, Chip, Telemetry, LiveDot } from '../ui/Ui'

function SensorPanel({ sensor }) {
  return (
    <div className="panel group overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span
            className="grid h-6 w-6 place-items-center rounded font-mono text-xs font-bold text-space-950"
            style={{ backgroundColor: sensor.accent }}
          >
            {sensor.panel}
          </span>
          <div>
            <div className="font-display text-sm font-bold tracking-wide text-slate-100">{sensor.name}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{sensor.fullName}</div>
          </div>
        </div>
        <LiveDot tone="cyan" label="Rx" />
      </div>

      {/* Visual feed */}
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-edge bg-space-950">
        <ProceduralCanvas kind={sensor.visual} seed={sensor.panel.charCodeAt(0) * 7} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-0 grid-scanlines" />
        {/* HUD corners */}
        <div className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-cyan-glow/60" />
        <div className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-cyan-glow/60" />
        <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-cyan-glow/60" />
        <div className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-cyan-glow/60" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-space-950/70 px-2 py-0.5 font-mono text-[10px] tracking-wider text-cyan-glow/80">
          {sensor.telemetry[0].v}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <Telemetry items={sensor.telemetry} />
        <p className="border-t border-edge pt-3 text-xs leading-relaxed text-slate-400">{sensor.footer}</p>
      </div>
    </div>
  )
}

export default function IngestionGrid() {
  return (
    <section id="ingestion" className="scroll-mt-24">
      <SectionHeading
        index={1}
        title="Multi-Modal Ingestion & Homography Registration"
        subtitle="Heterogeneous Chandrayaan-2 payloads aligned into one scale- & illumination-invariant frame."
        right={<Chip tone="safe"><LiveDot /> 4 FEEDS NOMINAL</Chip>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SENSORS.map((s) => (
          <SensorPanel key={s.id} sensor={s} />
        ))}
      </div>

      {/* Solar geometry & scale invariance */}
      <div className="panel mt-4">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold tracking-wide text-slate-100">
              Solar Geometry & Scale-Invariance Normalization
            </span>
          </div>
          <Chip tone="cyan">SUN-ANGLE INVARIANT</Chip>
        </div>
        <div className="grid grid-cols-1 divide-y divide-edge sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {SOLAR_GEOMETRY.map((g) => (
            <div key={g.param} className="p-4">
              <div className="telemetry-key">{g.param}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-xl font-bold text-cyan-glow">{g.value}</span>
              </div>
              <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-amber-glow/80">{g.tag}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{g.purpose}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
