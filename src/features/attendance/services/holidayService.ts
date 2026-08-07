import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type { HolidayInput } from '../schemas';
import type { Holiday } from '../types';

const base = createCrudService<Holiday>('/holidays');

const toPayload = (input: HolidayInput) => ({
  name: input.name.trim(),
  start_date: input.start_date,
  end_date: input.end_date,
  type: input.type,
  scope: input.scope,
  description: input.description.trim() || null,
});

export const holidayService = {
  list: base.list,
  remove: base.remove,

  /** Unpaginated, for the calendar view and for marking sheets. */
  async forYear(year: number, signal?: AbortSignal): Promise<Holiday[]> {
    const { data } = await http.get<CollectionResponse<Holiday>>('/holidays', {
      params: { per_page: 'all', year },
      signal,
    });
    return data.data;
  },

  async create(input: HolidayInput): Promise<Holiday> {
    const { data } = await http.post<ApiResource<Holiday>>('/holidays', toPayload(input));
    return data.data;
  },

  async update(id: number, input: HolidayInput): Promise<Holiday> {
    const { data } = await http.put<ApiResource<Holiday>>(`/holidays/${id}`, toPayload(input));
    return data.data;
  },
};
