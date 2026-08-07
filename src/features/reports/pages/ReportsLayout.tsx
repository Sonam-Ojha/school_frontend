import { LayoutDashboard } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

import { REPORT_FAMILIES } from '../constants';

const TABS: NavTabItem[] = [
  { label: 'Overview', to: PATHS.reportsOverview, icon: LayoutDashboard },
  ...REPORT_FAMILIES.map((family) => ({
    label: family.label,
    to: toPath(PATHS.reportFamily, { family: family.key }),
    icon: family.icon,
  })),
];

/** Shell for the reporting area. Each family is a real route, so each is linkable. */
export function ReportsLayout() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="The questions that cross modules — attendance, fees, strength, staffing, payroll and results — in one place."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Reports' }]}
      />

      <NavTabs items={TABS} className="print-hidden mb-6" />

      <Outlet />
    </>
  );
}
