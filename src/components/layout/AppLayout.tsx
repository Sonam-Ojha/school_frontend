import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { Spinner } from '@/components/ui/Spinner';

import { DesktopSidebar, MobileSidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * Chrome for every authenticated page.
 *
 * The error boundary sits inside the layout so a crashing page keeps the
 * navigation usable, and the Suspense boundary covers lazily-loaded routes.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh bg-slate-50">
      <DesktopSidebar />
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex justify-center py-20">
                  <Spinner size="lg" className="text-brand-600" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
