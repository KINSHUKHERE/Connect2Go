/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#22C55E', // Primary Brand Green
          600: '#16A34A', // Hover Green
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        canvas: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E2E8F0',
        dark: {
          text: '#0F172A',
          muted: '#475569',
          faint: '#94A3B8'
        },
        accent: {
          amber: '#F59E0B',
          pink: '#EC4899',
          red: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '10px',
        'md': '14px',
        'lg': '20px',
        'xl': '28px',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(15, 23, 42, 0.06)',
        'soft-hover': '0 14px 36px rgba(34, 197, 94, 0.12)',
      }
    },
  },
  plugins: [],
}
