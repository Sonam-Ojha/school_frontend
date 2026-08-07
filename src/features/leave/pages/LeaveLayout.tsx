import { CalendarRange, ChartColumn, ListChecks, Scale } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

import { LEAVE_PERMISSIONS } from '../constants';

const TABS: NavTabItem[] = [
  { label: 'Applications', to: PATHS.leaveApplications, icon: ListChecks },
  { label: 'Balances', to: PATHS.leaveBalances, icon: Scale },
  { label: 'Reports', to: PATHS.leaveReports, icon: ChartColumn },
  {
    label: 'Leave types',
    to: PATHS.leaveTypes,
    icon: CalendarRange,
    permissions: [LEAVE_PERMISSIONS.update],
  },
];

/** Shell for the leave area. Each tab is a real route, so it is linkable. */
export function LeaveLayout() {
  return (
    <>
      <PageHeader
        title="Leave"
        description="Applications from students, teachers and staff, the decisions on them, and what everybody has left."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Leave' }]}
      />

      <NavTabs items={TABS} className="print-hidden mb-6" />

      <Outlet />
    </>
  );
}
