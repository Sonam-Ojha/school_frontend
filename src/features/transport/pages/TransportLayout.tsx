import { Bus, IdCard, Radio, Route } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

const TABS: NavTabItem[] = [
  { label: 'Fleet', to: PATHS.transportVehicles, icon: Bus },
  { label: 'Routes', to: PATHS.transportRoutes, icon: Route },
  { label: 'Drivers', to: PATHS.transportDrivers, icon: IdCard },
  { label: 'Live tracking', to: PATHS.transportTracking, icon: Radio },
];

/** Shell for the transport area. Each tab is a real route, so it is linkable. */
export function TransportLayout() {
  return (
    <>
      <PageHeader
        title="Transport"
        description="Buses and their papers, routes and stops, drivers, and where everything is."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Transport' }]}
      />

      <NavTabs items={TABS} className="print-hidden mb-6" />

      <Outlet />
    </>
  );
}
