import { http } from '@/lib/axios';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type { AcademicYearInput } from '../schemas';
import type { AcademicYear } from '../types';

const toPayload = (input: AcademicYearInput) => ({
  name: input.name.trim(),
  start_date: input.start_date,
  end_date: input.end_date,
  is_current: input.is_current,
});

/**
 * Academic sessions.
 *
 * The list is short and always shown whole, so it is never paginated —
 * a school has a handful of sessions, not pages of them.
 */
export const academicYearService = {
  async all(signal?: AbortSignal): Promise<AcademicYear[]> {
    const { data } = await http.get<CollectionResponse<AcademicYear>>('/academic-years', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },

  async create(input: AcademicYearInput): Promise<AcademicYear> {
    const { data } = await http.post<ApiResource<AcademicYear>>('/academic-years', toPayload(input));
    return data.data;
  },

  async update(id: number, input: AcademicYearInput): Promise<AcademicYear> {
    const { data } = await http.put<ApiResource<AcademicYear>>(
      `/academic-years/${id}`,
      toPayload(input),
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await http.delete(`/academic-years/${id}`);
  },

  /**
   * Makes one session current. A dedicated endpoint rather than a flag on
   * update, because the backend must also clear the previous current session
   * inside the same transaction.
   */
  async activate(id: number): Promise<AcademicYear> {
    const { data } = await http.post<ApiResource<AcademicYear>>(`/academic-years/${id}/activate`);
    return data.data;
  },
};
