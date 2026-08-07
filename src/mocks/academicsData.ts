import type { SchoolClass, Section, Shift, Subject } from '@/features/academics/types';

/**
 * Class and section seed for the development mock.
 *
 * Lives here rather than in `studentData` because students, teachers and the
 * academics module all read it — the same reason the lookup service moved
 * into `features/academics`.
 *
 * Deliberately uneven: one class has no sections, one runs an afternoon
 * shift, one section is over capacity and one is inactive — so the empty
 * state, the shift badges and both capacity warnings are all reachable.
 */

interface SectionSeed {
  name: string;
  shift: Shift;
  capacity: number;
  room: string | null;
  students: number;
  is_active?: boolean;
}

interface ClassSeed {
  id: number;
  name: string;
  level: number;
  is_active?: boolean;
  sections: SectionSeed[];
}

const SEED: ClassSeed[] = [
  {
    id: 1,
    name: 'Class 1',
    level: 1,
    sections: [
      { name: 'A', shift: 'morning', capacity: 40, room: 'Block A — 101', students: 36 },
      { name: 'B', shift: 'morning', capacity: 40, room: 'Block A — 102', students: 31 },
    ],
  },
  {
    id: 2,
    name: 'Class 2',
    level: 2,
    sections: [
      { name: 'A', shift: 'morning', capacity: 40, room: 'Block A — 103', students: 38 },
      { name: 'B', shift: 'morning', capacity: 35, room: null, students: 22 },
    ],
  },
  {
    id: 3,
    name: 'Class 5',
    level: 5,
    sections: [
      // Nearly full — trips the amber warning.
      { name: 'A', shift: 'morning', capacity: 45, room: 'Block B — 201', students: 43 },
      { name: 'B', shift: 'afternoon', capacity: 45, room: 'Block B — 202', students: 29 },
    ],
  },
  {
    id: 4,
    name: 'Class 8',
    level: 8,
    sections: [
      // Over capacity — trips the red warning and the "over by" label.
      { name: 'A', shift: 'morning', capacity: 40, room: 'Block B — 301', students: 44 },
    ],
  },
  {
    id: 5,
    name: 'Class 10',
    level: 10,
    sections: [
      { name: 'A', shift: 'morning', capacity: 50, room: 'Block C — 101', students: 47 },
      { name: 'B', shift: 'morning', capacity: 50, room: 'Block C — 102', students: 41 },
      { name: 'C', shift: 'afternoon', capacity: 40, room: null, students: 0, is_active: false },
    ],
  },
  {
    id: 6,
    name: 'Class 12',
    level: 12,
    sections: [
      { name: 'Science', shift: 'morning', capacity: 60, room: 'Block D — 101', students: 52 },
      { name: 'Commerce', shift: 'morning', capacity: 60, room: 'Block D — 102', students: 38 },
    ],
  },
  // No sections yet — students cannot be admitted here.
  { id: 7, name: 'Class 11', level: 11, sections: [] },
  // Retired class, kept for historical records.
  {
    id: 8,
    name: 'Nursery',
    level: 0 + 1,
    is_active: false,
    sections: [{ name: 'A', shift: 'morning', capacity: 25, room: null, students: 0 }],
  },
];

let sectionId = 10;

function buildClass(seed: ClassSeed): SchoolClass {
  const sections: Section[] = seed.sections.map((section) => ({
    id: sectionId++,
    class_id: seed.id,
    name: section.name,
    shift: section.shift,
    capacity: section.capacity,
    room: section.room,
    is_active: section.is_active ?? true,
    students_count: section.students,
    created_at: '2025-04-01T00:00:00.000000Z',
  }));

  return {
    id: seed.id,
    name: seed.name,
    level: seed.level,
    is_active: seed.is_active ?? true,
    sections,
    sections_count: sections.length,
    students_count: sections.reduce((total, section) => total + section.students_count, 0),
    total_capacity: sections.reduce((total, section) => total + section.capacity, 0),
    created_at: '2025-04-01T00:00:00.000000Z',
    updated_at: '2025-06-01T00:00:00.000000Z',
  };
}

export const classes: SchoolClass[] = SEED.map(buildClass);

// --- subjects ---------------------------------------------------------------

interface SubjectSeed {
  id: number;
  name: string;
  code: string;
  theory: [max: number, pass: number] | null;
  practical: [max: number, pass: number] | null;
  credits: number;
  is_elective?: boolean;
  is_active?: boolean;
}

/**
 * Deliberately mixed: theory-only, practical-only, both, a zero-credit
 * subject, an elective and a retired one — so every badge and marks
 * breakdown in the table is reachable without editing anything.
 */
const SUBJECT_SEED: SubjectSeed[] = [
  { id: 1, name: 'Mathematics', code: 'MATH', theory: [100, 35], practical: null, credits: 6 },
  { id: 2, name: 'Physics', code: 'PHY', theory: [70, 23], practical: [30, 10], credits: 5 },
  { id: 3, name: 'Chemistry', code: 'CHEM', theory: [70, 23], practical: [30, 10], credits: 5 },
  { id: 4, name: 'Biology', code: 'BIO', theory: [70, 23], practical: [30, 10], credits: 5 },
  { id: 5, name: 'English', code: 'ENG', theory: [100, 35], practical: null, credits: 4 },
  { id: 6, name: 'Hindi', code: 'HIN', theory: [100, 35], practical: null, credits: 3 },
  { id: 7, name: 'Kannada', code: 'KAN', theory: [100, 35], practical: null, credits: 3 },
  { id: 8, name: 'History', code: 'HIST', theory: [100, 35], practical: null, credits: 4 },
  { id: 9, name: 'Geography', code: 'GEO', theory: [80, 28], practical: [20, 7], credits: 4 },
  {
    id: 10,
    name: 'Computer Science',
    code: 'CS',
    theory: [50, 17],
    practical: [50, 17],
    credits: 5,
  },
  { id: 11, name: 'Accountancy', code: 'ACC', theory: [100, 35], practical: null, credits: 4, is_elective: true },
  // Practical only, and carries no credit toward the final grade.
  { id: 12, name: 'Physical Education', code: 'PE', theory: null, practical: [100, 35], credits: 0 },
  { id: 13, name: 'Fine Arts', code: 'ART', theory: null, practical: [100, 33], credits: 2, is_elective: true },
  // Retired subject, kept for historical marksheets.
  { id: 14, name: 'Sanskrit', code: 'SANS', theory: [100, 35], practical: null, credits: 3, is_active: false },
];

function buildSubject(seed: SubjectSeed): Subject {
  const theoryMax = seed.theory?.[0] ?? null;
  const practicalMax = seed.practical?.[0] ?? null;

  return {
    id: seed.id,
    name: seed.name,
    code: seed.code,

    has_theory: seed.theory !== null,
    theory_max_marks: theoryMax,
    theory_pass_marks: seed.theory?.[1] ?? null,

    has_practical: seed.practical !== null,
    practical_max_marks: practicalMax,
    practical_pass_marks: seed.practical?.[1] ?? null,

    total_max_marks: (theoryMax ?? 0) + (practicalMax ?? 0),
    credits: seed.credits,
    is_elective: seed.is_elective ?? false,
    is_active: seed.is_active ?? true,

    // Filled in by the mock once the teacher seed is known.
    teachers_count: 0,
    created_at: '2025-04-01T00:00:00.000000Z',
    updated_at: '2025-06-01T00:00:00.000000Z',
  };
}

export const subjects: Subject[] = SUBJECT_SEED.map(buildSubject);
