import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary';
import { ApiError } from '@/lib/apiError';

import { platformApi, platformKeys } from './api';
import { PlatformLayout } from './components/PlatformLayout';
import { usePlatformAuth } from './store';

/**
 * The Super Admin console at `/superadmin/<tab>`: schools, plans, billing,
 * support and the platform's own team, for whoever runs the service.
 */
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default });

function createPlatformRouter() {
  return createBrowserRouter(
    [
      {
        errorElement: <RouteErrorBoundary />,
        // Shown on the first load while the page's code arrives (without it the router warns and shows nothing).
        hydrateFallbackElement: <FullPageLoader />,
        children: [
          {
            element: <GuestOnly />,
            children: [{ path: '/login', lazy: page(() => import('./pages/PlatformLoginPage')) }],
          },
          {
            element: <SignedInOnly />,
            children: [
              {
                element: <PlatformLayout />,
                children: [
                  { index: true, element: <Navigate to="/dashboard" replace /> },
                  { path: '/dashboard', lazy: page(() => import('./pages/PlatformDashboardPage')) },
                  { path: '/schools', lazy: page(() => import('./pages/SchoolsPage')) },
                  { path: '/schools/:id', lazy: page(() => import('./pages/SchoolDetailPage')) },
                  { path: '/plans', lazy: page(() => import('./pages/PlansPage')) },
                  { path: '/invoices', lazy: page(() => import('./pages/InvoicesPage')) },
                  { path: '/payments', lazy: page(() => import('./pages/PaymentsPage')) },
                  { path: '/renewals', lazy: page(() => import('./pages/RenewalsPage')) },
                  { path: '/tickets', lazy: page(() => import('./pages/TicketsPage')) },
                  { path: '/enquiries', lazy: page(() => import('./pages/EnquiriesPage')) },
                  { path: '/reports', lazy: page(() => import('./pages/ReportsPage')) },
                  { path: '/audit-logs', lazy: page(() => import('./pages/AuditLogPage')) },
                  { path: '/team', lazy: page(() => import('./pages/TeamPage')) },
                  { path: '/settings', lazy: page(() => import('./pages/PlatformSettingsPage')) },
                  { path: '*', lazy: page(() => import('./pages/PlatformNotFoundPage')) },
                ],
              },
            ],
          },
        ],
      },
    ],
    { basename: '/superadmin' },
  );
}

/** Checks a remembered console token once on boot. */
function PlatformSession({ children }: { children: ReactNode }) {
  const token = usePlatformAuth((state) => state.token);
  const status = usePlatformAuth((state) => state.status);

  const me = useQuery({
    queryKey: platformKeys.me(),
    queryFn: ({ signal }) => platformApi.me(signal),
    enabled: Boolean(token) && status === 'idle',
    retry: false,
    meta: { skipGlobalError: true },
  });

  useEffect(() => {
    const auth = usePlatformAuth.getState();
    if (!token) {
      if (auth.status === 'idle') auth.setUnauthenticated();
      return;
    }
    if (me.isSuccess) auth.setSession(me.data, token);
    else if (me.isError) {
      if (me.error instanceof ApiError && me.error.isUnauthorized) auth.clear();
      else auth.setUnauthenticated();
    }
  }, [token, me.isSuccess, me.isError, me.data, me.error]);

  return <>{children}</>;
}

function GuestOnly() {
  const status = usePlatformAuth((state) => state.status);
  if (status === 'idle') return <FullPageLoader />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function SignedInOnly() {
  const status = usePlatformAuth((state) => state.status);
  const location = useLocation();
  if (status === 'idle') return <FullPageLoader label="Restoring your session…" />;
  if (status === 'unauthenticated') return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export default function PlatformApp() {
  const [router] = useState(createPlatformRouter);
  return (
    <PlatformSession>
      <RouterProvider router={router} />
    </PlatformSession>
  );
}
