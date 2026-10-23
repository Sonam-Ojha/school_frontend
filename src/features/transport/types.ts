/**
 * School transport.
 *
 * Four records. A **vehicle** is a bus, with its statutory papers and a seat
 * count. A **route** is the run it makes, made of ordered **stops** — each
 * with a pickup time, a drop time and a monthly fare. An **assignment** puts
 * one student on one stop of one route.
 *
 * Drivers are not a record here. They are staff, with a licence already
 * tracked on the staff module, and a second driver table would be a second
 * place for a licence expiry to go stale. Transport reads that roster the way
 * the library reads students and teachers.
 *
 * GPS is "ready" in the same sense attendance is ready for biometrics: the
 * device registry, the position contract and the live view all exist and
 * work, and no vendor is bound. Hardware pushes to the backend; the frontend
 * polls for what it pushed.
 */

export type VehicleStatus = 'active' | 'maintenance' | 'retired';

export type FuelType = 'diesel' | 'petrol' | 'cng' | 'electric';

/** The four papers a school bus must carry. */
export type DocumentKind = 'insurance' | 'fitness' | 'permit' | 'pollution';

/**
 * `missing` is not the same as `expired`: one is a bus nobody has recorded
 * papers for, the other is a bus that may not legally leave the yard.
 */
export type ComplianceStatus = 'valid' | 'expiring' | 'expired' | 'missing';

export interface VehicleDocument {
  kind: DocumentKind;
  expires_on: string | null;
  /** Negative once it has lapsed. Null when nothing is recorded. */
  days_remaining: number | null;
  status: ComplianceStatus;
}

export interface Vehicle {
  id: number;
  registration_no: string;
  /** Friendly name painted on the side — `Bus 4`. */
  name: string;
  make: string | null;
  model: string | null;
  manufacture_year: number | null;
  /** Seats, excluding the driver. Caps how many students a route may carry. */
  capacity: number;
  fuel_type: FuelType;
  status: VehicleStatus;

  /** Staff members. Null until somebody is assigned. */
  driver_id: number | null;
  driver_name: string | null;
  driver_phone: string | null;
  attendant_id: number | null;
  attendant_name: string | null;

  route_id: number | null;
  route_name: string | null;

  gps_device_id: number | null;
  gps_imei: string | null;

  documents: VehicleDocument[];
  /** The worst of the four — what the list column shows. */
  compliance: ComplianceStatus;

  odometer_km: number | null;
  notes: string | null;
  created_at: string;
}

export interface TransportRoute {
  id: number;
  name: string;
  /** Short code on the bus board — `R-04`. */
  code: string;
  description: string | null;

  vehicle_id: number | null;
  vehicle_registration: string | null;
  vehicle_name: string | null;
  driver_name: string | null;
  /** Seats on the assigned bus, or zero without one. */
  capacity: number;

  distance_km: number | null;
  /** First pickup and last drop, derived from the stops. */
  start_time: string | null;
  end_time: string | null;

  stops_count: number;
  students_count: number;
  seats_available: number;
  is_active: boolean;
  created_at: string;
}

/** `GET /transport/routes/{id}` — adds the ordered stops. */
export interface RouteDetail extends TransportRoute {
  stops: RouteStop[];
}

export interface RouteStop {
  id: number;
  route_id: number;
  name: string;
  /** Position along the run, from 1. Unique within the route. */
  sequence: number;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  /** `HH:mm`. Must ascend with the sequence — a later stop is a later time. */
  pickup_time: string;
  drop_time: string;
  /** Monthly charge for boarding here. */
  fare: number;
  students_count: number;
}

export type TripType = 'both' | 'pickup' | 'drop';

/** One student on one stop. */
export interface TransportAssignment {
  id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  photo_url: string | null;
  class_name: string;
  section_name: string | null;

  route_id: number;
  route_name: string;
  stop_id: number;
  stop_name: string;

  trip: TripType;
  /**
   * Derived from the stop's fare and the trip — a one-way rider pays half.
   * Not stored, so a change to the stop's fare reaches everybody on it.
   */
  fare: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

// --- GPS --------------------------------------------------------------------

/**
 * `unassigned` is a device in the drawer; `offline` is one that should be
 * reporting and is not — which is the state worth an alert.
 */
export type GpsStatus = 'online' | 'idle' | 'offline' | 'unassigned';

export interface GpsDevice {
  id: number;
  imei: string;
  sim_number: string | null;
  provider: string;
  vehicle_id: number | null;
  vehicle_registration: string | null;
  status: GpsStatus;
  last_ping_at: string | null;
  installed_on: string;
}

/**
 * A tracker as the API returns it from a save. `push_key` is present only
 * when one was just issued — on registering, or when a new one is asked for —
 * and is never returned again.
 */
export interface RegisteredGpsDevice extends GpsDevice {
  push_key?: string;
}

/**
 * Where a bus is now.
 *
 * `is_stale` rather than a client-side timestamp comparison: whether a fix is
 * too old to trust depends on the reporting interval the device is configured
 * with, which the backend knows and the browser does not.
 */
export interface VehiclePosition {
  vehicle_id: number;
  registration_no: string;
  vehicle_name: string;
  route_id: number | null;
  route_name: string | null;
  driver_name: string | null;

  latitude: number;
  longitude: number;
  speed_kmph: number;
  heading_degrees: number;
  recorded_at: string;
  is_stale: boolean;
  status: GpsStatus;

  /** Progress along the run, for the schematic. */
  last_stop_id: number | null;
  last_stop_name: string | null;
  next_stop_id: number | null;
  next_stop_name: string | null;
  eta_minutes: number | null;
  progress_percent: number;
  students_on_board: number;
}

export interface TransportSummary {
  vehicles: number;
  active_vehicles: number;
  routes: number;
  students: number;
  /** Buses whose papers have lapsed — the number that stops a fleet. */
  expired_documents: number;
  expiring_documents: number;
  gps_online: number;
  gps_offline: number;
}
