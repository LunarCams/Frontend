import { useEffect, useMemo, useRef, useState } from 'react'
import { ALL_TILES } from '../../data/mockData'
import { scoreHex } from '../ui/Ui'

/**
 * Step 1 visual: the full field of 108 ("100+") multi-modal tiles.
 * On "run", tiles light up one-by-one to simulate DL/CV batch inference,
 * then the Top-15 are highlighted.
 */
export default function TileField({ running, done, highlightIds }) {
  const [revealed, setRevealed] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    if (!running) return
    setRevealed(0)
    timer.current = setInterval(() => {
      setRevealed((r) => {
        if (r >= ALL_TILES.length) {
          clearInterval(timer.current)
          return r
        }
        return r + 4
      })
    }, 24)
    return () => clearInterval(timer.current)
  }, [running])

  const showAll = done && !running
  const hi = useMemo(() => new Set(highlightIds || []), [highlightIds])

  return (
    <div
      className="relative grid gap-[3px] rounded-md border border-edge bg-space-950 p-2"
      style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}
    >
      {ALL_TILES.map((t, i) => {
        const isRevealed = showAll || i < revealed
        const isTop = hi.has(t.id)
        return (
          <div
            key={t.id}
            title={`${t.id} · score ${t.score} · slope ${t.slope}°`}
            className={`relative aspect-square rounded-[3px] transition-all duration-300 ${
              isTop && showAll ? 'ring-2 ring-cyan-glow ring-offset-1 ring-offset-space-950 z-10' : ''
            }`}
            style={{
              backgroundColor: isRevealed ? scoreHex(t.score) : '#141b2b',
              opacity: isRevealed ? (isTop || !showAll ? 1 : 0.32) : 0.5,
              boxShadow: isTop && showAll ? '0 0 8px rgba(34,211,238,0.7)' : 'none',
            }}
          >
            {isTop && showAll && (
              <span className="absolute inset-0 grid place-items-center font-mono text-[8px] font-bold text-space-950">
                {t.rank}
              </span>
            )}
          </div>
        )
      })}
      {running && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden">
          <div className="h-full w-1/3 animate-scan bg-gradient-to-r from-transparent via-cyan-glow to-transparent" />
        </div>
      )}
    </div>
  )
}
