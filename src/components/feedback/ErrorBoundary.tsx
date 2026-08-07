import { RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Hook for Sentry/logging. */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time crashes so one broken screen cannot blank the whole
 * ERP. Wrapped around the router at the app root and around individual
 * feature routes.
 *
 * Note: React error boundaries do not catch errors in event handlers or async
 * code — those surface through TanStack Query and the toast layer instead.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    if (env.isDev) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private readonly reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          This section failed to load. You can retry, or return to the dashboard if the problem
          persists.
        </p>

        {env.isDev && (
          <pre className="mt-4 max-w-xl overflow-x-auto rounded-lg bg-slate-900 p-3 text-left text-xs text-red-300">
            {error.message}
          </pre>
        )}

        <div className="mt-6 flex gap-2">
          <Button onClick={this.reset} leftIcon={<RefreshCw className="size-4" />}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.assign('/')}>
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }
}
