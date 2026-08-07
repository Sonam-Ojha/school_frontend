/** Public surface of the teacher management module. */

export { TeacherExportMenu } from './components/TeacherExportMenu';
export { TEACHER_FILTER_KEYS, TeacherFilters } from './components/TeacherFilters';
export { TeacherForm } from './components/TeacherForm';
export { buildTeacherColumns } from './components/teacherColumns';
export { AssignmentsSection } from './components/sections/AssignmentsSection';
export { ExperienceSection } from './components/sections/ExperienceSection';
export { QualificationsSection } from './components/sections/QualificationsSection';
export { TeacherPersonalSection } from './components/sections/TeacherPersonalSection';

export {
  DEPARTMENT_OPTIONS,
  DESIGNATION_OPTIONS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_TONES,
  TEACHER_PERMISSIONS,
} from './constants';

export {
  teacherDocumentKeys,
  teacherKeys,
  useCreateTeacher,
  useDeleteTeacher,
  useExportTeachers,
  useTeacher,
  useTeachers,
  useUpdateTeacher,
} from './hooks/useTeachers';

export { teacherDocumentService, teacherService } from './services/teacherService';

export {
  classAssignmentSchema,
  experienceSchema,
  qualificationSchema,
  teacherAddressSchema,
  teacherSchema,
  type ClassAssignmentInput,
  type ExperienceInput,
  type QualificationInput,
  type TeacherInput,
} from './schemas';

export {
  emptyClassAssignment,
  emptyExperience,
  emptyQualification,
  emptyTeacher,
  teacherToInput,
} from './utils/defaults';

export type {
  ClassAssignment,
  Experience,
  Qualification,
  Teacher,
  TeacherDetail,
  TeacherDocument,
} from './types';
