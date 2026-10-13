import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background"
    >
      <Loader2 className="h-10 w-10 animate-spin text-odc-primary" />
      <p className="text-sm text-odc-muted">Chargement…</p>
    </div>
  );
}