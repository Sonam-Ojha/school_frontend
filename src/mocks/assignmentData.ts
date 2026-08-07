import type { FileAttachment } from '@/components/attachments';
import type { AssignmentDetail, AssignmentType, RubricCriterion } from '@/features/assignments/types';

import { classes, subjects } from './academicsData';
import { teachers } from './teacherData';

/**
 * Assignment seed for the development mock.
 *
 * Dates are relative to today so a fresh clone always has a mix of upcoming,
 * due-soon and overdue coursework — a fixed calendar would leave everything in
 * one state and show the list screen dishonestly.
 */

const dayOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const assignable = classes.filter((entry) => entry.sections.length > 0);
const activeSubjects = subjects.filter((subject) => subject.is_active);
const activeTeachers = teachers.filter((teacher) => teacher.status === 'active');

let attachmentId = 5_000;
let criterionId = 1;

function pdf(name: string): FileAttachment {
  return {
    id: attachmentId++,
    kind: 'pdf',
    file_name: name,
    mime_type: 'application/pdf',
    size_bytes: 240_000 + attachmentId * 3_000,
    url: `/assignments/files/${name}`,
    thumbnail_url: null,
    duration_seconds: null,
    uploaded_at: dayOffset(-8),
  };
}

function image(name: string): FileAttachment {
  return {
    id: attachmentId++,
    kind: 'image',
    file_name: name,
    mime_type: 'image/jpeg',
    size_bytes: 940_000,
    url: `/assignments/files/${name}`,
    // A real backend generates these; the path is what the UI needs.
    thumbnail_url: `/assignments/files/thumbs/${name}`,
    duration_seconds: null,
    uploaded_at: dayOffset(-8),
  };
}

function video(name: string, seconds: number): FileAttachment {
  return {
    id: attachmentId++,
    kind: 'video',
    file_name: name,
    mime_type: 'video/mp4',
    size_bytes: seconds * 900_000,
    url: `/assignments/files/${name}`,
    thumbnail_url: `/assignments/files/thumbs/${name}.jpg`,
    duration_seconds: seconds,
    uploaded_at: dayOffset(-7),
  };
}

const criterion = (name: string, description: string, maxMarks: number): RubricCriterion => ({
  id: criterionId++,
  name,
  description,
  max_marks: maxMarks,
});

interface AssignmentSeed {
  title: string;
  instructions: string;
  type: AssignmentType;
  classIndex: number;
  subjectIndex: number;
  teacherIndex: number;
  assignedIn: number;
  dueIn: number;
  maxMarks: number;
  weightage: number;
  allowsLate: boolean;
  penalty: number;
  status: AssignmentDetail['status'];
  attachments: FileAttachment[];
  rubric: RubricCriterion[];
  /** Days ago the marks were released. Omit for unpublished marks. */
  marksPublishedIn?: number;
  /**
   * Scope to one section rather than the whole class. Most coursework is set
   * for the class, and a section-scoped seed only has a meaningful roster
   * where that section actually holds active students.
   */
  sectionIndex?: number;
}

/**
 * Deliberately mixed: a draft, one overdue and unevaluated, one fully marked
 * and published, one with no rubric at all, and one that refuses late work —
 * so every badge, warning and evaluation path is reachable without setting
 * anything up by hand.
 */
