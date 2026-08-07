import type { Option, ToneName } from '@/types/common';

import type {
  BedStatus,
  HostelType,
  MessPlan,
  RollCallStatus,
  RoomStatus,
  RoomType,
} from './types';

/**
 * `approve` is the right to overwrite a locked roll call — a correction to
 * last week's register is a decision, not a keystroke, and it is routinely
 * one the warden on duty may not take.
 */
export const HOSTEL_PERMISSIONS = {
  read: 'hostel.read',
  create: 'hostel.create',
  update: 'hostel.update',
  delete: 'hostel.delete',
  export: 'hostel.export',
  print: 'hostel.print',
  amendRollCall: 'hostel.approve',
} as const;

// --- policy -----------------------------------------------------------------

/**
 * How many nights a roll call stays editable.
 *
 * Long enough to fix a genuine mistake the next morning, short enough that
 * last month's register is a record rather than a draft.
 */
export const ROLL_CALL_GRACE_DAYS = 2;

/**
 * What each mess plan costs, as a share of the hostel's full-plan rate.
 *
 * The money lives on the hostel and the plan is a multiplier, so a block
 * putting its mess charge up reaches every resident instead of being copied
 * onto each allocation.
 */
export const MESS_PLAN_MULTIPLIER: Record<MessPlan, number> = {
  full: 1,
  breakfast_dinner: 0.7,
  none: 0,
};

/** Beds a room may hold, whatever its type says. A guard, not a policy. */
export const MAX_BEDS_PER_ROOM = 20;

/** The bed count each room type implies, offered as the default. */
export const BEDS_FOR_ROOM_TYPE: Record<RoomType, number> = {
  single: 1,
  double: 2,
  triple: 3,
  quad: 4,
  dormitory: 8,
};

/** Occupancy above this is a block with no slack left. */
export const HIGH_OCCUPANCY_PERCENT = 90;

// --- labels -----------------------------------------------------------------

export const HOSTEL_TYPE_LABELS: Record<HostelType, string> = {
  boys: "Boys'",
  girls: "Girls'",
};

export const HOSTEL_TYPE_OPTIONS: Option<HostelType>[] = (
  Object.keys(HOSTEL_TYPE_LABELS) as HostelType[]
).map((type) => ({ label: `${HOSTEL_TYPE_LABELS[type]} hostel`, value: type }));

/** A boys' block takes male residents; a girls' block takes female ones. */
export const GENDER_FOR_HOSTEL: Record<HostelType, string> = {
  boys: 'male',
  girls: 'female',
};

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  quad: 'Four-bed',
  dormitory: 'Dormitory',
};

export const ROOM_TYPE_OPTIONS: Option<RoomType>[] = (
  Object.keys(ROOM_TYPE_LABELS) as RoomType[]
).map((type) => ({ label: ROOM_TYPE_LABELS[type], value: type }));

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: 'Beds free',
  full: 'Full',
  maintenance: 'Under repair',
  blocked: 'Held back',
};

export const ROOM_STATUS_TONES: Record<RoomStatus, ToneName> = {
  available: 'success',
  full: 'info',
  maintenance: 'warning',
  blocked: 'neutral',
};

/** Only these two are set by hand — `available` and `full` come from the beds. */
export const ROOM_STATUS_OPTIONS: Option<RoomStatus>[] = [
  { label: ROOM_STATUS_LABELS.available, value: 'available' },
  { label: ROOM_STATUS_LABELS.maintenance, value: 'maintenance' },
  { label: ROOM_STATUS_LABELS.blocked, value: 'blocked' },
];

export const BED_STATUS_LABELS: Record<BedStatus, string> = {
  vacant: 'Vacant',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Out of use',
};

export const BED_STATUS_TONES: Record<BedStatus, ToneName> = {
  vacant: 'success',
  occupied: 'info',
  reserved: 'warning',
  maintenance: 'danger',
};

export const MESS_PLAN_LABELS: Record<MessPlan, string> = {
  full: 'Full board',
  breakfast_dinner: 'Breakfast and dinner',
  none: 'No mess',
};

export const MESS_PLAN_OPTIONS: Option<MessPlan>[] = (
  Object.keys(MESS_PLAN_LABELS) as MessPlan[]
).map((plan) => ({ label: MESS_PLAN_LABELS[plan], value: plan }));

export const ROLL_CALL_STATUS_LABELS: Record<RollCallStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  on_leave: 'On leave',
  out_pass: 'Out on a pass',
  late_return: 'Late return',
};

/** Single letters for the roll-call grid, where a word will not fit. */
export const ROLL_CALL_STATUS_INITIALS: Record<RollCallStatus, string> = {
  present: 'P',
  absent: 'A',
  on_leave: 'L',
  out_pass: 'O',
  late_return: 'R',
};

export const ROLL_CALL_STATUS_TONES: Record<RollCallStatus, ToneName> = {
  present: 'success',
  absent: 'danger',
  on_leave: 'info',
  out_pass: 'warning',
  late_return: 'warning',
};

export const ROLL_CALL_STATUS_OPTIONS: Option<RollCallStatus>[] = (
  Object.keys(ROLL_CALL_STATUS_LABELS) as RollCallStatus[]
).map((status) => ({ label: ROLL_CALL_STATUS_LABELS[status], value: status }));

/**
 * Cell colours for the roll-call row, mirroring the attendance module's grid.
 * Kept here rather than shared because the statuses differ.
 */
export const ROLL_CALL_CELL_CLASSES: Record<RollCallStatus, string> = {
  present: 'bg-emerald-100 text-emerald-800',
  absent: 'bg-red-100 text-red-800',
  on_leave: 'bg-sky-100 text-sky-800',
  out_pass: 'bg-amber-100 text-amber-800',
  late_return: 'bg-orange-100 text-orange-800',
};

/**
 * A resident in one of these states is away with the school's knowledge.
 *
 * Used for the "unaccounted for" figure, which is the number a warden is
 * actually asked at nine o'clock.
 */
export const ACCOUNTED_FOR: RollCallStatus[] = ['present', 'on_leave', 'out_pass', 'late_return'];

/** The share of the full mess rate a plan is charged. */
export function messChargeFor(plan: MessPlan, fullRate: number): number {
  return Math.round(fullRate * MESS_PLAN_MULTIPLIER[plan] * 100) / 100;
}
