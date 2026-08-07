/**
 * Examinations.
 *
 * Four records, in order: an **exam** is the term-level event ("Half Yearly
 * 2025"); its **papers** are the schedule — one per class-and-subject, each
 * with a date, a slot and its own marks scheme; **marks** are entered per
 * paper against the class roster; a **result** is one student's whole exam,
 * derived from their marks rather than stored alongside them.
 */

export type ExamType =
  | 'unit_test'
  | 'mid_term'
  | 'half_yearly'
  | 'annual'
  | 'pre_board'
  | 'practical';

/**
 * `draft` is invisible; `scheduled` has published papers; `ongoing` has begun;
 * `completed` is over and marks are being entered; `published` has released
 * results to students and guardians.
 */
export type ExamStatus = 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'published';

export interface Exam {
  id: number;
  name: string;
  type: ExamType;
  academic_year_id: number;
  academic_year_name: string;
  start_date: string;
  end_date: string;
  status: ExamStatus;
  /** Free text shown on the report card, e.g. exam rules. */
  description: string | null;

  papers_count: number;
  /** Classes the papers span — the exam's reach. */
  classes_count: number;
  /** Papers whose marks are fully entered. */
  marks_entered_papers: number;
  created_at: string;
  updated_at: string;
}

/** One examination paper: a class sitting a subject at a time. */
export interface ExamPaper {
  id: number;
  exam_id: number;
  class_id: number;
  class_name: string;
  /** Null means every section of the class sits it together. */
  section_id: number | null;
  section_name: string | null;
  subject_id: number;
  subject_name: string;
  subject_code: string;

  exam_date: string;
  /** `HH:mm`, 24-hour. */
  start_time: string;
  duration_minutes: number;
  room: string | null;

  max_marks: number;
  pass_marks: number;

  /** Students in scope, and how many have a mark recorded. */
  students_count: number;
  marks_entered: number;
  /** True once every student has a mark or is marked absent. */
  is_complete: boolean;
}

/** `GET /exams/{id}` — adds the schedule. */
export interface ExamDetail extends Exam {
  papers: ExamPaper[];
}

/** One student's mark on one paper. */
export interface PaperMark {
  student_id: number;
  student_name: string;
  admission_no: string;
  photo_url: string | null;
  roll_no: string | null;

  /** Null when nothing has been entered yet — distinct from a zero. */
  marks_obtained: number | null;
  is_absent: boolean;
  remarks: string | null;
  /** Derived from the paper's pass marks; null while unmarked or absent. */
  is_pass: boolean | null;
}

export interface PaperMarksSummary {
  total: number;
  entered: number;
  absent: number;
  passed: number;
  failed: number;
  /** Mean of the students who sat the paper, or null when none have marks. */
  average: number | null;
  highest: number | null;
  lowest: number | null;
}

/** One subject line on a student's result. */
export interface ResultSubject {
  paper_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  max_marks: number;
  pass_marks: number;
  marks_obtained: number | null;
  is_absent: boolean;
  percent: number;
  grade: string;
  is_pass: boolean;
}

/** A student's whole exam, computed from their marks. */
export interface StudentResult {
  student_id: number;
  student_name: string;
  admission_no: string;
  roll_no: string | null;
  photo_url: string | null;
  class_id: number;
  class_name: string;
  section_name: string | null;

  subjects: ResultSubject[];
  total_marks: number;
  total_max_marks: number;
  percent: number;
  grade: string;
  /** Failed if any subject is below its own pass mark. */
  is_pass: boolean;
  failed_subjects: number;
  /** Position within the class, by total marks. Null until results publish. */
  rank: number | null;
}

export interface ResultsSummary {
  students: number;
  /** Students with a mark on at least one paper. */
  appeared: number;
  passed: number;
  failed: number;
  pass_percent: number;
  class_average: number | null;
  highest_percent: number | null;
  distribution: { grade: string; count: number }[];
}

export interface ExamResults {
  exam_id: number;
  class_id: number;
  class_name: string;
  section_id: number | null;
  section_name: string | null;
  is_published: boolean;
  rows: StudentResult[];
  summary: ResultsSummary;
}

/** Everything a report card needs, in one payload. */
export interface ReportCard {
  exam: Pick<Exam, 'id' | 'name' | 'type' | 'academic_year_name' | 'start_date' | 'end_date'>;
  result: StudentResult;
  /** Class size, for the "rank of N" line. */
  class_strength: number;
  /** Attendance for the exam's period, when the module has data. */
  attendance_percent: number | null;
  class_teacher_name: string | null;
  remarks: string | null;
  published_at: string | null;
}
