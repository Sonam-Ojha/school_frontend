import { ROLES } from '@/types/auth';

/**
 * The seven actions every resource can expose. Permission names follow
 * `resource.action` (Spatie stores them as a flat string), so this list is
 * also the column order of the permission matrix.
 */
export const PERMISSION_ACTIONS = [
  'read',
  'create',
  'update',
  'delete',
  'approve',
  'export',
  'print',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/** As the quotation names them: View, Create, Edit, Delete, Approve, Export — and Print. */
export const ACTION_LABELS: Record<PermissionAction, string> = {
  read: 'View',
  create: 'Create',
  update: 'Edit',
  delete: 'Delete',
  approve: 'Approve',
  export: 'Export',
  print: 'Print',
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

const RESOURCE_NAMES: Record<string, string> = {
  'academics.classes': 'Classes',
  'academics.subjects': 'Subjects',
  'academic-years': 'Academic years',
};

/** `students.create` → “Students: Create”, as the matrix names it. */
export function permissionLabel(name: string): string {
  const dot = name.lastIndexOf('.');
  const resource = name.slice(0, dot);
  const action = name.slice(dot + 1) as PermissionAction;
  const label =
    RESOURCE_NAMES[resource] ?? resource.charAt(0).toUpperCase() + resource.slice(1).replace(/[-.]/g, ' ');
  return `${label}: ${ACTION_LABELS[action] ?? action}`;
}
