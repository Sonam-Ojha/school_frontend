import { CalendarDays, CalendarRange, GraduationCap, HardHat, ScanLine, Users } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

const TABS: NavTabItem[] = [
  { label: 'Students', to: PATHS.attendanceStudents, icon: GraduationCap },
  { label: 'Teachers', to: PATHS.attendanceTeachers, icon: Users },
  { label: 'Staff', to: PATHS.attendanceStaff, icon: HardHat },
  { label: 'Monthly report', to: PATHS.attendanceReports, icon: CalendarRange },
  { label: 'Holidays', to: PATHS.attendanceHolidays, icon: CalendarDays },
  { label: 'Devices', to: PATHS.attendanceDevices, icon: ScanLine },
];

/**
 * Shell for the attendance area.
 *
 * Tabs are real routes, so a specific day's sheet is linkable — which matters
 * when someone is asked to check a particular class on a particular date.
 */
export function AttendanceLayout() {
  return (
    <>
      <PageHeader
        title="Attendance"
        description="Daily marking, monthly reports, holidays and capture devices."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Attendance' }]}
      />

      <NavTabs items={TABS} className="mb-6" />

      <Outlet />
    </>
  );
}
