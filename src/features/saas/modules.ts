import { PATHS } from '@/app/router/paths';

import type { ModuleKey } from './types';

/**
 * Modules a plan may leave out. Everything not listed here — students,
 * teachers, staff, fees, attendance, exams, timetable, homework, messages,
 * reports and settings — is part of every plan.
 */
export const MODULE_LABELS: Record<ModuleKey, string> = {
  assignments: 'Assignments',
  leave: 'Leave management',
  library: 'Library',
  transport: 'Transport',
  payroll: 'Payroll',
  analytics: 'Analytics',
  hostel: 'Hostel',
  devices: 'Biometric & GPS devices',
};

export const ALL_MODULES = Object.keys(MODULE_LABELS) as ModuleKey[];

/** The module a page belongs to, by the start of its path, for pages a plan can leave out. */
const MODULE_BY_PATH: Array<[string, ModuleKey]> = [
  [PATHS.attendanceDevices, 'devices'],
  [PATHS.transportTracking, 'devices'],
  [PATHS.assignments, 'assignments'],
  [PATHS.leave, 'leave'],
  [PATHS.library, 'library'],
  [PATHS.transport, 'transport'],
  [PATHS.payroll, 'payroll'],
  [PATHS.analytics, 'analytics'],
  [PATHS.hostel, 'hostel'],
];

export function moduleOfPath(path: string): ModuleKey | null {
  for (const [prefix, module] of MODULE_BY_PATH) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return module;
  }
  return null;
}
