import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { Toaster } from '@/components/feedback/Toaster';
import { queryClient } from '@/lib/queryClient';

/**
 * Providers every part of the product shares, outermost first:
 * error boundary → server cache → UI outlets.
 *
 * The boundary wraps everything so a provider-level crash still renders a
 * recoverable screen instead of a blank page. A school's session is added by
 * the school's own app (`SchoolApp`), inside the check that the school exists.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
