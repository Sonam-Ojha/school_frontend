import { z } from 'zod';

import { durationBetween } from '@/lib/time';
import { optionalText, timeField } from '@/lib/validation';

import { MAX_ROOM_CAPACITY } from './constants';

const basePeriodSchema = z.object({
  name: z
    .string()
    .min(2, 'Period name is required')
    .max(40, 'Period name is too long'),
  shift: z.enum(['morning', 'afternoon', 'evening'], {
    invalid_type_error: 'Select a shift',
  }),
  sort_order: z
    .number({ invalid_type_error: 'Enter a position' })
    .int('Position must be a whole number')
    .min(1, 'Position starts at 1')
    .max(20, 'That is beyond the end of the day'),
  start_time: timeField('Start time'),
  end_time: timeField('End time'),
  is_break: z.boolean(),
});

/**
 * A period of the daily grid.
 *
 * The end must come after the start, and a period has to be long enough to
 * hold a lesson — a five-minute "period" is a data-entry slip, and it would
 * quietly render as an unusable sliver in every grid in the school.
 */
export const periodSchema = basePeriodSchema
  .refine(
    (data) => {
      const minutes = durationBetween(data.start_time, data.end_time);
      return minutes !== null && minutes > 0;
    },
    { message: 'The end time must come after the start', path: ['end_time'] },
  )
  .refine(
    (data) => {
      const minutes = durationBetween(data.start_time, data.end_time);
      return minutes === null || minutes >= 5;
    },
    { message: 'A period must be at least 5 minutes', path: ['end_time'] },
  )
  .refine(
    (data) => {
      const minutes = durationBetween(data.start_time, data.end_time);
      return minutes === null || minutes <= 240;
    },
    { message: 'A period cannot run longer than four hours', path: ['end_time'] },
  );

export const roomSchema = z.object({
  name: z.string().min(2, 'Room name is required').max(80, 'Room name is too long'),
  code: z
    .string()
    .min(1, 'Room code is required')
    .max(12, 'Room code is too long')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  type: z.enum(
    ['classroom', 'science_lab', 'computer_lab', 'library', 'hall', 'activity', 'ground'],
    { invalid_type_error: 'Select a room type' },
  ),
  building: optionalText(60, 'Building name is too long'),
  /**
   * Blank is a legitimate answer for a ground or a hall, so this is a string
   * the service converts rather than a number the form would hold as NaN.
   */
  floor: z.string().refine((value) => {
    if (value.trim() === '') return true;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= -2 && parsed <= 20;
  }, 'Enter a floor between -2 and 20'),
  capacity: z
    .number({ invalid_type_error: 'Enter the capacity' })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(MAX_ROOM_CAPACITY, `Capacity cannot exceed ${MAX_ROOM_CAPACITY}`),
  is_active: z.boolean(),
});

/**
 * One cell of the grid.
 *
 * The section, day and period identify the cell rather than describing it —
 * saving the same three again replaces what is there, which is what dragging
 * a lesson onto an occupied cell has to mean.
 */
export const slotSchema = z.object({
  class_id: z.number({ invalid_type_error: 'Select a class' }).int().positive('Select a class'),
  section_id: z
    .number({ invalid_type_error: 'Select a section' })
    .int()
    .positive('Select a section'),
  day_of_week: z
    .number({ invalid_type_error: 'Select a day' })
    .int()
    .min(1, 'Select a day')
    .max(7, 'Select a day'),
  period_id: z.number({ invalid_type_error: 'Select a period' }).int().positive('Select a period'),
  subject_id: z
    .number({ invalid_type_error: 'Select a subject' })
    .int()
    .positive('Select a subject'),
  teacher_id: z
    .number({ invalid_type_error: 'Select a teacher' })
    .int()
    .positive('Select a teacher'),
  /** Null means the section's own room, which most lessons use. */
  room_id: z.number().int().positive().nullable(),
});

export type PeriodInput = z.infer<typeof periodSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type SlotInput = z.infer<typeof slotSchema>;
