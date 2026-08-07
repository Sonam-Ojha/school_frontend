import type { StaffDocument, StaffMemberDetail, StaffType } from '@/features/staff/types';

/**
 * Seed non-teaching staff for the development mock.
 *
 * Deliberately uneven: only drivers carry licences (one expiring inside the
 * warning window), some have no emergency contact and one is terminated — so
 * the conditional fields, the expiry banner and every status tone are all
 * reachable without editing anything.
 */

const TYPES: StaffType[] = [
  'accountant',
  'receptionist',
  'librarian',
  'driver',
  'cleaner',
  'peon',
  'security',
];

const DESIGNATIONS: Record<StaffType, string> = {
  accountant: 'Accounts Officer',
  receptionist: 'Front Desk Executive',
  librarian: 'Librarian',
  driver: 'Bus Driver',
  cleaner: 'Housekeeping Attendant',
  peon: 'Office Attendant',
  security: 'Security Guard',
};

const FIRST_NAMES = [
  'Ramesh', 'Sudha', 'Ganesh', 'Mala', 'Venkatesh', 'Shanti', 'Basavaraj',
  'Nirmala', 'Krishnappa', 'Jayamma', 'Siddappa', 'Renuka', 'Thimmaiah', 'Sarojamma',
];

const LAST_NAMES = [
  'Naik', 'Gowda', 'Shetty', 'Poojary', 'Achar', 'Rao', 'Devadiga', 'Salian',
];

/** Deterministic pseudo-random, so the seed is identical on every reload. */
function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length];
}

/** ISO date `days` from today — used for licence expiry windows. */
function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function buildStaff(index: number): StaffMemberDetail {
  const id = index + 1;
  const first = pick(FIRST_NAMES, index * 3);
  const last = pick(LAST_NAMES, index * 5);
  const staffType = TYPES[index % TYPES.length];
  const isDriver = staffType === 'driver';

  const gender = index % 2 === 0 ? 'male' : 'female';
  const birthYear = 1970 + (index % 28);
  const joiningYear = 2014 + (index % 12);

  const statuses = ['active', 'active', 'active', 'active', 'active', 'on_leave', 'probation', 'resigned', 'terminated'] as const;
  const status = statuses[index % statuses.length];

  const employmentTypes = ['full_time', 'full_time', 'full_time', 'contract', 'part_time', 'temporary'] as const;
  const employmentType = employmentTypes[index % employmentTypes.length];

  // Security and cleaning run outside office hours.
  const shift =
    staffType === 'security'
      ? (['night', 'morning', 'afternoon'] as const)[index % 3]
      : staffType === 'cleaner'
        ? 'morning'
        : 'general';

  // The second driver's licence is inside the 60-day warning window.
  const licenceExpiry = isDriver
    ? index % 14 === 3
      ? daysFromNow(35)
      : daysFromNow(400 + (index % 300))
    : null;

  return {
    id,
    employee_id: `STF-${String(id).padStart(4, '0')}`,
    first_name: first,
    middle_name: index % 9 === 0 ? 'Kumar' : null,
    last_name: last,
    full_name: `${first} ${last}`,
    gender,
    date_of_birth: `${birthYear}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
    blood_group: pick(['A+', 'B+', 'O+', 'AB+', 'O-'], index),
    marital_status: index % 3 === 0 ? 'single' : 'married',
    nationality: 'Indian',
    aadhaar_no: index % 4 === 0 ? null : String(300000000000 + index * 8317),
    pan_no: index % 3 === 0 ? null : `PQRST${String(2000 + index).slice(0, 4)}Z`,

    email: `${first.toLowerCase()}.${last.toLowerCase()}${id}@staff.test`,
    phone: `+91 90${String(12000000 + index * 877).slice(0, 8)}`,
    alternate_phone: index % 4 === 0 ? null : `+91 91${String(22000000 + index * 331).slice(0, 8)}`,
    emergency_contact_name: index % 3 === 0 ? null : `${pick(FIRST_NAMES, index * 7)} ${last}`,
    emergency_contact_phone: index % 3 === 0 ? null : `+91 93${String(33000000 + index * 197).slice(0, 8)}`,

    photo_url: null,
    staff_type: staffType,
    designation: DESIGNATIONS[staffType],
    joining_date: `${joiningYear}-04-${String((index % 27) + 1).padStart(2, '0')}`,
    employment_type: employmentType,
    shift,
    status,
    reports_to: index % 5 === 0 ? null : 'Administrator',
    notes: isDriver ? 'Assigned to route 4 (Koramangala loop).' : null,

    licence_number: isDriver ? `KA01${joiningYear}${String(1000 + index).slice(0, 7)}` : null,
    licence_expiry: licenceExpiry,

    address: {
      line1: `${(index % 120) + 1} ${pick(['Market Road', '2nd Cross', 'Station Road', 'Gandhi Nagar'], index)}`,
      line2: index % 3 === 0 ? null : pick(['Yeshwanthpur', 'Peenya', 'Vijayanagar'], index),
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: `5600${String((index % 90) + 10)}`,
      country: 'India',
    },

    documents_count: 0,
    created_at: `${joiningYear}-04-01T00:00:00.000000Z`,
    updated_at: '2025-06-01T00:00:00.000000Z',
  };
}

export const staff: StaffMemberDetail[] = Array.from({ length: 24 }, (_, i) => buildStaff(i));

export const staffDocuments: Record<number, StaffDocument[]> = {
  4: [
    {
      id: 1,
      type: 'driving_licence',
      title: 'Driving licence',
      file_name: 'driving-licence.pdf',
      mime_type: 'application/pdf',
      size_bytes: 224_000,
      url: '#',
      uploaded_at: '2025-04-08T08:20:00.000000Z',
    },
    {
      id: 2,
      type: 'police_verification',
      title: 'Police verification',
      file_name: 'police-verification.pdf',
      mime_type: 'application/pdf',
      size_bytes: 176_500,
      url: '#',
      uploaded_at: '2025-04-09T10:05:00.000000Z',
    },
  ],
};
