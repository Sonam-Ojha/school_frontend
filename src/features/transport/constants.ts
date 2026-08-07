import type { Option, ToneName } from '@/types/common';

import type {
  ComplianceStatus,
  DocumentKind,
  FuelType,
  GpsStatus,
  TripType,
  VehicleStatus,
} from './types';

export const TRANSPORT_PERMISSIONS = {
  read: 'transport.read',
  create: 'transport.create',
  update: 'transport.update',
  delete: 'transport.delete',
  export: 'transport.export',
  print: 'transport.print',
} as const;

// --- policy -----------------------------------------------------------------

/**
 * Papers within this many days of expiry are flagged amber.
 *
 * Thirty days is roughly how long a renewal takes to come back, so a bus
 * flagged today can still be dealt with before it has to come off the road.
 */
export const DOCUMENT_EXPIRY_WARNING_DAYS = 30;

/** A licence expiring inside this window still lets somebody drive, just noisily. */
export const LICENCE_EXPIRY_WARNING_DAYS = 60;

/**
 * A one-way rider pays half.
 *
 * The fare lives on the stop and the multiplier here, so a change to either
 * reaches every assignment rather than being copied onto each one.
 */
export const TRIP_FARE_MULTIPLIER: Record<TripType, number> = {
  both: 1,
  pickup: 0.5,
  drop: 0.5,
};

/** A fix older than this is not worth steering by. */
export const POSITION_STALE_SECONDS = 180;

/** How often the live view asks again. Matches a typical reporting interval. */
export const TRACKING_POLL_MS = 15_000;

export const MAX_STOPS_PER_ROUTE = 40;
export const MAX_VEHICLE_CAPACITY = 90;

// --- labels -----------------------------------------------------------------

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  active: 'In service',
  maintenance: 'In the workshop',
  retired: 'Retired',
};

export const VEHICLE_STATUS_TONES: Record<VehicleStatus, ToneName> = {
  active: 'success',
  maintenance: 'warning',
  retired: 'neutral',
};

export const VEHICLE_STATUS_OPTIONS: Option<VehicleStatus>[] = (
  Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]
).map((status) => ({ label: VEHICLE_STATUS_LABELS[status], value: status }));

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  diesel: 'Diesel',
  petrol: 'Petrol',
  cng: 'CNG',
  electric: 'Electric',
};

export const FUEL_TYPE_OPTIONS: Option<FuelType>[] = (
  Object.keys(FUEL_TYPE_LABELS) as FuelType[]
).map((fuel) => ({ label: FUEL_TYPE_LABELS[fuel], value: fuel }));

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  insurance: 'Insurance',
  fitness: 'Fitness certificate',
  permit: 'Permit',
  pollution: 'Pollution certificate',
};

/** The order they are shown in — the two that ground a bus come first. */
export const DOCUMENT_KINDS: DocumentKind[] = ['insurance', 'fitness', 'permit', 'pollution'];

/**
 * Insurance and fitness are the two that legally stop a bus carrying children.
 * A lapsed permit or pollution certificate is a fine; these two are a crime.
 */
export const BLOCKING_DOCUMENTS: DocumentKind[] = ['insurance', 'fitness'];

export const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  valid: 'Valid',
  expiring: 'Expiring soon',
  expired: 'Expired',
  missing: 'Not recorded',
};

export const COMPLIANCE_TONES: Record<ComplianceStatus, ToneName> = {
  valid: 'success',
  expiring: 'warning',
  expired: 'danger',
  missing: 'neutral',
};

export const GPS_STATUS_LABELS: Record<GpsStatus, string> = {
  online: 'Reporting',
  idle: 'Parked',
  offline: 'Not reporting',
  unassigned: 'Not fitted',
};

export const GPS_STATUS_TONES: Record<GpsStatus, ToneName> = {
  online: 'success',
  idle: 'info',
  offline: 'danger',
  unassigned: 'neutral',
};

export const TRIP_LABELS: Record<TripType, string> = {
  both: 'Both ways',
  pickup: 'Pickup only',
  drop: 'Drop only',
};

export const TRIP_OPTIONS: Option<TripType>[] = (Object.keys(TRIP_LABELS) as TripType[]).map(
  (trip) => ({ label: TRIP_LABELS[trip], value: trip }),
);

/**
 * How urgent an expiry is.
 *
 * Shared by the vehicle list, the detail page and the fleet summary so a bus
 * cannot read amber on one screen and red on another.
 */
export function complianceFor(daysRemaining: number | null): ComplianceStatus {
  if (daysRemaining === null) return 'missing';
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= DOCUMENT_EXPIRY_WARNING_DAYS) return 'expiring';
  return 'valid';
}

/** The worst status across a set — a fleet is as compliant as its worst paper. */
export function worstCompliance(statuses: ComplianceStatus[]): ComplianceStatus {
  const order: ComplianceStatus[] = ['expired', 'missing', 'expiring', 'valid'];
  return order.find((status) => statuses.includes(status)) ?? 'valid';
}
