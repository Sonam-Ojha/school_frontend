import { PERMISSION_ACTIONS } from '../constants';
import type { ParsedPermission, Permission, PermissionGroup } from '../types';

/**
 * Split `academics.classes.create` into resource `academics.classes` and
 * action `create`. Splitting on the *last* dot keeps namespaced resources
 * intact. A name with no dot is treated as its own resource with no action.
 */
export function parsePermission(permission: Permission): ParsedPermission {
  const index = permission.name.lastIndexOf('.');

  return index === -1
    ? { id: permission.id, name: permission.name, resource: permission.name, action: '' }
    : {
        id: permission.id,
        name: permission.name,
        resource: permission.name.slice(0, index),
        action: permission.name.slice(index + 1),
      };
}

/** `academics.classes` → `Academics · Classes`. */
export function resourceLabel(resource: string): string {
  return resource
    .split('.')
    .map((segment) =>
      segment
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    )
    .join(' · ');
}

/**
 * Turn the flat permission list into matrix rows — one per resource, with a
 * lookup from action to permission name.
 *
 * Only actions the backend actually seeded appear, so a resource that has no
 * `approve` permission renders an empty cell instead of a checkbox that could
 * never be satisfied. Rows are alphabetical; unknown actions are kept so a
 * backend addition is never silently hidden.
 */
export function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>();

  for (const permission of permissions) {
    const { resource, action, name } = parsePermission(permission);

    let group = groups.get(resource);
    if (!group) {
      group = { resource, label: resourceLabel(resource), byAction: {}, names: [] };
      groups.set(resource, group);
    }

    group.byAction[action] = name;
    group.names.push(name);
  }

  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Action columns to render: the seven canonical actions first, then any extra
 * the backend introduced, so new permissions surface without a frontend change.
 */
export function resolveActionColumns(groups: PermissionGroup[]): string[] {
  const extras = new Set<string>();

  for (const group of groups) {
    for (const action of Object.keys(group.byAction)) {
      if (action && !PERMISSION_ACTIONS.includes(action as never)) extras.add(action);
    }
  }

  return [...PERMISSION_ACTIONS, ...[...extras].sort()];
}
