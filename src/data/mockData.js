// ============================================================================
// SIH26166 — Hardcoded mock data (V1 showcase).
// Every value here is either taken directly from the PRD / Module-1 Mock Spec
// or generated deterministically to stand in for the ML pipeline that lands
// in a later version. Kept in one file so the "wiring points" for the real
// models are obvious.
// ============================================================================

export const MISSION = {
  id: 'SIH26166',
  name: 'CHANDRAYAAN-2 · AUTONOMOUS LANDING SITE SELECTOR',
  vehicle: 'VIKRAM-NG LANDER / PRAGYAN-II ROVER',
  targetRegion: 'South Polar Highlands · 70.9°S 22.8°E',
  orbit: 'LLO 100 × 100 km',
  phase: 'PRE-DESCENT SITE EVALUATION',
}

// --- Module 1 : four sensor panels (values from Mock Spec §1) ---------------
export const SENSORS = [
  {
    id: 'ohrc',
    panel: 'A',
    name: 'OHRC',
    fullName: 'Orbital High Resolution Camera',
    visual: 'lunar', // procedural renderer key
    accent: '#e2e8f0',
    telemetry: [
      { k: 'Resolution / GSD', v: '0.25 m/pixel' },
      { k: 'Spectrum', v: 'Panchromatic Optical' },
      { k: 'Features', v: '42 Micro-Boulders · 8 Minor Impact Craters' },
    ],
    footer: 'Detects micro-boulders, small impact craters & fine surface hazards.',
  },
  {
    id: 'tmc2',
    panel: 'B',
    name: 'TMC-2',
    fullName: 'Terrain Mapping Camera',
    visual: 'topo',
    accent: '#a3b8d8',
    telemetry: [
      { k: 'Resolution / GSD', v: '5.0 m/pixel' },
      { k: 'Spectrum', v: 'Stereo Triplet / Panchromatic' },
      { k: 'Slope Profile', v: 'Mean 4.8° · Max 11.2°' },
    ],
    footer: 'Regional topography, slope profiles & elevation geometry.',
  },
  {
    id: 'iirs',
    panel: 'C',
    name: 'IIRS',
    fullName: 'Imaging Infrared Spectrometer',
    visual: 'heatmap',
    accent: '#fb923c',
    telemetry: [
      { k: 'Resolution / GSD', v: '80.0 m/pixel' },
      { k: 'Spectrum', v: 'SWIR / MWIR (0.8–5.0 µm)' },
      { k: 'Surface State', v: 'Thermal Inertia 0.88 · Ilmenite: Medium' },
    ],
    footer: 'Mineral composition, reflectance & thermal-stability maps.',
  },
  {
    id: 'fused',
    panel: 'D',
    name: 'FUSED',
    fullName: 'Final Processed View · Homography',
    visual: 'fused',
    accent: '#22d3ee',
    telemetry: [
      { k: 'Status', v: 'ALIGNED (Homography Computed)' },
      { k: 'Inlier Matches', v: '148 Verified Tie-Points' },
      { k: 'Registration Error', v: 'RMSE = 0.42 px' },
    ],
    footer: 'Scale-invariant, illumination-robust fusion with tie-point crosshairs.',
  },
]

// --- Module 1 : Solar geometry & scale-invariance (Mock Spec §2) ------------
export const SOLAR_GEOMETRY = [
  {
    param: 'Base Image Solar Elevation',
    value: '42.5°',
    tag: 'High Solar Altitude',
    purpose: 'Reference template with standard shadows.',
  },
  {
    param: 'Query Image Solar Elevation',
    value: '16.8°',
    tag: 'Low Solar Altitude',
    purpose: 'Severe illumination & shadow distortion.',
  },
  {
    param: 'Illumination Normalization',
    value: 'Phase-Congruency',
    tag: 'Filter Applied',
    purpose: 'Proves shadow-invariant structural alignment.',
  },
  {
    param: 'Cross-Sensor Scale Ratio',
    value: '1 : 16.0 · 1 : 266.7',
    tag: 'TMC/OHRC · IIRS/OHRC',
    purpose: 'Multi-scale feature-pyramid capability.',
  },
]

// --- Module 2 : live streaming grid (Mock Spec §3) --------------------------
export const LIVE_FEEDS = {
  ldi: {
    name: 'Lander Descent Imager (LDI)',
    status: 'STREAMING',
    fps: 30,
    velocity: -1.4, // m/s
  },
  dem: {
    name: 'Dynamic DEM Hazard Map',
    hazardMode: 'ACTIVE',
    safeArea: 87.4, // %
    safeThreshold: 10, // deg (green)
    hazardThreshold: 12, // deg (red)
  },
}

