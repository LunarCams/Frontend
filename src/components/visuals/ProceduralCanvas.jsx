import { useRef, useEffect } from 'react'

// Deterministic RNG so every render of a given seed is pixel-identical.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Jet-ish colormap for IIRS false colour.
function jet(v) {
  const r = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * v - 3)))
  const g = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * v - 2)))
  const b = Math.max(0, Math.min(1, 1.5 - Math.abs(4 * v - 1)))
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

/**
 * A single <canvas> that draws one of several procedural lunar visuals.
 * kind: 'lunar' | 'topo' | 'heatmap' | 'fused'
 */
export default function ProceduralCanvas({ kind = 'lunar', seed = 1, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = (canvas.width = canvas.clientWidth * dpr)
    const H = (canvas.height = canvas.clientHeight * dpr)
    const ctx = canvas.getContext('2d')
    const rand = mulberry32(seed)

    if (kind === 'heatmap') {
      // False-colour thermal/mineral field via smooth value noise.
      const cells = 26
      const grid = []
      for (let y = 0; y <= cells; y++) {
        grid[y] = []
        for (let x = 0; x <= cells; x++) grid[y][x] = rand()
      }
      const img = ctx.createImageData(W, H)
      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const gx = (px / W) * cells
          const gy = (py / H) * cells
          const x0 = Math.floor(gx),
            y0 = Math.floor(gy)
          const fx = gx - x0,
            fy = gy - y0
          const a = grid[y0][x0],
            b = grid[y0][x0 + 1]
          const c = grid[y0 + 1][x0],
            d = grid[y0 + 1][x0 + 1]
          const top = a + (b - a) * fx
          const bot = c + (d - c) * fx
          let v = top + (bot - top) * fy
          v = Math.max(0, Math.min(1, v * 1.1))
          const [r, g, bl] = jet(v)
          const i = (py * W + px) * 4
          img.data[i] = r
          img.data[i + 1] = g
          img.data[i + 2] = bl
          img.data[i + 3] = 255
        }
      }
      ctx.putImageData(img, 0, 0)
      return
    }

    // --- base regolith gradient for lunar/topo/fused --------------------------
    const base = kind === 'topo' ? 46 : 62
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, `rgb(${base + 18},${base + 18},${base + 22})`)
    g.addColorStop(1, `rgb(${base - 20},${base - 18},${base - 12})`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    // speckle noise (regolith texture)
    const speck = ctx.createImageData(W, H)
    for (let i = 0; i < speck.data.length; i += 4) {
      const n = (rand() - 0.5) * 46
      speck.data[i] = speck.data[i + 1] = speck.data[i + 2] = 128 + n
      speck.data[i + 3] = 26
    }
    ctx.putImageData(speck, 0, 0)
    ctx.globalCompositeOperation = 'overlay'
    ctx.drawImage(canvas, 0, 0)
    ctx.globalCompositeOperation = 'source-over'

    const sunAngle = kind === 'topo' ? 2.4 : 0.9 // light direction for shading

    // craters
    const craterCount = kind === 'topo' ? 10 : 26
    for (let i = 0; i < craterCount; i++) {
      const cx = rand() * W
      const cy = rand() * H
      const r = (kind === 'topo' ? 22 : 8) * dpr + rand() * 34 * dpr
      // shadowed rim
      const rg = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r)
      rg.addColorStop(0, 'rgba(20,20,26,0.55)')
      rg.addColorStop(0.7, 'rgba(30,30,36,0.25)')
      rg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = rg
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
      // sun-lit crescent
      ctx.strokeStyle = 'rgba(230,230,235,0.35)'
      ctx.lineWidth = 1.4 * dpr
      ctx.beginPath()
      ctx.arc(cx + Math.cos(sunAngle) * r * 0.25, cy + Math.sin(sunAngle) * r * 0.25, r * 0.82, sunAngle - 1, sunAngle + 1)
      ctx.stroke()
    }

    // boulders (bright specks with cast shadow) — mostly for OHRC
    if (kind === 'lunar' || kind === 'fused') {
      for (let i = 0; i < 60; i++) {
        const bx = rand() * W
        const by = rand() * H
        const br = 1 * dpr + rand() * 2.4 * dpr
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.ellipse(bx + br, by + br, br * 1.6, br, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(220,220,228,0.85)'
        ctx.beginPath()
        ctx.arc(bx, by, br, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // topo contour lines for TMC-2
    if (kind === 'topo') {
      ctx.strokeStyle = 'rgba(120,170,220,0.28)'
      ctx.lineWidth = 1 * dpr
      for (let k = 0; k < 9; k++) {
        ctx.beginPath()
        const yBase = (k / 9) * H
        for (let x = 0; x <= W; x += 6 * dpr) {
          const y = yBase + Math.sin(x / (70 * dpr) + k) * 18 * dpr + Math.sin(x / (23 * dpr)) * 6 * dpr
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    }

    // fused view: tie-point crosshairs + faint magenta ghost of a second frame
    if (kind === 'fused') {
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = 'rgba(80,0,60,0.18)'
      ctx.fillRect(3 * dpr, 3 * dpr, W, H) // registration ghost offset
      ctx.globalCompositeOperation = 'source-over'

      const pts = []
      for (let i = 0; i < 14; i++) pts.push([rand() * W, rand() * H])
      // connecting lines
      ctx.strokeStyle = 'rgba(34,211,238,0.5)'
      ctx.lineWidth = 1 * dpr
      for (const [x, y] of pts) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + (rand() - 0.5) * 3 * dpr, y + (rand() - 0.5) * 3 * dpr)
        ctx.stroke()
        // crosshair
        ctx.strokeStyle = 'rgba(34,211,238,0.9)'
        ctx.beginPath()
        ctx.moveTo(x - 6 * dpr, y)
        ctx.lineTo(x + 6 * dpr, y)
        ctx.moveTo(x, y - 6 * dpr)
        ctx.lineTo(x, y + 6 * dpr)
        ctx.stroke()
        ctx.strokeStyle = 'rgba(34,211,238,0.5)'
      }
    }

    // vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.75)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, W, H)
  }, [kind, seed])

  return <canvas ref={ref} className={className} />
}
