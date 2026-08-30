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
 * Dynamic DEM hazard map: color-coded slope mesh.
 * Green = safe (< 10°), amber = caution, red = hazard (> 12°).
 * The mesh shimmers slightly to read as "live".
 */
export default function DEMHazardMap({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = (canvas.width = canvas.clientWidth * dpr)
    let H = (canvas.height = canvas.clientHeight * dpr)
    const ctx = canvas.getContext('2d')

    const N = 22 // grid resolution
    const rand = mulberry32(313)
    // Base slope field (degrees). Two safe basins, hazardous ridges elsewhere.
    const field = []
    for (let y = 0; y < N; y++) {
      field[y] = []
      for (let x = 0; x < N; x++) {
        const d1 = Math.hypot(x - 6, y - 15)
        const d2 = Math.hypot(x - 15, y - 6)
        const basin = Math.max(0, 1 - Math.min(d1, d2) / 7)
        const ridge = Math.abs(Math.sin(x * 0.6) + Math.cos(y * 0.5))
        field[y][x] = (1 - basin) * 10 + ridge * 6 + rand() * 3
      }
    }

    const slopeColor = (s) => {
      if (s < 10) return [34, 197, 94] // green safe
      if (s < 12) return [245, 158, 11] // amber caution
      return [239, 68, 68] // red hazard
    }

    let raf
    let t0 = performance.now()
    const draw = (now) => {
      const t = (now - t0) / 1000
      ctx.fillStyle = '#080a10'
      ctx.fillRect(0, 0, W, H)

      const cw = W / N
      const ch = H / N
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const shimmer = Math.sin(t * 1.6 + x * 0.5 + y * 0.4) * 0.8
          const s = field[y][x] + shimmer
          const [r, g, b] = slopeColor(s)
          const elev = Math.max(0, 1 - s / 20)
          ctx.fillStyle = `rgba(${r},${g},${b},${0.18 + elev * 0.5})`
          ctx.fillRect(x * cw, y * ch, cw + 1, ch + 1)
        }
      }

      // mesh grid lines
      ctx.strokeStyle = 'rgba(120,140,180,0.14)'
      ctx.lineWidth = 1
      for (let i = 0; i <= N; i++) {
        ctx.beginPath()
        ctx.moveTo(i * cw, 0)
        ctx.lineTo(i * cw, H)
        ctx.moveTo(0, i * ch)
        ctx.lineTo(W, i * ch)
        ctx.stroke()
      }

      // highlight the safest basin with a target ring
      const bx = 15.5 * cw
      const by = 6.5 * ch
      const pulse = 1 + Math.sin(t * 2) * 0.12
      ctx.strokeStyle = 'rgba(34,211,238,0.9)'
      ctx.lineWidth = 2 * dpr
      ctx.beginPath()
      ctx.arc(bx, by, 26 * dpr * pulse, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = 'rgba(34,211,238,0.95)'
      ctx.font = `${11 * dpr}px "JetBrains Mono", monospace`
      ctx.fillText('LZ-01', bx + 30 * dpr, by)

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
