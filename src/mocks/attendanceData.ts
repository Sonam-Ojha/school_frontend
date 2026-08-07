import type { BiometricDevice, Holiday, QrSession } from '@/features/attendance/types';

/**
 * Attendance seed for the development mock.
 *
 * Holidays are anchored to the current year so a fresh clone always has a
 * calendar that overlaps today — a fixed year would leave the marking screen
 * with nothing to demonstrate.
 */

const YEAR = new Date().getFullYear();

const iso = (month: number, day: number) =>
  `${YEAR}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

interface HolidaySeed {
  id: number;
  name: string;
  start: [month: number, day: number];
  end: [month: number, day: number];
  type: Holiday['type'];
  scope: Holiday['scope'];
  description?: string;
}

const SEED: HolidaySeed[] = [
  { id: 1, name: 'Republic Day', start: [1, 26], end: [1, 26], type: 'public', scope: 'all' },
  { id: 2, name: 'Holi', start: [3, 14], end: [3, 15], type: 'public', scope: 'all' },
  {
    id: 3,
    name: 'Summer vacation',
    start: [4, 10],
    end: [5, 31],
    type: 'vacation',
    scope: 'students',
    description: 'Teaching staff report for planning weeks from mid-May.',
  },
  { id: 4, name: 'Independence Day', start: [8, 15], end: [8, 15], type: 'public', scope: 'all' },
  {
    id: 5,
    name: 'Mid-term examinations',
    start: [9, 22],
    end: [9, 26],
    type: 'exam',
    scope: 'students',
    description: 'No regular classes; invigilation duty applies to teachers.',
  },
  { id: 6, name: 'Dussehra', start: [10, 2], end: [10, 4], type: 'public', scope: 'all' },
  { id: 7, name: 'Diwali break', start: [10, 20], end: [10, 24], type: 'school', scope: 'all' },
  { id: 8, name: 'Founder’s Day', start: [11, 12], end: [11, 12], type: 'school', scope: 'all' },
  { id: 9, name: 'Christmas', start: [12, 25], end: [12, 25], type: 'public', scope: 'all' },
  {
    id: 10,
    name: 'Staff training day',
    start: [7, 4],
    end: [7, 4],
    type: 'school',
    scope: 'employees',
    description: 'Students do not attend; all employees do.',
  },
];

function buildHoliday(seed: HolidaySeed): Holiday {
  const startDate = iso(seed.start[0], seed.start[1]);
  const endDate = iso(seed.end[0], seed.end[1]);
  const days =
    Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1;

  return {
    id: seed.id,
    name: seed.name,
    start_date: startDate,
    end_date: endDate,
    type: seed.type,
    scope: seed.scope,
    description: seed.description ?? null,
    days_count: days,
    created_at: `${YEAR}-01-01T00:00:00.000000Z`,
  };
}

export const holidays: Holiday[] = SEED.map(buildHoliday);

/**
 * Biometric readers. One offline and one erroring so the health states and
 * the disabled sync button are both reachable.
 */
export const devices: BiometricDevice[] = [
  {
    id: 1,
    name: 'Main gate',
    serial_number: 'ZK-9920-0011',
    location: 'Main entrance',
    status: 'online',
    last_sync_at: new Date(Date.now() - 12 * 60_000).toISOString(),
    last_sync_count: 214,
    error_message: null,
  },
  {
    id: 2,
    name: 'Staff room',
    serial_number: 'ZK-9920-0042',
    location: 'Block A, first floor',
    status: 'online',
    last_sync_at: new Date(Date.now() - 45 * 60_000).toISOString(),
    last_sync_count: 38,
    error_message: null,
  },
  {
    id: 3,
    name: 'Bus bay',
    serial_number: 'ZK-9920-0077',
    location: 'Transport yard',
    status: 'offline',
    last_sync_at: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    last_sync_count: 0,
    error_message: 'No heartbeat for 3 days. Check power and network.',
  },
  {
    id: 4,
    name: 'Library',
    serial_number: 'ZK-9920-0103',
    location: 'Block C, ground floor',
    status: 'error',
    last_sync_at: new Date(Date.now() - 6 * 60 * 60_000).toISOString(),
    last_sync_count: 0,
    error_message: 'Fingerprint sensor reported a hardware fault (code 0x21).',
  },
];

/** No live QR sessions on boot — the empty state is the honest first view. */
export const qrSessions: QrSession[] = [];
