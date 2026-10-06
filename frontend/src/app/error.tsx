'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: envoyer à Sentry / Datadog
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-20 h-20 rounded-full bg-odc-error-bg flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10 text-odc-error" />
      </div>

      <h1 className="font-display text-3xl font-bold mb-2">
        Oups, une erreur est survenue
      </h1>

      <p className="text-odc-muted mb-8 max-w-md text-center">
        {error.message || 'Veuillez réessayer dans quelques instants.'}
      </p>

      {error.digest && (
        <p className="text-xs text-odc-muted mb-4 font-mono">
          Code : {error.digest}
        </p>
      )}

      <div className="flex gap-3">
        <Button onClick={reset} variant="odc">
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}