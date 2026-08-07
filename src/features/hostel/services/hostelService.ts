import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type {
  ApiResource,
  CollectionResponse,
  ListQueryParams,
  PaginatedResponse,
} from '@/types/api';

import type {
  AddBedsInput,
  AllocationInput,
  BedInput,
  HostelInput,
  RaiseChargesInput,
  RollCallEntryInput,
  RoomInput,
  VacateInput,
} from '../schemas';
import type {
  Hostel,
  HostelAllocation,
  HostelCharge,
  HostelChargeSummary,
  HostelRoom,
  HostelRoomDetail,
  HostelSummary,
  RollCall,
} from '../types';

const roomCrud = createCrudService<HostelRoom>('/hostel/rooms');

const nullable = (value: string): string | null => value.trim() || null;

const toHostelPayload = (input: HostelInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  type: input.type,
  address: nullable(input.address),
  warden_id: input.warden_id,
  mess_charge: input.mess_charge,
  is_active: input.is_active,
});

const toRoomPayload = (input: RoomInput) => ({
  hostel_id: input.hostel_id,
  room_no: input.room_no.trim().toUpperCase(),
  floor: input.floor,
  type: input.type,
  monthly_rent: input.monthly_rent,
  has_ac: input.has_ac,
  has_attached_bath: input.has_attached_bath,
  status: input.status,
  notes: nullable(input.notes),
});

export interface RollCallQuery {
  hostelId: number;
  date: string;
}

export interface ChargeQuery extends ListQueryParams {
  hostel_id?: number;
}

