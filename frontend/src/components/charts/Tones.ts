/**
 * Tons sémantiques partagés (StatCard, KPI, badges…).
 * Textes ≥ 4.5:1 sur leur fond, light ET dark.
 *
 * RÈGLE : les classes Tailwind utilisent des couleurs *sémantiques* (emerald, red…)
 * plutôt que des tokens ODC qui n'existent pas. `stroke` (pour SVG / Recharts)
 * doit être une couleur CSS complète : `hsl(var(--chart-N))` ou hex.
 */

export type Tone = 'primary' | 'success' | 'warning' | 'info' | 'error' | 'purple';

export const TONES: Record<
  Tone,
  {
    /** Classe de fond + texte pour un chip / badge */
    chip: string;
    /** Classe de fond pour une barre de progression */
    bar: string;
    /** Couleur CSS complète pour SVG / Recharts */
    stroke: string;
  }
> = {
  primary: {
    chip:
      'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 ' +
      'dark:bg-primary/15 dark:text-primary',
    bar: 'bg-primary',
    stroke: 'hsl(var(--chart-1))',
  },
  success: {
    chip:
      'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 ' +
      'dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    bar: 'bg-emerald-500',
    stroke: 'hsl(var(--chart-3))',
  },
  warning: {
    chip:
      'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 ' +
      'dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    bar: 'bg-amber-500',
    stroke: 'hsl(var(--chart-5))',
  },
  info: {
    chip:
      'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200 ' +
      'dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
    bar: 'bg-sky-500',
    stroke: 'hsl(var(--chart-6))',
  },
  error: {
    chip:
      'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 ' +
      'dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
    bar: 'bg-destructive',
    stroke: 'hsl(var(--destructive))',
  },
  purple: {
    chip:
      'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 ' +
      'dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30',
    bar: 'bg-violet-500',
    stroke: 'hsl(var(--chart-4))',
  },
};