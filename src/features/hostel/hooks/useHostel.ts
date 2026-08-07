import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';
import type { Option } from '@/types/common';

import { HOSTEL_TYPE_LABELS } from '../constants';
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
import {
  hostelService,
  type ChargeQuery,
  type RollCallQuery,
} from '../services/hostelService';
import type { HostelRoomDetail, RollCall } from '../types';

export const roomKeys = createResourceKeys('hostel-rooms');

export const hostelKeys = {
  all: ['hostel'] as const,
  hostels: () => ['hostel', 'hostels'] as const,
  summary: () => ['hostel', 'summary'] as const,
  vacancies: (hostelId: number) => ['hostel', 'vacancies', hostelId] as const,
  allocations: (params: ListQueryParams) => ['hostel', 'allocations', params] as const,
  charges: (query: ChargeQuery) => ['hostel', 'charges', query] as const,
  chargeSummary: (hostelId?: number) => ['hostel', 'charges', 'summary', hostelId ?? 0] as const,
  rollCall: (query: RollCallQuery) => ['hostel', 'roll-call', query] as const,
};

/** Blocks and rooms change once a year; the occupancy under them does not. */
const LOOKUP_STALE_TIME = 10 * 60_000;

/**
 * Every write here moves an occupancy figure somewhere else: allocating a bed
 * changes the room's free count, the block's percentage, tonight's roll call
 * and the month's charges at once. Precision would buy nothing and lose a
 * stale-count bug.
 */
function useInvalidateHostel() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: hostelKeys.all });
    await queryClient.invalidateQueries({ queryKey: roomKeys.all });
  };
}

// --- hostels ----------------------------------------------------------------

export function useHostels() {
  const query = useQuery({
    queryKey: hostelKeys.hostels(),
    queryFn: ({ signal }) => hostelService.hostels(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const hostels = useMemo(() => query.data ?? [], [query.data]);

  const hostelOptions = useMemo<Option<number>[]>(
    () =>
      hostels
        .filter((hostel) => hostel.is_active)
        .map((hostel) => ({
          label: `${hostel.name} (${HOSTEL_TYPE_LABELS[hostel.type]})`,
          value: hostel.id,
        })),
    [hostels],
  );

  return { ...query, hostels, hostelOptions };
}

export function useCreateHostel() {
  const invalidate = useInvalidateHostel();

  return useMutation({
    mutationFn: (input: HostelInput) => hostelService.createHostel(input),
    onSuccess: async (hostel) => {
      await invalidate();
      toast.success('Hostel added', `Add rooms to ${hostel.name} to start allocating beds.`);
    },
  });
}

export function useUpdateHostel(id: number) {
  const invalidate = useInvalidateHostel();

  return useMutation({
    mutationFn: (input: HostelInput) => hostelService.updateHostel(id, input),
    onSuccess: async () => {
      await invalidate();
      toast.success('Hostel updated');
    },
  });
}

export function useDeleteHostel() {
  const invalidate = useInvalidateHostel();

  return useMutation({
    mutationFn: (id: number) => hostelService.removeHostel(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Hostel removed');
    },
  });
}

// --- rooms ------------------------------------------------------------------

export function useRooms(params: ListQueryParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: ({ signal }) => hostelService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useRoom(id: number | string | undefined) {
  return useQuery({
    queryKey: roomKeys.detail(id ?? ''),
    queryFn: ({ signal }) => hostelService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

export function useCreateRoom() {
  const invalidate = useInvalidateHostel();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RoomInput) => hostelService.createRoom(input),
    onSuccess: async (room) => {
      queryClient.setQueryData(roomKeys.detail(room.id), room);
      await invalidate();
      toast.success('Room added', 'Add its beds to make them allocatable.');
    },
  });
}

export function useUpdateRoom(id: number) {
  const invalidate = useInvalidateHostel();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RoomInput) => hostelService.updateRoom(id, input),
    onSuccess: async (room) => {
      queryClient.setQueryData(roomKeys.detail(room.id), room);
      await invalidate();
      toast.success('Room updated');
    },
  });
}

export function useDeleteRoom() {
  const invalidate = useInvalidateHostel();

  return useMutation({
    mutationFn: (id: number) => hostelService.removeRoom(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Room removed');
    },
  });
}

// --- beds -------------------------------------------------------------------

/** Bed writes all return the recomputed room, which is cached directly. */
function useBedMutation<TInput>(
  roomId: number,
  mutationFn: (input: TInput) => Promise<HostelRoomDetail>,
  message: string,
) {
  const invalidate = useInvalidateHostel();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (room) => {
      queryClient.setQueryData(roomKeys.detail(roomId), room);
      await invalidate();
      toast.success(message);
    },
  });
}

export function useAddBeds(roomId: number) {
  return useBedMutation<AddBedsInput>(
    roomId,
    (input) => hostelService.addBeds(roomId, input),
    'Beds added',
  );
}

