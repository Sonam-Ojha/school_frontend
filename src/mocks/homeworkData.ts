import type { HomeworkAttachment, HomeworkDetail } from '@/features/homework/types';

import { classes, subjects } from './academicsData';
import { teachers } from './teacherData';

/**
 * Homework seed for the development mock.
 *
 * Dates are relative to today so a fresh clone always has a mix of upcoming,
 * due-soon and overdue homework — a fixed calendar would leave everything in
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

let attachmentId = 1;

function pdf(name: string): HomeworkAttachment {
  return {
    id: attachmentId++,
    kind: 'pdf',
    file_name: name,
    mime_type: 'application/pdf',
    size_bytes: 180_000 + attachmentId * 4_000,
    url: `/homework/files/${name}`,
    thumbnail_url: null,
    duration_seconds: null,
    uploaded_at: dayOffset(-3),
  };
}

function image(name: string): HomeworkAttachment {
  return {
    id: attachmentId++,
    kind: 'image',
    file_name: name,
    mime_type: 'image/jpeg',
    size_bytes: 820_000,
    url: `/homework/files/${name}`,
    // A real backend generates these; the path is what the UI needs.
    thumbnail_url: `/homework/files/thumbs/${name}`,
    duration_seconds: null,
    uploaded_at: dayOffset(-3),
  };
}

function video(name: string, seconds: number): HomeworkAttachment {
  return {
    id: attachmentId++,
    kind: 'video',
    file_name: name,
    mime_type: 'video/mp4',
    size_bytes: seconds * 900_000,
    url: `/homework/files/${name}`,
    thumbnail_url: `/homework/files/thumbs/${name}.jpg`,
    duration_seconds: seconds,
    uploaded_at: dayOffset(-2),
  };
}

interface HomeworkSeed {
  title: string;
  description: string;
  classIndex: number;
  subjectIndex: number;
  teacherIndex: number;
  assignedIn: number;
  dueIn: number;
  maxMarks: number;
  status: HomeworkDetail['status'];
  attachments: HomeworkAttachment[];
  /**
   * Scope to one section rather than the whole class. Most homework is set
   * for the class, and a section-scoped seed only has a meaningful roster
   * where that section actually holds active students.
   */
  sectionIndex?: number;
}

/**
 * Deliberately mixed: a draft with no attachments, an overdue one, a closed
 * one, and each attachment kind represented — so every badge, warning and
 * preview path is reachable without uploading anything.
 */
const SEED: HomeworkSeed[] = [
  {
    title: 'Chapter 4 — quadratic equations',
    description:
      'Work through exercises 4.1 to 4.3 in the textbook.\n\nShow every step of your working — answers alone will not score full marks. The worked example in the attached PDF covers the method for question 7.',
    classIndex: 4, subjectIndex: 0, teacherIndex: 0,
    assignedIn: -6, dueIn: -1, maxMarks: 20, status: 'published',
    attachments: [pdf('quadratic-worked-examples.pdf')],
  },
  {
    title: 'Newton’s laws — lab write-up',
    description:
      'Write up the trolley experiment we ran in class.\n\nInclude your readings table, a graph of force against acceleration, and a paragraph on sources of error. The recording is there if you missed the demonstration.',
    classIndex: 5, subjectIndex: 1, teacherIndex: 1,
    assignedIn: -4, dueIn: 3, maxMarks: 25, status: 'published',
    attachments: [video('trolley-experiment.mp4', 412), image('apparatus-setup.jpg')],
  },
  {
    title: 'Book review — “The Guide”',
    description:
      'A one-page review of the novel we finished this week. Cover the setting, the narrator’s reliability, and whether the ending earned itself.',
    // The one section-scoped seed — Class 8 has a single, well-populated section.
    classIndex: 3, subjectIndex: 4, teacherIndex: 2, sectionIndex: 0,
    assignedIn: -10, dueIn: -4, maxMarks: 15, status: 'closed',
    attachments: [],
  },
  {
    title: 'Periodic table — group trends',
    description:
      'Complete the trends worksheet. Pay attention to the difference between atomic radius and ionic radius — several of you mixed these up in the test.',
    classIndex: 5, subjectIndex: 2, teacherIndex: 3,
    assignedIn: -1, dueIn: 6, maxMarks: 20, status: 'published',
    attachments: [pdf('group-trends-worksheet.pdf'), image('periodic-table-reference.png')],
  },
  {
    title: 'Map work — river systems',
    description:
      'Label the major river systems on the outline map and write two sentences on why settlements cluster along them.',
    classIndex: 2, subjectIndex: 8, teacherIndex: 4,
    assignedIn: 0, dueIn: 7, maxMarks: 10, status: 'draft',
    attachments: [],
  },
  {
    title: 'Loops and conditionals — practice set',
    description:
      'Ten short programs. Submit your source files, not screenshots.\n\nThe walkthrough video covers the first two; the rest are yours.',
    classIndex: 5, subjectIndex: 9, teacherIndex: 5,
    assignedIn: -8, dueIn: -2, maxMarks: 30, status: 'published',
    attachments: [video('loops-walkthrough.mp4', 738), pdf('practice-set.pdf')],
  },
];

function buildHomework(seed: HomeworkSeed, index: number): HomeworkDetail {
  const klass = assignable[seed.classIndex % assignable.length];
  const section =
    seed.sectionIndex === undefined ? null : (klass.sections[seed.sectionIndex] ?? null);
  const subject = activeSubjects[seed.subjectIndex % activeSubjects.length];
  const teacher = activeTeachers[seed.teacherIndex % activeTeachers.length];

  const dueDate = dayOffset(seed.dueIn);

  return {
    id: index + 1,
    title: seed.title,
    description: seed.description,
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
    due_date: dueDate,
    max_marks: seed.maxMarks,
    status: seed.status,
    is_overdue: seed.status === 'published' && seed.dueIn < 0,
    attachments_count: seed.attachments.length,
    // Filled in by the mock from the live student roster.
    students_count: 0,
    submitted_count: 0,
    graded_count: 0,
    created_at: dayOffset(seed.assignedIn),
    updated_at: dayOffset(seed.assignedIn),
    attachments: seed.attachments,
  };
}

export const homework: HomeworkDetail[] = SEED.map(buildHomework);
export const nextAttachmentId = attachmentId;
