import type { TeacherDetail, TeacherDocument } from '@/features/teachers/types';

import { classes, subjects } from './academicsData';

/** Only classes with sections can be assigned to a teacher. */
const assignableClasses = classes.filter((entry) => entry.sections.length > 0);

/**
 * Seed teachers for the development mock.
 *
 * Deliberately uneven: some are freshers with no experience, some have no
 * department or class assignment, one is on leave — so the empty states and
 * status tones are all reachable without editing anything.
 */

/** Only active subjects are handed out to teachers. */
const assignableSubjects = subjects.filter((subject) => subject.is_active);

const FIRST_NAMES = [
  'Sunil', 'Kavita', 'Ramesh', 'Lakshmi', 'Anil', 'Deepa', 'Vinod', 'Shobha',
  'Prakash', 'Geetha', 'Mahesh', 'Sunitha', 'Ravi', 'Latha', 'Girish', 'Asha',
  'Nagaraj', 'Vidya', 'Suresh', 'Rekha', 'Manjunath', 'Padma',
];

const LAST_NAMES = [
  'Rao', 'Shetty', 'Hegde', 'Kamath', 'Bhat', 'Pai', 'Nayak', 'Gowda',
  'Reddy', 'Murthy', 'Prasad', 'Kulkarni',
];

const DESIGNATIONS = [
  'Teacher', 'Senior Teacher', 'Assistant Teacher', 'Head of Department',
  'Sports Coach', 'Counsellor',
];

const DEPARTMENTS = [
  'Science', 'Mathematics', 'Languages', 'Social Studies',
  'Computer Science', 'Physical Education', 'Commerce',
];

const DEGREES = ['M.Sc.', 'M.A.', 'B.Ed.', 'M.Ed.', 'B.Sc.', 'M.Com.'];
const INSTITUTIONS = [
  "St. Joseph's College", 'Bangalore University', 'Mysore University',
  'Christ University', 'Mount Carmel College',
];

/** Deterministic pseudo-random, so the seed is identical on every reload. */
function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length];
}

