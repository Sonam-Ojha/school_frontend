import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { Spinner } from '@/components/ui/Spinner';
import { AssistantWidget } from '@/features/assistant/components/AssistantWidget';
import { ModuleUnavailable } from '@/features/saas/components/ModuleUnavailable';
import { SubscriptionBanner } from '@/features/saas/components/SubscriptionBanner';
import { usePlanModules } from '@/features/saas/hooks/useSubscription';
import { moduleOfPath } from '@/features/saas/modules';

import { DesktopSidebar, MobileSidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * Chrome for every authenticated page.
 *
 * The error boundary sits inside the layout so a crashing page keeps the
 * navigation usable, and the Suspense boundary covers lazily-loaded routes.
 * A page whose module the school's plan leaves out is replaced by a notice
 * saying so, rather than left to fail request by request.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const modules = usePlanModules();
  const module = moduleOfPath(pathname);
  const locked = module !== null && modules !== null && !modules.includes(module);

  return (
    <div className="flex min-h-dvh bg-slate-50">
      <DesktopSidebar />
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <SubscriptionBanner />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex justify-center py-20">
                  <Spinner size="lg" className="text-brand-600" />
                </div>
              }
            >
              {locked ? <ModuleUnavailable module={module} /> : <Outlet />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* The assistant, a tap away on every page. */}
      <AssistantWidget />
    </div>
  );
}
