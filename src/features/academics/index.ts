/** Public surface of the academics module. */

export { AssignTeachersModal } from './components/AssignTeachersModal';
export { CapacityBar } from './components/CapacityBar';
export { ClassFormModal } from './components/ClassFormModal';
export { SectionFormModal } from './components/SectionFormModal';
export { SectionsCard } from './components/SectionsCard';
export { SubjectFormModal } from './components/SubjectFormModal';
export { buildClassColumns } from './components/classColumns';
export { buildSubjectColumns } from './components/subjectColumns';

export {
  CLASS_PERMISSIONS,
  MAX_CLASS_LEVEL,
  MAX_COMPONENT_MARKS,
  MAX_CREDITS,
  MAX_SECTION_CAPACITY,
  NEARLY_FULL_RATIO,
  SHIFT_LABELS,
  SHIFT_OPTIONS,
  SHIFT_TONES,
  SUBJECT_PERMISSIONS,
} from './constants';

/** Lookups read by students, teachers and later timetables. */
export { classKeys, subjectKeys, useClassOptions, useSubjectOptions } from './hooks/useAcademics';

export {
  useClasses,
  useCreateClass,
  useCreateSection,
  useDeleteClass,
  useDeleteSection,
  useSchoolClass,
  useUpdateClass,
  useUpdateSection,
} from './hooks/useClasses';

export {
  useAssignTeachers,
  useCreateSubject,
  useDeleteSubject,
  useSubject,
  useSubjects,
  useTeacherOptions,
  useUpdateSubject,
} from './hooks/useSubjects';

export { academicsService } from './services/academicsService';

export {
  assignTeachersSchema,
  classSchema,
  readMarks,
  sectionSchema,
  sectionSchemaFor,
  subjectSchema,
  type ClassInput,
  type SectionInput,
  type SubjectInput,
} from './schemas';

export type {
  SchoolClass,
  SchoolClassSummary,
  Section,
  Shift,
  Subject,
  SubjectDetail,
  SubjectRef,
  SubjectTeacher,
} from './types';
