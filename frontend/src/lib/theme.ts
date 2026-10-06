export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'odc-theme';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'system';
}

export function applyTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

export function setTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
  applyTheme(mode);
}

export const themeInitScript = `
(function() {
  try {
    var mode = localStorage.getItem('odc-theme') || 'system';
    var isDark = mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  } catch (e) {}
})();
`;