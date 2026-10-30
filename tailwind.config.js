/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef3fb',
          100: '#dbe5f5',
          200: '#b5c9ea',
          300: '#82a2d6',
          400: '#4f78bd',
          500: '#245a9f',
          600: '#0b4486',
          700: '#012e69',
          800: '#01265a',
          900: '#011a40',
        },
        cream: { 50: '#fbf8f0', 100: '#f6f1e4', 200: '#ece4cf', 300: '#dcd1b4' },
        gold: { 400: '#d9b44a', 500: '#c9a227', 600: '#a8851a' },
        ink: '#14202e',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
