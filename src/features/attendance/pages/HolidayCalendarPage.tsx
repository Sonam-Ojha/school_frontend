import { CalendarDays, Plus } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { HolidayFormModal } from '../components/HolidayFormModal';
import { buildHolidayColumns } from '../components/holidayColumns';
import { HOLIDAY_PERMISSIONS, HOLIDAY_SCOPE_OPTIONS, HOLIDAY_TYPE_OPTIONS } from '../constants';
import { useDeleteHoliday, useHolidays } from '../hooks/useHolidays';
import type { Holiday } from '../types';

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - 1 + i;
  return { label: String(year), value: year };
});

export default function HolidayCalendarPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'start_date',
    defaultSortDir: 'asc',
    filterKeys: ['year', 'type', 'scope'],
  });

  const { data, isLoading, isFetching, error } = useHolidays(table.queryParams);
  const deleteHoliday = useDeleteHoliday();

  const formModal = useDisclosure();
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Holiday | null>(null);

  const openCreate = () => {
    setEditing(null);
    formModal.open();
  };

  const columns = buildHolidayColumns({
    onEdit: (holiday) => {
      setEditing(holiday);
      formModal.open();
    },
    onDelete: setPendingDelete,
    canUpdate: hasPermission(HOLIDAY_PERMISSIONS.update),
    canDelete: hasPermission(HOLIDAY_PERMISSIONS.delete),
  });

  return (
    <>
      <DataTable
        columns={columns}
        rows={data?.data}
        meta={data?.meta}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSort={table.toggleSort}
        onPageChange={table.setPage}
        onPerPageChange={table.setPerPage}
        toolbar={
          <TableToolbar
            search={table.search}
            onSearchChange={table.setSearch}
            searchPlaceholder="Search holidays…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <>
                <Select
                  aria-label="Filter by year"
                  value={table.filters.year ?? ''}
                  options={YEAR_OPTIONS}
                  placeholder="All years"
                  onChange={(event) => table.setFilter('year', event.target.value || undefined)}
                  className="h-9 w-auto min-w-28 text-sm"
                />
                <Select
                  aria-label="Filter by type"
                  value={table.filters.type ?? ''}
                  options={HOLIDAY_TYPE_OPTIONS}
                  placeholder="All types"
                  onChange={(event) => table.setFilter('type', event.target.value || undefined)}
                  className="h-9 w-auto min-w-40 text-sm"
                />
                <Select
                  aria-label="Filter by scope"
                  value={table.filters.scope ?? ''}
                  options={HOLIDAY_SCOPE_OPTIONS}
                  placeholder="Anyone"
                  onChange={(event) => table.setFilter('scope', event.target.value || undefined)}
                  className="h-9 w-auto min-w-36 text-sm"
                />
              </>
            }
            actions={
              <Can permissions={[HOLIDAY_PERMISSIONS.create]}>
                <Button onClick={openCreate} leftIcon={<Plus className="size-4" />}>
                  New holiday
                </Button>
              </Can>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title={table.hasActiveFilters ? 'No holidays match your filters' : 'No holidays yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Add the school calendar so attendance skips non-working days.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[HOLIDAY_PERMISSIONS.create]}>
                  <Button onClick={openCreate}>New holiday</Button>
                </Can>
              )
            }
          />
        }
      />

      <HolidayFormModal
        // Remount per record so `defaultValues` are applied.
        key={editing?.id ?? 'create'}
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        holiday={editing}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteHoliday.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteHoliday.isPending}
        isDestructive
        title="Remove this holiday?"
        confirmLabel="Remove holiday"
        message={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.name}</strong> will be removed from the calendar. Those{' '}
              {pendingDelete.days_count} day{pendingDelete.days_count === 1 ? '' : 's'} become
              working days again, and will count toward attendance percentages.
            </>
          ) : null
        }
      />
    </>
  );
}
