import { ROLES } from '@/types/auth';

/**
 * The seven actions every resource can expose. Permission names follow
 * `resource.action` (Spatie stores them as a flat string), so this list is
 * also the column order of the permission matrix.
 */
export const PERMISSION_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'export',
  'print',
  'approve',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const ACTION_LABELS: Record<PermissionAction, string> = {
  create: 'Create',
  read: 'Read',
  update: 'Update',
  delete: 'Delete',
  export: 'Export',
  print: 'Print',
  approve: 'Approve',
};

/**
 * Roles the backend seeds and protects. They can have their permissions
 * changed but cannot be renamed or deleted — except `super-admin`, which
 * bypasses every check and therefore has nothing meaningful to edit.
 */
export const SYSTEM_ROLES: readonly string[] = Object.values(ROLES);

/** Permissions gating this module. Mirror these in the backend policy. */
export const ROLE_PERMISSIONS = {
  read: 'roles.read',
  create: 'roles.create',
  update: 'roles.update',
  delete: 'roles.delete',
} as const;

export const PERMISSION_PERMISSIONS = {
  read: 'permissions.read',
} as const;

/**
 * `super-admin` is granted everything through Spatie's `Gate::before`, so its
 * permission set is not editable — showing an all-checked matrix would imply
 * the checkboxes mean something.
 */
export const isSuperAdminRole = (name: string): boolean => name === ROLES.superAdmin;
