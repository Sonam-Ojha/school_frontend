import { CalendarRange, Landmark, SlidersHorizontal, Wallet } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

import { PAYROLL_PERMISSIONS } from '../constants';

const TABS: NavTabItem[] = [
  { label: 'Runs', to: PATHS.payrollRuns, icon: CalendarRange },
  { label: 'Salaries', to: PATHS.payrollStructures, icon: Wallet },
  { label: 'PF & ESI', to: PATHS.payrollStatutory, icon: Landmark },
  {
    label: 'Components',
    to: PATHS.payrollComponents,
    icon: SlidersHorizontal,
    permissions: [PAYROLL_PERMISSIONS.update],
  },
];

/** Shell for the payroll area. Each tab is a real route, so it is linkable. */
export function PayrollLayout() {
  return (
    <>
      <PageHeader
        title="Payroll"
        description="Salaries and their allowances, monthly runs and payslips, and the PF and ESI returns."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Payroll' }]}
      />

      <NavTabs items={TABS} className="print-hidden mb-6" />

      <Outlet />
    </>
  );
}
