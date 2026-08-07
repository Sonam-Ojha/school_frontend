/**
 * Academic structure — classes, sections and subjects.
 *
 * Shared by several modules (students, teachers, and later timetables and
 * exams). This module owns the management screens; everything else reads the
 * lookup shapes below.
 *
 * Shift and capacity live on the **section**, not the class: a class is an
 * academic level, a section is the physical group that occupies a room, in a
 * shift, with a seat count. A class's capacity is the sum of its sections'.
 */

export type Shift = 'morning' | 'afternoon' | 'evening';

export interface Section {
  id: number;
  class_id: number;
  /** Short label within the class, e.g. `A`. */
  name: string;
  shift: Shift;
  capacity: number;
  room: string | null;
  is_active: boolean;
  /** Currently enrolled — computed by the API. */
  students_count: number;
  created_at: string;
}

export interface SchoolClass {
  id: number;
  name: string;
  /**
   * Ordinal used for sorting and year-end promotion, e.g. 10 for "Class 10".
   * Distinct from `id`, which is arbitrary.
   */
  level: number;
  is_active: boolean;
  sections: Section[];
  /** Aggregates computed by the API from the sections. */
  sections_count: number;
  students_count: number;
  total_capacity: number;
  created_at: string;
  updated_at: string;
}

/**
 * Row shape for the class list — the aggregates without the nested sections,
 * so the index stays cheap.
 */
export type SchoolClassSummary = Omit<SchoolClass, 'sections'>;

/**
 * Slim subject reference, embedded in other records (a teacher's subject
 * list, a timetable slot). Kept separate from the full record so nesting a
 * subject does not drag its whole marks scheme along.
 */
export interface SubjectRef {
  id: number;
  name: string;
  /** Short code shown alongside the name, e.g. `MATH`. */
  code: string;
}

/** A teacher qualified to teach a subject, as returned on the subject record. */
export interface SubjectTeacher {
  id: number;
  full_name: string;
  employee_id: string;
  designation: string;
  photo_url: string | null;
}

/**
 * Full subject record.
 *
 * A subject carries theory and/or practical components, each with its own
 * maximum and pass marks. At least one component must be present — a subject
 * that is neither cannot be examined. `total_max_marks` is the sum, computed
 * by the API rather than stored, so it cannot drift from the parts.
 */
export interface Subject extends SubjectRef {
  has_theory: boolean;
  theory_max_marks: number | null;
  theory_pass_marks: number | null;

  has_practical: boolean;
  practical_max_marks: number | null;
  practical_pass_marks: number | null;

  total_max_marks: number;
  credits: number;
  /** Elective subjects are chosen by the student rather than assigned. */
  is_elective: boolean;
  is_active: boolean;

  teachers_count: number;
  created_at: string;
  updated_at: string;
}

/** `GET /academics/subjects/{id}` — adds the assigned teachers. */
export interface SubjectDetail extends Subject {
  teachers: SubjectTeacher[];
}
