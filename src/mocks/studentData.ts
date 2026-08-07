import type { StudentDetail, StudentDocument } from '@/features/students/types';

import { classes } from './academicsData';

/**
 * Seed students for the development mock.
 *
 * Deliberately uneven: some have no medical record, some no previous school,
 * some no guardian email — so the "not recorded" branches and the medical
 * warning banner are all reachable without editing anything.
 */

/**
 * Only classes that actually have sections can take an admission — the seed
 * deliberately includes one that does not.
 */
const assignableClasses = classes.filter((entry) => entry.sections.length > 0);

const FIRST_NAMES = [
  'Aarav', 'Diya', 'Vihaan', 'Ananya', 'Arjun', 'Ishita', 'Reyansh', 'Saanvi', 'Kabir', 'Myra',
  'Advik', 'Aadhya', 'Vivaan', 'Kiara', 'Aditya', 'Navya', 'Rudra', 'Anika', 'Shaurya', 'Pari',
  'Krishna', 'Riya', 'Ayaan', 'Sara', 'Dhruv', 'Avni', 'Ved', 'Meera', 'Ritvik', 'Tara',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Nair', 'Reddy', 'Iyer', 'Gupta', 'Singh', 'Menon', 'Joshi',
  'Rao', 'Desai', 'Kulkarni', 'Bose', 'Chatterjee',
];

const CITIES = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'];

/** Deterministic pseudo-random, so the seed is identical on every reload. */
function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length];
}

