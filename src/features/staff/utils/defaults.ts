import { toDateInputValue } from '@/lib/format';

import { DEFAULT_DESIGNATIONS } from '../constants';
import type { StaffInput } from '../schemas';
import type { StaffMemberDetail } from '../types';

const text = (value: string | null | undefined): string => value ?? '';

/** Blank staff form. */
export function emptyStaff(): StaffInput {
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
    staff_type: 'accountant',
    designation: DEFAULT_DESIGNATIONS.accountant,
    joining_date: toDateInputValue(new Date()),
    employment_type: 'full_time',
    shift: 'general',
    status: 'active',
    reports_to: '',
    notes: '',

    licence_number: '',
    licence_expiry: '',

    address: { line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' },
  };
}

/** Map a saved record back onto the form shape for editing. */
export function staffToInput(member: StaffMemberDetail): StaffInput {
  return {
    first_name: member.first_name,
    middle_name: text(member.middle_name),
    last_name: member.last_name,
    gender: member.gender,
    date_of_birth: toDateInputValue(member.date_of_birth),
    blood_group: text(member.blood_group),
    marital_status: member.marital_status ?? '',
    nationality: text(member.nationality),
    aadhaar_no: text(member.aadhaar_no),
    pan_no: text(member.pan_no),

    email: member.email,
    phone: member.phone,
    alternate_phone: text(member.alternate_phone),
    emergency_contact_name: text(member.emergency_contact_name),
    emergency_contact_phone: text(member.emergency_contact_phone),

    employee_id: member.employee_id,
    staff_type: member.staff_type,
    designation: member.designation,
    joining_date: toDateInputValue(member.joining_date),
    employment_type: member.employment_type,
    shift: member.shift,
    status: member.status,
    reports_to: text(member.reports_to),
    notes: text(member.notes),

    licence_number: text(member.licence_number),
    licence_expiry: member.licence_expiry ? toDateInputValue(member.licence_expiry) : '',

    address: {
      line1: member.address.line1,
      line2: text(member.address.line2),
      city: member.address.city,
      state: member.address.state,
      postal_code: member.address.postal_code,
      country: member.address.country,
    },
  };
}
