import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { createDocumentService } from '@/lib/createDocumentService';
import type { ApiResource, CollectionResponse } from '@/types/api';

import { LICENCE_REQUIRED_TYPES } from '../constants';
import type { StaffInput } from '../schemas';
import type { StaffMember, StaffMemberDetail } from '../types';

const base = createCrudService<StaffMember>('/staff');

/** Staff documents. Composes the shared owner-agnostic document service. */
export const staffDocumentService = createDocumentService('/staff');

const nullable = (value: string | undefined): string | null => value?.trim() || null;

function toPayload(input: StaffInput) {
  // Licence details are only meaningful for driving roles — switching a
  // driver to another type must not leave a stale licence on the record.
  const needsLicence = LICENCE_REQUIRED_TYPES.includes(input.staff_type);

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
    staff_type: input.staff_type,
    designation: input.designation.trim(),
    joining_date: input.joining_date,
    employment_type: input.employment_type,
    shift: input.shift,
    status: input.status,
    reports_to: nullable(input.reports_to),
    notes: nullable(input.notes),

    licence_number: needsLicence ? nullable(input.licence_number)?.toUpperCase() ?? null : null,
    licence_expiry: needsLicence ? nullable(input.licence_expiry) : null,

    address: {
      line1: input.address.line1.trim(),
      line2: nullable(input.address.line2),
      city: input.address.city.trim(),
      state: input.address.state.trim(),
      postal_code: input.address.postal_code.trim().toUpperCase(),
      country: input.address.country.trim(),
    },
  };
}

export const staffService = {
  list: base.list,
  remove: base.remove,

  /**
   * Active staff, unpaginated, for other modules' pickers.
   *
   * Lives here rather than in whichever module needs a staff member this
   * week — the roster has one owner, and a second endpoint would be a second
   * answer to who works here.
   */
  async options(signal?: AbortSignal): Promise<StaffMember[]> {
    const { data } = await http.get<CollectionResponse<StaffMember>>('/staff', {
      params: { per_page: 'all', status: 'active' },
      signal,
    });
    return data.data;
  },

  async show(id: number | string, signal?: AbortSignal): Promise<StaffMemberDetail> {
    const { data } = await http.get<ApiResource<StaffMemberDetail>>(`/staff/${id}`, { signal });
    return data.data;
  },

  async create(input: StaffInput): Promise<StaffMemberDetail> {
    const { data } = await http.post<ApiResource<StaffMemberDetail>>('/staff', toPayload(input));
    return data.data;
  },

  async update(id: number, input: StaffInput): Promise<StaffMemberDetail> {
    const { data } = await http.put<ApiResource<StaffMemberDetail>>(`/staff/${id}`, toPayload(input));
    return data.data;
  },

  async uploadPhoto(id: number, file: File): Promise<StaffMemberDetail> {
    const body = new FormData();
    body.append('photo', file);

    const { data } = await http.post<ApiResource<StaffMemberDetail>>(`/staff/${id}/photo`, body);
    return data.data;
  },
};
