import type { Shift } from '@/features/academics/types';

/**
 * The timetable.
 *
 * Three records. A **period** is a row of the school's daily time grid — one
 * set per shift, because a morning section and an afternoon section run
 * different clocks. A **room** is a physical space that can hold one class at
 * a time. A **slot** is the single record everything else is derived from:
 * one section, on one weekday, in one period, taking one subject with one
 * teacher in one room.
 *
 * The class, teacher and room timetables are three readings of that same slot
 * table, never three tables. A teacher's Tuesday is not stored anywhere — it
 * is the slots where they appear, which is why it can never disagree with the
 * class timetable it was taken from.
 */

/** ISO weekday: 1 = Monday … 7 = Sunday. The school week runs Monday–Saturday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Period {
  id: number;
  /** Display name — `Period 1`, `Lunch`, `Assembly`. */
  name: string;
  /** Position in the day. Contiguous within a shift; ordering, not identity. */
  sort_order: number;
  shift: Shift;
  /** `HH:mm`, 24-hour. */
  start_time: string;
  end_time: string;
  /** Computed by the API from the two times. */
  duration_minutes: number;
  /** Breaks hold no lesson — assembly, lunch, games. */
  is_break: boolean;
  /** Slots currently using this period, across every section. A delete guard. */
  slots_count: number;
  created_at: string;
}

export type RoomType =
  | 'classroom'
  | 'science_lab'
  | 'computer_lab'
  | 'library'
  | 'hall'
  | 'activity'
  | 'ground';

export interface Room {
  id: number;
  name: string;
  /** Short code shown in a grid cell, where the full name will not fit. */
  code: string;
  type: RoomType;
  building: string | null;
  floor: number | null;
  capacity: number;
  is_active: boolean;

  /** Periods a week this room is occupied — computed from the slots. */
  allocated_periods: number;
  /** Occupied periods as a share of the teaching periods available. */
  utilisation_percent: number;
  created_at: string;
}

/** One cell of the timetable, and the only record that is written. */
export interface TimetableSlot {
  id: number;
  class_id: number;
  class_name: string;
  section_id: number;
  section_name: string;

  day_of_week: Weekday;
  period_id: number;
  period_name: string;
  /** Denormalised from the period so a grid cell needs no second lookup. */
  start_time: string;
  end_time: string;

  subject_id: number;
  subject_name: string;
  subject_code: string;

  teacher_id: number;
  teacher_name: string;

  /** Null when the lesson happens wherever the section normally sits. */
  room_id: number | null;
  room_name: string | null;
}

/**
 * A weekly load breakdown — subjects for a section, classes for a teacher or
 * a room. One shape for all three views, because they are the same count of
 * the same slots grouped by a different column.
 */
export interface LoadEntry {
  key: string;
  label: string;
  periods: number;
}

export interface TimetableSummary {
  /** Teaching cells in the grid — periods × days, breaks excluded. */
  teaching_slots: number;
  filled_slots: number;
  free_slots: number;
  /** The busiest weekday, or null when the timetable is empty. */
  busiest_day: Weekday | null;
  load: LoadEntry[];
}

export type TimetableScope = 'section' | 'teacher' | 'room';

/**
 * A whole timetable, as any of the three views returns it.
 *
 * The periods and days travel with the slots: a grid rendered against a
 * locally-assumed period list would silently drop a lesson the moment the
 * school added an eighth period.
 */
export interface TimetableGrid {
  scope: TimetableScope;
  /** Heading for the grid — `Class 5 — A`, a teacher's name, a room's name. */
  title: string;
  subtitle: string | null;
  periods: Period[];
  days: Weekday[];
  slots: TimetableSlot[];
  summary: TimetableSummary;
}

/** A teacher's week in one row — the workload table above the teacher grid. */
export interface TeacherWorkload {
  teacher_id: number;
  teacher_name: string;
  employee_id: string;
  photo_url: string | null;
  periods_per_week: number;
  /** The school's ceiling, so the row can flag an overload without guessing. */
  max_periods_per_week: number;
  /** Periods on the heaviest single day. */
  busiest_day_periods: number;
  classes_count: number;
  subjects: string[];
  is_overloaded: boolean;
}

/**
 * Who and what is free in one day-and-period.
 *
 * Read by the slot form so a clash is something the picker prevents rather
 * than something the save rejects — the difference between a tool that helps
 * and one that scolds.
 */
export interface SlotAvailability {
  day_of_week: Weekday;
  period_id: number;
  teachers: AvailabilityEntry[];
  rooms: AvailabilityEntry[];
}

export interface AvailabilityEntry {
  id: number;
  name: string;
  /** Free text describing the clash — `Class 8 — B, Mathematics`. */
  busy_with: string | null;
  is_busy: boolean;
}
