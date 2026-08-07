import { Eye, Pencil, TriangleAlert, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format';

import {
  EMPLOYMENT_TYPE_LABELS,
  SHIFT_LABELS,
  STAFF_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_TONES,
} from '../constants';
import type { StaffMember } from '../types';

/** A licence within 60 days of expiry needs attention before it lapses. */
const EXPIRY_WARNING_DAYS = 60;

export function isLicenceExpiringSoon(expiry: string | null): boolean {
  if (!expiry) return false;
  const days = (new Date(expiry).getTime() - Date.now()) / 86_400_000;
  return days <= EXPIRY_WARNING_DAYS;
}

interface StaffColumnOptions {
  onView: (member: StaffMember) => void;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

export function buildStaffColumns({
  onView,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: StaffColumnOptions): Column<StaffMember>[] {
  return [
    {
      key: 'full_name',
      header: 'Staff member',
      sortable: true,
      cell: (member) => (
        <div className="flex items-center gap-3">
          <Avatar name={member.full_name} src={member.photo_url} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{member.full_name}</p>
            {/* Type shows here on mobile, where its own column is hidden. */}
            <p className="truncate text-xs text-slate-500 md:hidden">
              {STAFF_TYPE_LABELS[member.staff_type]}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'employee_id',
      header: 'Employee ID',
      sortable: true,
      hideBelow: 'sm',
      cell: (member) => <code className="text-xs text-slate-600">{member.employee_id}</code>,
    },
    {
      key: 'staff_type',
      header: 'Type',
      sortable: true,
      hideBelow: 'md',
      cell: (member) => (
        <div className="min-w-0">
          <p className="truncate text-slate-800">{STAFF_TYPE_LABELS[member.staff_type]}</p>
          <p className="truncate text-xs text-slate-500">{member.designation}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      hideBelow: 'lg',
      cell: (member) => <span className="text-slate-700">{member.phone}</span>,
    },
    {
      key: 'shift',
      header: 'Shift',
      hideBelow: 'xl',
      cell: (member) => SHIFT_LABELS[member.shift],
    },
    {
      key: 'employment_type',
      header: 'Contract',
      hideBelow: 'xl',
      cell: (member) => EMPLOYMENT_TYPE_LABELS[member.employment_type],
    },
    {
      key: 'joining_date',
      header: 'Joined',
      sortable: true,
      hideBelow: 'lg',
      cell: (member) => formatDate(member.joining_date),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      hideBelow: 'sm',
      cell: (member) => (
        <div className="flex items-center justify-start gap-1.5">
          <Badge tone={STATUS_TONES[member.status]}>{STATUS_LABELS[member.status]}</Badge>
          {/* A driver whose licence is about to lapse needs chasing. */}
          {isLicenceExpiringSoon(member.licence_expiry) && (
            <span
              title={`Licence expires ${formatDate(member.licence_expiry)}`}
              className="text-amber-600"
            >
              <TriangleAlert className="size-4" aria-label="Licence expiring soon" />
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (member) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={`View ${member.full_name}`}
            onClick={() => onView(member)}
            leftIcon={<Eye className="size-4" />}
          />
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${member.full_name}`}
              onClick={() => onEdit(member)}
              leftIcon={<Pencil className="size-4" />}
            />
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${member.full_name}`}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(member)}
              leftIcon={<Trash2 className="size-4" />}
            />
          )}
        </div>
      ),
    },
  ];
}
