/** Public surface of the non-teaching staff module. */

export { StaffEmploymentSection } from './components/StaffEmploymentSection';
export { STAFF_FILTER_KEYS, StaffFilters } from './components/StaffFilters';
export { StaffForm } from './components/StaffForm';
export { buildStaffColumns, isLicenceExpiringSoon } from './components/staffColumns';

export {
  DEFAULT_DESIGNATIONS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPE_OPTIONS,
  LICENCE_REQUIRED_TYPES,
  SHIFT_LABELS,
  SHIFT_OPTIONS,
  STAFF_PERMISSIONS,
  STAFF_TYPE_LABELS,
  STAFF_TYPE_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_TONES,
} from './constants';

export {
  staffDocumentKeys,
  staffKeys,
  useCreateStaff,
  useDeleteStaff,
  useStaffList,
  useStaffMember,
  useUpdateStaff,
} from './hooks/useStaff';

export { staffDocumentService, staffService } from './services/staffService';

export { staffSchema, type StaffInput } from './schemas';

export { emptyStaff, staffToInput } from './utils/defaults';

export type {
  EmploymentType,
  Shift,
  StaffDocument,
  StaffMember,
  StaffMemberDetail,
  StaffStatus,
  StaffType,
} from './types';
