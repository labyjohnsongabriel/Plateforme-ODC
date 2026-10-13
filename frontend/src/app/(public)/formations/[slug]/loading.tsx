import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container-page py-12">
      <Skeleton className="h-4 w-64 mb-8" />
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}