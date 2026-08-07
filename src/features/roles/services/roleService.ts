import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import type { ApiResource, CollectionResponse } from '@/types/api';

import type { RoleInput } from '../schemas';
import type { Role, RoleDetail, RolePayload } from '../types';

const base = createCrudService<Role, RolePayload>('/roles');

/** Role names are slugs; normalise before they reach the API. */
const toPayload = (input: RoleInput): RolePayload => ({
  name: input.name.trim().toLowerCase(),
  permissions: input.permissions,
});

/**
 * Role I/O. Composes the shared CRUD service and overrides only what differs:
 * the detail endpoint returns the assigned permission names, and writes go
 * through `toPayload`.
 */
export const roleService = {
  list: base.list,
  remove: base.remove,

  async show(id: number | string, signal?: AbortSignal): Promise<RoleDetail> {
    const { data } = await http.get<ApiResource<RoleDetail>>(`/roles/${id}`, { signal });
    return data.data;
  },

  async create(input: RoleInput): Promise<RoleDetail> {
    const { data } = await http.post<ApiResource<RoleDetail>>('/roles', toPayload(input));
    return data.data;
  },

  async update(id: number | string, input: RoleInput): Promise<RoleDetail> {
    const { data } = await http.put<ApiResource<RoleDetail>>(`/roles/${id}`, toPayload(input));
    return data.data;
  },

  /** Unpaginated list for role pickers (e.g. assigning a role to a user). */
  async options(signal?: AbortSignal): Promise<Role[]> {
    const { data } = await http.get<CollectionResponse<Role>>('/roles', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },
};
