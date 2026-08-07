import { Outlet } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

import { ANALYTICS_DOMAINS } from '../constants';

const TABS: NavTabItem[] = ANALYTICS_DOMAINS.map((domain) => ({
  label: domain.label,
  to: toPath(PATHS.analyticsDomain, { domain: domain.key }),
  icon: domain.icon,
}));

/**
 * Shell for the analytics area.
 *
 * The description is doing real work: somebody arriving from Reports needs to
 * know why there are two of these, and the answer — one tells you what
 * happened, the other what it means — belongs where they will read it.
 */
export function AnalyticsLayout() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Reports say what happened. This says what it means — what moves results, who is at risk, and where the money actually is."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Analytics' }]}
      />

      <NavTabs items={TABS} className="print-hidden mb-6" />

      <Outlet />
    </>
  );
}
