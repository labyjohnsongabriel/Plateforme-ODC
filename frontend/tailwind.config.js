/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        odc: {
          // Couleurs principales ODC
          primary: '#FF7900',
          'primary-dark': '#E65100',
          'primary-light': '#FFB74D',
          'primary-soft': '#FFE0B2',

          // Light theme
          'bg-light': '#FFF8F2',
          'surface-light': '#FFFFFF',
          'surface-alt-light': '#F5F5F5',
          'text-light': '#1A1A1A',
          'text-muted-light': '#6B6B6B',
          'border-light': '#E0E0E0',

          // Dark theme
          'bg-dark': '#0F0F0F',
          'surface-dark': '#1A1A1A',
          'surface-alt-dark': '#242424',
          'text-dark': '#F5F5F5',
          'text-muted-dark': '#A0A0A0',
          'border-dark': '#333333',

          // États
          success: '#2E7D32',
          'success-bg': '#E8F5E9',
          warning: '#F57C00',
          'warning-bg': '#FFF3E0',
          error: '#C62828',
          'error-bg': '#FFEBEE',
          info: '#0277BD',
          'info-bg': '#E1F5FE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'odc-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'odc-md': '0 4px 6px rgba(255, 121, 0, 0.08)',
        'odc-lg': '0 10px 25px rgba(255, 121, 0, 0.12)',
        'odc-dark': '0 4px 6px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'odc': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};