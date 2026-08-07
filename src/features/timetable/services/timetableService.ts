import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource, CollectionResponse, ListQueryParams } from '@/types/api';

import type { PeriodInput, RoomInput, SlotInput } from '../schemas';
import type {
  Period,
  Room,
  SlotAvailability,
  TeacherWorkload,
  TimetableGrid,
  TimetableScope,
  Weekday,
} from '../types';

const roomCrud = createCrudService<Room>('/timetable/rooms');

const nullable = (value: string): string | null => value.trim() || null;

const toPeriodPayload = (input: PeriodInput) => ({
  name: input.name.trim(),
  shift: input.shift,
  sort_order: input.sort_order,
  start_time: input.start_time,
  end_time: input.end_time,
  is_break: input.is_break,
});

/**
 * A blank floor is "not applicable", not floor zero — a ground has no floor,
 * and sending `0` would put it in the basement of every filter.
 */
const toRoomPayload = (input: RoomInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  type: input.type,
  building: nullable(input.building),
  floor: input.floor.trim() === '' ? null : Number(input.floor),
  capacity: input.capacity,
  is_active: input.is_active,
});

export interface SectionGridQuery {
  classId: number;
  sectionId: number;
}

export interface AvailabilityQuery {
  dayOfWeek: Weekday;
  periodId: number;
  /** Narrows the teacher list to those qualified for the subject. */
  subjectId?: number | null;
  /** The slot being edited, so its own teacher and room do not read as busy. */
  excludeSlotId?: number | null;
}

export const timetableService = {
  // --- periods: the school's daily time grid ---

  async periods(signal?: AbortSignal): Promise<Period[]> {
    const { data } = await http.get<CollectionResponse<Period>>('/timetable/periods', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },

  async createPeriod(input: PeriodInput): Promise<Period> {
    const { data } = await http.post<ApiResource<Period>>(
      '/timetable/periods',
      toPeriodPayload(input),
    );
    return data.data;
  },

  async updatePeriod(id: number, input: PeriodInput): Promise<Period> {
    const { data } = await http.put<ApiResource<Period>>(
      `/timetable/periods/${id}`,
      toPeriodPayload(input),
    );
    return data.data;
  },

  async removePeriod(id: number): Promise<void> {
    await http.delete(`/timetable/periods/${id}`);
  },

  // --- rooms ---

  listRooms: roomCrud.list,

  async rooms(signal?: AbortSignal): Promise<Room[]> {
    const { data } = await http.get<CollectionResponse<Room>>('/timetable/rooms', {
      params: { per_page: 'all', is_active: 1 },
      signal,
    });
    return data.data;
  },

  async createRoom(input: RoomInput): Promise<Room> {
    const { data } = await http.post<ApiResource<Room>>(
      '/timetable/rooms',
      toRoomPayload(input),
    );
    return data.data;
  },

  async updateRoom(id: number, input: RoomInput): Promise<Room> {
    const { data } = await http.put<ApiResource<Room>>(
      `/timetable/rooms/${id}`,
      toRoomPayload(input),
    );
    return data.data;
  },

  async removeRoom(id: number): Promise<void> {
    await http.delete(`/timetable/rooms/${id}`);
  },

  // --- the three views, all reading the same slots ---

  /** A section's week — what a student and their guardian see. */
  async sectionGrid(query: SectionGridQuery, signal?: AbortSignal): Promise<TimetableGrid> {
    const { data } = await http.get<ApiResource<TimetableGrid>>('/timetable/section', {
      params: { class_id: query.classId, section_id: query.sectionId },
      signal,
    });
    return data.data;
  },

  async teacherGrid(teacherId: number, signal?: AbortSignal): Promise<TimetableGrid> {
    const { data } = await http.get<ApiResource<TimetableGrid>>(
      `/timetable/teachers/${teacherId}`,
      { signal },
    );
    return data.data;
  },

  async roomGrid(roomId: number, signal?: AbortSignal): Promise<TimetableGrid> {
    const { data } = await http.get<ApiResource<TimetableGrid>>(`/timetable/rooms/${roomId}/grid`, {
      signal,
    });
    return data.data;
  },

  /** Every teacher's weekly load — the table above the teacher timetable. */
  async workload(signal?: AbortSignal): Promise<TeacherWorkload[]> {
    const { data } = await http.get<CollectionResponse<TeacherWorkload>>('/timetable/workload', {
      signal,
    });
    return data.data;
  },

  /**
   * Who is free in one day-and-period.
   *
   * Asked before the save rather than after: a picker that greys out the
   * teacher already taking Class 8 is a tool; a 409 afterwards is a scolding.
   */
  async availability(query: AvailabilityQuery, signal?: AbortSignal): Promise<SlotAvailability> {
    const { data } = await http.get<ApiResource<SlotAvailability>>('/timetable/availability', {
      params: {
        day_of_week: query.dayOfWeek,
        period_id: query.periodId,
        ...(query.subjectId ? { subject_id: query.subjectId } : {}),
        ...(query.excludeSlotId ? { exclude_slot_id: query.excludeSlotId } : {}),
      },
      signal,
    });
    return data.data;
  },

  // --- writes: one cell at a time ---

  /**
   * Save a cell.
   *
   * Returns the whole section grid rather than the slot, so the summary,
   * the load breakdown and the free-period count are recomputed by the side
   * that owns the arithmetic. A client that patched one cell and left the
   * totals alone would drift within a single edit.
   */
  async saveSlot(input: SlotInput): Promise<TimetableGrid> {
    const { data } = await http.put<ApiResource<TimetableGrid>>('/timetable/slots', {
      class_id: input.class_id,
      section_id: input.section_id,
      day_of_week: input.day_of_week,
      period_id: input.period_id,
      subject_id: input.subject_id,
      teacher_id: input.teacher_id,
      room_id: input.room_id,
    });
    return data.data;
  },

  async removeSlot(slotId: number): Promise<TimetableGrid> {
    const { data } = await http.delete<ApiResource<TimetableGrid>>(`/timetable/slots/${slotId}`);
    return data.data;
  },

  // --- printing ---

  async exportGrid(scope: TimetableScope, id: number | string, label: string): Promise<void> {
    await downloadFile(
      '/timetable/export',
      timestampedFilename(`timetable-${label}`, 'pdf'),
      { params: { scope, id } },
    );
  },
};

export type { ListQueryParams };
