import {
  MapPin, Mail, Phone, Clock, Facebook, Instagram, Linkedin, Twitter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const INFOS = [
  { icon: MapPin, label: 'Adresse', value: 'Antananarivo, Madagascar' },
  { icon: Mail, label: 'Email', value: 'contact@odc.mg', href: 'mailto:contact@odc.mg' },
  { icon: Phone, label: 'Téléphone', value: '+261 00 000 00', href: 'tel:+2610000000' },
  { icon: Clock, label: 'Horaires', value: 'Lundi - Vendredi, 8h - 17h' },
];

const SOCIALS = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
];

export function ContactInfo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {INFOS.map((info) => {
            const Icon = info.icon;
            const content = (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-odc-primary" />
                </div>
                <div>
                  <p className="text-xs text-odc-muted mb-0.5">{info.label}</p>
                  <p className="font-medium">{info.value}</p>
                </div>
              </div>
            );

            return info.href ? (
              <a
                key={info.label}
                href={info.href}
                className="block hover:opacity-80 transition-opacity"
              >
                {content}
              </a>
            ) : (
              <div key={info.label}>{content}</div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {SOCIALS.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-lg bg-odc-surface-alt hover:bg-odc-primary hover:text-white flex items-center justify-center transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}