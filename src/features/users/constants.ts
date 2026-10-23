import type { Option } from '@/types/common';

/** Permissions gating this module. Mirror these in the backend rules. */
export const USER_PERMISSIONS = {
  read: 'users.read',
  create: 'users.create',
  update: 'users.update',
  delete: 'users.delete',
} as const;

export const USER_STATUS_OPTIONS: Option[] = [
  { label: 'Active', value: 'active' },
  { label: 'Deactivated', value: 'inactive' },
];

/** Filter keys this table owns — passed to `useTableQueryState`. */
export const USER_FILTER_KEYS = ['role', 'status'];
