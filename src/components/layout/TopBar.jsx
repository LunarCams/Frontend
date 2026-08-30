import { useEffect, useState } from 'react'
import { MISSION } from '../../data/mockData'
import { LiveDot } from '../ui/Ui'
import { PAGES } from '../../App'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function TopBar({ active, onNavigate }) {
  const now = useClock()
  const utc = now.toISOString().slice(11, 19)

  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-space-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-2.5 sm:px-6">
        {/* Emblem */}
        <button onClick={() => onNavigate('overview')} className="flex items-center gap-3 text-left">
          <div className="relative grid h-9 w-9 place-items-center">
            <div className="absolute inset-0 rounded-full border border-cyan-glow/40" />
            <div className="absolute inset-0 animate-sweep rounded-full border-t-2 border-cyan-glow/70" />
            <img src="/moon.svg" alt="" className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-wide text-slate-100">
              {MISSION.id}
              <span className="ml-2 hidden font-sans text-[10px] font-normal uppercase tracking-widest text-cyan-glow/70 sm:inline">
                ISRO · MISSION CONTROL
              </span>
            </div>
            <div className="hidden font-mono text-[10px] tracking-wider text-slate-500 md:block">
              {MISSION.name}
            </div>
          </div>
        </button>

        {/* Nav */}
        <nav className="ml-auto flex items-center gap-1 overflow-x-auto">
          {PAGES.map((n) => (
            <button
              key={n.id}
              onClick={() => onNavigate(n.id)}
              className={`whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-semibold tracking-wide transition-colors sm:px-3 ${
                active === n.id
                  ? 'bg-cyan-glow/10 text-cyan-glow shadow-glow'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* Clock + status */}
        <div className="ml-4 hidden items-center gap-4 md:flex">
          <div className="hidden text-right sm:block">
            <div className="font-mono text-sm font-bold tabular-nums text-cyan-glow">{utc} UTC</div>
            <div className="font-mono text-[10px] tracking-wider text-slate-500">MET T− 04:12:38</div>
          </div>
          <LiveDot tone="safe" label="LINK OK" />
        </div>
      </div>
    </header>
  )
}
