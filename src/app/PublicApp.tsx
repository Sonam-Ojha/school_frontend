import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
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
      // Shown on the first load while the page's code arrives (without it the router warns and shows nothing).
      hydrateFallbackElement: <FullPageLoader />,
      children: [
        {
          path: '/',
          lazy: async () => ({ Component: (await import('@/features/landing/pages/LandingPage')).default }),
        },
        {
          path: '/features',
          lazy: async () => ({ Component: (await import('@/features/landing/pages/FeaturesPage')).default }),
        },
        {
          path: '/pricing',
          lazy: async () => ({ Component: (await import('@/features/landing/pages/PricingPage')).default }),
        },
        {
          path: '/about',
          lazy: async () => ({ Component: (await import('@/features/landing/pages/AboutPage')).default }),
        },
        {
          path: '/contact',
          lazy: async () => ({ Component: (await import('@/features/landing/pages/ContactPage')).default }),
        },
        {
          path: '/signup',
          lazy: async () => ({ Component: (await import('@/features/saas/pages/SignupPage')).default }),
        },
        {
          path: '/login',
          lazy: async () => ({ Component: (await import('@/features/saas/pages/FindSchoolPage')).default }),
        },
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
