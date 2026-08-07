import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { createDocumentService } from '@/lib/createDocumentService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource, ListQueryParams } from '@/types/api';

import type { ExperienceInput, QualificationInput, TeacherInput } from '../schemas';
import type { Teacher, TeacherDetail } from '../types';

const base = createCrudService<Teacher>('/teachers');

/** Teacher documents. Composes the shared owner-agnostic document service. */
export const teacherDocumentService = createDocumentService('/teachers');

const nullable = (value: string | undefined): string | null => value?.trim() || null;

const toQualification = (qualification: QualificationInput) => ({
  degree: qualification.degree.trim(),
  specialization: nullable(qualification.specialization),
  institution: qualification.institution.trim(),
  board_university: nullable(qualification.board_university),
  year_of_passing: Number(qualification.year_of_passing),
  grade: nullable(qualification.grade),
});

const toExperience = (experience: ExperienceInput) => ({
  organisation: experience.organisation.trim(),
  designation: experience.designation.trim(),
  from_date: experience.from_date,
  // A current role has no end date, whatever is left in the field.
  to_date: experience.is_current ? null : experience.to_date || null,
  is_current: experience.is_current,
  responsibilities: nullable(experience.responsibilities),
});

function toPayload(input: TeacherInput) {
  return {
    first_name: input.first_name.trim(),
    middle_name: nullable(input.middle_name),
    last_name: input.last_name.trim(),
    gender: input.gender,
    date_of_birth: input.date_of_birth,
    blood_group: nullable(input.blood_group),
    marital_status: nullable(input.marital_status),
    nationality: nullable(input.nationality),
    aadhaar_no: input.aadhaar_no.replace(/\s/g, '') || null,
    pan_no: input.pan_no.trim().toUpperCase() || null,

    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    alternate_phone: nullable(input.alternate_phone),
    emergency_contact_name: nullable(input.emergency_contact_name),
    emergency_contact_phone: nullable(input.emergency_contact_phone),

    employee_id: input.employee_id.trim().toUpperCase(),
    designation: input.designation.trim(),
    department: nullable(input.department),
    joining_date: input.joining_date,
    employment_type: input.employment_type,
    status: input.status,
    highest_qualification: nullable(input.highest_qualification),

    address: {
      line1: input.address.line1.trim(),
      line2: nullable(input.address.line2),
      city: input.address.city.trim(),
      state: input.address.state.trim(),
      postal_code: input.address.postal_code.trim().toUpperCase(),
      country: input.address.country.trim(),
    },

    qualifications: input.qualifications.map(toQualification),
    experiences: input.experiences.map(toExperience),
    subject_ids: input.subject_ids,
    class_assignments: input.class_assignments,
  };
}

export const teacherService = {
  list: base.list,
  remove: base.remove,

  /**
   * Unpaginated teachers for pickers — used by the subject module to assign
   * teachers from the other side of the same relationship.
   */
  options: (signal?: AbortSignal) => base.all({ status: 'active' }, signal),

  async show(id: number | string, signal?: AbortSignal): Promise<TeacherDetail> {
    const { data } = await http.get<ApiResource<TeacherDetail>>(`/teachers/${id}`, { signal });
    return data.data;
  },

  async create(input: TeacherInput): Promise<TeacherDetail> {
    const { data } = await http.post<ApiResource<TeacherDetail>>('/teachers', toPayload(input));
    return data.data;
  },

  async update(id: number, input: TeacherInput): Promise<TeacherDetail> {
    const { data } = await http.put<ApiResource<TeacherDetail>>(`/teachers/${id}`, toPayload(input));
    return data.data;
  },

  async uploadPhoto(id: number, file: File): Promise<TeacherDetail> {
    const body = new FormData();
    body.append('photo', file);

    const { data } = await http.post<ApiResource<TeacherDetail>>(`/teachers/${id}/photo`, body);
    return data.data;
  },

  /**
   * Export the current view. Filters are forwarded and paging dropped, so the
   * file matches what the user is looking at and covers every match.
   */
  async export(format: 'pdf' | 'excel', params: ListQueryParams = {}): Promise<void> {
    const { page: _page, per_page: _perPage, ...filters } = params;
    const extension = format === 'excel' ? 'xlsx' : 'pdf';

    await downloadFile('/teachers/export', timestampedFilename('teachers', extension), {
      params: { ...filters, format },
    });
  },
};
