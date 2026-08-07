import { Clock, DoorOpen, GraduationCap, Users } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

import { ROOM_PERMISSIONS, TIMETABLE_PERMISSIONS } from '../constants';

const TABS: NavTabItem[] = [
  { label: 'Classes', to: PATHS.timetableClasses, icon: GraduationCap },
  { label: 'Teachers', to: PATHS.timetableTeachers, icon: Users },
  { label: 'Rooms', to: PATHS.timetableRooms, icon: DoorOpen, permissions: [ROOM_PERMISSIONS.read] },
  {
    label: 'Periods',
    to: PATHS.timetablePeriods,
    icon: Clock,
    permissions: [TIMETABLE_PERMISSIONS.update],
  },
];

/**
 * Shell for the timetable area.
 *
 * Tabs are real routes, so a particular class's week is a link somebody can
 * send — which is most of what a timetable is for.
 */
export function TimetableLayout() {
  return (
    <>
      <PageHeader
        title="Timetable"
        description="Class and teacher timetables, room allocation and the daily period grid."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Timetable' }]}
      />

      <NavTabs items={TABS} className="mb-6 print-hidden" />

      <Outlet />
    </>
  );
}
