/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
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
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
      red: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      blue: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
      },
    },
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      serif: 'ui-serif, Georgia, serif',
      mono: 'ui-monospace, SFMono-Regular, monospace',
    },
    extend: {
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
}