export function useUpdateBed(roomId: number, bedId: number) {
  return useBedMutation<BedInput>(
    roomId,
    (input) => hostelService.updateBed(roomId, bedId, input),
    'Bed updated',
  );
}

export function useRemoveBed(roomId: number) {
  return useBedMutation<number>(
    roomId,
    (bedId) => hostelService.removeBed(roomId, bedId),
    'Bed removed',
  );
}

/** Only asked once a hostel is chosen — an unopened form needs no vacancies. */
export function useVacancies(hostelId: number | null) {
  return useQuery({
    queryKey: hostelKeys.vacancies(hostelId ?? 0),
    queryFn: ({ signal }) => hostelService.vacantBeds(hostelId!, signal),
    enabled: Boolean(hostelId),
  });
}

// --- allocations ------------------------------------------------------------

export function useAllocations(params: ListQueryParams) {
  return useQuery({
    queryKey: hostelKeys.allocations(params),
    queryFn: ({ signal }) => hostelService.allocations(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useAllocateBed() {
  const invalidate = useInvalidateHostel();

  return useMutation({
    mutationFn: (input: AllocationInput) => hostelService.allocate(input),
    onSuccess: async (allocation) => {
      await invalidate();
      toast.success(
        'Bed allocated',
        `${allocation.student_name} is in ${allocation.room_no}, bed ${allocation.bed_no}.`,
      );
    },
  });
}

export function useVacateBed() {
  const invalidate = useInvalidateHostel();

  return useMutation({
    mutationFn: (input: VacateInput) => hostelService.vacate(input),
    onSuccess: async (allocation) => {
      await invalidate();
      toast.success('Bed vacated', `${allocation.room_no} bed ${allocation.bed_no} is free.`);
    },
  });
}

export function useTransferBed() {
  const invalidate = useInvalidateHostel();

  return useMutation({
    mutationFn: ({ allocationId, bedId }: { allocationId: number; bedId: number }) =>
      hostelService.transfer(allocationId, bedId),
    onSuccess: async (allocation) => {
      await invalidate();
      toast.success('Resident moved', `Now in ${allocation.room_no}, bed ${allocation.bed_no}.`);
    },
  });
}

// --- fees -------------------------------------------------------------------

export function useCharges(query: ChargeQuery) {
  return useQuery({
    queryKey: hostelKeys.charges(query),
    queryFn: ({ signal }) => hostelService.charges(query, signal),
    placeholderData: (previous) => previous,
  });
}

export function useChargeSummary(hostelId?: number) {
  return useQuery({
    queryKey: hostelKeys.chargeSummary(hostelId),
    queryFn: ({ signal }) => hostelService.chargeSummary(hostelId, signal),
  });
}

export function useRaiseCharges() {
  const invalidate = useInvalidateHostel();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RaiseChargesInput) => hostelService.raiseCharges(input),
    onSuccess: async () => {
      await invalidate();
      // The charges land on the students' fee accounts, so those are stale too.
      await queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Charges raised', 'They are on the students’ fee accounts.');
    },
  });
}

// --- roll call --------------------------------------------------------------

export function useRollCall(query: RollCallQuery, enabled = true) {
  return useQuery({
    queryKey: hostelKeys.rollCall(query),
    queryFn: ({ signal }) => hostelService.rollCall(query, signal),
    enabled: enabled && query.hostelId > 0 && query.date !== '',
    placeholderData: (previous) => previous,
  });
}

/**
 * Save a roll call.
 *
 * The server returns the recomputed register, written straight into the
 * cache — the summary counts come from the side that owns them, and a
 * locally-tallied one would disagree the first time two wardens marked at
 * once.
 */
export function useSaveRollCall(query: RollCallQuery) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateHostel();

  return useMutation({
    mutationFn: (entries: RollCallEntryInput[]) => hostelService.saveRollCall(query, entries),
    onSuccess: async (rollCall) => {
      queryClient.setQueryData<RollCall>(hostelKeys.rollCall(query), rollCall);
      await invalidate();
      toast.success(
        'Roll call saved',
        rollCall.summary.unmarked > 0
          ? `${rollCall.summary.unmarked} residents still to call.`
          : 'Every resident is accounted for.',
      );
    },
  });
}

export function useHostelSummary() {
  return useQuery({
    queryKey: hostelKeys.summary(),
    queryFn: ({ signal }) => hostelService.summary(signal),
    staleTime: 60_000,
  });
}

// --- printing and export ----------------------------------------------------

export function useDownloadOccupancy() {
  return useMutation({
    mutationFn: ({ hostelId, hostelCode }: { hostelId: number; hostelCode: string }) =>
      hostelService.downloadOccupancy(hostelId, hostelCode),
    onError: (error: Error) => toast.error('Could not download the occupancy sheet', error.message),
  });
}

export function useExportAllocations() {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListQueryParams; format: 'pdf' | 'excel' }) =>
      hostelService.exportAllocations(params, format),
    onError: (error: Error) => toast.error('Could not export the residents', error.message),
  });
}
