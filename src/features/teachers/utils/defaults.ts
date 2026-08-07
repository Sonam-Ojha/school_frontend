import { toDateInputValue } from '@/lib/format';

import type {
  ClassAssignmentInput,
  ExperienceInput,
  QualificationInput,
  TeacherInput,
} from '../schemas';
import type { TeacherDetail } from '../types';

const text = (value: string | null | undefined): string => value ?? '';
const numText = (value: number | null | undefined): string =>
  value === null || value === undefined ? '' : String(value);

export const emptyQualification = (): QualificationInput => ({
  degree: '',
  specialization: '',
  institution: '',
  board_university: '',
  year_of_passing: '',
  grade: '',
});

export const emptyExperience = (): ExperienceInput => ({
  organisation: '',
  designation: '',
  from_date: '',
  to_date: '',
  is_current: false,
  responsibilities: '',
});

export const emptyClassAssignment = (): ClassAssignmentInput => ({
  class_id: 0,
  section_id: null,
  is_class_teacher: false,
});

/**
 * Blank teacher form.
 *
 * One qualification row is pre-seeded because the schema requires at least
 * one — starting empty would show an error before anything is typed.
 */
export function emptyTeacher(): TeacherInput {
  return {
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: 'male',
    date_of_birth: '',
    blood_group: '',
    marital_status: '',
    nationality: 'Indian',
    aadhaar_no: '',
    pan_no: '',

    email: '',
    phone: '',
    alternate_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',

    employee_id: '',
    designation: 'Teacher',
    department: '',
    joining_date: toDateInputValue(new Date()),
    employment_type: 'full_time',
    status: 'active',
    highest_qualification: '',

    address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' },

    qualifications: [emptyQualification()],
    experiences: [],
    subject_ids: [],
    class_assignments: [],
  };
}

/** Map a saved record back onto the form shape for editing. */
export function teacherToInput(teacher: TeacherDetail): TeacherInput {
  return {
    first_name: teacher.first_name,
    middle_name: text(teacher.middle_name),
    last_name: teacher.last_name,
    gender: teacher.gender,
    date_of_birth: toDateInputValue(teacher.date_of_birth),
    blood_group: text(teacher.blood_group),
    marital_status: teacher.marital_status ?? '',
    nationality: text(teacher.nationality),
    aadhaar_no: text(teacher.aadhaar_no),
    pan_no: text(teacher.pan_no),

    email: teacher.email,
    phone: teacher.phone,
    alternate_phone: text(teacher.alternate_phone),
    emergency_contact_name: text(teacher.emergency_contact_name),
    emergency_contact_phone: text(teacher.emergency_contact_phone),

    employee_id: teacher.employee_id,
    designation: teacher.designation,
    department: text(teacher.department),
    joining_date: toDateInputValue(teacher.joining_date),
    employment_type: teacher.employment_type,
    status: teacher.status,
    highest_qualification: text(teacher.highest_qualification),

    address: {
      line1: teacher.address.line1,
      line2: text(teacher.address.line2),
      city: teacher.address.city,
      state: teacher.address.state,
      postal_code: teacher.address.postal_code,
      country: teacher.address.country,
    },

    qualifications:
      teacher.qualifications.length > 0
        ? teacher.qualifications.map((qualification) => ({
            degree: qualification.degree,
            specialization: text(qualification.specialization),
            institution: qualification.institution,
            board_university: text(qualification.board_university),
            year_of_passing: numText(qualification.year_of_passing),
            grade: text(qualification.grade),
          }))
        : [emptyQualification()],

    experiences: teacher.experiences.map((experience) => ({
      organisation: experience.organisation,
      designation: experience.designation,
      from_date: toDateInputValue(experience.from_date),
      to_date: experience.to_date ? toDateInputValue(experience.to_date) : '',
      is_current: experience.is_current,
      responsibilities: text(experience.responsibilities),
    })),

    subject_ids: teacher.subjects.map((subject) => subject.id),

    class_assignments: teacher.class_assignments.map((assignment) => ({
      class_id: assignment.class_id,
      section_id: assignment.section_id,
      is_class_teacher: assignment.is_class_teacher,
    })),
  };
}
