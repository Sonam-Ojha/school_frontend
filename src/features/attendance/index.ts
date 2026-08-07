/** Public surface of the attendance module. */

export { AttendanceSheet } from './components/AttendanceSheet';
export { AttendanceSummaryBar } from './components/AttendanceSummaryBar';
export { BiometricDevicesCard } from './components/BiometricDevicesCard';
export { HolidayFormModal } from './components/HolidayFormModal';
export { MonthlyGrid } from './components/MonthlyGrid';
export { QrSessionsCard } from './components/QrSessionsCard';
export { SourceBadge } from './components/SourceBadge';
export { StatusPicker } from './components/StatusPicker';
export { buildHolidayColumns } from './components/holidayColumns';

export {
  ATTENDANCE_PERMISSIONS,
  ATTENDANCE_TYPE_LABELS,
  HOLIDAY_PERMISSIONS,
  HOLIDAY_SCOPE_LABELS,
  HOLIDAY_TYPE_LABELS,
  PRESENT_EQUIVALENT,
  SOURCE_LABELS,
  STATUS_INITIALS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_TONES,
} from './constants';

export {
  attendanceKeys,
  useAttendanceSheet,
  useExportMonthly,
  useMonthlyReport,
  useSaveAttendance,
} from './hooks/useAttendance';

export {
  useBiometricDevices,
  useCreateQrSession,
  useQrSessions,
  useRevokeQrSession,
  useSyncDevice,
} from './hooks/useDevices';

export {
  holidayKeys,
  useCreateHoliday,
  useDeleteHoliday,
  useHolidays,
  useHolidaysForYear,
  useUpdateHoliday,
} from './hooks/useHolidays';

export { attendanceService } from './services/attendanceService';
export { deviceService } from './services/deviceService';
export { holidayService } from './services/holidayService';

export {
  attendanceSheetSchema,
  holidaySchema,
  qrSessionSchema,
  type AttendanceMarkInput,
  type AttendanceSheetInput,
  type HolidayInput,
  type QrSessionInput,
} from './schemas';

export type {
  AttendanceEntry,
  AttendanceSheet as AttendanceSheetData,
  AttendanceSource,
  AttendanceStatus,
  AttendanceSummary,
  AttendanceType,
  BiometricDevice,
  Holiday,
  MonthlyReport,
  QrSession,
} from './types';
