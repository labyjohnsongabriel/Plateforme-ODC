import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary :', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-odc-bg-light dark:bg-odc-bg-dark p-4">
          <div className="max-w-md w-full bg-white dark:bg-odc-surface-dark rounded-2xl shadow-odc-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-odc-error-bg flex items-center justify-center">
              <AlertTriangle size={32} className="text-odc-error" />
            </div>

            <h1 className="font-heading text-2xl font-bold mb-2 text-odc-text-light dark:text-odc-text-dark">
              Oups, une erreur est survenue
            </h1>

            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-6">
              Une erreur inattendue s'est produite. Veuillez réessayer.
            </p>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-3 bg-odc-error-bg rounded-lg text-left">
                <p className="text-xs font-mono text-odc-error break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                icon={<RefreshCw size={16} />}
                onClick={this.handleReload}
                fullWidth
              >
                Recharger
              </Button>
              <Button
                variant="secondary"
                icon={<Home size={16} />}
                onClick={this.handleHome}
                fullWidth
              >
                Accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}