const SEED: AssignmentSeed[] = [
  {
    title: 'Water quality of the local river',
    instructions:
      'Sample the river at three points along its course and test each for pH, turbidity and dissolved oxygen.\n\nWrite up your method, your readings and what they suggest about the sources of pollution. Six to eight pages, including your data tables. The safety sheet is attached and must be read before you go anywhere near the bank.',
    type: 'project',
    classIndex: 5, subjectIndex: 2, teacherIndex: 3,
    assignedIn: -21, dueIn: -3, maxMarks: 50, weightage: 15,
    allowsLate: true, penalty: 10, status: 'published',
    attachments: [pdf('field-safety-and-method.pdf'), image('sampling-points-map.jpg')],
    rubric: [
      criterion('Method and fieldwork', 'Sampling technique, controls and safety', 15),
      criterion('Data and analysis', 'Accuracy of readings and the reasoning drawn from them', 20),
      criterion('Conclusions', 'Whether the conclusions follow from the evidence', 10),
      criterion('Presentation', 'Structure, figures and referencing', 5),
    ],
  },
  {
    title: 'Partition and its aftermath — source essay',
    instructions:
      'Using the three sources provided and at least two of your own, write 1,500 words on how far the human cost of Partition was foreseen by those who negotiated it.\n\nQuote sparingly and always attribute. An essay that summarises the sources without arguing with them cannot reach the top band.',
    type: 'essay',
    classIndex: 4, subjectIndex: 7, teacherIndex: 2,
    assignedIn: -28, dueIn: -10, maxMarks: 40, weightage: 20,
    allowsLate: true, penalty: 5, status: 'closed',
    attachments: [pdf('source-booklet.pdf')],
    rubric: [
      criterion('Argument', 'A clear line of argument, sustained throughout', 15),
      criterion('Use of sources', 'Range, attribution and critical handling', 15),
      criterion('Written expression', 'Clarity, structure and register', 10),
    ],
    marksPublishedIn: -4,
  },
  {
    title: 'Titration lab — determining concentration',
    instructions:
      'Write up the acid–base titration carried out in Thursday’s practical.\n\nInclude your titre readings, the calculation in full, an error analysis and a note on why the first titre is discarded. The demonstration recording is attached for anyone who missed the session.',
    type: 'lab_report',
    classIndex: 5, subjectIndex: 2, teacherIndex: 1,
    assignedIn: -9, dueIn: 4, maxMarks: 25, weightage: 8,
    allowsLate: true, penalty: 20, status: 'published',
    attachments: [video('titration-demonstration.mp4', 486)],
    rubric: [
      criterion('Readings and calculation', 'Correct working, units carried through', 12),
      criterion('Error analysis', 'Identified sources and their likely magnitude', 8),
      criterion('Write-up', 'Clarity and completeness of the report', 5),
    ],
  },
  {
    title: 'Build a working model of a simple machine',
    instructions:
      'Design and build a working model of a lever, pulley or inclined plane that does something useful.\n\nBring the model in on the due date — this one is marked in the room, not uploaded. A one-page sheet explaining the mechanical advantage should come with it.',
    type: 'practical',
    // Marked in the room, so nothing is uploaded — a submission with no files.
    classIndex: 2, subjectIndex: 1, teacherIndex: 4,
    assignedIn: -5, dueIn: 9, maxMarks: 20, weightage: 5,
    allowsLate: false, penalty: 0, status: 'published',
    attachments: [],
    // No rubric — marked out of a single total.
    rubric: [],
  },
  {
    title: 'Case study — a business that failed',
    instructions:
      'Choose a company that closed in the last twenty years and account for it.\n\nWhat did management see, what did they miss, and what would you have done differently? Present your findings to the class in ten minutes; the written case should be no more than 1,200 words.',
    type: 'case_study',
    classIndex: 4, subjectIndex: 8, teacherIndex: 0, sectionIndex: 0,
    assignedIn: 0, dueIn: 18, maxMarks: 30, weightage: 10,
    allowsLate: true, penalty: 10, status: 'draft',
    attachments: [],
    rubric: [
      criterion('Research', 'Depth and reliability of the evidence gathered', 10),
      criterion('Analysis', 'Quality of the explanation offered', 12),
      criterion('Presentation', 'Delivery, timing and handling of questions', 8),
    ],
  },
];

function buildAssignment(seed: AssignmentSeed, index: number): AssignmentDetail {
  const klass = assignable[seed.classIndex % assignable.length];
  const section =
    seed.sectionIndex === undefined ? null : (klass.sections[seed.sectionIndex] ?? null);
  const subject = activeSubjects[seed.subjectIndex % activeSubjects.length];
  const teacher = activeTeachers[seed.teacherIndex % activeTeachers.length];

  return {
    id: index + 1,
    title: seed.title,
    instructions: seed.instructions,
    type: seed.type,
    class_id: klass.id,
    class_name: klass.name,
    section_id: section?.id ?? null,
    section_name: section?.name ?? null,
    subject_id: subject.id,
    subject_name: subject.name,
    subject_code: subject.code,
    teacher_id: teacher.id,
    teacher_name: teacher.full_name,
    assigned_date: dayOffset(seed.assignedIn),
    due_date: dayOffset(seed.dueIn),
    max_marks: seed.maxMarks,
    weightage_percent: seed.weightage,
    allows_late_submission: seed.allowsLate,
    late_penalty_percent: seed.penalty,
    status: seed.status,
    is_overdue: seed.status === 'published' && seed.dueIn < 0,
    has_rubric: seed.rubric.length > 0,
    attachments_count: seed.attachments.length,
    // Filled in by the mock from the live student roster.
    students_count: 0,
    submitted_count: 0,
    evaluated_count: 0,
    marks_published_at:
      seed.marksPublishedIn === undefined ? null : `${dayOffset(seed.marksPublishedIn)}T10:00:00Z`,
    created_at: dayOffset(seed.assignedIn),
    updated_at: dayOffset(seed.assignedIn),
    rubric: seed.rubric,
    attachments: seed.attachments,
  };
}

export const assignments: AssignmentDetail[] = SEED.map(buildAssignment);
export const nextAssignmentAttachmentId = attachmentId;
export const nextCriterionId = criterionId;
