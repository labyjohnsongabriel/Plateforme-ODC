// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Providers } from './providers';
import { InscriptionModalProvider } from '@/components/inscription/InscriptionModalProvider';
import { MessagerieProvider } from '@/components/messagerie/MessagerieProvider';
import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/lib/constants';
import './globals.css';

/* ============================================================================
   METADATA — SEO & Open Graph
   ============================================================================ */

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Formations & innovation numérique`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    'ODC',
    'Orange Digital Center',
    'Madagascar',
    'formations numériques',
    'coding',
    'développement web',
    'IA',
    'data science',
    'entrepreneuriat',
    'innovation',
  ],
  authors: [{ name: 'Orange Digital Center Madagascar', url: APP_URL }],
  creator: 'Orange Digital Center Madagascar',
  publisher: 'Orange Digital Center Madagascar',
  openGraph: {
    type: 'website',
    locale: 'fr_MG',
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Formations & innovation numérique`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — Formations & innovation numérique`,
    description: APP_DESCRIPTION,
    images: ['/images/og-default.png'],
    creator: '@odc_madagascar',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' }],
    shortcut: ['/favicon.svg'],
    apple: [{ url: '/favicon.svg' }],
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  applicationName: APP_NAME,
  category: 'education',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

/* ============================================================================
   VIEWPORT — Responsive & Theme
   ============================================================================ */

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
  colorScheme: 'light dark',
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
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href={APP_URL} />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>

      <body
        className="
          min-h-screen
          bg-odc-background
          text-odc-text-primary
          antialiased
          font-sans
          selection:bg-odc-primary/20
          selection:text-odc-primary
        "
      >
        <Providers>
          {/* ⭐ Provider du modal d'inscription — englobe TOUT */}
          <InscriptionModalProvider>
            {children}
          </InscriptionModalProvider>

          {/* ⭐ Modale messagerie globale — accessible partout */}
          <Suspense fallback={null}>
            <MessagerieProvider />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}