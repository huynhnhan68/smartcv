/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'border-l-blue-400',
    'border-l-purple-400',
    'border-l-amber-400',
    'border-l-green-400',
    'border-l-red-400',
    'border-l-gray-300',
    'border-l-gray-500',
    'dark:border-l-blue-400',
    'dark:border-l-purple-400',
    'dark:border-l-amber-400',
    'dark:border-l-green-400',
    'dark:border-l-red-400',
    'dark:border-l-gray-300',
    'dark:border-l-gray-500',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          600: '#2563eb',
          800: '#1e40af',
        },
      },
      fontFamily: {
        // App UI font - unchanged
        sans: ['Inter', 'system-ui', 'sans-serif'],
        syne: ['Syne', 'system-ui', 'sans-serif'],
        dm: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
