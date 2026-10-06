import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx}',
    './src/pages/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1400px' },
    },
    extend: {
      // ======================================================================
      // COULEURS
      // ======================================================================
      colors: {
        odc: {
          50: '#FFF8F2', 100: '#FFE9D6', 200: '#FFCFA8', 300: '#FFB075',
          400: '#FF9548', 500: '#FF7900', 600: '#E66D00', 700: '#BF5B00',
          800: '#994900', 900: '#7A3B00', 950: '#4A2200',
          primary: 'var(--odc-primary)',
          'primary-dark': 'var(--odc-primary-dark)',
          'primary-light': 'var(--odc-primary-light)',
          'primary-soft': 'var(--odc-primary-soft)',
          background: 'var(--odc-background)',
          surface: 'var(--odc-surface)',
          'surface-alt': 'var(--odc-surface-alt)',
          elevated: 'var(--odc-elevated)',
          'text-primary': 'var(--odc-text-primary)',
          'text-secondary': 'var(--odc-text-secondary)',
          'text-muted': 'var(--odc-text-muted)',
          'text-inverse': 'var(--odc-text-inverse)',
          border: 'var(--odc-border)',
          'border-light': 'var(--odc-border-light)',
          'border-strong': 'var(--odc-border-strong)',
          success: 'var(--odc-success)',
          'success-bg': 'var(--odc-success-bg)',
          warning: 'var(--odc-warning)',
          'warning-bg': 'var(--odc-warning-bg)',
          error: 'var(--odc-error)',
          'error-bg': 'var(--odc-error-bg)',
          info: 'var(--odc-info)',
          'info-bg': 'var(--odc-info-bg)',
          purple: 'var(--odc-purple)',
          'purple-bg': 'var(--odc-purple-bg)',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // ======================================================================
      // TYPOGRAPHIE
      // ======================================================================
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-ubuntu)', 'Ubuntu', 'Inter', 'sans-serif'],
        heading: ['var(--font-ubuntu)', 'Ubuntu', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },

      // ======================================================================
      // RAYONS
      // ======================================================================
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        odc: '12px',
      },

      // ======================================================================
      // OMBRES
      // ======================================================================
      boxShadow: {
        'odc-sm': 'var(--odc-shadow-sm)',
        'odc-md': 'var(--odc-shadow-md)',
        'odc-lg': 'var(--odc-shadow-lg)',
        'odc-xl': 'var(--odc-shadow-xl)',
        'odc-focus': 'var(--odc-shadow-focus)',
      },

      // ======================================================================
      // KEYFRAMES
      // ======================================================================
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%, 100%': {
            boxShadow:
              '0 0 5px rgba(255,121,0,0.5), 0 0 10px rgba(255,121,0,0.3)',
          },
          '50%': {
            boxShadow:
              '0 0 20px rgba(255,121,0,0.8), 0 0 30px rgba(255,121,0,0.5)',
          },
        },
      },

      // ======================================================================
      // ANIMATIONS
      // ======================================================================
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.4s ease-out',
        'slide-in-down': 'slide-in-down 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },

      // ======================================================================
      // Z-INDEX
      // ======================================================================
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
        toast: '1080',
      },

      // ======================================================================
      // TRANSITIONS
      // ======================================================================
      transitionTimingFunction: {
        odc: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'odc-fast': '150ms',
        'odc-base': '200ms',
        'odc-slow': '300ms',
        'odc-slower': '500ms',
      },

      // ======================================================================
      // BACKGROUNDS
      // ======================================================================
      backgroundImage: {
        'gradient-odc':
          'linear-gradient(135deg, #FF7900 0%, #E65100 100%)',
        'gradient-odc-soft':
          'linear-gradient(135deg, #FFF8F2 0%, #FFE0B2 100%)',
        'gradient-radial':
          'radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent 50%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;