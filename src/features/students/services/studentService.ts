import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource, ListQueryParams } from '@/types/api';

import type { GuardianInput, StudentInput } from '../schemas';
import type { ExportFormat, Student, StudentDetail } from '../types';

const base = createCrudService<Student>('/students');

/** Blank optional text becomes null; the API stores absence, not `""`. */
const nullable = (value: string | undefined): string | null => value?.trim() || null;

/** Blank optional numeric text becomes null rather than `0` or `NaN`. */
const nullableNumber = (value: string | undefined): number | null => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
};

const toGuardianPayload = (guardian: GuardianInput) => ({
  relation: guardian.relation,
  name: guardian.name.trim(),
  occupation: nullable(guardian.occupation),
  phone: guardian.phone.trim(),
  email: nullable(guardian.email)?.toLowerCase() ?? null,
  annual_income: nullableNumber(guardian.annual_income),
  is_primary: guardian.is_primary,
});

/**
 * Flatten the form into the request body.
 *
 * The shapes already match — this only normalises whitespace, casing and the
 * blank-to-null conversions that the form cannot express.
 */
function toPayload(input: StudentInput) {
  return {
    first_name: input.first_name.trim(),
    middle_name: nullable(input.middle_name),
    last_name: input.last_name.trim(),
    gender: input.gender,
    date_of_birth: input.date_of_birth,
    blood_group: nullable(input.blood_group),
    category: nullable(input.category),
    religion: nullable(input.religion),
    nationality: nullable(input.nationality),
    mother_tongue: nullable(input.mother_tongue),
    aadhaar_no: input.aadhaar_no.replace(/\s/g, '') || null,

    admission_no: input.admission_no.trim().toUpperCase(),
    roll_no: nullable(input.roll_no),
    class_id: input.class_id,
    section_id: input.section_id,
    admission_date: input.admission_date,
    status: input.status,

    email: nullable(input.email)?.toLowerCase() ?? null,
    phone: nullable(input.phone),

    address: {
      line1: input.address.line1.trim(),
      line2: nullable(input.address.line2),
      city: input.address.city.trim(),
      state: input.address.state.trim(),
      postal_code: input.address.postal_code.trim().toUpperCase(),
      country: input.address.country.trim(),
    },

    guardians: input.guardians.map(toGuardianPayload),

    medical: {
      blood_group: nullable(input.medical.blood_group),
      height_cm: nullableNumber(input.medical.height_cm),
      weight_kg: nullableNumber(input.medical.weight_kg),
      allergies: nullable(input.medical.allergies),
      chronic_conditions: nullable(input.medical.chronic_conditions),
      medications: nullable(input.medical.medications),
      doctor_name: nullable(input.medical.doctor_name),
      doctor_phone: nullable(input.medical.doctor_phone),
      emergency_contact_name: nullable(input.medical.emergency_contact_name),
      emergency_contact_phone: nullable(input.medical.emergency_contact_phone),
      notes: nullable(input.medical.notes),
    },

    previous_school: {
      school_name: nullable(input.previous_school.school_name),
      board: nullable(input.previous_school.board),
      last_class: nullable(input.previous_school.last_class),
      passing_year: nullableNumber(input.previous_school.passing_year),
      percentage: nullableNumber(input.previous_school.percentage),
      tc_number: nullable(input.previous_school.tc_number),
      reason_for_leaving: nullable(input.previous_school.reason_for_leaving),
    },
  };
}

export const studentService = {
  list: base.list,
  remove: base.remove,

  /**
   * Active students, unpaginated, for another module's picker — linking a
   * parent's account to their children, say. The roll has one owner.
   */
  options: (signal?: AbortSignal) => base.all({ status: 'active' }, signal),

  async show(id: number | string, signal?: AbortSignal): Promise<StudentDetail> {
    const { data } = await http.get<ApiResource<StudentDetail>>(`/students/${id}`, { signal });
    return data.data;
  },

  async create(input: StudentInput): Promise<StudentDetail> {
    const { data } = await http.post<ApiResource<StudentDetail>>('/students', toPayload(input));
    return data.data;
  },

  async update(id: number, input: StudentInput): Promise<StudentDetail> {
    const { data } = await http.put<ApiResource<StudentDetail>>(`/students/${id}`, toPayload(input));
    return data.data;
  },

  /** Replaces the profile photo. Separate from the record so it can fail alone. */
  async uploadPhoto(id: number, file: File): Promise<StudentDetail> {
    const body = new FormData();
    body.append('photo', file);

    const { data } = await http.post<ApiResource<StudentDetail>>(`/students/${id}/photo`, body);
    return data.data;
  },

  /**
   * Export the current view.
   *
   * The active filters are forwarded, so what downloads is what the user is
   * looking at — an export that silently ignored the filters would be worse
   * than no export at all. Paging params are dropped: exports cover every match.
   */
  async export(format: ExportFormat, params: ListQueryParams = {}): Promise<void> {
    const { page: _page, per_page: _perPage, ...filters } = params;
    const extension = format === 'excel' ? 'xlsx' : 'pdf';

    await downloadFile('/students/export', timestampedFilename('students', extension), {
      params: { ...filters, format },
    });
  },

  /** Server-rendered ID card, for a print run that must match exactly. */
  async downloadIdCard(id: number, admissionNo: string): Promise<void> {
    await downloadFile(`/students/${id}/id-card`, `id-card-${admissionNo}.pdf`);
  },
};
