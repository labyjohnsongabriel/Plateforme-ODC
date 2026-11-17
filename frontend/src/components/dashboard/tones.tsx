// src/components/dashboard/tones.ts

export type Tone = 'primary' | 'success' | 'warning' | 'info' | 'purple' | 'error';

export interface ToneStyle {
  chip: string;
  bar: string;
  text: string;
  bg: string;
}

export const TONES: Record<Tone, ToneStyle> = {
  primary: {
    chip: 'bg-odc-primary-soft text-odc-primary',
    bar: 'bg-odc-primary',
    text: 'text-odc-primary',
    bg: 'bg-odc-primary-soft',
  },
  success: {
    chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  warning: {
    chip: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    bar: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  info: {
    chip: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    bar: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  purple: {
    chip: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
    bar: 'bg-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
  },
  error: {
    chip: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400',
    bar: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
  },
};