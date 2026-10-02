/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#07090E',
        midnight: '#0D1424',
        abyss: '#090F1C',
        antiqueGold: '#C89F56',
        brightGold: '#E8C77E',
        candleAmber: '#F59E0B',
        waxCrimson: '#991B1B',
        moonlitSilver: '#94A3B8',
        parchment: {
          light: '#F8F3E8',
          base: '#F4EBD9',
          aged: '#E5D5BE',
          deep: '#D1BC9D'
        },
        ink: '#1A130E',
        inkMuted: '#5C4838'
      },
      fontFamily: {
        cinzel: ['"Cinzel"', 'serif'],
        'cinzel-dec': ['"Cinzel Decorative"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'rune-glow': '0 0 25px rgba(200, 159, 86, 0.35)',
        'amber-glow': '0 0 35px rgba(245, 158, 11, 0.4)',
        'cyan-glow': '0 0 30px rgba(56, 189, 248, 0.35)',
        'manuscript': '0 25px 60px rgba(0, 0, 0, 0.85), inset 0 0 50px rgba(110, 75, 35, 0.25)',
      },
      animation: {
        'flame-flicker': 'candlePulse1 3.2s infinite ease-in-out',
        'flame-flicker-2': 'candlePulse2 2.7s infinite ease-in-out',
        'subtle-drift': 'subtleDrift 14s infinite ease-in-out',
        'world-breathe': 'worldBreathe 10s infinite ease-in-out',
        'spin-slow': 'spin 45s linear infinite',
        'spin-reverse-slow': 'spinReverse 35s linear infinite',
      },
      keyframes: {
        candlePulse1: {
          '0%, 100%': { opacity: '0.85', transform: 'scale(1) translate(-50%, -50%)' },
          '25%': { opacity: '0.65', transform: 'scale(0.96) translate(-51%, -49%)' },
          '50%': { opacity: '0.98', transform: 'scale(1.04) translate(-49%, -52%)' },
          '75%': { opacity: '0.72', transform: 'scale(0.98) translate(-50%, -50%)' },
        },
        candlePulse2: {
          '0%, 100%': { opacity: '0.75', transform: 'scale(1.02) translate(-50%, -50%)' },
          '33%': { opacity: '0.95', transform: 'scale(1.08) translate(-48%, -51%)' },
          '66%': { opacity: '0.6', transform: 'scale(0.94) translate(-52%, -48%)' },
        },
        subtleDrift: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        worldBreathe: {
          '0%, 100%': { opacity: '0.94' },
          '50%': { opacity: '1.0' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
};