function buildTeacher(index: number): TeacherDetail {
  const id = index + 1;
  const first = pick(FIRST_NAMES, index * 5);
  const last = pick(LAST_NAMES, index * 3);
  const gender = index % 2 === 0 ? 'male' : 'female';

  // Every fourth teacher is a fresher, every seventh has no department.
  const isFresher = index % 4 === 0;
  const hasDepartment = index % 7 !== 0;
  const priorYears = isFresher ? 0 : 2 + (index % 14);

  const statuses = ['active', 'active', 'active', 'active', 'active', 'on_leave', 'probation', 'resigned'] as const;
  const status = statuses[index % statuses.length];

  const employmentTypes = ['full_time', 'full_time', 'full_time', 'part_time', 'contract', 'visiting'] as const;
  const employmentType = employmentTypes[index % employmentTypes.length];

  const joiningYear = 2015 + (index % 11);
  const birthYear = 1975 + (index % 20);

  // Roughly a third are class teachers, and only of a class that exists.
  const isClassTeacher = index % 3 === 0;
  const klass = assignableClasses[index % assignableClasses.length];
  const section = klass.sections[index % klass.sections.length];

  const subjectCount = 1 + (index % 3);
  const assignedSubjects = Array.from({ length: subjectCount }, (_, i) =>
    pick(assignableSubjects, index * 3 + i * 5),
  )
    .filter((subject, i, list) => list.findIndex((s) => s.id === subject.id) === i)
    // Teachers embed the slim reference, not the whole marks scheme.
    .map(({ id, name, code }) => ({ id, name, code }));

  return {
    id,
    employee_id: `EMP-${String(id).padStart(4, '0')}`,
    first_name: first,
    middle_name: index % 8 === 0 ? 'Kumar' : null,
    last_name: last,
    full_name: `${first} ${last}`,
    gender,
    date_of_birth: `${birthYear}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    blood_group: pick(['A+', 'B+', 'O+', 'AB+', 'O-'], index),
    marital_status: index % 3 === 0 ? 'single' : 'married',
    nationality: 'Indian',
    aadhaar_no: index % 4 === 0 ? null : String(200000000000 + index * 6421),
    pan_no: index % 5 === 0 ? null : `ABCDE${String(1000 + index).slice(0, 4)}F`,

    email: `${first.toLowerCase()}.${last.toLowerCase()}@school.test`,
    phone: `+91 98${String(45000000 + index * 613).slice(0, 8)}`,
    alternate_phone: index % 3 === 0 ? null : `+91 80 2${String(3450000 + index * 71).slice(0, 6)}`,
    emergency_contact_name: index % 3 === 0 ? null : `${pick(FIRST_NAMES, index * 9)} ${last}`,
    emergency_contact_phone: index % 3 === 0 ? null : `+91 97${String(51000000 + index * 419).slice(0, 8)}`,

    photo_url: null,
    designation: pick(DESIGNATIONS, index),
    department: hasDepartment ? pick(DEPARTMENTS, index * 2) : null,
    joining_date: `${joiningYear}-06-${String((index % 27) + 1).padStart(2, '0')}`,
    employment_type: employmentType,
    status,
    highest_qualification: `${pick(DEGREES, index)} ${pick(['Physics', 'Mathematics', 'English', 'History'], index * 2)}`,
    experience_years: priorYears,

    address: {
      line1: `${(index % 150) + 1} ${pick(['Nehru Road', '3rd Cross', 'Temple Street', 'Park Avenue'], index)}`,
      line2: index % 3 === 0 ? null : pick(['Rajajinagar', 'Basavanagudi', 'Malleshwaram'], index),
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: `5600${String((index % 90) + 10)}`,
      country: 'India',
    },

    qualifications: [
      {
        id: id * 10 + 1,
        degree: pick(DEGREES, index),
        specialization: pick(['Physics', 'Mathematics', 'English', 'History', 'Chemistry'], index * 2),
        institution: pick(INSTITUTIONS, index),
        board_university: 'Bangalore University',
        year_of_passing: birthYear + 23,
        grade: pick(['First class', 'Distinction', '78%', '85%'], index),
      },
      // Not everyone has a B.Ed. on file.
      ...(index % 3 !== 0
        ? [
            {
              id: id * 10 + 2,
              degree: 'B.Ed.',
              specialization: null,
              institution: pick(INSTITUTIONS, index * 2),
              board_university: 'Bangalore University',
              year_of_passing: birthYear + 25,
              grade: 'First class',
            },
          ]
        : []),
    ],

    experiences: isFresher
      ? []
      : [
          {
            id: id * 20 + 1,
            organisation: `${pick(['Vidya Mandir', 'St. Anne', 'National Public', 'Sunrise'], index)} School`,
            designation: pick(['Teacher', 'Assistant Teacher'], index),
            from_date: `${joiningYear - priorYears}-06-01`,
            to_date: `${joiningYear}-05-31`,
            is_current: false,
            responsibilities: 'Taught secondary classes and coordinated the science club.',
          },
        ],

    subjects: assignedSubjects,

    class_assignments:
      index % 5 === 0
        ? [] // some teachers have no class yet
        : [
            {
              class_id: klass.id,
              class_name: klass.name,
              section_id: section.id,
              section_name: section.name,
              is_class_teacher: isClassTeacher,
            },
          ],

    class_teacher_of: index % 5 !== 0 && isClassTeacher ? `${klass.name} — ${section.name}` : null,
    subjects_count: assignedSubjects.length,
    classes_count: index % 5 === 0 ? 0 : 1,

    documents_count: 0,
    created_at: `${joiningYear}-06-01T00:00:00.000000Z`,
    updated_at: '2025-06-01T00:00:00.000000Z',
  };
}

export const teachers: TeacherDetail[] = Array.from({ length: 32 }, (_, i) => buildTeacher(i));

export const teacherDocuments: Record<number, TeacherDocument[]> = {
  1: [
    {
      id: 1,
      type: 'degree_certificate',
      title: 'M.Sc. Physics certificate',
      file_name: 'msc-certificate.pdf',
      mime_type: 'application/pdf',
      size_bytes: 412_000,
      url: '#',
      uploaded_at: '2025-05-12T09:00:00.000000Z',
    },
    {
      id: 2,
      type: 'police_verification',
      title: 'Police verification report',
      file_name: 'police-verification.pdf',
      mime_type: 'application/pdf',
      size_bytes: 198_400,
      url: '#',
      uploaded_at: '2025-05-14T11:30:00.000000Z',
    },
  ],
};
