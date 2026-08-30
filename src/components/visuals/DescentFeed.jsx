import { useRef, useEffect } from 'react'

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Simulated 30 FPS Lander Descent Imager feed: a lunar surface that slowly
 * scales up (approach) while optical-flow vectors track surface drift.
 */
export default function DescentFeed({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = (canvas.width = canvas.clientWidth * dpr)
    let H = (canvas.height = canvas.clientHeight * dpr)
    const ctx = canvas.getContext('2d')

    // Fixed surface features in a virtual space we zoom into.
    const rand = mulberry32(777)
    const feats = []
    for (let i = 0; i < 90; i++) {
      feats.push({
        x: rand() * 2 - 0.5,
        y: rand() * 2 - 0.5,
        r: 0.004 + rand() * 0.02,
        b: 0.3 + rand() * 0.5,
      })
    }

    let raf
    let t0 = performance.now()

    const draw = (now) => {
      const elapsed = (now - t0) / 1000
      const zoom = 1 + (elapsed % 8) * 0.14 // slow approach, loops

      ctx.fillStyle = '#0b0d12'
      ctx.fillRect(0, 0, W, H)

      const cx = W / 2
      const cy = H / 2
      const scale = Math.min(W, H) * zoom

      for (const f of feats) {
        const sx = cx + f.x * scale - scale / 2
        const sy = cy + f.y * scale - scale / 2
        const r = f.r * scale
        if (sx < -r || sx > W + r || sy < -r || sy > H + r) continue
        // crater
        const rg = ctx.createRadialGradient(sx, sy, r * 0.2, sx, sy, r)
        rg.addColorStop(0, `rgba(20,20,26,0.6)`)
        rg.addColorStop(0.7, `rgba(${90 * f.b},${90 * f.b},${96 * f.b},0.25)`)
        rg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = rg
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = `rgba(210,210,220,${0.28 * f.b})`
        ctx.lineWidth = 1 * dpr
        ctx.beginPath()
        ctx.arc(sx - r * 0.2, sy - r * 0.2, r * 0.8, 2.2, 4.6)
        ctx.stroke()
      }

      // optical-flow vectors radiating from centre (surface drift outward as we descend)
      ctx.strokeStyle = 'rgba(34,211,238,0.55)'
      ctx.fillStyle = 'rgba(34,211,238,0.8)'
      ctx.lineWidth = 1.2 * dpr
      const ring = 5
      for (let a = 0; a < 16; a++) {
        for (let rr = 1; rr <= ring; rr++) {
          const ang = (a / 16) * Math.PI * 2
          const d0 = (rr / ring) * Math.min(W, H) * 0.42
          const len = 6 * dpr + d0 * 0.05
          const x = cx + Math.cos(ang) * d0
          const y = cy + Math.sin(ang) * d0
          const x2 = x + Math.cos(ang) * len
          const y2 = y + Math.sin(ang) * len
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      }

      // centre reticle / landing target
      ctx.strokeStyle = 'rgba(251,191,36,0.9)'
      ctx.lineWidth = 1.4 * dpr
      ctx.beginPath()
      ctx.arc(cx, cy, 26 * dpr, 0, Math.PI * 2)
      ctx.moveTo(cx - 36 * dpr, cy)
      ctx.lineTo(cx - 14 * dpr, cy)
      ctx.moveTo(cx + 14 * dpr, cy)
      ctx.lineTo(cx + 36 * dpr, cy)
      ctx.moveTo(cx, cy - 36 * dpr)
      ctx.lineTo(cx, cy - 14 * dpr)
      ctx.moveTo(cx, cy + 14 * dpr)
      ctx.lineTo(cx, cy + 36 * dpr)
      ctx.stroke()

      // scanline sweep
      const sweepY = ((elapsed * 120 * dpr) % H)
      const sg = ctx.createLinearGradient(0, sweepY - 30 * dpr, 0, sweepY)
      sg.addColorStop(0, 'rgba(34,211,238,0)')
      sg.addColorStop(1, 'rgba(34,211,238,0.12)')
      ctx.fillStyle = sg
      ctx.fillRect(0, sweepY - 30 * dpr, W, 30 * dpr)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    const onResize = () => {
      W = canvas.width = canvas.clientWidth * dpr
      H = canvas.height = canvas.clientHeight * dpr
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} className={className} />
}
