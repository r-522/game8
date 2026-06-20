import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kenka: {
          black: '#0a0a0a',
          gold: '#c8a84b',
          crimson: '#8b1a1a',
          red: '#cc2200',
          ink: '#1a0505',
          rust: '#7a3b2e',
          steel: '#3d3d3d',
          ash: '#2a2a2a',
          paper: '#e8dcc8',
          neon: '#ff4400',
        },
      },
      fontFamily: {
        kenka: ['var(--font-kenka)', 'serif'],
        gothic: ['var(--font-gothic)', 'sans-serif'],
      },
      animation: {
        'flash-in': 'flashIn 0.1s ease-out',
        'shake': 'shake 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'punch-in': 'punchIn 0.15s ease-out',
        'komachi': 'komachi 0.5s ease-out',
      },
      keyframes: {
        flashIn: {
          '0%': { opacity: '0', transform: 'scale(1.5)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        punchIn: {
          '0%': { opacity: '0', transform: 'scale(2) rotate(-5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        komachi: {
          '0%': { opacity: '0', transform: 'scaleX(0)' },
          '50%': { opacity: '1', transform: 'scaleX(1.05)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
