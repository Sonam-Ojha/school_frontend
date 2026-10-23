import { useState } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary';

/**
 * The public website: what the product is and costs, starting a school's
 * free trial, and finding your school to sign in to it. Nobody is signed in
 * here; every school's sign-in page lives under its own code.
 */
function createPublicRouter() {
  return createBrowserRouter([
    {
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: '/',
          lazy: async () => ({ Component: (await import('@/features/landing/pages/LandingPage')).default }),
        },
        {
          path: '/signup',
          lazy: async () => ({ Component: (await import('@/features/saas/pages/SignupPage')).default }),
        },
        {
          path: '/login',
          lazy: async () => ({ Component: (await import('@/features/saas/pages/FindSchoolPage')).default }),
        },
        { path: '/pricing', element: <Navigate to={{ pathname: '/', hash: '#pricing' }} replace /> },
        {
          path: '*',
          lazy: async () => ({ Component: (await import('@/features/saas/pages/WebsiteNotFoundPage')).default }),
        },
      ],
    },
  ]);
}

export default function PublicApp() {
  const [router] = useState(createPublicRouter);
  return <RouterProvider router={router} />;
}
