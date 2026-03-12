/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#06080f',
          800: '#0a0f1e',
          700: '#0d1526',
          600: '#111b30',
          500: '#1a2540',
        },
        brand: {
          blue: '#1a73e8',
          cyan: '#00b4d8',
          green: '#00e676',
          red: '#ff1744',
          yellow: '#ffd740',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter var', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-green': 'pulseGreen 1s ease-in-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGreen: { '0%, 100%': { color: '#00e676' }, '50%': { color: '#69f0ae' } },
      },
    },
  },
  plugins: [],
};
