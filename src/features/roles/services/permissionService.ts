import { http } from '@/lib/axios';
import type { CollectionResponse } from '@/types/api';

import type { Permission } from '../types';

export const permissionService = {
  /**
   * Every permission in the system, unpaginated.
   *
   * The matrix needs the complete set to render its rows, and the list is
   * seeded and small (resources × 7 actions), so paging it would only add
   * complexity. `with_roles` asks the API to include the holding roles for
   * the read-only permissions screen.
   */
  async all(withRoles = false, signal?: AbortSignal): Promise<Permission[]> {
    const { data } = await http.get<CollectionResponse<Permission>>('/permissions', {
      params: { per_page: 'all', ...(withRoles ? { with_roles: 1 } : {}) },
      signal,
    });
    return data.data;
  },
};
