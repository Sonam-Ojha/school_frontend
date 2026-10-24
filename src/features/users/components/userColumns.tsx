import { Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { isSuperAdminRole } from '@/features/roles/constants';
import { formatDateTime } from '@/lib/format';
import { roleLabel } from '@/types/auth';

import type { UserAccount } from '../types';

interface UserColumnOptions {
  onEdit: (user: UserAccount) => void;
  onDelete: (user: UserAccount) => void;
  canUpdate: boolean;
  canDelete: boolean;
  /** The signed-in account, which may not delete itself. */
  currentUserId: number | null;
  /** Only a super admin may change or remove another super admin. */
  isSuperAdmin: boolean;
}

/**
 * Column definitions for the users table.
 *
 * A factory rather than a constant because the cells need the page's handlers
 * and the current user's permissions. Secondary columns drop away on small
 * screens so the name and actions always stay reachable.
 */
export function buildUserColumns({
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
  currentUserId,
  isSuperAdmin,
}: UserColumnOptions): Column<UserAccount>[] {
  return [
    {
      key: 'name',
      header: 'User',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatar_url} size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium text-slate-900">{user.name}</span>
              {user.id === currentUserId && <Badge tone="info">You</Badge>}
              {user.is_demo && <Badge tone="warning">Demo</Badge>}
            </div>
            <div className="truncate text-xs text-slate-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      hideBelow: 'sm',
      cell: (user) => {
        const granted = user.granted_permissions?.length ?? 0;
        const revoked = user.revoked_permissions?.length ?? 0;
        return (
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1">
              {user.roles.length === 0 ? (
                <span className="text-slate-400">None</span>
              ) : (
                user.roles.map((role) => (
                  <Badge key={role} tone="neutral">
                    {roleLabel(role)}
                  </Badge>
                ))
              )}
            </div>
            {/* What the School Admin set for this person alone, on top of the roles. */}
            {(granted > 0 || revoked > 0) && (
              <p className="text-xs text-amber-700">
                {[granted > 0 && `+${granted} extra`, revoked > 0 && `−${revoked} taken away`].filter(Boolean).join(' · ')}
              </p>
            )}
            {user.access_scope_label && (
              <p className="truncate text-xs text-slate-500" title={user.access_scope_label}>
                Limited to {user.access_scope_label}
              </p>
            )}
          </div>
        );
      },
    },
    {
      // Who on the rosters the account is. For a parent or student this is
      // everything they can see, so an empty cell there is worth noticing.
      key: 'linked',
      header: 'Linked to',
      hideBelow: 'lg',
      cell: (user) => {
        const people = [
          ...(user.linked?.students ?? []).map((person) => ({ ...person, kind: 'Student' })),
          ...(user.linked?.teacher ? [{ ...user.linked.teacher, kind: 'Teacher' }] : []),
          ...(user.linked?.staff ? [{ ...user.linked.staff, kind: 'Staff' }] : []),
        ];
        const isFamily = user.roles.some((role) => role === 'parent' || role === 'student');

        if (people.length === 0) {
          return isFamily ? (
            <Badge tone="warning">No student linked</Badge>
          ) : (
            <span className="text-slate-400">—</span>
          );
        }
        return (
          <div className="space-y-0.5">
            {people.map((person) => (
              <div key={`${person.kind}-${person.id}`} className="truncate text-sm">
                <span className="text-slate-900">{person.name}</span>
                <span className="text-xs text-slate-500">
                  {' '}
                  · {person.kind}
                  {person.detail ? `, ${person.detail}` : ''}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      hideBelow: 'xl',
      cell: (user) => user.phone ?? <span className="text-slate-400">—</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      hideBelow: 'md',
      cell: (user) =>
        user.is_active ? (
          <Badge tone="success" withDot>
            Active
          </Badge>
        ) : (
          <Badge tone="neutral" withDot>
            Deactivated
          </Badge>
        ),
    },
    {
      key: 'last_login_at',
      header: 'Last sign-in',
      hideBelow: 'xl',
      cell: (user) => formatDateTime(user.last_login_at, 'Never'),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (user) => {
        const protectedAccount = user.roles.some(isSuperAdminRole) && !isSuperAdmin;
        const editable = canUpdate && !protectedAccount;
        const removable = canDelete && !protectedAccount && user.id !== currentUserId;

        return (
          <div className="flex items-center justify-end gap-1">
            {editable && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={`Edit ${user.name}`}
                onClick={() => onEdit(user)}
                leftIcon={<Pencil className="size-4" />}
              />
            )}
            {removable && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={`Delete ${user.name}`}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onDelete(user)}
                leftIcon={<Trash2 className="size-4" />}
              />
            )}
          </div>
        );
      },
    },
  ];
}
