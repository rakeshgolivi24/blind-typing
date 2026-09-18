/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f7c5cc',
          300: '#f094a3',
          400: '#e0526b',
          500: '#c72445',
          600: '#a51535',
          700: '#800020',
          800: '#66001a',
          900: '#4a0413',
          950: '#2b020b',
        },
        wine: {
          dark: '#170307',
          darker: '#0e0103',
          card: '#22040b',
          cardHover: '#2d050f',
          border: '#530b18',
          borderGlow: '#800020',
        },
        gold: {
          300: '#fde68a',
          400: '#facc15',
          500: '#eab308',
          accent: '#d4af37',
        }
      },
      boxShadow: {
        'burgundy': '0 0 25px -5px rgba(128, 0, 32, 0.45)',
        'burgundy-lg': '0 0 40px -5px rgba(165, 21, 53, 0.55)',
        'gold': '0 0 20px -3px rgba(212, 175, 55, 0.35)',
      },
      fontFamily: {
        mono: ['Fira Code', 'Courier New', 'monospace'],
        display: ['Cinzel', 'Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
