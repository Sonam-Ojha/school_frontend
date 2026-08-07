import type { ExamDetail, ExamPaper, ExamStatus, ExamType } from '@/features/exams/types';

import { academicYears } from './data';
import { classes, subjects } from './academicsData';

/**
 * Examination seed for the development mock.
 *
 * Dates are relative to today so a fresh clone always has one exam finished
 * and published, one finished but still being marked, one about to start and
 * one still a draft — a fixed calendar would freeze every exam in the same
 * state and show the module dishonestly.
 *
 * The marks themselves are not seeded here: they belong to the roster, which
 * only `devApi` knows about, so it fills them in from this schedule.
 */

const dayOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

/** Only a class with sections can sit an exam — one seeded class has none. */
const examinable = classes.filter((entry) => entry.is_active && entry.sections.length > 0);
const activeSubjects = subjects.filter((subject) => subject.is_active);

const currentYear = academicYears.find((year) => year.is_current) ?? academicYears[0];

/** Papers start at 09:30 and, where a class sits two in a day, 13:00. */
const SLOTS = ['09:30', '13:00'] as const;

interface ExamSeed {
  name: string;
  type: ExamType;
  status: ExamStatus;
  description: string | null;
  /** Window, in days from today. Must be long enough for one paper a day. */
  startsIn: number;
  endsIn: number;
  classIndexes: number[];
  subjectIndexes: number[];
  /**
   * Fixed scheme for the whole exam, or null to take each subject's own
   * theory-plus-practical scheme from the subject module — a unit test is out
   * of 25 whatever the subject, an annual exam is out of the subject's total.
   */
  marks: [max: number, pass: number] | null;
  /**
   * How many papers already carry marks, in schedule order. `'all'` for a
   * finished exam, 0 for one that has not been sat.
   */
  markedPapers: number | 'all';
  duration: number;
}

const SEED: ExamSeed[] = [
  {
    name: 'Unit Test I',
    type: 'unit_test',
    status: 'published',
    description: 'Short written test covering the first two chapters of each subject.',
    startsIn: -62,
    endsIn: -58,
    classIndexes: [0, 1, 2],
    subjectIndexes: [0, 4, 1],
    marks: [25, 10],
    markedPapers: 'all',
    duration: 60,
  },
  {
    name: 'Half Yearly Examination',
    type: 'half_yearly',
    status: 'completed',
    description:
      'Full syllabus of the first term. Candidates must be seated fifteen minutes before the paper begins; no material may be carried into the hall.',
    startsIn: -26,
    endsIn: -19,
    classIndexes: [2, 3, 4],
    subjectIndexes: [0, 4, 1, 2, 7],
    marks: null,
    // Three of five papers marked, so the results screen shows a genuinely
    // partial exam and the publish warning is reachable.
    markedPapers: 9,
    duration: 180,
  },
  {
    name: 'Pre-Board Examination',
    type: 'pre_board',
    status: 'scheduled',
    description: 'Conducted under board conditions. Results are advisory and do not carry forward.',
    startsIn: 11,
    endsIn: 19,
    classIndexes: [4, 5],
    subjectIndexes: [0, 4, 1, 2, 9],
    marks: [80, 27],
    markedPapers: 0,
    duration: 180,
  },
  {
    name: 'Annual Examination',
    type: 'annual',
    status: 'draft',
    description: null,
    startsIn: 68,
    endsIn: 80,
    classIndexes: [0, 1],
    subjectIndexes: [0, 4],
    marks: null,
    markedPapers: 0,
    duration: 180,
  },
];

let paperId = 1;

function buildPapers(seed: ExamSeed, examId: number): ExamPaper[] {
  const windowDays = seed.endsIn - seed.startsIn;
  const papers: ExamPaper[] = [];

  for (const classIndex of seed.classIndexes) {
    const klass = examinable[classIndex % examinable.length];

    seed.subjectIndexes.forEach((subjectIndex, order) => {
      const subject = activeSubjects[subjectIndex % activeSubjects.length];

      // One paper a day per class, wrapping to the afternoon slot only if the
      // window is shorter than the subject list — never two in the same slot,
      // which the clash check would rightly reject.
      const day = order % (windowDays + 1);
      const slot = SLOTS[Math.floor(order / (windowDays + 1)) % SLOTS.length];

      const max = seed.marks?.[0] ?? subject.total_max_marks;
      const pass =
        seed.marks?.[1] ??
        (subject.theory_pass_marks ?? 0) + (subject.practical_pass_marks ?? 0);

      papers.push({
        id: paperId++,
        exam_id: examId,
        class_id: klass.id,
        class_name: klass.name,
        // Whole-class papers: every section sits the same paper together.
        section_id: null,
        section_name: null,
        subject_id: subject.id,
        subject_name: subject.name,
        subject_code: subject.code,
        exam_date: dayOffset(seed.startsIn + day),
        start_time: slot,
        duration_minutes: subject.code === 'PE' ? 90 : seed.duration,
        room: klass.sections[0]?.room ?? null,
        max_marks: max,
        pass_marks: pass,
        // Filled in by the mock from the live roster.
        students_count: 0,
        marks_entered: 0,
        is_complete: false,
      });
    });
  }

  return papers;
}

function buildExam(seed: ExamSeed, index: number): ExamDetail {
  const id = index + 1;
  const papers = buildPapers(seed, id);

  return {
    id,
    name: seed.name,
    type: seed.type,
    academic_year_id: currentYear.id,
    academic_year_name: currentYear.name,
    start_date: dayOffset(seed.startsIn),
    end_date: dayOffset(seed.endsIn),
    status: seed.status,
    description: seed.description,
    papers_count: papers.length,
    classes_count: new Set(papers.map((paper) => paper.class_id)).size,
    // Recomputed by the mock once the marks are seeded.
    marks_entered_papers: 0,
    created_at: `${dayOffset(seed.startsIn - 30)}T09:00:00.000000Z`,
    updated_at: `${dayOffset(seed.startsIn - 30)}T09:00:00.000000Z`,
    papers,
  };
}

export const exams: ExamDetail[] = SEED.map(buildExam);

/** How many papers of each exam the mock should fill marks in for. */
export const seededMarkedPapers: Record<number, number> = Object.fromEntries(
  SEED.map((seed, index) => [
    index + 1,
    seed.markedPapers === 'all' ? exams[index].papers.length : seed.markedPapers,
  ]),
);

export const nextExamId = exams.length + 1;
export const nextPaperId = paperId;
