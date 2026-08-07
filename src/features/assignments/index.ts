/** Public surface of the assignments module. */

export { AssignmentAttachmentsCard } from './components/AssignmentAttachmentsCard';
export { AssignmentForm } from './components/AssignmentForm';
export { EvaluationModal } from './components/EvaluationModal';
export { MarksCard } from './components/MarksCard';
export { ReturnForRevisionModal } from './components/ReturnForRevisionModal';
export { RubricBuilder } from './components/RubricBuilder';
export { SubmissionsCard } from './components/SubmissionsCard';
export { buildAssignmentColumns } from './components/assignmentColumns';

export {
  ASSIGNMENT_PERMISSIONS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_OPTIONS,
  ASSIGNMENT_STATUS_TONES,
  ASSIGNMENT_TYPE_LABELS,
  ASSIGNMENT_TYPE_OPTIONS,
  GRADE_BANDS,
  MAX_ATTACHMENTS,
  MAX_RUBRIC_CRITERIA,
  MAX_SUBMISSION_ATTACHMENTS,
  PASS_PERCENT,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_OPTIONS,
  SUBMISSION_STATUS_TONES,
  gradeFor,
  toneForGrade,
} from './constants';

export {
  assignmentKeys,
  assignmentSubmissionKeys,
  useAddAssignmentAttachment,
  useAddSubmissionAttachment,
  useAssignment,
  useAssignmentList,
  useAssignmentSubmissions,
  useClearEvaluation,
  useCloseAssignment,
  useCreateAssignment,
  useDeleteAssignment,
  useDownloadAssignmentAttachment,
  useDownloadSubmissionAttachment,
  useEvaluateSubmission,
  useExportMarks,
  usePublishAssignment,
  usePublishMarks,
  useRecordAssignmentSubmission,
  useRemoveAssignmentAttachment,
  useReturnForRevision,
  useUpdateAssignment,
} from './hooks/useAssignments';

export { assignmentService } from './services/assignmentService';

export {
  assignmentSchema,
  evaluationSchemaFor,
  recordSubmissionSchema,
  returnForRevisionSchema,
  rubricCriterionSchema,
  type AssignmentInput,
  type EvaluationInput,
  type RecordSubmissionInput,
  type ReturnForRevisionInput,
  type RubricCriterionInput,
} from './schemas';

export type {
  Assignment,
  AssignmentDetail,
  AssignmentStatus,
  AssignmentSubmission,
  AssignmentType,
  CriterionScore,
  Evaluation,
  MarksSummary,
  RubricCriterion,
  SubmissionStatus,
} from './types';
