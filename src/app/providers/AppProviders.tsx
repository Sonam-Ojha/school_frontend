import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { Toaster } from '@/components/feedback/Toaster';
import { queryClient } from '@/lib/queryClient';

import { SessionProvider } from './SessionProvider';

/**
 * Application-wide providers, outermost first:
 * error boundary → server cache → session → UI outlets.
 *
 * The boundary wraps everything so a provider-level crash still renders a
 * recoverable screen instead of a blank page.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
