# SIH26166 · Chandrayaan-2 Autonomous Landing Site Selector — V1

Multi-Modal Lunar Image Registration, Autonomous Hazard Assessment & Human-in-the-Loop
Landing Site Selector — the earth-facing part of LunarCams. This is the **V1 showcase
webpage**: every value is hardcoded per the PRD / Module-1 Mock Spec, standing in for the
ML inference pipeline that lands in V2.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle -> dist/
```

## What's on the page

1. **Hero / Mission Profile** — mission framing + animated boot log.
2. **Module 1 — Multi-Modal Ingestion** (`#ingestion`)
   - 4-panel sensor grid: OHRC (0.25 m/px), TMC-2 (5 m/px), IIRS (80 m/px false-colour),
     Fused Homography — each with hardcoded telemetry, all visuals procedurally drawn on `<canvas>`.
   - Solar Geometry & Scale-Invariance normalization panel.
3. **Module 2 — Live Descent Grid** (`#descent`)
   - Simulated 30 FPS LDI feed with optical-flow overlay + jittering velocity/altitude.
   - Dynamic DEM hazard mesh (green/amber/red slope colour-coding, live safe-area %).
4. **Decision Pipeline** (`#pipeline`) — the interactive core:
   - **Step 1** 108 tiles scored (< 2.5 s) → Top 15 highlighted.
   - **Step 2** HITL: operator selects 5 candidates.
   - **Step 3** shadow-invariant re-scoring → Top 3 with landing ellipses.
   - **Step 4** Flight-director passkey auth → descent trajectory → touchdown → rover deploy.
     Demo passkey: **2199**.

## Where the real ML plugs in (V2)

All mock data + the scoring/refinement functions live in `src/data/mockData.js`.
Swap `generateTiles()`, `refineTop3()`, and the sensor telemetry for live model output;
the UI is already wired to consume the same shapes.

## Stack

React 18 · Vite 5 · Tailwind CSS 3. No backend, no external image assets.
