import { toDateInputValue } from '@/lib/format';

import type { GuardianInput, StudentInput } from '../schemas';
import type { StudentDetail } from '../types';

/** Nullable API values become empty strings so inputs stay controlled. */
const text = (value: string | null | undefined): string => value ?? '';
const numText = (value: number | null | undefined): string =>
  value === null || value === undefined ? '' : String(value);

export const emptyGuardian = (relation: GuardianInput['relation'] = 'father'): GuardianInput => ({
  relation,
  name: '',
  occupation: '',
  phone: '',
  email: '',
  annual_income: '',
  is_primary: relation === 'father',
});

/**
 * Blank admission form.
 *
 * Pre-seeded with a father and a mother because almost every admission has
 * both, and with today's admission date — the two things staff would otherwise
 * fill in identically on every record.
 */
export function emptyStudent(): StudentInput {
  return {
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: 'male',
    date_of_birth: '',
    blood_group: '',
    category: '',
    religion: '',
    nationality: 'Indian',
    mother_tongue: '',
    aadhaar_no: '',

    admission_no: '',
    roll_no: '',
    class_id: 0,
    section_id: null,
    admission_date: toDateInputValue(new Date()),
    status: 'active',

    email: '',
    phone: '',

    address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' },

    guardians: [emptyGuardian('father'), { ...emptyGuardian('mother'), is_primary: false }],

    medical: {
      blood_group: '',
      height_cm: '',
      weight_kg: '',
      allergies: '',
      chronic_conditions: '',
      medications: '',
      doctor_name: '',
      doctor_phone: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: '',
    },

    previous_school: {
      school_name: '',
      board: '',
      last_class: '',
      passing_year: '',
      percentage: '',
      tc_number: '',
      reason_for_leaving: '',
    },
  };
}

/** Map a saved record back onto the form shape for editing. */
export function studentToInput(student: StudentDetail): StudentInput {
  return {
    first_name: student.first_name,
    middle_name: text(student.middle_name),
    last_name: student.last_name,
    gender: student.gender,
    date_of_birth: toDateInputValue(student.date_of_birth),
    blood_group: text(student.blood_group),
    category: text(student.category),
    religion: text(student.religion),
    nationality: text(student.nationality),
    mother_tongue: text(student.mother_tongue),
    aadhaar_no: text(student.aadhaar_no),

    admission_no: student.admission_no,
    roll_no: text(student.roll_no),
    class_id: student.class_id,
    section_id: student.section_id,
    admission_date: toDateInputValue(student.admission_date),
    status: student.status,

    email: text(student.email),
    phone: text(student.phone),

    address: {
      line1: student.address.line1,
      line2: text(student.address.line2),
      city: student.address.city,
      state: student.address.state,
      postal_code: student.address.postal_code,
      country: student.address.country,
    },

    guardians:
      student.guardians.length > 0
        ? student.guardians.map((guardian) => ({
            relation: guardian.relation,
            name: guardian.name,
            occupation: text(guardian.occupation),
            phone: guardian.phone,
            email: text(guardian.email),
            annual_income: numText(guardian.annual_income),
            is_primary: guardian.is_primary,
          }))
        : [emptyGuardian()],

    medical: {
      blood_group: text(student.medical.blood_group),
      height_cm: numText(student.medical.height_cm),
      weight_kg: numText(student.medical.weight_kg),
      allergies: text(student.medical.allergies),
      chronic_conditions: text(student.medical.chronic_conditions),
      medications: text(student.medical.medications),
      doctor_name: text(student.medical.doctor_name),
      doctor_phone: text(student.medical.doctor_phone),
      emergency_contact_name: text(student.medical.emergency_contact_name),
      emergency_contact_phone: text(student.medical.emergency_contact_phone),
      notes: text(student.medical.notes),
    },

    previous_school: {
      school_name: text(student.previous_school.school_name),
      board: text(student.previous_school.board),
      last_class: text(student.previous_school.last_class),
      passing_year: numText(student.previous_school.passing_year),
      percentage: numText(student.previous_school.percentage),
      tc_number: text(student.previous_school.tc_number),
      reason_for_leaving: text(student.previous_school.reason_for_leaving),
    },
  };
}
