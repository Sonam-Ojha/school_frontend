/** Public surface of the student management module. */

export { ExportMenu } from './components/ExportMenu';
export { StudentIdCard } from './components/StudentIdCard';
export { STUDENT_FILTER_KEYS, StudentFilters } from './components/StudentFilters';
export { buildStudentColumns } from './components/studentColumns';
export { AdmissionWizard } from './components/admission/AdmissionWizard';
export { GuardiansSection } from './components/sections/GuardiansSection';
export { MedicalSection } from './components/sections/MedicalSection';
export { PersonalSection } from './components/sections/PersonalSection';
export { PreviousSchoolSection } from './components/sections/PreviousSchoolSection';

export {
  BLOOD_GROUP_OPTIONS,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_TONES,
  STUDENT_PERMISSIONS,
} from './constants';

export {
  useCreateStudent,
  useDeleteStudent,
  useExportStudents,
  useUpdateStudent,
  useUploadStudentPhoto,
} from './hooks/useStudentMutations';
export {
  studentDocumentKeys,
  studentKeys,
  useStudent,
  useStudents,
} from './hooks/useStudents';

export { studentDocumentService } from './services/studentDocumentService';
export { studentService } from './services/studentService';

export {
  STEP_FIELDS,
  addressSchema,
  documentUploadSchema,
  guardianSchema,
  medicalSchema,
  previousSchoolSchema,
  studentSchema,
  type GuardianInput,
  type StudentInput,
} from './schemas';

export { emptyGuardian, emptyStudent, studentToInput } from './utils/defaults';

export type {
  ExportFormat,
  Guardian,
  MedicalInfo,
  PreviousSchool,
  Student,
  StudentDetail,
  StudentDocument,
} from './types';
