import type { Gender } from '@/features/students/types';

/**
 * Boarding.
 *
 * Four records, nested. A **hostel** is a block with a warden and a mess. A
 * **room** is a space inside it. A **bed** is the thing actually allocated —
 * the same room/copy distinction the library draws between a title and the
 * physical object on the shelf, and for the same reason: "room 12 is full"
 * cannot say which of its four beds is free.
 *
 * An **allocation** puts one student in one bed, and is what everything else
 * hangs off: the monthly charge, the roll call and the occupancy figures are
 * all readings of the allocations, never stored beside them.
 *
 * Hostel rooms are deliberately not the `Room` record the timetable owns.
 * That one is a teaching space booked by period and released an hour later;
 * this one is a residence held for a term, and it owns beds. Sharing them
 * would mean one table answering two questions that have nothing in common.
 */

export type HostelType = 'boys' | 'girls';

export interface Hostel {
  id: number;
  name: string;
  /** Short code on the block board — `BH-A`. */
  code: string;
  type: HostelType;
  address: string | null;

  /** A staff member. Null until somebody is put in charge. */
  warden_id: number | null;
  warden_name: string | null;
  warden_phone: string | null;

  /** Monthly mess charge on the full plan. Other plans are a share of it. */
  mess_charge: number;

  /** All computed from the rooms and beds beneath it. */
  rooms_count: number;
  beds_count: number;
  occupied_beds: number;
  available_beds: number;
  occupancy_percent: number;

  is_active: boolean;
  created_at: string;
}

export type RoomType = 'single' | 'double' | 'triple' | 'quad' | 'dormitory';

/**
 * `full` is derived from the beds; `maintenance` and `blocked` are set by
 * hand — one is a room being repaired, the other one held back deliberately.
 */
export type RoomStatus = 'available' | 'full' | 'maintenance' | 'blocked';

export interface HostelRoom {
  id: number;
  hostel_id: number;
  hostel_name: string;
  hostel_type: HostelType;

  room_no: string;
  floor: number;
  type: RoomType;

  /** Counted from the beds, never stored — the beds are the truth. */
  beds_count: number;
  occupied_beds: number;
  available_beds: number;

  /** Monthly rent for a bed in this room. */
  monthly_rent: number;
  has_ac: boolean;
  has_attached_bath: boolean;

  status: RoomStatus;
  notes: string | null;
  created_at: string;
}

/** `GET /hostel/rooms/{id}` — adds the beds. */
export interface HostelRoomDetail extends HostelRoom {
  beds: Bed[];
}

export type BedStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance';

/** One bed, and the only thing a student is ever allocated to. */
export interface Bed {
  id: number;
  room_id: number;
  room_no: string;
  hostel_id: number;
  hostel_name: string;
  /** Unique within the room — `A`, `B`, or a number in a dormitory. */
  bed_no: string;
  status: BedStatus;
  notes: string | null;
  /** Who is in it. Null unless the status is `occupied`. */
  occupant: BedOccupant | null;
}

export interface BedOccupant {
  allocation_id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  photo_url: string | null;
  class_name: string;
  allocated_on: string;
}

/**
 * What a resident eats.
 *
 * The rate lives on the hostel and the plan is a share of it, so a hostel
 * putting its mess charge up reaches every resident rather than being copied
 * onto each allocation.
 */
export type MessPlan = 'full' | 'breakfast_dinner' | 'none';

export interface HostelAllocation {
  id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  photo_url: string | null;
  gender: Gender;
  class_name: string;
  section_name: string | null;
  guardian_phone: string | null;

  hostel_id: number;
  hostel_name: string;
  room_id: number;
  room_no: string;
  bed_id: number;
  bed_no: string;

  allocated_on: string;
  /** Null while they are still resident. */
  vacated_on: string | null;
  is_active: boolean;

  mess_plan: MessPlan;
  /** Derived from the room's rent and the hostel's mess rate. Not stored. */
  room_rent: number;
  mess_charge: number;
  monthly_charge: number;
}

// --- fees -------------------------------------------------------------------

/**
 * What one resident is charged and what they owe.
 *
 * The amounts owed come from the fee ledger, not from here. The hostel owns
 * what a bed *costs*; the fees module owns what has been billed and collected,
 * and a second money ledger in this module would be a second answer to "what
 * does this family owe the school".
 */
export interface HostelCharge {
  /** The allocation's id — a charge row *is* one stay's monthly cost. */
  id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  class_name: string;
  hostel_name: string;
  room_no: string;
  bed_no: string;
  mess_plan: MessPlan;

  room_rent: number;
  mess_charge: number;
  monthly_charge: number;

  /** Raised into the fee ledger against the hostel fee head. */
  months_billed: number;
  billed_amount: number;
  paid_amount: number;
  balance: number;
}

export interface HostelChargeSummary {
  residents: number;
  monthly_total: number;
  billed: number;
  collected: number;
  outstanding: number;
  /** Months already raised, so the same one is not billed twice. */
  billed_months: string[];
}

// --- roll call --------------------------------------------------------------

/**
 * Evening roll call.
 *
 * Deliberately not the attendance module's `AttendanceStatus`: a hostel night
 * has no half day, and it has two states class attendance has never needed —
 * signed out on a pass and expected back, and back after curfew.
 */
export type RollCallStatus = 'present' | 'absent' | 'on_leave' | 'out_pass' | 'late_return';

export interface RollCallEntry {
  allocation_id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  photo_url: string | null;
  class_name: string;
  room_no: string;
  bed_no: string;

  /** Null means not yet called — distinct from being marked absent. */
  status: RollCallStatus | null;
  remarks: string | null;
  marked_at: string | null;
  marked_by: string | null;
}

export interface RollCallSummary {
  total: number;
  marked: number;
  unmarked: number;
  present: number;
  absent: number;
  on_leave: number;
  out_pass: number;
  late_return: number;
}

export interface RollCall {
  hostel_id: number;
  hostel_name: string;
  date: string;
  entries: RollCallEntry[];
  summary: RollCallSummary;
  /**
   * A past roll call is a record, not a draft.
   *
   * Locked after the grace window so a warden cannot quietly rewrite last
   * Tuesday — which is exactly the night somebody would want rewritten.
   */
  is_locked: boolean;
  lock_reason: string | null;
}

export interface HostelSummary {
  hostels: number;
  rooms: number;
  beds: number;
  occupied_beds: number;
  available_beds: number;
  occupancy_percent: number;
  /** Residents not accounted for in tonight's roll call. */
  unmarked_tonight: number;
  outstanding_fees: number;
}
