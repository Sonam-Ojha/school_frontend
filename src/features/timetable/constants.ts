import type { Shift } from '@/features/academics/types';
import type { Option, ToneName } from '@/types/common';

import type { RoomType, Weekday } from './types';

/**
 * Editing the grid, configuring it and printing it are separate rights.
 *
 * A head of department rearranges lessons; only an administrator adds a
 * period or a room, because both reshape every timetable in the school at
 * once. Periods are governed by `timetable.update` rather than a resource of
 * their own — they are the timetable's time grid, not a register.
 */
export const TIMETABLE_PERMISSIONS = {
  read: 'timetable.read',
  create: 'timetable.create',
  update: 'timetable.update',
  delete: 'timetable.delete',
  export: 'timetable.export',
  print: 'timetable.print',
} as const;

/** Rooms are a facility register, granted separately from the timetable. */
export const ROOM_PERMISSIONS = {
  read: 'rooms.read',
  create: 'rooms.create',
  update: 'rooms.update',
  delete: 'rooms.delete',
} as const;

/**
 * The school week.
 *
 * Monday–Saturday, matching the attendance module's rule that Sunday is the
 * weekly off. Kept as ISO numbers so they sort correctly and survive a locale
 * change, with the labels applied only at the edge.
 */
export const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
};

export const SHIFT_LABELS: Record<Shift, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

export const SHIFT_OPTIONS: Option<Shift>[] = (
  Object.keys(SHIFT_LABELS) as Shift[]
).map((shift) => ({ label: SHIFT_LABELS[shift], value: shift }));

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  classroom: 'Classroom',
  science_lab: 'Science lab',
  computer_lab: 'Computer lab',
  library: 'Library',
  hall: 'Hall',
  activity: 'Activity room',
  ground: 'Ground',
};

export const ROOM_TYPE_TONES: Record<RoomType, ToneName> = {
  classroom: 'neutral',
  science_lab: 'info',
  computer_lab: 'info',
  library: 'success',
  hall: 'warning',
  activity: 'warning',
  ground: 'success',
};

export const ROOM_TYPE_OPTIONS: Option<RoomType>[] = (
  Object.keys(ROOM_TYPE_LABELS) as RoomType[]
).map((type) => ({ label: ROOM_TYPE_LABELS[type], value: type }));

/**
 * A teacher's weekly ceiling.
 *
 * A rule the school sets, not a technical limit — it lives here so the
 * workload table, the overload badge and the save-time guard all read the
 * same number.
 */
export const MAX_PERIODS_PER_WEEK = 36;
export const MAX_PERIODS_PER_DAY = 7;

/** Guards against a period grid nobody could teach or a room nobody could fill. */
export const MAX_PERIODS_PER_SHIFT = 14;
export const MAX_ROOM_CAPACITY = 500;

/** Utilisation above this reads as a room with no slack left. */
export const HIGH_UTILISATION_PERCENT = 80;
