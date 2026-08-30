/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Mission-control deep-space palette
        space: {
          950: '#05070d',
          900: '#0a0e18',
          850: '#0d1220',
          800: '#111726',
          700: '#1a2236',
          600: '#26304a',
          500: '#3a4a6e',
        },
        panel: '#0e1420',
        edge: '#1e2740',
        // Accents
        cyan: {
          glow: '#22d3ee',
        },
        amber: {
          glow: '#fbbf24',
        },
        safe: '#22c55e',
        caution: '#f59e0b',
        hazard: '#ef4444',
        isro: '#ff7a1a',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"Orbitron"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(34, 211, 238, 0.25)',
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-hazard': '0 0 20px rgba(239, 68, 68, 0.35)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.6' },
          '94%': { opacity: '1' },
        },
      },
      animation: {
        scan: 'scan 4s linear infinite',
        pulseDot: 'pulseDot 1.4s ease-in-out infinite',
        sweep: 'sweep 6s linear infinite',
        flicker: 'flicker 6s linear infinite',
      },
    },
  },
  plugins: [],
}
