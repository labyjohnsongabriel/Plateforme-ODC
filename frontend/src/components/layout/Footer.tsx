import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Facebook, Linkedin, Twitter, Github, Heart } from 'lucide-react';

interface FooterProps {
  variant?: 'full' | 'minimal';
}

export function Footer({ variant = 'full' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className="border-t border-odc-border-light dark:border-odc-border-dark py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
          © {currentYear} Orange Digital Center. Tous droits réservés.
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark border-t border-odc-border-light dark:border-odc-border-dark mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* ================================================================
              Colonne 1 : Branding
              ================================================================ */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white font-bold shadow-odc-md">
                ODC
              </div>
              <div>
                <div className="font-heading font-bold text-odc-text-light dark:text-odc-text-dark">
                  Orange Digital
                </div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  Center
                </div>
              </div>
            </div>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-4">
              Plateforme de gestion des formations, suivi des bénéficiaires et réseautage.
            </p>
            <div className="flex gap-2">
              {[
                { icon: <Facebook size={16} />, href: '#' },
                { icon: <Linkedin size={16} />, href: '#' },
                { icon: <Twitter size={16} />, href: '#' },
                { icon: <Github size={16} />, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-white dark:bg-odc-surface-dark flex items-center justify-center text-odc-text-muted-light dark:text-odc-text-muted-dark hover:bg-odc-primary hover:text-white transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ================================================================
              Colonne 2 : Navigation
              ================================================================ */}
          <div>
            <h3 className="font-heading font-bold text-sm mb-4 text-odc-text-light dark:text-odc-text-dark uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/formations', label: 'Formations' },
                { to: '/sessions', label: 'Sessions' },
                { to: '/attestations', label: 'Attestations' },
                { to: '/reseautage', label: 'Réseautage' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark hover:text-odc-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================================================================
              Colonne 3 : Ressources
              ================================================================ */}
          <div>
            <h3 className="font-heading font-bold text-sm mb-4 text-odc-text-light dark:text-odc-text-dark uppercase tracking-wider">
              Ressources
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/about', label: 'À propos' },
                { to: '/contact', label: 'Contact' },
                { to: '/help', label: 'Aide' },
                { to: '/privacy', label: 'Confidentialité' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark hover:text-odc-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================================================================
              Colonne 4 : Contact
              ================================================================ */}
          <div>
            <h3 className="font-heading font-bold text-sm mb-4 text-odc-text-light dark:text-odc-text-dark uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                <MapPin size={16} className="text-odc-primary flex-shrink-0 mt-0.5" />
                <span>Antananarivo, Madagascar</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                <Mail size={16} className="text-odc-primary flex-shrink-0" />
                <a href="mailto:contact@odc.mg" className="hover:text-odc-primary transition-colors">
                  contact@odc.mg
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                <Phone size={16} className="text-odc-primary flex-shrink-0" />
                <a href="tel:+261341234567" className="hover:text-odc-primary transition-colors">
                  +261 34 12 345 67
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ================================================================
            Bottom bar
            ================================================================ */}
        <div className="mt-8 pt-8 border-t border-odc-border-light dark:border-odc-border-dark flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark text-center md:text-left">
            © {currentYear} Orange Digital Center. Tous droits réservés.
          </p>
          <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark flex items-center gap-1">
            Fait avec <Heart size={12} className="text-odc-primary fill-odc-primary" /> à Madagascar
          </p>
        </div>
      </div>
    </footer>
  );
}