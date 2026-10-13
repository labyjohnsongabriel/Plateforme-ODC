import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container-page py-12">
      <Skeleton className="h-12 w-full mb-6" />
      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <Skeleton className="h-96" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    </div>
  );
}