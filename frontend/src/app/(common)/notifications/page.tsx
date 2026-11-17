// src/app/(common)/notifications/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NotificationsPageContent } from './NotificationsPageContent';

export const metadata: Metadata = {
  title: 'Notifications',
  description:
    'Consultez toutes vos notifications sur la plateforme Orange Digital Center.',
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsPageContent />
    </Suspense>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FALLBACK SUSPENSE — aligné avec le loading.tsx
   ═══════════════════════════════════════════════════════════════════════════ */

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function NotificationsSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full max-w-md" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}