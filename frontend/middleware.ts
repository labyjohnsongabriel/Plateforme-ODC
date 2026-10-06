import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */
const ROLE_ROUTES: Record<string, string> = {
  ADMINISTRATEUR: '/admin',
  STAFF_ODC: '/staff',
  FORMATEUR: '/formateur',
  PARTICIPANT: '/participant',
  PARTENAIRE: '/partenaire',
};

const PUBLIC_ROUTES = [
  '/',
  '/a-propos',
  '/formations',
  '/domaines',
  '/sessions',
  '/partenaires',
  '/inscription-en-ligne',
  '/verifier-attestation',
  '/actualites',
  '/contact',
  '/communaute-y2c',
];

const AUTH_ROUTES = [
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/reinitialiser-mot-de-passe',
];

const SHARED_ROUTES = ['/notifications', '/messagerie', '/parametres'];

const PROTECTED_PREFIXES = [
  '/admin',
  '/staff',
  '/formateur',
  '/participant',
  '/partenaire',
  ...SHARED_ROUTES,
];

/* ============================================================================
   MIDDLEWARE
   ============================================================================ */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('access_token')?.value;

  /* ---------- ROUTES PUBLIQUES ---------- */
  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  );
  if (isPublic) {
    return NextResponse.next();
  }

  /* ---------- ROUTES D'AUTHENTIFICATION ---------- */
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute) {
    if (token) {
      const role = await getRoleFromToken(token);
      if (role) {
        return NextResponse.redirect(
          new URL(`${ROLE_ROUTES[role]}/dashboard`, req.url),
        );
      }
    }
    return NextResponse.next();
  }

  /* ---------- ROUTES PROTÉGÉES ---------- */
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected) {
    if (!token) {
      const url = new URL('/connexion', req.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    const role = await getRoleFromToken(token);
    if (!role) {
      const res = NextResponse.redirect(new URL('/connexion', req.url));
      res.cookies.delete('access_token');
      return res;
    }

    const allowedPrefix = ROLE_ROUTES[role];
    const isShared = SHARED_ROUTES.some((p) => pathname.startsWith(p));

    if (!isShared && allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(
        new URL(`${allowedPrefix}/dashboard`, req.url),
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

/* ============================================================================
   HELPERS
   ============================================================================ */
async function getRoleFromToken(token: string): Promise<string | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'change-me',
    );
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

/* ============================================================================
   MATCHER
   ============================================================================ */
export const config = {
  matcher: [
    /*
     * Match toutes les routes SAUF :
     * - _next/static (assets)
     * - _next/image (images optimisées)
     * - favicon.ico, images, icons, fonts
     * - robots.txt, sitemap.xml, manifest.json
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|images|icons|fonts).*)',
  ],
};