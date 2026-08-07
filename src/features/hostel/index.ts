/** Public surface of the hostel module. */

export { AllocateBedModal } from './components/AllocateBedModal';
export { AddBedsModal, EditBedModal } from './components/BedFormModals';
export { BedGrid } from './components/BedGrid';
export { HostelFormModal } from './components/HostelFormModal';
export { HostelStats } from './components/HostelStats';
export { RollCallSheet } from './components/RollCallSheet';
export { RoomFormModal } from './components/RoomFormModal';
export { VacateModal } from './components/VacateModal';
export { buildRoomColumns } from './components/roomColumns';

export {
  ACCOUNTED_FOR,
  BED_STATUS_LABELS,
  BED_STATUS_TONES,
  BEDS_FOR_ROOM_TYPE,
  GENDER_FOR_HOSTEL,
  HIGH_OCCUPANCY_PERCENT,
  HOSTEL_PERMISSIONS,
  HOSTEL_TYPE_LABELS,
  HOSTEL_TYPE_OPTIONS,
  MAX_BEDS_PER_ROOM,
  MESS_PLAN_LABELS,
  MESS_PLAN_MULTIPLIER,
  MESS_PLAN_OPTIONS,
  ROLL_CALL_GRACE_DAYS,
  ROLL_CALL_STATUS_INITIALS,
  ROLL_CALL_STATUS_LABELS,
  ROLL_CALL_STATUS_OPTIONS,
  ROLL_CALL_STATUS_TONES,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_OPTIONS,
  ROOM_STATUS_TONES,
  ROOM_TYPE_LABELS,
  ROOM_TYPE_OPTIONS,
  messChargeFor,
} from './constants';

export {
  hostelKeys,
  roomKeys,
  useAddBeds,
  useAllocateBed,
  useAllocations,
  useChargeSummary,
  useCharges,
  useCreateHostel,
  useCreateRoom,
  useDeleteHostel,
  useDeleteRoom,
  useDownloadOccupancy,
  useExportAllocations,
  useHostelSummary,
  useHostels,
  useRaiseCharges,
  useRemoveBed,
  useRollCall,
  useRoom,
  useRooms,
  useSaveRollCall,
  useTransferBed,
  useUpdateBed,
  useUpdateHostel,
  useUpdateRoom,
  useVacancies,
  useVacateBed,
} from './hooks/useHostel';

export {
  hostelService,
  type ChargeQuery,
  type RollCallQuery,
} from './services/hostelService';

export {
  addBedsSchema,
  allocationSchema,
  bedSchema,
  hostelSchema,
  raiseChargesSchema,
  rollCallEntrySchema,
  rollCallSchema,
  roomSchema,
  vacateSchema,
  type AddBedsInput,
  type AllocationInput,
  type BedInput,
  type HostelInput,
  type RaiseChargesInput,
  type RollCallEntryInput,
  type RollCallInput,
  type RoomInput,
  type VacateInput,
} from './schemas';

export type {
  Bed,
  BedOccupant,
  BedStatus,
  Hostel,
  HostelAllocation,
  HostelCharge,
  HostelChargeSummary,
  HostelRoom,
  HostelRoomDetail,
  HostelSummary,
  HostelType,
  MessPlan,
  RollCall,
  RollCallEntry,
  RollCallStatus,
  RollCallSummary,
  RoomStatus,
  RoomType,
} from './types';
