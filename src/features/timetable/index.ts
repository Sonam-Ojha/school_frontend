/** Public surface of the timetable module. */

export { GridSummary } from './components/GridSummary';
export { PeriodFormModal } from './components/PeriodFormModal';
export { PeriodList } from './components/PeriodList';
export { RoomFormModal } from './components/RoomFormModal';
export { SlotCell } from './components/SlotCell';
export { SlotFormModal } from './components/SlotFormModal';
export { WeeklyGrid } from './components/WeeklyGrid';
export { WorkloadTable } from './components/WorkloadTable';
export { buildRoomColumns } from './components/roomColumns';

export {
  HIGH_UTILISATION_PERCENT,
  MAX_PERIODS_PER_DAY,
  MAX_PERIODS_PER_SHIFT,
  MAX_PERIODS_PER_WEEK,
  MAX_ROOM_CAPACITY,
  ROOM_PERMISSIONS,
  ROOM_TYPE_LABELS,
  ROOM_TYPE_OPTIONS,
  ROOM_TYPE_TONES,
  SHIFT_LABELS,
  SHIFT_OPTIONS,
  TIMETABLE_PERMISSIONS,
  WEEKDAYS,
  WEEKDAY_LABELS,
  WEEKDAY_SHORT,
} from './constants';

export {
  roomKeys,
  timetableKeys,
  useAvailability,
  useCreatePeriod,
  useCreateRoom,
  useDeletePeriod,
  useDeleteRoom,
  useExportTimetable,
  usePeriods,
  useRemoveSlot,
  useRoomGrid,
  useRoomOptions,
  useRooms,
  useSaveSlot,
  useSectionGrid,
  useTeacherGrid,
  useUpdatePeriod,
  useUpdateRoom,
  useWorkload,
} from './hooks/useTimetable';

export {
  timetableService,
  type AvailabilityQuery,
  type SectionGridQuery,
} from './services/timetableService';

export {
  periodSchema,
  roomSchema,
  slotSchema,
  type PeriodInput,
  type RoomInput,
  type SlotInput,
} from './schemas';

export type {
  AvailabilityEntry,
  LoadEntry,
  Period,
  Room,
  RoomType,
  SlotAvailability,
  TeacherWorkload,
  TimetableGrid,
  TimetableScope,
  TimetableSlot,
  TimetableSummary,
  Weekday,
} from './types';
