// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import { APP_DESCRIPTION, APP_NAME, APP_URL } from '@/lib/constants';
import './globals.css';

/* ============================================================================
   FONTS — Google Fonts optimisées (self-hosted par Next.js)
   ============================================================================ */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
  preload: false,
});

/* ============================================================================
   METADATA — SEO & Open Graph
   ============================================================================ */

export const metadata: Metadata = {
  /* -------------------- Base -------------------- */
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Formations & innovation numérique`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,

  /* -------------------- Mots-clés -------------------- */
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

  /* -------------------- Auteurs -------------------- */
  authors: [
    {
      name: 'Orange Digital Center Madagascar',
      url: APP_URL,
    },
  ],
  creator: 'Orange Digital Center Madagascar',
  publisher: 'Orange Digital Center Madagascar',

  /* -------------------- Open Graph -------------------- */
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

  /* -------------------- Twitter -------------------- */
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — Formations & innovation numérique`,
    description: APP_DESCRIPTION,
    images: ['/images/og-default.png'],
    creator: '@odc_madagascar',
  },

  /* -------------------- Icons -------------------- */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icons/icon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#FF7900' },
    ],
  },

  /* -------------------- Manifest PWA -------------------- */
  manifest: '/manifest.webmanifest',

  /* -------------------- Robots -------------------- */
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

  /* -------------------- Divers -------------------- */
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
    <html
      lang="fr"
      dir="ltr"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* DNS prefetch pour les domaines externes */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href={APP_URL} />

        {/* Meta sécurité */}
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}