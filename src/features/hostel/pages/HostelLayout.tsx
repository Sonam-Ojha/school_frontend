import { BedDouble, Building2, IndianRupee, UserCheck, Users } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

import { HOSTEL_PERMISSIONS } from '../constants';

const TABS: NavTabItem[] = [
  { label: 'Rooms', to: PATHS.hostelRooms, icon: BedDouble },
  { label: 'Residents', to: PATHS.hostelAllocations, icon: Users },
  { label: 'Fees', to: PATHS.hostelFees, icon: IndianRupee },
  { label: 'Roll call', to: PATHS.hostelRollCall, icon: UserCheck },
  {
    label: 'Blocks',
    to: PATHS.hostelBlocks,
    icon: Building2,
    permissions: [HOSTEL_PERMISSIONS.update],
  },
];

/** Shell for the hostel area. Each tab is a real route, so it is linkable. */
export function HostelLayout() {
  return (
    <>
      <PageHeader
        title="Hostel"
        description="Blocks, rooms and beds, who is in them, what they are charged, and tonight's roll call."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Hostel' }]}
      />

      <NavTabs items={TABS} className="print-hidden mb-6" />

      <Outlet />
    </>
  );
}
