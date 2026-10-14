import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/* ============================================================================
 * ODC FORMATIONS — Configuration Tailwind CSS
 * Version : 2.0.0
 * ----------------------------------------------------------------------------
 * Aligné sur les design tokens définis dans `src/styles/root.css`
 * Extension complète : couleurs, typographie, ombres, animations, z-index
 * ========================================================================== */

const config: Config = {
  /* --------------------------------------------------------------------------
   * Mode sombre — basé sur une classe `.dark` sur <html>
   * ------------------------------------------------------------------------ */
  darkMode: ['class'],

  /* --------------------------------------------------------------------------
   * Fichiers scannés par Tailwind
   * ------------------------------------------------------------------------ */
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx}',
    './src/pages/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/layouts/**/*.{ts,tsx}',
  ],

  /* --------------------------------------------------------------------------
   * Préfixe (laisser vide sauf conflit avec une autre lib)
   * ------------------------------------------------------------------------ */
  prefix: '',

  /* --------------------------------------------------------------------------
   * Désactive les couleurs par défaut trop larges (on garde les nôtres)
   * ------------------------------------------------------------------------ */
  theme: {
    /* ========================================================================
     * CONTAINER
     * ====================================================================== */
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },

    /* ========================================================================
     * ÉCRANS RESPONSIVE — Breakpoints standard
     * ====================================================================== */
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1720px',
    },

    extend: {
      /* ======================================================================
       * COULEURS
       * ==================================================================== */
      colors: {
        /* --------------------------------------------------------------------
         * Palette ODC — 50 → 950 (couleur signature #FF7900)
         * ------------------------------------------------------------------ */
        odc: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF7900',   /* Signature ODC */
          600: '#EA6A00',
          700: '#C25400',
          800: '#9A4300',
          900: '#7C3600',
          950: '#431A00',

          /* Alias sémantiques */
          primary:         'var(--odc-primary)',
          'primary-hover': 'var(--odc-primary-hover)',
          'primary-active':'var(--odc-primary-active)',
          'primary-dark':  'var(--odc-primary-dark)',
          'primary-light': 'var(--odc-primary-light)',
          'primary-soft':  'var(--odc-primary-soft)',
          'primary-softer':'var(--odc-primary-softer)',

          /* Surfaces */
          background:     'var(--odc-background)',
          surface:        'var(--odc-surface)',
          'surface-alt':  'var(--odc-surface-alt)',
          'surface-hover':'var(--odc-surface-hover)',
          elevated:       'var(--odc-elevated)',

          /* Textes */
          'text-primary':   'var(--odc-text-primary)',
          'text-secondary': 'var(--odc-text-secondary)',
          'text-tertiary':  'var(--odc-text-tertiary)',
          'text-muted':     'var(--odc-text-muted)',
          'text-inverse':   'var(--odc-text-inverse)',

          /* Bordures */
          border:         'var(--odc-border)',
          'border-light': 'var(--odc-border-light)',
          'border-strong':'var(--odc-border-strong)',

          /* États */
          success:        'var(--odc-success)',
          'success-dark': 'var(--odc-success-dark)',
          'success-soft': 'var(--odc-success-soft)',
          'success-bg':   'var(--odc-success-bg)',

          warning:        'var(--odc-warning)',
          'warning-dark': 'var(--odc-warning-dark)',
          'warning-soft': 'var(--odc-warning-soft)',
          'warning-bg':   'var(--odc-warning-bg)',

          error:        'var(--odc-error)',
          'error-dark': 'var(--odc-error-dark)',
          'error-soft': 'var(--odc-error-soft)',
          'error-bg':   'var(--odc-error-bg)',

          info:        'var(--odc-info)',
          'info-dark': 'var(--odc-info-dark)',
          'info-soft': 'var(--odc-info-soft)',
          'info-bg':   'var(--odc-info-bg)',

          purple:        'var(--odc-purple)',
          'purple-soft': 'var(--odc-purple-soft)',
          'purple-bg':   'var(--odc-purple-bg)',

          pink:        'var(--odc-pink)',
          'pink-soft': 'var(--odc-pink-soft)',
        },

        /* --------------------------------------------------------------------
         * Mapping shadcn/ui (HSL)
         * ------------------------------------------------------------------ */
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',

        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* --------------------------------------------------------------------
         * Couleurs neutres raccourcies (accès rapide)
         * ------------------------------------------------------------------ */
        ink: {
          DEFAULT: '#111827',
          soft:    '#374151',
          muted:   '#6B7280',
          subtle:  '#9CA3AF',
        },
      },

      /* ======================================================================
       * TYPOGRAPHIE
       * ==================================================================== */
      fontFamily: {
        sans:    ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-ubuntu)', 'Ubuntu', 'Inter', 'sans-serif'],
        heading: ['var(--font-ubuntu)', 'Ubuntu', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },

      fontSize: {
        /* [taille, { lineHeight, letterSpacing }] */
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],       /* 10px */
        xs:    ['0.75rem',  { lineHeight: '1rem' }],           /* 12px */
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],        /* 14px */
        base:  ['1rem',     { lineHeight: '1.5rem' }],         /* 16px */
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],        /* 18px */
        xl:    ['1.25rem',  { lineHeight: '1.75rem' }],        /* 20px */
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],           /* 24px */
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],        /* 30px */
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],         /* 36px */
        '5xl': ['3rem',     { lineHeight: '1' }],              /* 48px */
        '6xl': ['3.75rem',  { lineHeight: '1' }],              /* 60px */
        '7xl': ['4.5rem',   { lineHeight: '1' }],              /* 72px */
        '8xl': ['6rem',     { lineHeight: '1' }],              /* 96px */
      },

      fontWeight: {
        normal:   '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
        black:    '900',
      },

      letterSpacing: {
        tighter: '-0.05em',
        tight:   '-0.025em',
        normal:  '0em',
        wide:    '0.025em',
        wider:   '0.05em',
        widest:  '0.1em',
      },

      lineHeight: {
        tight:   '1.25',
        snug:    '1.375',
        normal:  '1.5',
        relaxed: '1.625',
        loose:   '2',
      },

      /* ======================================================================
       * RAYONS
       * ==================================================================== */
      borderRadius: {
        none:  '0',
        xs:    '4px',
        sm:    '6px',
        md:    '8px',
        lg:    '12px',
        xl:    '16px',
        '2xl': '24px',
        '3xl': '32px',
        full:  '9999px',

        /* Alias shadcn */
        DEFAULT: 'var(--radius)',
        shadcn: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
      },

      /* ======================================================================
       * OMBRES
       * ==================================================================== */
      boxShadow: {
        'odc-xs':  'var(--odc-shadow-xs)',
        'odc-sm':  'var(--odc-shadow-sm)',
        'odc-md':  'var(--odc-shadow-md)',
        'odc-lg':  'var(--odc-shadow-lg)',
        'odc-xl':  'var(--odc-shadow-xl)',
        'odc-2xl': 'var(--odc-shadow-2xl)',
        'odc-focus': 'var(--odc-shadow-focus)',
        'odc-primary-sm': 'var(--odc-shadow-primary-sm)',
        'odc-primary-md': 'var(--odc-shadow-primary-md)',
        'odc-primary-lg': 'var(--odc-shadow-primary-lg)',

        /* Ombres neutres génériques */
        soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
        card: '0 4px 12px rgba(17, 24, 39, 0.08)',
        pop:  '0 8px 24px rgba(17, 24, 39, 0.12)',
        glow: '0 0 20px rgba(255, 121, 0, 0.35)',
      },

      /* ======================================================================
       * OPACITÉ
       * ==================================================================== */
      opacity: {
        2:  '0.02',
        5:  '0.05',
        8:  '0.08',
        12: '0.12',
        15: '0.15',
        25: '0.25',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        75: '0.75',
        85: '0.85',
        95: '0.95',
      },

      /* ======================================================================
       * Z-INDEX
       * ==================================================================== */
      zIndex: {
        base:           '0',
        dropdown:       '1000',
        sticky:         '1020',
        fixed:          '1030',
        'modal-backdrop': '1040',
        modal:          '1050',
        popover:        '1060',
        tooltip:        '1070',
        toast:          '1080',
        max:            '9999',
      },

      /* ======================================================================
       * ESPACEMENTS SUPPLÉMENTAIRES
       * ==================================================================== */
      spacing: {
        4.5: '1.125rem',
        5.5: '1.375rem',
        6.5: '1.625rem',
        7.5: '1.875rem',
        13:  '3.25rem',
        15:  '3.75rem',
        18:  '4.5rem',
        22:  '5.5rem',
        26:  '6.5rem',
        30:  '7.5rem',
        'sidebar':          '16rem',
        'sidebar-collapsed':'4rem',
        'header':           '4rem',
      },

      /* ======================================================================
       * TRANSITIONS
       * ==================================================================== */
      transitionTimingFunction: {
        odc:         'cubic-bezier(0.4, 0, 0.2, 1)',
        'odc-out':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'odc-spring':'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'odc-fast':   '150ms',
        'odc-base':   '200ms',
        'odc-slow':   '300ms',
        'odc-slower': '500ms',
        'odc-slowest':'700ms',
      },

      /* ======================================================================
       * BACKGROUNDS
       * ==================================================================== */
      backgroundImage: {
        'gradient-odc':
          'linear-gradient(135deg, #FF7900 0%, #EA6A00 50%, #C25400 100%)',
        'gradient-odc-soft':
          'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        'gradient-odc-rainbow':
          'linear-gradient(135deg, #FF7900 0%, #F59E0B 50%, #DB2777 100%)',
        'gradient-radial':
          'radial-gradient(circle at top right, rgba(255,255,255,0.15), transparent 50%)',
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
        'gradient-mesh':
          'radial-gradient(at 20% 10%, #FFEDD5 0px, transparent 50%), radial-gradient(at 80% 90%, #FED7AA 0px, transparent 50%)',
      },

      /* ======================================================================
       * KEYFRAMES
       * ==================================================================== */
      keyframes: {
        /* Accordéon (Radix) */
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },

        /* Fade */
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },

        /* Slide */
        'slide-in-up': {
          '0%':   { transform: 'translateY(20px)',  opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        'slide-in-down': {
          '0%':   { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        'slide-in-left': {
          '0%':   { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(20px)',  opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },

        /* Scale */
        'scale-in': {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'scale-out': {
          '0%':   { transform: 'scale(1)',    opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },

        /* Shimmer (skeleton) */
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },

        /* Pulse doux */
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },

        /* Flottement */
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },

        /* Lueur ODC */
        glow: {
          '0%, 100%': {
            boxShadow:
              '0 0 5px rgba(255,121,0,0.4), 0 0 10px rgba(255,121,0,0.2)',
          },
          '50%': {
            boxShadow:
              '0 0 20px rgba(255,121,0,0.7), 0 0 30px rgba(255,121,0,0.4)',
          },
        },

        /* Barre de progression indéterminée */
        'progress-indeterminate': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },

        /* Rotation douce */
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },

        /* Bounce subtil */
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },

        /* Wobble (attention) */
        wobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(-3deg)' },
          '75%':      { transform: 'rotate(3deg)' },
        },
      },

      /* ======================================================================
       * ANIMATIONS
       * ==================================================================== */
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',

        'fade-in':   'fade-in 0.3s ease-out',
        'fade-out':  'fade-out 0.3s ease-out',

        'slide-in-up':    'slide-in-up 0.4s ease-out',
        'slide-in-down':  'slide-in-down 0.4s ease-out',
        'slide-in-left':  'slide-in-left 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',

        'scale-in':  'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',

        shimmer:             'shimmer 1.5s infinite',
        'pulse-soft':        'pulse-soft 2s ease-in-out infinite',
        float:               'float 3s ease-in-out infinite',
        glow:                'glow 2s ease-in-out infinite',
        'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
        'spin-slow':         'spin-slow 3s linear infinite',
        'bounce-subtle':     'bounce-subtle 1s ease-in-out infinite',
        wobble:              'wobble 0.4s ease-in-out',
      },

      /* ======================================================================
       * GRILLES & FLEX
       * ==================================================================== */
      gridTemplateColumns: {
        'sidebar':          '16rem 1fr',
        'sidebar-collapsed':'4rem 1fr',
        'dashboard':        'repeat(auto-fit, minmax(280px, 1fr))',
        'cards-2':          'repeat(auto-fit, minmax(360px, 1fr))',
        'cards-3':          'repeat(auto-fit, minmax(280px, 1fr))',
        'cards-4':          'repeat(auto-fit, minmax(220px, 1fr))',
      },

      /* ======================================================================
       * ASPECT RATIO
       * ==================================================================== */
      aspectRatio: {
        card:   '16 / 9',
        cover:  '21 / 9',
        square: '1 / 1',
        avatar: '1 / 1',
      },

      /* ======================================================================
       * BACKDROP BLUR
       * ==================================================================== */
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        '2xl': '40px',
      },
    },
  },

  /* --------------------------------------------------------------------------
   * PLUGINS
   * ------------------------------------------------------------------------ */
  plugins: [
    tailwindcssAnimate,
    /* ------------------------------------------------------------------------
     * Plugin personnalisé : utilitaires ODC additionnels
     * ---------------------------------------------------------------------- */
    function ({ addUtilities }: { addUtilities: (u: Record<string, unknown>) => void }) {
      addUtilities({
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
        },
        '.scrollbar-none': {
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.scrollbar-odc': {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': {
            background: 'var(--odc-surface-alt)',
            borderRadius: '9999px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--odc-border-strong)',
            borderRadius: '9999px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'var(--odc-primary)',
          },
        },
        '.text-balance': { textWrap: 'balance' },
        '.text-pretty':  { textWrap: 'pretty' },
        '.drag-none': {
          '-webkit-user-drag': 'none',
          userSelect: 'none',
        },
      });
    },
  ],
};

export default config;