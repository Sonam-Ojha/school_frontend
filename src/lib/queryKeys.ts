import type { ListQueryParams } from '@/types/api';

/**
 * Central query-key registry.
 *
 * Every feature registers its keys here so invalidation is greppable and no
 * two modules can accidentally collide on a string. Keys are hierarchical:
 * invalidating `students.all` clears every list and detail beneath it.
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    /** The signed-in user (`GET /auth/me`). */
    session: () => [...queryKeys.auth.all, 'session'] as const,
    /** Issued tokens / signed-in devices (`GET /auth/sessions`). */
    devices: () => [...queryKeys.auth.all, 'devices'] as const,
    /** One-click demo accounts (`GET /auth/demo-accounts`). */
    demoAccounts: () => [...queryKeys.auth.all, 'demo-accounts'] as const,
  },
  /** The platform, as the website and the schools see it (`/saas/…`). */
  saas: {
    all: ['saas'] as const,
    config: () => [...queryKeys.saas.all, 'config'] as const,
    plans: () => [...queryKeys.saas.all, 'plans'] as const,
    school: (code: string) => [...queryKeys.saas.all, 'school', code] as const,
    subscription: () => [...queryKeys.saas.all, 'subscription'] as const,
    invoice: (id: number) => [...queryKeys.saas.all, 'invoice', id] as const,
  },
} as const;

/**
 * Build the standard key tuple for a resource. Feature modules use this to
 * avoid re-inventing the list/detail shape.
 *
 * @example
 * const studentKeys = createResourceKeys('students');
 * studentKeys.list({ page: 1 }); // ['students', 'list', { page: 1 }]
 */
export function createResourceKeys<TScope extends string>(scope: TScope) {
  return {
    all: [scope] as const,
    lists: () => [scope, 'list'] as const,
    list: (params: ListQueryParams = {}) => [scope, 'list', params] as const,
    details: () => [scope, 'detail'] as const,
    detail: (id: number | string) => [scope, 'detail', id] as const,
    options: () => [scope, 'options'] as const,
  };
}

export type ResourceKeys = ReturnType<typeof createResourceKeys>;
