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
        navy: {
          900: '#0a1628',
          800: '#0f2145',
          700: '#142d5e',
        },
        gov: {
          navy: '#112e51',
          'navy-dark': '#0a1c33',
          'navy-light': '#1b3f73',
          saffron: '#FF9933',
          'saffron-dark': '#d97706',
          green: '#138808',
          'green-dark': '#15803d',
          ashoka: '#000080',
          paper: '#f8f9fa',
          border: '#cbd5e1',
        },
        accent: {
          teal: '#0d9488',
        }
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.06)',
        'card-lg': '0 8px 40px rgba(0,0,0,0.08)',
        'glow-teal': '0 0 24px rgba(13,148,136,0.15)',
        'glow-amber': '0 0 24px rgba(245,158,11,0.15)',
        'glow-blue': '0 0 24px rgba(59,130,246,0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(13,148,136,0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(13,148,136,0.4)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in-scale': 'fade-in-scale 0.5s ease-out forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
