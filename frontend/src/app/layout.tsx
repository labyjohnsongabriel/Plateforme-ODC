import type { Metadata, Viewport } from 'next';
import { Inter, Ubuntu } from 'next/font/google';
import { Providers } from './providers';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

/* ============================================================================
   POLICES
   ============================================================================ */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ubuntu',
  display: 'swap',
});

/* ============================================================================
   MÉTADONNÉES
   ============================================================================ */
export const metadata: Metadata = {
  title: {
    default: 'ODC Platform — Orange Digital Center',
    template: '%s | ODC',
  },
  description:
    'Plateforme de gestion des formations, suivi des bénéficiaires et réseautage — Orange Digital Center Madagascar',
  keywords: ['ODC', 'Orange Digital Center', 'Formation', 'Madagascar', 'Numérique'],
  authors: [{ name: 'ODC Madagascar' }],
  creator: 'Orange Digital Center',
  icons: {
    icon: '/favicon.ico',
    apple: '/images/brand/icon-192x192.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'ODC Platform',
    title: 'ODC Platform — Orange Digital Center',
    description: 'Formations numériques, suivi et réseautage',
    images: ['/images/brand/logo.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ODC Platform',
    description: 'Formations numériques, suivi et réseautage',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF7900' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

/* ============================================================================
   ROOT LAYOUT
   ============================================================================ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${ubuntu.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}