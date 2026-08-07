import { FileSpreadsheet, UserMinus, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { formatCurrency, formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { AllocateBedModal } from '../components/AllocateBedModal';
import { VacateModal } from '../components/VacateModal';
import { HOSTEL_PERMISSIONS, MESS_PLAN_LABELS } from '../constants';
import { useAllocations, useExportAllocations, useHostels } from '../hooks/useHostel';
import type { HostelAllocation } from '../types';

const RESIDENCY_OPTIONS = [
  { label: 'Currently resident', value: 'active' },
  { label: 'Past residents', value: 'past' },
];

export default function AllocationsPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(HOSTEL_PERMISSIONS.update);

  const table = useTableQueryState({
    defaultSortBy: 'student_name',
    defaultSortDir: 'asc',
    filterKeys: ['hostel_id', 'residency'],
  });

  const { data, isLoading, isFetching, error } = useAllocations(table.queryParams);
  const { hostelOptions } = useHostels();
  const exportAllocations = useExportAllocations();

  const allocateForm = useDisclosure();
  const vacateDialog = useDisclosure();
  const [vacating, setVacating] = useState<HostelAllocation | null>(null);

  const columns: Column<HostelAllocation>[] = [
    {
      key: 'student_name',
      header: 'Resident',
      sortable: true,
      cell: (allocation) => (
        <div className="flex items-center gap-3">
          <Avatar name={allocation.student_name} src={allocation.photo_url} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{allocation.student_name}</p>
            <p className="truncate text-xs text-slate-500">
              <code>{allocation.admission_no}</code> · {allocation.class_name}
              {allocation.section_name ? ` — ${allocation.section_name}` : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'room_no',
      header: 'Bed',
      sortable: true,
      cell: (allocation) => (
        <button
          type="button"
          className="text-left"
          onClick={() => navigate(toPath(PATHS.hostelRoomDetail, { id: allocation.room_id }))}
        >
          <p className="text-sm font-medium text-slate-900">
            {allocation.room_no} · bed {allocation.bed_no}
          </p>
          <p className="truncate text-xs text-slate-500">{allocation.hostel_name}</p>
        </button>
      ),
    },
    {
      key: 'mess_plan',
      header: 'Mess',
      hideBelow: 'lg',
      cell: (allocation) => (
        <span className="text-sm text-slate-700">{MESS_PLAN_LABELS[allocation.mess_plan]}</span>
      ),
    },
    {
      key: 'monthly_charge',
      header: 'Monthly',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (allocation) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {formatCurrency(allocation.monthly_charge)}
          </p>
          <p className="text-xs whitespace-nowrap text-slate-500">
            {formatCurrency(allocation.room_rent)} + {formatCurrency(allocation.mess_charge)}
          </p>
        </div>
      ),
    },
    {
      key: 'allocated_on',
      header: 'Since',
      sortable: true,
      hideBelow: 'xl',
      cell: (allocation) => formatDate(allocation.allocated_on),
    },
    {
      key: 'is_active',
      header: 'Status',
      cell: (allocation) =>
        allocation.is_active ? (
          <Badge tone="success" withDot>
            Resident
          </Badge>
        ) : (
          <div>
            <Badge tone="neutral">Left</Badge>
            <p className="mt-0.5 text-xs whitespace-nowrap text-slate-500">
              {formatDate(allocation.vacated_on)}
            </p>
          </div>
        ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (allocation) =>
        canUpdate && allocation.is_active ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setVacating(allocation);
              vacateDialog.open();
            }}
            leftIcon={<UserMinus className="size-4" />}
          >
            Vacate
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <Card>
        <CardBody className="p-0">
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
                searchPlaceholder="Name, admission number or room"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <>
                    <Select
                      aria-label="Filter by hostel"
                      value={table.filters.hostel_id ?? ''}
                      options={hostelOptions}
                      placeholder="All blocks"
                      onChange={(event) =>
                        table.setFilter('hostel_id', event.target.value || undefined)
                      }
                      className="w-52"
                    />
                    <Select
                      aria-label="Filter by residency"
                      value={table.filters.residency ?? ''}
                      options={RESIDENCY_OPTIONS}
                      placeholder="Everyone"
                      onChange={(event) =>
                        table.setFilter('residency', event.target.value || undefined)
                      }
                      className="w-48"
                    />
                  </>
                }
                actions={
                  <>
                    <Can permissions={[HOSTEL_PERMISSIONS.export]}>
                      <Button
                        variant="outline"
                        isLoading={exportAllocations.isPending}
                        onClick={() =>
                          exportAllocations.mutate({
                            params: table.queryParams,
                            format: 'excel',
                          })
                        }
                        leftIcon={<FileSpreadsheet className="size-4" />}
                      >
                        Export
                      </Button>
                    </Can>

                    <Can permissions={[HOSTEL_PERMISSIONS.create]}>
                      <Button onClick={allocateForm.open} leftIcon={<UserPlus className="size-4" />}>
                        Allocate a bed
                      </Button>
                    </Can>
                  </>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<Users className="size-6" />}
                title="No residents"
                description={
                  table.hasActiveFilters
                    ? 'Nothing matches these filters.'
                    : 'Allocate a bed to put the first student in.'
                }
              />
            }
          />
        </CardBody>
      </Card>

      {allocateForm.isOpen && (
        <AllocateBedModal
          isOpen={allocateForm.isOpen}
          onClose={allocateForm.close}
          defaultHostelId={table.filters.hostel_id ? Number(table.filters.hostel_id) : null}
        />
      )}

      {vacateDialog.isOpen && vacating && (
        <VacateModal
          isOpen={vacateDialog.isOpen}
          onClose={() => {
            vacateDialog.close();
            setVacating(null);
          }}
          allocationId={vacating.id}
          studentName={vacating.student_name}
          location={`${vacating.hostel_name} · room ${vacating.room_no}, bed ${vacating.bed_no}`}
        />
      )}
    </>
  );
}
