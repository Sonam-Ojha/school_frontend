import type {
  ApiResource,
  CollectionResponse,
  ListQueryParams,
  PaginatedResponse,
} from '@/types/api';

import { http } from './axios';

/**
 * Generic REST service for a Laravel API resource.
 *
 * Standard `apiResource` routes are identical for every module, so each
 * feature composes this instead of rewriting five axios calls. Modules add
 * their own endpoints alongside it:
 *
 * @example
 * const base = createCrudService<Student, StudentPayload>('/students');
 * export const studentService = {
 *   ...base,
 *   promote: (id: number) => http.post(`/students/${id}/promote`),
 * };
 */
export interface CrudService<TResource, TPayload = Partial<TResource>> {
  list: (params?: ListQueryParams, signal?: AbortSignal) => Promise<PaginatedResponse<TResource>>;
  all: (params?: ListQueryParams, signal?: AbortSignal) => Promise<TResource[]>;
  show: (id: number | string, signal?: AbortSignal) => Promise<TResource>;
  create: (payload: TPayload) => Promise<TResource>;
  update: (id: number | string, payload: TPayload) => Promise<TResource>;
  remove: (id: number | string) => Promise<void>;
}

export function createCrudService<TResource, TPayload = Partial<TResource>>(
  endpoint: string,
): CrudService<TResource, TPayload> {
  const base = `/${endpoint.replace(/^\/+|\/+$/g, '')}`;

  return {
    async list(params = {}, signal) {
      const { data } = await http.get<PaginatedResponse<TResource>>(base, { params, signal });
      return data;
    },

    /** Unpaginated fetch for select/autocomplete sources. */
    async all(params = {}, signal) {
      const { data } = await http.get<CollectionResponse<TResource>>(base, {
        params: { ...params, per_page: 'all' },
        signal,
      });
      return data.data;
    },

    async show(id, signal) {
      const { data } = await http.get<ApiResource<TResource>>(`${base}/${id}`, { signal });
      return data.data;
    },

    async create(payload) {
      const { data } = await http.post<ApiResource<TResource>>(base, payload);
      return data.data;
    },

    async update(id, payload) {
      const { data } = await http.put<ApiResource<TResource>>(`${base}/${id}`, payload);
      return data.data;
    },

    async remove(id) {
      await http.delete(`${base}/${id}`);
    },
  };
}