// --- Decision pipeline hazard parameters (PRD §3 Step 1) --------------------
export const HAZARD_PARAMS = [
  { key: 'slope', label: 'Slope Gradient', unit: '°', threshold: '< 12°', weight: 0.32 },
  { key: 'boulder', label: 'Boulder Density', unit: '/100m²', threshold: 'low', weight: 0.26 },
  { key: 'shadow', label: 'Shadow Penetration', unit: '%', threshold: 'low', weight: 0.22 },
  { key: 'thermal', label: 'Thermal Stability', unit: 'TI', threshold: 'high', weight: 0.2 },
]

// Deterministic pseudo-random so the demo is identical on every reload.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const GRID_COLS = 12
const GRID_ROWS = 9 // 108 tiles => "100+"

// Generate the full tile field the DL/CV engine "scored".
export function generateTiles() {
  const rand = mulberry32(26166)
  const tiles = []
  for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
    const row = Math.floor(i / GRID_COLS)
    const col = i % GRID_COLS

    // Sculpt a plausible safety field: a couple of "good basins".
    const d1 = Math.hypot(col - 3, row - 6)
    const d2 = Math.hypot(col - 9, row - 2)
    const basin = Math.max(0, 1 - Math.min(d1, d2) / 6)
    const noise = rand()

    const slope = +(2 + (1 - basin) * 16 + noise * 4).toFixed(1) // deg
    const boulder = +((1 - basin) * 40 + noise * 20).toFixed(0) // per 100m^2
    const shadow = +((1 - basin) * 55 + noise * 25).toFixed(0) // %
    const thermal = +(0.55 + basin * 0.4 + noise * 0.05).toFixed(2) // TI

    // Safety score 0-100 (higher is safer).
    const slopeScore = Math.max(0, 1 - slope / 20)
    const boulderScore = Math.max(0, 1 - boulder / 60)
    const shadowScore = Math.max(0, 1 - shadow / 80)
    const thermalScore = Math.min(1, thermal)
    const score = Math.round(
      (slopeScore * 0.32 + boulderScore * 0.26 + shadowScore * 0.22 + thermalScore * 0.2) * 100,
    )

    tiles.push({
      id: `T-${String(i + 1).padStart(3, '0')}`,
      row,
      col,
      score,
      slope,
      boulder,
      shadow,
      thermal,
      // grid-cell centre expressed as a mock selenographic coord
      lat: +(70.2 + row * 0.11).toFixed(3),
      lon: +(22.1 + col * 0.09).toFixed(3),
    })
  }
  return tiles
}

export const ALL_TILES = generateTiles()

export const TOP15 = [...ALL_TILES]
  .sort((a, b) => b.score - a.score)
  .slice(0, 15)
  .map((t, i) => ({ ...t, rank: i + 1 }))

// Step 3 re-scoring nudges the score slightly (shadow-invariant re-scoring).
export function refineTop3(selectedFive) {
  return [...selectedFive]
    .map((t) => {
      const rescored = Math.min(100, t.score + Math.round((t.thermal - 0.7) * 10) + 2)
      return {
        ...t,
        rescored,
        ellipse: {
          semiMajor: +(90 + (100 - rescored) * 2).toFixed(0), // m
          semiMinor: +(60 + (100 - rescored) * 1.4).toFixed(0), // m
          confidence: Math.min(99.9, 90 + rescored / 12).toFixed(1),
        },
      }
    })
    .sort((a, b) => b.rescored - a.rescored)
    .slice(0, 3)
    .map((t, i) => ({ ...t, finalRank: i + 1 }))
}

// --- Step 4 : authorization -------------------------------------------------
export const AUTH = {
  passkey: '2199', // demo passkey shown in a hint
  directorId: 'FD-01 · S. IYER',
  clearance: 'ALPHA-OMEGA',
}

export const DESCENT_PHASES = [
  { t: 'ROUGH BRAKING', d: 'Retro-burn · 1680 → 146 m/s' },
  { t: 'ATTITUDE HOLD', d: 'Vehicle re-orientation to vertical' },
  { t: 'FINE BRAKING', d: 'Hazard cam active · 146 → 60 m/s' },
  { t: 'TERMINAL DESCENT', d: 'Vertical descent · optical flow lock' },
  { t: 'TOUCHDOWN', d: 'Contact confirmed · engines cut-off' },
]

// Faux-terminal boot log lines used across the app.
export const BOOT_LOG = [
  'ISAC-DSN handshake … OK',
  'OHRC / TMC-2 / IIRS payload sync … OK',
  'Illumination normalization kernel … LOADED',
  'Homography solver (RANSAC) … READY',
  'Hazard scoring net … STANDBY (mock)',
  'HITL console … ONLINE',
]
