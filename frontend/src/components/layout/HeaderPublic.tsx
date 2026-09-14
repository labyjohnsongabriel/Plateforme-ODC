import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, LogIn, UserPlus, LayoutDashboard,
} from 'lucide-react';

import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

// ============================================================================
//  NAV LINKS
// ============================================================================

interface NavLink {
  to: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
];

// ============================================================================
//  HEADER PUBLIC
// ============================================================================

export function HeaderPublic() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-white/95 dark:bg-odc-surface-dark/95 backdrop-blur-xl shadow-odc-sm'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white font-bold shadow-odc-md group-hover:scale-105 transition-transform">
                  ODC
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-odc-primary animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <div className="font-heading font-bold text-odc-text-light dark:text-odc-text-dark leading-tight">
                  Orange Digital
                </div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  Center
                </div>
              </div>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'relative px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'text-odc-primary'
                        : 'text-odc-text-light dark:text-odc-text-dark hover:text-odc-primary'
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-odc-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* CAS 1 — Utilisateur CONNECTÉ (tous rôles)                   */}
              {/* ═══════════════════════════════════════════════════════════ */}
              {isAuthenticated && user && (
                <div className="hidden md:flex items-center gap-3">
                  <Link to="/dashboard">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<LayoutDashboard size={16} />}
                    >
                      Dashboard
                    </Button>
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 transition-colors"
                  >
                    <Avatar
                      src={user.photoUrl}
                      name={`${user.prenom} ${user.nom}`}
                      size="sm"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-odc-text-light dark:text-odc-text-dark truncate max-w-[100px]">
                        {user.prenom}
                      </p>
                      <p className="text-[10px] text-odc-text-muted-light dark:text-odc-text-muted-dark truncate max-w-[100px]">
                        {user.role?.nom}
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* CAS 2 — Utilisateur NON CONNECTÉ                            */}
              {/* ═══════════════════════════════════════════════════════════ */}
              {!isAuthenticated && (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" icon={<LogIn size={16} />}>
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" icon={<UserPlus size={16} />}>
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  'md:hidden p-2 rounded-lg',
                  'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20',
                  'transition-colors'
                )}
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MENU MOBILE                                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          'fixed inset-0 z-30 md:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'absolute top-16 left-0 right-0 bg-white dark:bg-odc-surface-dark',
            'border-b border-odc-border-light dark:border-odc-border-dark',
            'transition-transform duration-300',
            mobileOpen ? 'translate-y-0' : '-translate-y-full'
          )}
        >
          <nav className="p-4 space-y-1">
            {/* Nav links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'block px-4 py-3 rounded-lg font-medium transition-colors',
                  location.pathname === link.to
                    ? 'bg-odc-primary-soft text-odc-primary-dark'
                    : 'hover:bg-odc-surface-alt-light dark:hover:bg-odc-surface-alt-dark'
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-odc-border-light dark:border-odc-border-dark space-y-2">
              {/* Connecté → Dashboard + Profil */}
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar
                      src={user.photoUrl}
                      name={`${user.prenom} ${user.nom}`}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-odc-text-light dark:text-odc-text-dark truncate">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                        {user.role?.nom}
                      </p>
                    </div>
                  </div>
                  <Link to="/dashboard" className="block">
                    <Button variant="primary" fullWidth icon={<LayoutDashboard size={16} />}>
                      Aller au Dashboard
                    </Button>
                  </Link>
                  <Link to="/profile" className="block">
                    <Button variant="secondary" fullWidth>
                      Mon profil
                    </Button>
                  </Link>
                </>
              ) : (
                /* Non connecté → Connexion + Inscription */
                <>
                  <Link to="/login" className="block">
                    <Button variant="secondary" fullWidth icon={<LogIn size={16} />}>
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button variant="primary" fullWidth icon={<UserPlus size={16} />}>
                      S'inscrire
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
}

export default HeaderPublic;