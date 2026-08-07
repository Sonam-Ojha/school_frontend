import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

/**
 * `errorElement` for the router. Handles thrown `Response`s from loaders as
 * well as ordinary render errors that escape a nested `ErrorBoundary`.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const status = isRouteErrorResponse(error) ? error.status : null;
  const message = isRouteErrorResponse(error)
    ? error.statusText || 'The page could not be loaded.'
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12 text-center">
      {status && <p className="text-sm font-semibold text-brand-600">{status}</p>}
      <h1 className="mt-2 text-xl font-semibold text-slate-900">
        {status === 404 ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">{message}</p>

      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button onClick={() => navigate('/', { replace: true })}>Go to dashboard</Button>
      </div>
    </div>
  );
}
