/** Public surface of the homework module. */

export { AttachmentPreview, AttachmentThumbnail } from '@/components/attachments';
export { AttachmentsCard } from './components/AttachmentsCard';
export { GradeSubmissionModal } from './components/GradeSubmissionModal';
export { HomeworkForm } from './components/HomeworkForm';
export { SubmissionsCard } from './components/SubmissionsCard';
export { buildHomeworkColumns } from './components/homeworkColumns';

export {
  ALL_ACCEPTED_MIME_TYPES,
  ATTACHMENT_KIND_LABELS,
  HOMEWORK_PERMISSIONS,
  HOMEWORK_STATUS_LABELS,
  HOMEWORK_STATUS_OPTIONS,
  HOMEWORK_STATUS_TONES,
  MAX_ATTACHMENTS,
  MAX_BYTES,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_TONES,
  kindForMime,
} from './constants';

export {
  homeworkKeys,
  submissionKeys,
  useAddAttachment,
  useCloseHomework,
  useCreateHomework,
  useDeleteHomework,
  useDownloadAttachment,
  useGradeSubmission,
  useHomework,
  useHomeworkList,
  usePublishHomework,
  useRecordSubmission,
  useRemoveAttachment,
  useSubmissions,
  useUngradeSubmission,
  useUpdateHomework,
} from './hooks/useHomework';

export { homeworkService } from './services/homeworkService';

export {
  gradeSchemaFor,
  homeworkSchema,
  submissionSchema,
  type GradeInput,
  type HomeworkInput,
} from './schemas';

export { attachmentUrl, formatDuration } from '@/components/attachments';

export type {
  AttachmentKind,
  Homework,
  HomeworkAttachment,
  HomeworkDetail,
  HomeworkStatus,
  Submission,
  SubmissionStatus,
  SubmissionSummary,
} from './types';
