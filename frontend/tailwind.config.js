/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        // Clé plate : @apply bg-surface-muted et classes JSX (évite les soucis avec surface.muted imbriqué)
        'surface-muted': '#F5F5F7',
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        brand: {
          lime: '#D6FF79',
          limeSoft: '#E2FF7D',
          lavender: '#D6C6F2',
          lavenderDeep: '#D8BFFF',
          accentPink: '#E879A9',
        },
      },
    },
  },
  plugins: [],
}
