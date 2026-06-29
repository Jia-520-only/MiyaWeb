/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'oklch(0.97 0.02 calc(var(--hue) * 1))',
          100: 'oklch(0.92 0.04 calc(var(--hue) * 1))',
          200: 'oklch(0.86 0.07 calc(var(--hue) * 1))',
          300: 'oklch(0.78 0.10 calc(var(--hue) * 1))',
          400: 'oklch(0.70 var(--hue-sat) calc(var(--hue) * 1))',
          500: 'oklch(0.65 var(--hue-sat) calc(var(--hue) * 1))',
          600: 'oklch(0.55 var(--hue-sat) calc(var(--hue) * 1))',
          700: 'oklch(0.45 var(--hue-sat) calc(var(--hue) * 1))',
          800: 'oklch(0.35 var(--hue-sat) calc(var(--hue) * 1))',
          900: 'oklch(0.28 var(--hue-sat) calc(var(--hue) * 1))',
          950: 'oklch(0.20 calc(var(--hue-sat) * 0.5) calc(var(--hue) * 1))',
        },
        secondary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.65)',
          lightStrong: 'rgba(255, 255, 255, 0.82)',
          dark: 'rgba(30, 41, 59, 0.65)',
          darkStrong: 'rgba(30, 41, 59, 0.82)',
          border: 'rgba(255, 255, 255, 0.25)',
          borderDark: 'rgba(255, 255, 255, 0.08)',
        },
        cyber: {
          cyan: 'oklch(0.82 0.18 var(--hue))',
          teal: 'oklch(0.65 var(--hue-sat) var(--hue))',
          blue: '#3ba6d5',
          purple: '#7c3aed',
          pink: '#ff6b9d',
          gold: '#ffd700',
          red: '#f87171',
          green: '#4ade80',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)',
          overlay: 'var(--color-surface-dim)',
          border: 'var(--color-border-subtle)',
        },
        hud: {
          bg: 'var(--color-bg-deep)',
          surface: 'var(--color-surface)',
          border: 'var(--color-border-subtle)',
          glow: 'oklch(0.82 0.18 var(--hue) / 0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        serif: ['"Source Han Serif SC"', '"Songti SC"', '"Noto Serif SC"', '"SimSun"', '"STSong"', 'serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.1)',
        'cyber': '0 0 30px oklch(0.82 0.18 var(--hue) / 0.1)',
        'cyber-lg': '0 0 60px oklch(0.82 0.18 var(--hue) / 0.15)',
        'glow-cyan': '0 0 20px oklch(0.82 0.18 var(--hue) / 0.3)',
        'glow-teal': '0 0 20px oklch(0.65 var(--hue-sat) var(--hue) / 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'gloss-sweep': 'glossSweep 3s ease-in-out infinite',
        'dot-beat': 'dotBeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px oklch(0.82 0.18 var(--hue) / 0.1), 0 0 40px oklch(0.82 0.18 var(--hue) / 0.05)' },
          '50%': { boxShadow: '0 0 30px oklch(0.82 0.18 var(--hue) / 0.25), 0 0 60px oklch(0.82 0.18 var(--hue) / 0.1)' },
        },
        glossSweep: {
          '0%': { left: '-30%', opacity: '0' },
          '10%': { opacity: '1' },
          '40%': { left: '120%', opacity: '1' },
          '42%': { opacity: '0' },
          '100%': { left: '120%', opacity: '0' },
        },
        dotBeat: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.5)' },
        },
      },
    },
  },
  plugins: [],
}
