import { PATHS } from '@/app/router/paths';

import type { ModuleKey } from './types';

/**
 * What a plan may leave out. Everything not listed here — students,
 * teachers, staff, fees, attendance, exams, timetable, homework, messages
 * by SMS and email, reports and settings — is part of every plan.
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
  assistant: 'AI assistant',
  whatsapp: 'WhatsApp messages',
  priority_support: 'Priority support',
  custom_domain: 'Own domain',
  account_manager: 'Account manager',
};

export const ALL_MODULES = Object.keys(MODULE_LABELS) as ModuleKey[];

/** The module a page belongs to, by the start of its path, for pages a plan can leave out. */
const MODULE_BY_PATH: Array<[string, ModuleKey]> = [
  [`${PATHS.reports}/payroll`, 'payroll'],
  [PATHS.attendanceDevices, 'devices'],
  [PATHS.transportTracking, 'devices'],
  [PATHS.assignments, 'assignments'],
  [PATHS.leave, 'leave'],
  [PATHS.library, 'library'],
  [PATHS.transport, 'transport'],
  [PATHS.payroll, 'payroll'],
  [PATHS.analytics, 'analytics'],
  [PATHS.hostel, 'hostel'],
  [PATHS.assistant, 'assistant'],
];

export function moduleOfPath(path: string): ModuleKey | null {
  for (const [prefix, module] of MODULE_BY_PATH) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return module;
  }
  return null;
}
