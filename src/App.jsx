import { useEffect, useState } from 'react'
import TopBar from './components/layout/TopBar'
import Hero from './components/layout/Hero'
import IngestionGrid from './components/sections/IngestionGrid'
import LiveDescent from './components/sections/LiveDescent'
import HazardPipeline from './components/pipeline/HazardPipeline'
import { MISSION } from './data/mockData'

export const PAGES = [
  { id: 'overview', label: 'Overview' },
  { id: 'ingestion', label: 'Ingestion' },
  { id: 'descent', label: 'Live Descent' },
  { id: 'pipeline', label: 'Decision Pipeline' },
]

export default function App() {
  const [page, setPage] = useState('overview')

  // Scroll to top whenever the active page changes (web-app navigation feel).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar active={page} onNavigate={setPage} />

      <main key={page} className="mx-auto w-full max-w-[1400px] flex-1 animate-[fadeIn_0.3s_ease] px-4 py-8 sm:px-6 sm:py-10">
        {page === 'overview' && <Hero onNavigate={setPage} />}
        {page === 'ingestion' && <IngestionGrid />}
        {page === 'descent' && <LiveDescent />}
        {page === 'pipeline' && <HazardPipeline />}
      </main>

      <footer className="border-t border-edge">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="font-mono text-[11px] text-slate-500">
            {MISSION.id} · {MISSION.name}
          </div>
          <div className="font-mono text-[11px] text-slate-600">
            V1 Prototype · Hardcoded mock data · ML inference pipeline integrates in V2
          </div>
        </div>
      </footer>
    </div>
  )
}
