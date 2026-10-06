import Link from 'next/link';
import {
  Facebook, Instagram, Linkedin, Twitter,
  Mail, Phone, MapPin, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ============================================================================
   LIENS DU FOOTER
   ============================================================================ */
const FOOTER_LINKS = {
  programme: [
    { href: '/formations',  label: 'Nos formations' },
    { href: '/sessions',    label: 'Sessions à venir' },
    { href: '/domaines',    label: 'Domaines' },
    { href: '/communaute-y2c', label: 'Communauté Y2C' },
  ],
  entreprise: [
    { href: '/a-propos',   label: 'À propos' },
    { href: '/partenaires', label: 'Partenaires' },
    { href: '/actualites', label: 'Actualités' },
    { href: '/contact',    label: 'Contact' },
  ],
  legal: [
    { href: '/mentions-legales',     label: 'Mentions légales' },
    { href: '/politique-confidentialite', label: 'Confidentialité' },
    { href: '/cgu',                  label: 'CGU' },
  ],
} as const;

const SOCIALS = [
  { href: 'https://facebook.com',  icon: Facebook,  label: 'Facebook' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://linkedin.com',  icon: Linkedin,  label: 'LinkedIn' },
  { href: 'https://twitter.com',   icon: Twitter,   label: 'Twitter' },
] as const;

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-odc-surface border-t border-odc-border mt-auto">
      {/* ---------- NEWSLETTER ---------- */}
      <div className="border-b border-odc-border">
        <div className="container-page py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-2xl font-bold mb-2">
                Restez informé
              </h3>
              <p className="text-odc-muted">
                Recevez les nouvelles formations et événements de l&apos;ODC
                directement dans votre boîte mail.
              </p>
            </div>

            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="votre@email.mg"
                className="input-odc flex-1"
                aria-label="Votre email"
              />
              <Button type="submit" variant="odc">
                S&apos;abonner
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ---------- LIENS ---------- */}
      <div className="container-page py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-odc-500 to-odc-700 text-white font-display font-bold text-sm">
                ODC
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display font-bold text-sm">
                  Orange Digital Center
                </span>
                <span className="text-xs text-odc-muted">Madagascar</span>
              </div>
            </Link>

            <p className="text-sm text-odc-muted mb-6 max-w-sm">
              Un lieu unique dédié à l&apos;apprentissage, à l&apos;innovation et
              à l&apos;entrepreneuriat numérique à Madagascar.
            </p>

            {/* Contacts */}
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-odc-secondary">
                <MapPin className="h-4 w-4 mt-0.5 text-odc-primary shrink-0" />
                <span>Antananarivo, Madagascar</span>
              </li>
              <li>
                <a
                  href="mailto:contact@odc.mg"
                  className="flex items-start gap-2 text-odc-secondary hover:text-odc-primary transition-colors"
                >
                  <Mail className="h-4 w-4 mt-0.5 text-odc-primary shrink-0" />
                  <span>contact@odc.mg</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+2610000000"
                  className="flex items-start gap-2 text-odc-secondary hover:text-odc-primary transition-colors"
                >
                  <Phone className="h-4 w-4 mt-0.5 text-odc-primary shrink-0" />
                  <span>+261 00 000 00</span>
                </a>
              </li>
            </ul>

            {/* Réseaux sociaux */}
            <div className="flex gap-2 mt-6">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-odc-surface-alt hover:bg-odc-primary hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Colonnes de liens */}
          <div>
            <h4 className="font-display font-semibold mb-4">Programme</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.programme.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-odc-muted hover:text-odc-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Entreprise</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.entreprise.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-odc-muted hover:text-odc-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Légal</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-odc-muted hover:text-odc-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ---------- BOTTOM ---------- */}
      <div className="border-t border-odc-border">
        <div className="container-page py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-odc-muted text-center md:text-left">
            © {year} Orange Digital Center Madagascar. Tous droits réservés.
          </p>
          <p className="text-sm text-odc-muted flex items-center gap-1.5">
            Fait avec
            <span className="text-odc-primary">♥</span>
            à Madagascar
          </p>
        </div>
      </div>
    </footer>
  );
}