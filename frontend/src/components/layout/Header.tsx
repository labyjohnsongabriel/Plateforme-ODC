import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, ChevronRight, Sparkles } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { ProfileMenu } from './ProfileMenu';
import { cn } from '@/utils/cn';

// ============================================================================
//  HEADER
// ============================================================================

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);

  // Générer le breadcrumb depuis l'URL
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, i) => ({
      label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      href: '/' + paths.slice(0, i + 1).join('/'),
      isLast: i === paths.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-odc-surface-dark/95 backdrop-blur-xl border-b border-odc-border-light dark:border-odc-border-dark">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8 gap-3">
        {/* ================================================================ */}
        {/* LEFT — Menu mobile + Breadcrumb                                   */}
        {/* ================================================================ */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 text-odc-text-light dark:text-odc-text-dark transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Breadcrumb (desktop) */}
          <nav className="hidden md:flex items-center gap-2 text-sm min-w-0 flex-1">
            <div className="flex items-center gap-1 text-odc-text-muted-light dark:text-odc-text-muted-dark">
              <Sparkles size={14} className="text-odc-primary" />
              <span className="font-semibold text-odc-primary">ODC</span>
            </div>

            {breadcrumbs.slice(0, 3).map((crumb, i) => (
              <div key={i} className="flex items-center gap-2 min-w-0">
                <ChevronRight size={14} className="text-odc-text-muted-light flex-shrink-0" />
                {crumb.isLast ? (
                  <span className="font-semibold text-odc-text-light dark:text-odc-text-dark truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="hover:text-odc-primary transition-colors truncate text-odc-text-muted-light dark:text-odc-text-muted-dark"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* ================================================================ */}
        {/* CENTER — Search bar (desktop)                                     */}
        {/* ================================================================ */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search
              size={16}
              className={cn(
                'absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors',
                searchFocused
                  ? 'text-odc-primary'
                  : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
              )}
            />
            <input
              type="text"
              placeholder="Rechercher formations, utilisateurs..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm',
                'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark',
                'text-odc-text-light dark:text-odc-text-dark',
                'placeholder:text-odc-text-muted-light dark:placeholder:text-odc-text-muted-dark',
                'border transition-all duration-200',
                searchFocused
                  ? 'border-odc-primary ring-4 ring-odc-primary/10'
                  : 'border-transparent'
              )}
            />
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT — Theme, Notifications, Profile                             */}
        {/* ================================================================ */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ThemeToggle />
          <NotificationBell />
          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}

export default Header;