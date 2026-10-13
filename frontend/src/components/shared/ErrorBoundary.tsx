// src/components/shared/ErrorBoundary.tsx
'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-odc-error-bg flex items-center justify-center mb-5">
            <AlertTriangle className="h-8 w-8 text-odc-error" />
          </div>

          <h2 className="font-display text-xl font-bold mb-2">
            Une erreur est survenue
          </h2>

          <p className="text-sm text-odc-muted mb-6 max-w-md">
            {this.state.error?.message ?? 'Quelque chose s\'est mal passé.'}
          </p>

          <div className="flex gap-3">
            <Button variant="odc" onClick={this.reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}