function buildStudent(index: number): StudentDetail {
  const id = index + 1;
  const first = pick(FIRST_NAMES, index * 7);
  const last = pick(LAST_NAMES, index * 3);
  const klass = assignableClasses[index % assignableClasses.length];
  const section = klass.sections[index % klass.sections.length];

  const gender = index % 2 === 0 ? 'male' : 'female';
  const birthYear = 2008 + (index % 10);
  const dateOfBirth = `${birthYear}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`;

  // Every fifth record is missing its medical section, every third its
  // previous school — both are legitimately optional.
  const hasMedical = index % 5 !== 0;
  const hasPreviousSchool = index % 3 !== 0;

  /**
   * Nine entries, not seven.
   *
   * Class is assigned on a 7-cycle, so a status list of length 7 would make
   * the two perfectly correlated — every student in a class sharing one
   * status, and three of the seven classes ending up with no active students
   * at all. Nine is coprime with seven, so statuses vary within every class.
   */
  const statuses = [
    'active', 'active', 'active', 'active', 'active', 'active',
    'inactive', 'transferred', 'graduated',
  ] as const;
  const status = statuses[index % statuses.length];

  const fatherName = `${pick(FIRST_NAMES, index * 11)} ${last}`;
  const motherName = `${pick(FIRST_NAMES, index * 13 + 1)} ${last}`;

  return {
    id,
    admission_no: `ADM-2025-${String(id).padStart(4, '0')}`,
    roll_no: index % 4 === 0 ? null : String((index % 40) + 1),
    first_name: first,
    middle_name: index % 6 === 0 ? 'Kumar' : null,
    last_name: last,
    full_name: `${first} ${last}`,
    gender,
    date_of_birth: dateOfBirth,
    photo_url: null,
    email: index % 7 === 0 ? null : `${first.toLowerCase()}.${last.toLowerCase()}@student.test`,
    phone: index % 4 === 0 ? null : `+91 98${String(10000000 + index * 137).slice(0, 8)}`,
    blood_group: pick(['A+', 'B+', 'O+', 'AB+', 'O-'], index),
    category: pick(['General', 'OBC', 'SC', 'ST', 'EWS'], index * 2),
    religion: pick(['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain'], index * 5),
    nationality: 'Indian',
    mother_tongue: pick(['Kannada', 'Hindi', 'Tamil', 'Telugu', 'Malayalam'], index * 3),
    aadhaar_no: index % 3 === 0 ? null : String(100000000000 + index * 7919),

    class_id: klass.id,
    class_name: klass.name,
    section_id: section.id,
    section_name: section.name,
    academic_year_id: 3,
    academic_year_name: '2025-2026',
    admission_date: `2025-04-${String((index % 27) + 1).padStart(2, '0')}`,
    status,

    primary_guardian_name: fatherName,
    primary_guardian_phone: `+91 99${String(20000000 + index * 271).slice(0, 8)}`,

    address: {
      line1: `${(index % 200) + 1} ${pick(['MG Road', 'Hosur Road', 'Church Street', '4th Cross'], index)}`,
      line2: index % 3 === 0 ? null : pick(['Koramangala', 'Indiranagar', 'Jayanagar'], index),
      city: pick(CITIES, index),
      state: 'Karnataka',
      postal_code: `5600${String((index % 90) + 10)}`,
      country: 'India',
    },

    guardians: [
      {
        id: id * 10 + 1,
        relation: 'father',
        name: fatherName,
        occupation: pick(['Engineer', 'Doctor', 'Teacher', 'Business', 'Farmer'], index),
        phone: `+91 99${String(20000000 + index * 271).slice(0, 8)}`,
        email: index % 4 === 0 ? null : `${fatherName.split(' ')[0].toLowerCase()}@example.com`,
        annual_income: index % 3 === 0 ? null : 400000 + (index % 12) * 75000,
        is_primary: true,
      },
      {
        id: id * 10 + 2,
        relation: 'mother',
        name: motherName,
        occupation: pick(['Homemaker', 'Teacher', 'Nurse', 'Accountant'], index * 2),
        phone: `+91 97${String(30000000 + index * 331).slice(0, 8)}`,
        email: null,
        annual_income: null,
        is_primary: false,
      },
    ],

    medical: hasMedical
      ? {
          blood_group: pick(['A+', 'B+', 'O+', 'AB+', 'O-'], index),
          height_cm: 120 + (index % 50),
          weight_kg: 25 + (index % 35),
          // Only some students have alerts, so the danger banner is meaningful.
          allergies: index % 4 === 0 ? 'Peanuts, dust' : null,
          chronic_conditions: index % 9 === 0 ? 'Asthma' : null,
          medications: index % 9 === 0 ? 'Salbutamol inhaler as needed' : null,
          doctor_name: index % 2 === 0 ? `Dr. ${pick(LAST_NAMES, index * 4)}` : null,
          doctor_phone: index % 2 === 0 ? `+91 80 2345 ${String(1000 + index).slice(0, 4)}` : null,
          emergency_contact_name: motherName,
          emergency_contact_phone: `+91 97${String(30000000 + index * 331).slice(0, 8)}`,
          notes: null,
        }
      : {
          blood_group: null,
          height_cm: null,
          weight_kg: null,
          allergies: null,
          chronic_conditions: null,
          medications: null,
          doctor_name: null,
          doctor_phone: null,
          emergency_contact_name: null,
          emergency_contact_phone: null,
          notes: null,
        },

    previous_school: hasPreviousSchool
      ? {
          school_name: `${pick(['Little Flower', 'St. Xavier', 'Vidya Mandir', 'Sunrise'], index)} School`,
          board: pick(['CBSE', 'ICSE', 'State Board'], index),
          last_class: `Class ${Math.max(1, (index % 9))}`,
          passing_year: 2024,
          percentage: 60 + (index % 40),
          tc_number: `TC/${2024}/${String(index + 1).padStart(4, '0')}`,
          reason_for_leaving: pick(['Relocation', 'Parent transfer', 'Better facilities'], index),
        }
      : {
          school_name: null,
          board: null,
          last_class: null,
          passing_year: null,
          percentage: null,
          tc_number: null,
          reason_for_leaving: null,
        },

    documents_count: 0,
    created_at: '2025-04-01T00:00:00.000000Z',
    updated_at: '2025-06-01T00:00:00.000000Z',
  };
}

/** Enough rows to exercise paging, sorting and filters. */
export const students: StudentDetail[] = Array.from({ length: 47 }, (_, i) => buildStudent(i));

export const studentDocuments: Record<number, StudentDocument[]> = {
  1: [
    {
      id: 1,
      type: 'birth_certificate',
      title: 'Birth certificate',
      file_name: 'birth-certificate.pdf',
      mime_type: 'application/pdf',
      size_bytes: 284_512,
      url: '#',
      uploaded_at: '2025-04-02T10:15:00.000000Z',
    },
    {
      id: 2,
      type: 'transfer_certificate',
      title: 'TC from Little Flower School',
      file_name: 'tc-2024.pdf',
      mime_type: 'application/pdf',
      size_bytes: 156_800,
      url: '#',
      uploaded_at: '2025-04-02T10:18:00.000000Z',
    },
  ],
};