export const hostelService = {
  // --- hostels ---

  async hostels(signal?: AbortSignal): Promise<Hostel[]> {
    const { data } = await http.get<CollectionResponse<Hostel>>('/hostel/hostels', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },

  async createHostel(input: HostelInput): Promise<Hostel> {
    const { data } = await http.post<ApiResource<Hostel>>(
      '/hostel/hostels',
      toHostelPayload(input),
    );
    return data.data;
  },

  async updateHostel(id: number, input: HostelInput): Promise<Hostel> {
    const { data } = await http.put<ApiResource<Hostel>>(
      `/hostel/hostels/${id}`,
      toHostelPayload(input),
    );
    return data.data;
  },

  async removeHostel(id: number): Promise<void> {
    await http.delete(`/hostel/hostels/${id}`);
  },

  // --- rooms ---

  list: roomCrud.list,

  async show(id: number | string, signal?: AbortSignal): Promise<HostelRoomDetail> {
    const { data } = await http.get<ApiResource<HostelRoomDetail>>(`/hostel/rooms/${id}`, {
      signal,
    });
    return data.data;
  },

  async createRoom(input: RoomInput): Promise<HostelRoomDetail> {
    const { data } = await http.post<ApiResource<HostelRoomDetail>>(
      '/hostel/rooms',
      toRoomPayload(input),
    );
    return data.data;
  },

  async updateRoom(id: number, input: RoomInput): Promise<HostelRoomDetail> {
    const { data } = await http.put<ApiResource<HostelRoomDetail>>(
      `/hostel/rooms/${id}`,
      toRoomPayload(input),
    );
    return data.data;
  },

  async removeRoom(id: number): Promise<void> {
    await http.delete(`/hostel/rooms/${id}`);
  },

  // --- beds ---

  /**
   * Bed writes return the recomputed room.
   *
   * The bed counts and the room's own status are derived from the beds, so
   * the side that owns the arithmetic sends them back — a client adding a bed
   * and leaving `available_beds` alone would drift within a single click.
   */
  async addBeds(roomId: number, input: AddBedsInput): Promise<HostelRoomDetail> {
    const { data } = await http.post<ApiResource<HostelRoomDetail>>(
      `/hostel/rooms/${roomId}/beds`,
      { quantity: input.quantity, notes: nullable(input.notes) },
    );
    return data.data;
  },

  async updateBed(roomId: number, bedId: number, input: BedInput): Promise<HostelRoomDetail> {
    const { data } = await http.put<ApiResource<HostelRoomDetail>>(
      `/hostel/rooms/${roomId}/beds/${bedId}`,
      {
        bed_no: input.bed_no.trim().toUpperCase(),
        status: input.status,
        notes: nullable(input.notes),
      },
    );
    return data.data;
  },

  async removeBed(roomId: number, bedId: number): Promise<HostelRoomDetail> {
    const { data } = await http.delete<ApiResource<HostelRoomDetail>>(
      `/hostel/rooms/${roomId}/beds/${bedId}`,
    );
    return data.data;
  },

  /** Vacant beds in a hostel, for the allocation form's cascading pickers. */
  async vacantBeds(hostelId: number, signal?: AbortSignal): Promise<HostelRoomDetail[]> {
    const { data } = await http.get<CollectionResponse<HostelRoomDetail>>('/hostel/vacancies', {
      params: { hostel_id: hostelId },
      signal,
    });
    return data.data;
  },

  // --- allocations ---

  async allocations(
    params: ListQueryParams = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<HostelAllocation>> {
    const { data } = await http.get<PaginatedResponse<HostelAllocation>>('/hostel/allocations', {
      params,
      signal,
    });
    return data;
  },

  async allocate(input: AllocationInput): Promise<HostelAllocation> {
    const { data } = await http.post<ApiResource<HostelAllocation>>('/hostel/allocations', {
      student_id: input.student_id,
      hostel_id: input.hostel_id,
      room_id: input.room_id,
      bed_id: input.bed_id,
      mess_plan: input.mess_plan,
      allocated_on: input.allocated_on,
    });
    return data.data;
  },

  /** Ends a stay and frees the bed. The allocation is kept as history. */
  async vacate(input: VacateInput): Promise<HostelAllocation> {
    const { data } = await http.post<ApiResource<HostelAllocation>>(
      `/hostel/allocations/${input.allocation_id}/vacate`,
      { vacated_on: input.vacated_on, reason: nullable(input.reason) },
    );
    return data.data;
  },

  /** Moves a resident to another bed without ending their stay. */
  async transfer(allocationId: number, bedId: number): Promise<HostelAllocation> {
    const { data } = await http.post<ApiResource<HostelAllocation>>(
      `/hostel/allocations/${allocationId}/transfer`,
      { bed_id: bedId },
    );
    return data.data;
  },

  // --- fees ---

  /**
   * What each resident is charged, and what the fee ledger says they owe.
   *
   * The balance is not computed here. The hostel owns what a bed costs; the
   * fees module owns what has been billed and collected against the hostel
   * fee head, and a second ledger would be a second answer to the only
   * question a parent actually asks.
   */
  async charges(query: ChargeQuery = {}, signal?: AbortSignal) {
    const { data } = await http.get<PaginatedResponse<HostelCharge>>('/hostel/charges', {
      params: query,
      signal,
    });
    return data;
  },

  async chargeSummary(hostelId?: number, signal?: AbortSignal): Promise<HostelChargeSummary> {
    const { data } = await http.get<ApiResource<HostelChargeSummary>>('/hostel/charges/summary', {
      params: hostelId ? { hostel_id: hostelId } : {},
      signal,
    });
    return data.data;
  },

  /** Raises a month's rent and mess into the fee ledger, once. */
  async raiseCharges(input: RaiseChargesInput): Promise<HostelChargeSummary> {
    const { data } = await http.post<ApiResource<HostelChargeSummary>>('/hostel/charges/raise', {
      hostel_id: input.hostel_id,
      month: input.month,
    });
    return data.data;
  },

  // --- roll call ---

  async rollCall(query: RollCallQuery, signal?: AbortSignal): Promise<RollCall> {
    const { data } = await http.get<ApiResource<RollCall>>('/hostel/roll-call', {
      params: { hostel_id: query.hostelId, date: query.date },
      signal,
    });
    return data.data;
  },

  /**
   * Saves the changed rows of a roll call.
   *
   * Batched, like attendance and exam marks: calling a hostel of eighty one
   * request at a time half-saves on a dropped connection, and a half-called
   * register is worse than none.
   */
  async saveRollCall(
    query: RollCallQuery,
    entries: RollCallEntryInput[],
  ): Promise<RollCall> {
    const { data } = await http.post<ApiResource<RollCall>>('/hostel/roll-call', {
      hostel_id: query.hostelId,
      date: query.date,
      entries: entries.map((entry) => ({
        allocation_id: entry.allocation_id,
        status: entry.status,
        remarks: nullable(entry.remarks),
      })),
    });
    return data.data;
  },

  async summary(signal?: AbortSignal): Promise<HostelSummary> {
    const { data } = await http.get<ApiResource<HostelSummary>>('/hostel/summary', { signal });
    return data.data;
  },

  // --- printing and export ---

  /** The room list a warden pins up, with who is in which bed. */
  async downloadOccupancy(hostelId: number, hostelCode: string): Promise<void> {
    await downloadFile(
      `/hostel/hostels/${hostelId}/occupancy`,
      timestampedFilename(`hostel-${hostelCode.toLowerCase()}-occupancy`, 'pdf'),
    );
  },

  async exportAllocations(params: ListQueryParams, format: 'pdf' | 'excel'): Promise<void> {
    await downloadFile(
      '/hostel/allocations/export',
      timestampedFilename('hostel-residents', format === 'excel' ? 'xlsx' : 'pdf'),
      { params: { ...params, format } },
    );
  },
};

export type { ListQueryParams };
