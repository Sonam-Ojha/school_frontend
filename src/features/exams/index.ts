/** Public surface of the examinations module. */

export { ExamForm } from './components/ExamForm';
export { MarksEntrySheet } from './components/MarksEntrySheet';
export { PaperFormModal } from './components/PaperFormModal';
export { ReportCardSheet } from './components/ReportCardSheet';
export { ResultsTable } from './components/ResultsTable';
export { ScheduleCard } from './components/ScheduleCard';
export { buildExamColumns } from './components/examColumns';

export {
  DURATION_OPTIONS,
  EXAM_PERMISSIONS,
  EXAM_STATUS_LABELS,
  EXAM_STATUS_OPTIONS,
  EXAM_STATUS_TONES,
  EXAM_TYPE_LABELS,
  EXAM_TYPE_OPTIONS,
  MAX_DURATION_MINUTES,
  MAX_PAPER_MARKS,
  MIN_PAPERS_FOR_RESULT,
} from './constants';

export {
  examKeys,
  useAddPaper,
  useCreateExam,
  useDeleteExam,
  useDownloadReportCards,
  useExam,
  useExamClasses,
  useExams,
  useExportResults,
  usePaperMarks,
  usePublishResults,
  usePublishSchedule,
  useRemovePaper,
  useReportCard,
  useResults,
  useSaveMarks,
  useUpdateExam,
  useUpdatePaper,
} from './hooks/useExams';

export { examService } from './services/examService';

export {
  examSchema,
  markSchemaFor,
  marksSheetSchemaFor,
  paperSchema,
  paperSchemaFor,
  publishResultsSchema,
  type ExamInput,
  type MarkInput,
  type MarksSheetInput,
  type PaperInput,
  type PublishResultsInput,
} from './schemas';

export type {
  Exam,
  ExamDetail,
  ExamPaper,
  ExamResults,
  ExamStatus,
  ExamType,
  PaperMark,
  PaperMarksSummary,
  ReportCard,
  ResultSubject,
  ResultsSummary,
  StudentResult,
} from './types';
