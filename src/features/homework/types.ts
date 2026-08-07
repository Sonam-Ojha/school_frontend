/**
 * Homework: what was set, what was handed in, and what it scored.
 *
 * Three records, in that order — a **homework** carries its brief and its
 * attachments; each student in scope gets a **submission** row from the
 * moment it is published (pending until they hand in); grading writes marks
 * and remarks onto that submission.
 */

import type { FileAttachment } from '@/components/attachments';

export type { AttachmentKind } from '@/components/attachments';

/** Homework attachments are ordinary file attachments; the alias is the name
 * the rest of this module and the API documentation already use. */
export type HomeworkAttachment = FileAttachment;

/**
 * Draft homework is invisible to students; published is live; closed stops
 * accepting submissions but keeps everything readable.
 */
export type HomeworkStatus = 'draft' | 'published' | 'closed';

export interface Homework {
  id: number;
  title: string;
  class_id: number;
  class_name: string;
  section_id: number | null;
  section_name: string | null;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  teacher_id: number;
  teacher_name: string;
  assigned_date: string;
  due_date: string;
  max_marks: number;
  status: HomeworkStatus;
  /** Past its due date and still published. */
  is_overdue: boolean;
  attachments_count: number;
  /** Students in scope — the denominator for the other two. */
  students_count: number;
  submitted_count: number;
  graded_count: number;
  created_at: string;
  updated_at: string;
}

/** `GET /homework/{id}` — adds the brief and its attachments. */
export interface HomeworkDetail extends Homework {
  description: string;
  attachments: HomeworkAttachment[];
}

export type SubmissionStatus = 'pending' | 'submitted' | 'late' | 'graded';

export interface Submission {
  id: number;
  homework_id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  photo_url: string | null;

  status: SubmissionStatus;
  /** Null until the student hands in. */
  submitted_at: string | null;
  /** Whole days past the due date; zero when on time or not yet handed in. */
  days_late: number;
  student_note: string | null;
  attachments: HomeworkAttachment[];

  /** Null until graded. Never exceeds the homework's `max_marks`. */
  marks_obtained: number | null;
  remarks: string | null;
  graded_at: string | null;
  graded_by: string | null;
}

/** Aggregate shown above the submissions list. */
export interface SubmissionSummary {
  total: number;
  pending: number;
  submitted: number;
  late: number;
  graded: number;
  /** Mean of the graded submissions, or null when none are. */
  average_marks: number | null;
}
