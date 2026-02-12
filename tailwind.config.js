/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
        'text-primary': '#111827',
        'text-secondary': '#6b7280',
        border: '#e5e7eb',
        error: '#991b1b',
        success: '#059669',
        warning: '#d97706',
      },
      fontFamily: {
        sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
