import { lazy, Suspense, useEffect } from 'react';

import { FullPageLoader } from '@/components/feedback/FullPageLoader';
import { importFresh } from '@/lib/staleBuild';

import { AppProviders } from './providers/AppProviders';
import { area, lastSchool, schoolUrl } from './tenant';

// Each part of the product is its own bundle: a parent opening their school
// never downloads the platform console, and the website stays light. A
// bundle that has gone since the page was opened (a new version) reloads
// the page rather than failing.
const SchoolApp = lazy(() => importFresh(() => import('./SchoolApp')));
const PublicApp = lazy(() => importFresh(() => import('./PublicApp')));
const PlatformApp = lazy(() => importFresh(() => import('@/features/platform/PlatformApp')));

/** Picks the part of the product the address belongs to (see `tenant.ts`). */
export function App() {
  return (
    <AppProviders>
      <Suspense fallback={<FullPageLoader />}>
        {area.kind === 'school' ? (
          <SchoolApp code={area.code} />
        ) : area.kind === 'platform' ? (
          <PlatformApp />
        ) : area.kind === 'legacy' ? (
          <LegacyRedirect path={area.path} />
        ) : (
          <PublicApp />
        )}
      </Suspense>
    </AppProviders>
  );
}

/**
 * An address from before schools had codes (`/students/12`): sent on to the
 * same page in the school used last on this device, or to the page that
 * finds a school.
 */
function LegacyRedirect({ path }: { path: string }) {
  useEffect(() => {
    const last = lastSchool();
    const rest = `${path}${window.location.search}${window.location.hash}`;
    window.location.replace(
      last ? schoolUrl(last, rest) : `/login?next=${encodeURIComponent(rest)}`,
    );
  }, [path]);

  return <FullPageLoader />;
}
