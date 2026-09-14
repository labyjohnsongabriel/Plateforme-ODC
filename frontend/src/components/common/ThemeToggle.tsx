import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-lg bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-odc-text-light dark:text-odc-text-dark hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 transition-colors"
      aria-label={mode === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
      title={mode === 'light' ? 'Mode sombre' : 'Mode clair'}
    >
      {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}