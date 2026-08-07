/** Public surface of the roles & permissions module. */

export { PermissionMatrix } from './components/PermissionMatrix';
export { RoleForm } from './components/RoleForm';
export { buildRoleColumns } from './components/roleColumns';

export {
  ACTION_LABELS,
  PERMISSION_ACTIONS,
  PERMISSION_PERMISSIONS,
  ROLE_PERMISSIONS,
  SYSTEM_ROLES,
  isSuperAdminRole,
  type PermissionAction,
} from './constants';

export { permissionKeys, usePermissions } from './hooks/usePermissions';
export { useCreateRole, useDeleteRole, useUpdateRole } from './hooks/useRoleMutations';
export { roleKeys, useRole, useRoleOptions, useRoles } from './hooks/useRoles';

export { permissionService } from './services/permissionService';
export { roleService } from './services/roleService';

export { roleSchema, type RoleInput } from './schemas';

export {
  groupPermissions,
  parsePermission,
  resolveActionColumns,
  resourceLabel,
} from './utils/groupPermissions';

export type {
  ParsedPermission,
  Permission,
  PermissionGroup,
  Role,
  RoleDetail,
  RolePayload,
} from './types';
