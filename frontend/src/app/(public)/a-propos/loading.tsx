import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="bg-odc-surface-alt py-16">
        <div className="container-page">
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-12 w-96 mb-3" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
      </div>

      {/* Sections skeletons */}
      <div className="container-page py-16 space-y-24">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}