import { Lock, Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatNumber } from '@/lib/format';
import { roleLabel } from '@/types/auth';

import { isSuperAdminRole } from '../constants';
import type { Role } from '../types';

interface RoleColumnOptions {
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * Column definitions for the roles table.
 *
 * A factory rather than a constant because the cells need the page's handlers
 * and the current user's permissions. Secondary columns drop away on small
 * screens so the name and actions always stay reachable.
 */
export function buildRoleColumns({
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: RoleColumnOptions): Column<Role>[] {
  return [
    {
      key: 'name',
      header: 'Role',
      sortable: true,
      cell: (role) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{roleLabel(role.name)}</span>
          {role.is_system && (
            <Badge tone="neutral" className="gap-1">
              <Lock className="size-3" aria-hidden />
              System
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      hideBelow: 'lg',
      cell: (role) => <code className="text-xs text-slate-500">{role.name}</code>,
    },
    {
      key: 'users_count',
      header: 'Users',
      sortable: true,
      align: 'right',
      hideBelow: 'sm',
      cell: (role) => formatNumber(role.users_count),
    },
    {
      key: 'permissions_count',
      header: 'Permissions',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (role) =>
        // super-admin is granted everything via Gate::before, so its stored
        // permission count is meaningless.
        isSuperAdminRole(role.name) ? (
          <Badge tone="info">All</Badge>
        ) : (
          formatNumber(role.permissions_count)
        ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      hideBelow: 'xl',
      cell: (role) => formatDate(role.created_at),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (role) => {
        // super-admin has nothing editable, and system roles cannot be removed.
        const editable = canUpdate && !isSuperAdminRole(role.name);
        const removable = canDelete && !role.is_system;

        return (
          <div className="flex items-center justify-end gap-1">
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={`Edit ${role.name}`}
                onClick={() => onEdit(role)}
                leftIcon={<Pencil className="size-4" />}
              />
            )}
            {removable && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={`Delete ${role.name}`}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDelete(role)}
                leftIcon={<Trash2 className="size-4" />}
              />
            )}
          </div>
        );
      },
    },
  ];
}
