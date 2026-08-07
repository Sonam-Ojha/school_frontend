import type { HostelType, RoomType } from '@/features/hostel/types';

/**
 * Hostel seed for the development mock.
 *
 * Blocks and rooms only. Beds are minted by `devApi` from each room's type,
 * and residents are drawn from the live student roster — an allocation
 * hard-coded against a student id would break the moment the seed moved, and
 * a boys' block filled with girls would be worse than useless.
 *
 * Deliberately uneven: one block nearly full, one with room to spare, one
 * closed; a room under repair, one held back, and one furnished with fewer
 * beds than its type implies — so every badge, every warning and both
 * capacity states are reachable without editing anything.
 */

export interface HostelSeed {
  id: number;
  name: string;
  code: string;
  type: HostelType;
  address: string | null;
  /** Index into the active staff roster; the mock resolves it to a real id. */
  wardenIndex: number | null;
  mess_charge: number;
  is_active?: boolean;
}

export const hostelSeed: HostelSeed[] = [
  {
    id: 1,
    name: 'Nilgiri Block',
    code: 'BH-A',
    type: 'boys',
    address: 'Behind the science block, north campus',
    wardenIndex: 0,
    mess_charge: 3200,
  },
  {
    id: 2,
    name: 'Kaveri Block',
    code: 'GH-A',
    type: 'girls',
    address: 'West campus, beside the auditorium',
    wardenIndex: 1,
    mess_charge: 3200,
  },
  {
    id: 3,
    name: 'Sahyadri Block',
    code: 'BH-B',
    type: 'boys',
    address: 'North campus, second gate',
    // Nobody in charge yet — the "no warden" state.
    wardenIndex: null,
    mess_charge: 2800,
  },
  {
    // Closed for renovation: keeps its rooms, takes nobody new.
    id: 4,
    name: 'Old Wing',
    code: 'OH',
    type: 'boys',
    address: null,
    wardenIndex: null,
    mess_charge: 2500,
    is_active: false,
  },
];

export interface RoomSeed {
  hostelId: number;
  room_no: string;
  floor: number;
  type: RoomType;
  monthly_rent: number;
  has_ac?: boolean;
  has_attached_bath?: boolean;
  status?: 'available' | 'maintenance' | 'blocked';
  notes?: string;
  /** Beds to mint. Defaults to what the room type implies. */
  beds?: number;
  /**
   * Roughly what share of the beds should start occupied. The mock fills them
   * from the live roster, so the exact count depends on how many eligible
   * students the student seed produced.
   */
  fill?: number;
}

export const roomSeed: RoomSeed[] = [
  // --- Nilgiri (boys), nearly full ---
  { hostelId: 1, room_no: 'A-101', floor: 1, type: 'double', monthly_rent: 4500, has_ac: true, fill: 1 },
  { hostelId: 1, room_no: 'A-102', floor: 1, type: 'double', monthly_rent: 4500, has_ac: true, fill: 1 },
  { hostelId: 1, room_no: 'A-103', floor: 1, type: 'triple', monthly_rent: 3800, fill: 1 },
  { hostelId: 1, room_no: 'A-201', floor: 2, type: 'quad', monthly_rent: 3200, fill: 0.75 },
  { hostelId: 1, room_no: 'A-202', floor: 2, type: 'quad', monthly_rent: 3200, fill: 0.5 },
  {
    hostelId: 1,
    room_no: 'A-203',
    floor: 2,
    type: 'double',
    monthly_rent: 4500,
    status: 'maintenance',
    notes: 'Damp in the ceiling. Off the list until the monsoon repairs are done.',
    fill: 0,
  },

  // --- Kaveri (girls), room to spare ---
  { hostelId: 2, room_no: 'K-101', floor: 1, type: 'double', monthly_rent: 4500, has_ac: true, fill: 1 },
  { hostelId: 2, room_no: 'K-102', floor: 1, type: 'triple', monthly_rent: 3800, fill: 0.66 },
  { hostelId: 2, room_no: 'K-103', floor: 1, type: 'triple', monthly_rent: 3800, fill: 0.33 },
  { hostelId: 2, room_no: 'K-201', floor: 2, type: 'quad', monthly_rent: 3200, fill: 0.5 },
  {
    // Furnished with fewer beds than a dormitory usually holds — the type is
    // a label, the beds are the truth.
    hostelId: 2,
    room_no: 'K-202',
    floor: 2,
    type: 'dormitory',
    monthly_rent: 2400,
    beds: 6,
    fill: 0.5,
  },
  {
    hostelId: 2,
    room_no: 'K-203',
    floor: 2,
    type: 'single',
    monthly_rent: 6500,
    has_ac: true,
    status: 'blocked',
    notes: 'Held for a visiting scholar.',
    fill: 0,
  },

  // --- Sahyadri (boys), newly opened ---
  { hostelId: 3, room_no: 'S-101', floor: 1, type: 'quad', monthly_rent: 2900, has_attached_bath: false, fill: 0.5 },
  { hostelId: 3, room_no: 'S-102', floor: 1, type: 'quad', monthly_rent: 2900, has_attached_bath: false, fill: 0.25 },
  { hostelId: 3, room_no: 'S-103', floor: 1, type: 'dormitory', monthly_rent: 2200, has_attached_bath: false, fill: 0.25 },

  // --- Old Wing, closed but still on the register ---
  { hostelId: 4, room_no: 'O-01', floor: 0, type: 'quad', monthly_rent: 2000, has_attached_bath: false, status: 'maintenance', fill: 0 },
  { hostelId: 4, room_no: 'O-02', floor: 0, type: 'quad', monthly_rent: 2000, has_attached_bath: false, status: 'maintenance', fill: 0 },
];

export const nextHostelId = hostelSeed.length + 1;
export const nextRoomId = roomSeed.length + 1;
