import { LayoutDashboard } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';
import { usePlanModules } from '@/features/saas/hooks/useSubscription';

import { REPORT_FAMILIES } from '../constants';

/** Shell for the reporting area. Each family is a real route, so each is linkable. */
export function ReportsLayout() {
  // The payroll reports belong to payroll: only on a plan that includes it.
  const modules = usePlanModules();
  const tabs: NavTabItem[] = [
    { label: 'Overview', to: PATHS.reportsOverview, icon: LayoutDashboard },
    ...REPORT_FAMILIES.filter((family) => family.key !== 'payroll' || modules === null || modules.includes('payroll')).map(
      (family) => ({
        label: family.label,
        to: toPath(PATHS.reportFamily, { family: family.key }),
        icon: family.icon,
      }),
    ),
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        description="The questions that cross modules — attendance, fees, strength, staffing, payroll and results — in one place."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Reports' }]}
      />

      <NavTabs items={tabs} className="print-hidden mb-6" />

      <Outlet />
    </>
  );
}
