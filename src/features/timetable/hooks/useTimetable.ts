import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';
import type { Option } from '@/types/common';

import type { PeriodInput, RoomInput, SlotInput } from '../schemas';
import {
  timetableService,
  type AvailabilityQuery,
  type SectionGridQuery,
} from '../services/timetableService';
import type { TimetableGrid, TimetableScope } from '../types';

export const timetableKeys = {
  all: ['timetable'] as const,
  periods: () => ['timetable', 'periods'] as const,
  workload: () => ['timetable', 'workload'] as const,
  sectionGrid: (query: SectionGridQuery) => ['timetable', 'grid', 'section', query] as const,
  teacherGrid: (teacherId: number) => ['timetable', 'grid', 'teacher', teacherId] as const,
  roomGrid: (roomId: number) => ['timetable', 'grid', 'room', roomId] as const,
  availability: (query: AvailabilityQuery) => ['timetable', 'availability', query] as const,
};

export const roomKeys = createResourceKeys('timetable-rooms');

/** The period grid and the room register change once a year — cache them hard. */
const LOOKUP_STALE_TIME = 15 * 60_000;

// --- periods ----------------------------------------------------------------

export function usePeriods() {
  const query = useQuery({
    queryKey: timetableKeys.periods(),
    queryFn: ({ signal }) => timetableService.periods(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const periods = useMemo(() => query.data ?? [], [query.data]);

  return { ...query, periods };
}

/**
 * Every write to a period or a room can change any grid in the school, so
 * both invalidate the whole namespace rather than one key. Precision here
 * would buy nothing and lose a stale-cell bug.
 */
function useInvalidateTimetable() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: timetableKeys.all });
    await queryClient.invalidateQueries({ queryKey: roomKeys.all });
  };
}

export function useCreatePeriod() {
  const invalidate = useInvalidateTimetable();

  return useMutation({
    mutationFn: (input: PeriodInput) => timetableService.createPeriod(input),
    onSuccess: async (period) => {
      await invalidate();
      toast.success('Period added', `${period.name} now appears in every ${period.shift} grid.`);
    },
  });
}

export function useUpdatePeriod(id: number) {
  const invalidate = useInvalidateTimetable();

  return useMutation({
    mutationFn: (input: PeriodInput) => timetableService.updatePeriod(id, input),
    onSuccess: async () => {
      await invalidate();
      toast.success('Period updated');
    },
  });
}

export function useDeletePeriod() {
  const invalidate = useInvalidateTimetable();

  return useMutation({
    mutationFn: (id: number) => timetableService.removePeriod(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Period removed');
    },
  });
}

// --- rooms ------------------------------------------------------------------

export function useRooms(params: ListQueryParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: ({ signal }) => timetableService.listRooms(params, signal),
    placeholderData: (previous) => previous,
  });
}

/** Active rooms as select options, for the slot form's room picker. */
export function useRoomOptions() {
  const query = useQuery({
    queryKey: roomKeys.options(),
    queryFn: ({ signal }) => timetableService.rooms(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const rooms = useMemo(() => query.data ?? [], [query.data]);

  const roomOptions = useMemo<Option<number>[]>(
    () => rooms.map((room) => ({ label: `${room.name} (${room.code})`, value: room.id })),
    [rooms],
  );

  return { ...query, rooms, roomOptions };
}

export function useCreateRoom() {
  const invalidate = useInvalidateTimetable();

  return useMutation({
    mutationFn: (input: RoomInput) => timetableService.createRoom(input),
    onSuccess: async (room) => {
      await invalidate();
      toast.success('Room added', `${room.name} can now hold lessons.`);
    },
  });
}

export function useUpdateRoom(id: number) {
  const invalidate = useInvalidateTimetable();

  return useMutation({
    mutationFn: (input: RoomInput) => timetableService.updateRoom(id, input),
    onSuccess: async () => {
      await invalidate();
      toast.success('Room updated');
    },
  });
}

export function useDeleteRoom() {
  const invalidate = useInvalidateTimetable();

  return useMutation({
    mutationFn: (id: number) => timetableService.removeRoom(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Room removed');
    },
  });
}

// --- the three grids --------------------------------------------------------

export function useSectionGrid(query: SectionGridQuery, enabled = true) {
  return useQuery({
    queryKey: timetableKeys.sectionGrid(query),
    queryFn: ({ signal }) => timetableService.sectionGrid(query, signal),
    enabled: enabled && query.classId > 0 && query.sectionId > 0,
    placeholderData: (previous) => previous,
  });
}

export function useTeacherGrid(teacherId: number | null) {
  return useQuery({
    queryKey: timetableKeys.teacherGrid(teacherId ?? 0),
    queryFn: ({ signal }) => timetableService.teacherGrid(teacherId!, signal),
    enabled: Boolean(teacherId),
    placeholderData: (previous) => previous,
  });
}

export function useRoomGrid(roomId: number | null) {
  return useQuery({
    queryKey: timetableKeys.roomGrid(roomId ?? 0),
    queryFn: ({ signal }) => timetableService.roomGrid(roomId!, signal),
    enabled: Boolean(roomId),
    placeholderData: (previous) => previous,
  });
}

export function useWorkload() {
  return useQuery({
    queryKey: timetableKeys.workload(),
    queryFn: ({ signal }) => timetableService.workload(signal),
    staleTime: 60_000,
  });
}

/** Only asked once a cell is open — an unopened form needs no availability. */
export function useAvailability(query: AvailabilityQuery | null) {
  return useQuery({
    queryKey: timetableKeys.availability(query ?? { dayOfWeek: 1, periodId: 0 }),
    queryFn: ({ signal }) => timetableService.availability(query!, signal),
    enabled: query !== null && query.periodId > 0,
  });
}

// --- writes -----------------------------------------------------------------

/**
 * Save one cell.
 *
 * The server returns the recomputed section grid, which is written straight
 * into the cache — a refetch would show the same numbers a moment later, and
 * a locally-patched cell would show different ones forever.
 */
export function useSaveSlot(query: SectionGridQuery) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTimetable();

  return useMutation({
    mutationFn: (input: SlotInput) => timetableService.saveSlot(input),
    onSuccess: async (grid) => {
      queryClient.setQueryData<TimetableGrid>(timetableKeys.sectionGrid(query), grid);
      // The teacher and room grids share these slots, so they are stale too.
      await invalidate();
      toast.success('Lesson saved');
    },
  });
}

export function useRemoveSlot(query: SectionGridQuery) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTimetable();

  return useMutation({
    mutationFn: (slotId: number) => timetableService.removeSlot(slotId),
    onSuccess: async (grid) => {
      queryClient.setQueryData<TimetableGrid>(timetableKeys.sectionGrid(query), grid);
      await invalidate();
      toast.success('Lesson cleared');
    },
  });
}

export function useExportTimetable() {
  return useMutation({
    mutationFn: ({
      scope,
      id,
      label,
    }: {
      scope: TimetableScope;
      id: number | string;
      label: string;
    }) => timetableService.exportGrid(scope, id, label),
    onError: (error: Error) => {
      toast.error('Could not export the timetable', error.message);
    },
  });
}
