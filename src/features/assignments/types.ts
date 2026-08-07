/**
 * Assignments: coursework that counts toward internal assessment.
 *
 * Distinct from homework, which is daily practice marked out of ten. An
 * assignment carries a **weightage** toward the term's internal marks, is
 * scored against a **rubric** rather than a single number, and its marks are
 * **published** as a separate act — the moment they become a student's record
 * rather than a teacher's working note.
 *
 * Four records, in that order: an **assignment** carries its brief, its rubric
 * and its attachments; each student in scope gets a **submission** row from
 * publication; evaluating that submission writes an **evaluation** (per
 * criterion, plus feedback); publishing marks releases every evaluation at
 * once.
 */

import type { FileAttachment } from '@/components/attachments';

export type { AttachmentKind, FileAttachment } from '@/components/attachments';

/** What kind of work is being asked for. Drives nothing but reporting. */
export type AssignmentType =
  | 'project'
  | 'essay'
  | 'lab_report'
  | 'presentation'
  | 'case_study'
  | 'practical';

/**
 * Draft is invisible to students; published is live; closed stops accepting
 * submissions but stays readable and evaluable.
 */
export type AssignmentStatus = 'draft' | 'published' | 'closed';

/**
 * One line of the marking scheme.
 *
 * A rubric is optional — a short assignment may be marked out of a single
 * total — but when present its criteria must sum to the assignment's
 * `max_marks`, or the scheme cannot award what it claims to.
 */
export interface RubricCriterion {
  id: number;
  name: string;
  description: string | null;
  max_marks: number;
}

export interface Assignment {
  id: number;
  title: string;
  type: AssignmentType;

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
  /** Share of the term's internal assessment this assignment carries. */
  weightage_percent: number;

  /** Whether work is still accepted after the due date. */
  allows_late_submission: boolean;
  /** Marks docked per day late, as a percentage of `max_marks`. Zero when none. */
  late_penalty_percent: number;

  status: AssignmentStatus;
  /** Past its due date and still published. */
  is_overdue: boolean;

  has_rubric: boolean;
  attachments_count: number;

  /** Students in scope — the denominator for the counts below. */
  students_count: number;
  submitted_count: number;
  evaluated_count: number;

  /**
   * When the marks were released to students. Null while evaluation is still
   * the teacher's working note.
   */
  marks_published_at: string | null;

  created_at: string;
  updated_at: string;
}

/** `GET /assignments/{id}` — adds the brief, the rubric and the files. */
export interface AssignmentDetail extends Assignment {
  instructions: string;
  rubric: RubricCriterion[];
  attachments: FileAttachment[];
}

/**
 * `returned` is work handed back for revision — evaluated, but the student is
 * expected to submit again. It is why `attempt` exists.
 */
export type SubmissionStatus =
  | 'pending'
  | 'submitted'
  | 'late'
  | 'under_review'
  | 'evaluated'
  | 'returned';

/** One criterion's score within an evaluation. */
export interface CriterionScore {
  criterion_id: number;
  marks_awarded: number;
  comment: string | null;
}

/**
 * The result of marking one submission.
 *
 * `raw_marks` is what the rubric awarded; `final_marks` is what it becomes
 * after the late penalty. Both are stored because a student who lost marks to
 * lateness is entitled to see that it happened, not just the lower number.
 */
export interface Evaluation {
  criteria_scores: CriterionScore[];
  raw_marks: number;
  late_penalty: number;
  final_marks: number;
  /** `final_marks` as a share of the assignment's `max_marks`. */
  percentage: number;
  grade: string;
  feedback: string | null;
  evaluated_by: string;
  evaluated_at: string;
  /** Set when the work was handed back for revision. */
  returned_at: string | null;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  student_name: string;
  admission_no: string;
  photo_url: string | null;

  status: SubmissionStatus;
  /** Null until the student hands in. */
  submitted_at: string | null;
  /** Whole days past the due date; zero when on time or not yet handed in. */
  days_late: number;
  /** 1 for a first hand-in, higher after a return-for-revision. */
  attempt: number;
  student_note: string | null;
  attachments: FileAttachment[];

  /** Null until evaluated. */
  evaluation: Evaluation | null;
  /** Whether this student can see their marks yet. */
  marks_published: boolean;
}

/** Aggregate shown above the submissions list and on the marks card. */
export interface MarksSummary {
  total: number;
  pending: number;
  submitted: number;
  under_review: number;
  evaluated: number;
  returned: number;

  /** All out of the assignment's `max_marks`; null when nothing is evaluated. */
  average_marks: number | null;
  highest_marks: number | null;
  lowest_marks: number | null;

  pass_count: number;
  fail_count: number;
  /** One entry per grade band, in band order, including empty bands. */
  distribution: { grade: string; count: number }[];

  marks_published: boolean;
  published_at: string | null;
}
