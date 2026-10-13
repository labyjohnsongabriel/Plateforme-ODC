/* ============================================================================
   ANALYTICS — Wrapper simple
   ============================================================================ */
const ENABLED = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

export function trackEvent(name: string, properties?: Record<string, any>) {
  if (!ENABLED || typeof window === 'undefined') return;
  // TODO: brancher GA4, Plausible, PostHog, etc.
  console.debug('[Analytics]', name, properties);
}

export function trackPageView(path: string) {
  trackEvent('page_view', { path });
}