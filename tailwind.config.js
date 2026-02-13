/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b1a1a',
          dark: '#6b1414',
          light: '#a52222',
        },
        secondary: '#f9fafb',
        text: {
          primary: '#111827',
          secondary: '#6b7280',
        },
        border: '#e5e7eb',
        error: '#991b1b',
        success: '#059669',
        warning: '#d97706',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        'container-sm': '1rem',
        'container-md': '1.5rem',
        'container-lg': '2rem',
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideInLeft: 'slideInLeft 0.6s ease-out',
        slideInRight: 'slideInRight 0.6s ease-out',
        scaleUp: 'scaleUp 0.6s ease-out',
        pulse: 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'hover-sm': '0 6px 12px rgba(0, 0, 0, 0.15)',
        'hover-md': '0 12px 24px rgba(139, 26, 26, 0.25)',
        'hover-lg': '0 20px 40px rgba(0, 0, 0, 0.15)',
        'hover-xl': '0 15px 30px rgba(139, 26, 26, 0.35)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
