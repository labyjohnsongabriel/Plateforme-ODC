// src/app/(participant)/participant/presences/[sessionId]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PresencesParticipantDetail } from './components/PresencesParticipantDetail';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: { sessionId: string };
}

export default function ParticipantPresenceDetailPage({
  params,
}: PageProps) {
  if (
    !params.sessionId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      params.sessionId,
    )
  ) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      }
    >
      <PresencesParticipantDetail sessionId={params.sessionId} />
    </Suspense>
  );
}