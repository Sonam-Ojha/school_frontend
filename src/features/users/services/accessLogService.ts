import { http } from '@/lib/axios';
import type { CollectionResponse } from '@/types/api';

export type AccessLogAction =
  | 'role.created'
  | 'role.updated'
  | 'role.deleted'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.roles'
  | 'user.permissions'
  | 'user.scope'
  | 'user.status';

/** One change to who may do what: a role's permissions, a person's roles, overrides, scope or status. */
export interface AccessLogEntry {
  id: number;
  at: string;
  actor_id: number | null;
  actor_name: string;
  action: AccessLogAction;
  /** The role or the person it was about. */
  target: string;
  detail: string;
}

export const accessLogService = {
  /** The latest 500 changes, newest first, optionally narrowed by a search. */
  async list(search: string, signal?: AbortSignal): Promise<AccessLogEntry[]> {
    const { data } = await http.get<CollectionResponse<AccessLogEntry>>('/access-log', {
      params: search ? { search } : undefined,
      signal,
    });
    return data.data;
  },
};
