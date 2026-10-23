import { z } from 'zod';

import { toMinutes } from '@/lib/time';
import { optionalText, timeField } from '@/lib/validation';

import { MAX_VEHICLE_CAPACITY } from './constants';

/**
 * Transport validation.
 *
 * Transform-free like every other module: optional numbers are held as
 * strings and converted in the service, because a numeric input left blank
 * yields `NaN` rather than null.
 */

/** An Indian registration mark, with or without the spaces people type. */
const registrationNo = z
  .string()
  .min(4, 'Registration number is required')
  .max(16, 'Registration number is too long')
  .refine(
    (value) => /^[A-Za-z]{2}[\s-]?\d{1,2}[\s-]?[A-Za-z]{0,3}[\s-]?\d{1,4}$/.test(value.trim()),
    'Enter a registration like KA 05 MH 1234',
  );

/** Blank, or a date. Statutory papers may legitimately not be recorded yet. */
const optionalDate = z.string().refine((value) => {
  if (value.trim() === '') return true;
  return !Number.isNaN(new Date(value).getTime());
}, 'Enter a valid date');

export const vehicleSchema = z.object({
  registration_no: registrationNo,
  name: z.string().min(2, 'Give the bus a name').max(40, 'Name is too long'),
  make: optionalText(40, 'Make is too long'),
  model: optionalText(40, 'Model is too long'),
  manufacture_year: z.string().refine((value) => {
    if (value.trim() === '') return true;
    const year = Number(value);
    return Number.isInteger(year) && year >= 1980 && year <= new Date().getFullYear() + 1;
  }, 'Enter a year between 1980 and next year'),
  capacity: z
    .number({ invalid_type_error: 'Enter the seat count' })
    .int('Seats must be a whole number')
    .min(1, 'A bus needs at least one seat')
    .max(MAX_VEHICLE_CAPACITY, `That is more than ${MAX_VEHICLE_CAPACITY} seats`),
  fuel_type: z.enum(['diesel', 'petrol', 'cng', 'electric'], {
    invalid_type_error: 'Select a fuel type',
  }),
  status: z.enum(['active', 'maintenance', 'retired'], {
    invalid_type_error: 'Select a status',
  }),

  /** Both are staff ids. Null is a bus with nobody rostered to it yet. */
  driver_id: z.number().int().positive().nullable(),
  attendant_id: z.number().int().positive().nullable(),

  insurance_expiry: optionalDate,
  fitness_expiry: optionalDate,
  permit_expiry: optionalDate,
  pollution_expiry: optionalDate,

  odometer_km: z.string().refine((value) => {
    if (value.trim() === '') return true;
    const reading = Number(value);
    return Number.isInteger(reading) && reading >= 0 && reading <= 5_000_000;
  }, 'Enter a reading in kilometres'),
  notes: optionalText(500, 'Notes are too long'),
});

export const routeSchema = z.object({
  name: z.string().min(3, 'Route name is required').max(80, 'Name is too long'),
  code: z
    .string()
    .min(2, 'A route code is required')
    .max(10, 'Code is too long')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  description: optionalText(300, 'Description is too long'),
  /** Null is a route with no bus on it yet — planned, not running. */
  vehicle_id: z.number().int().positive().nullable(),
  distance_km: z.string().refine((value) => {
    if (value.trim() === '') return true;
    const distance = Number(value);
    return !Number.isNaN(distance) && distance > 0 && distance <= 500;
  }, 'Enter a distance in kilometres'),
  is_active: z.boolean(),
});

const baseStopSchema = z.object({
  name: z.string().min(2, 'Stop name is required').max(80, 'Name is too long'),
  sequence: z
    .number({ invalid_type_error: 'Enter a position' })
    .int('Position must be a whole number')
    .min(1, 'Positions start at 1')
    .max(99, 'That is beyond the end of the route'),
  landmark: optionalText(120, 'Landmark is too long'),
  pickup_time: timeField('Pickup time'),
  drop_time: timeField('Drop time'),
  fare: z
    .number({ invalid_type_error: 'Enter the monthly fare' })
    .min(0, 'Fare cannot be negative')
    .max(100_000, 'That fare looks wrong'),
  /** Blank is a stop nobody has surveyed yet — legitimate, and common. */
  latitude: z.string().refine((value) => {
    if (value.trim() === '') return true;
    const lat = Number(value);
    return !Number.isNaN(lat) && lat >= -90 && lat <= 90;
  }, 'Latitude must be between -90 and 90'),
  longitude: z.string().refine((value) => {
    if (value.trim() === '') return true;
    const lng = Number(value);
    return !Number.isNaN(lng) && lng >= -180 && lng <= 180;
  }, 'Longitude must be between -180 and 180'),
});

/**
 * A stop is picked up on the way in and dropped on the way out, so the drop
 * runs later in the day than the pickup. A stop where the two are the same
 * is a data-entry slip, and it would break the run ordering downstream.
 */
export const stopSchema = baseStopSchema.refine(
  (data) => {
    const pickup = toMinutes(data.pickup_time);
    const drop = toMinutes(data.drop_time);
    return pickup === null || drop === null || drop > pickup;
  },
  { message: 'The drop is later in the day than the pickup', path: ['drop_time'] },
);

/** One coordinate without the other locates nothing. */
export const stopSchemaWithCoordinates = stopSchema.refine(
  (data) => (data.latitude.trim() === '') === (data.longitude.trim() === ''),
  { message: 'Give both coordinates, or neither', path: ['longitude'] },
);

export const assignmentSchema = z.object({
  student_id: z.number({ invalid_type_error: 'Choose a student' }).int().positive('Choose a student'),
  route_id: z.number({ invalid_type_error: 'Choose a route' }).int().positive('Choose a route'),
  stop_id: z.number({ invalid_type_error: 'Choose a stop' }).int().positive('Choose a stop'),
  trip: z.enum(['both', 'pickup', 'drop'], { invalid_type_error: 'Select the trips taken' }),
  start_date: z.string().min(1, 'A start date is required'),
});

export const gpsDeviceSchema = z.object({
  // Not only a 15-digit IMEI: a phone running a tracking app reports an
  // identifier of its own choosing, and the API accepts either.
  imei: z
    .string()
    .trim()
    .min(5, 'Enter the IMEI, or the ID the tracker reports')
    .max(40, 'That is too long for an IMEI or a device ID')
    .regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers and hyphens only'),
  sim_number: z.string().refine((value) => {
    if (value.trim() === '') return true;
    return /^[+]?[\d\s-]{7,20}$/.test(value.trim());
  }, 'Enter a valid SIM number'),
  provider: z.string().min(2, 'Which tracker is this?').max(60, 'Provider name is too long'),
  /** Null is a device on the shelf, not yet fitted to anything. */
  vehicle_id: z.number().int().positive().nullable(),
  installed_on: z.string().min(1, 'An installation date is required'),
  /** Edit only: replace the key the tracker reports with. */
  regenerate_key: z.boolean(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type RouteInput = z.infer<typeof routeSchema>;
export type StopInput = z.infer<typeof stopSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type GpsDeviceInput = z.infer<typeof gpsDeviceSchema>;
