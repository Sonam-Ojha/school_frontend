import { UserPlus, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { formatCurrency } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { StructureEditor } from '../components/StructureEditor';
import { EMPLOYEE_TYPE_LABELS, EMPLOYEE_TYPE_OPTIONS, PAYROLL_PERMISSIONS } from '../constants';
import { useStructure, useStructures, useUnassignedEmployees } from '../hooks/usePayroll';
import type { EmployeeType, SalaryStructure, UnassignedEmployee } from '../types';

/** Whoever the editor is pointed at, from either roster. */
type EditorTarget = Pick<
  UnassignedEmployee,
  'employee_type' | 'employee_id' | 'employee_name' | 'employee_code' | 'designation' | 'photo_url'
>;

export default function StructuresPage() {
  const [, setSearchParams] = useSearchParams();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(PAYROLL_PERMISSIONS.update);

  const table = useTableQueryState({
    defaultSortBy: 'employee_name',
    defaultSortDir: 'asc',
    filterKeys: ['employee_type'],
  });

  const query = useMemo(() => ({ ...table.queryParams }), [table.queryParams]);
  const { data, isLoading, isFetching, error } = useStructures(query);
  const { data: unassigned } = useUnassignedEmployees();

  const editor = useDisclosure();
  const [target, setTarget] = useState<EditorTarget | null>(null);

  // The editor needs the full structure; the table row already is one, but
  // somebody being put on the payroll for the first time has none.
  const { data: structure } = useStructure(
    target?.employee_type ?? null,
    target?.employee_id ?? null,
  );

  const openEditor = (employee: EditorTarget) => {
    setTarget(employee);
    editor.open();
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set('employee', `${employee.employee_type}-${employee.employee_id}`);
        return next;
      },
      { replace: true },
    );
  };

  const closeEditor = () => {
    editor.close();
    setTarget(null);
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('employee');
        return next;
      },
      { replace: true },
    );
  };

  const columns: Column<SalaryStructure>[] = [
    {
      key: 'employee_name',
      header: 'Employee',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.employee_name} src={row.photo_url} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{row.employee_name}</p>
            <p className="truncate text-xs text-slate-500">
              <code>{row.employee_code}</code> · {row.designation}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'employee_type',
      header: 'Category',
      hideBelow: 'lg',
      cell: (row) => <Badge tone="neutral">{EMPLOYEE_TYPE_LABELS[row.employee_type]}</Badge>,
    },
    {
      key: 'basic',
      header: 'Basic',
      sortable: true,
      align: 'right',
      hideBelow: 'md',
      cell: (row) => formatCurrency(row.basic),
    },
    {
      key: 'gross',
      header: 'Gross',
      sortable: true,
      align: 'right',
      cell: (row) => (
        <span className="font-mono text-sm tabular-nums text-slate-700">
          {formatCurrency(row.gross)}
        </span>
      ),
    },
    {
      key: 'total_deductions',
      header: 'Deductions',
      align: 'right',
      hideBelow: 'xl',
      cell: (row) => (
        <span className="font-mono text-sm tabular-nums text-red-700">
          {formatCurrency(row.total_deductions)}
        </span>
      ),
    },
    {
      key: 'net',
      header: 'Net',
      sortable: true,
      align: 'right',
      cell: (row) => (
        <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
          {formatCurrency(row.net)}
        </span>
      ),
    },
    {
      key: 'statutory',
      header: 'Statutory',
      hideBelow: 'lg',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge tone={row.pf_applicable ? 'success' : 'neutral'}>
            PF {row.pf_applicable ? '' : '—'}
          </Badge>
          <Badge tone={row.esi_applicable ? 'success' : 'neutral'}>
            ESI {row.esi_applicable ? '' : '—'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (row) =>
        canUpdate ? (
          <Button variant="ghost" size="sm" onClick={() => openEditor(row)}>
            Edit
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      {unassigned && unassigned.length > 0 && (
        <Card>
          <CardHeader
            title={`${unassigned.length} not on the payroll`}
            description="They will be passed over silently by the next run until a salary is set."
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100">
              {unassigned.slice(0, 8).map((employee) => (
                <li
                  key={`${employee.employee_type}-${employee.employee_id}`}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <Avatar name={employee.employee_name} src={employee.photo_url} size="sm" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {employee.employee_name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      <code>{employee.employee_code}</code> · {employee.designation} ·{' '}
                      {EMPLOYEE_TYPE_LABELS[employee.employee_type]}
                    </p>
                  </div>

                  {canUpdate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditor(employee)}
                      leftIcon={<UserPlus className="size-4" />}
                    >
                      Set salary
                    </Button>
                  )}
                </li>
              ))}
            </ul>

            {unassigned.length > 8 && (
              <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                and {unassigned.length - 8} more.
              </p>
            )}
          </CardBody>
        </Card>
      )}

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
                searchPlaceholder="Name or employee id"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <Select
                    aria-label="Filter by category"
                    value={table.filters.employee_type ?? ''}
                    options={EMPLOYEE_TYPE_OPTIONS as { label: string; value: EmployeeType }[]}
                    placeholder="Everyone"
                    onChange={(event) =>
                      table.setFilter('employee_type', event.target.value || undefined)
                    }
                    className="w-44"
                  />
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<Wallet className="size-6" />}
                title="Nobody on the payroll"
                description="Set a salary for a member of staff to start."
              />
            }
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={editor.isOpen}
        onClose={closeEditor}
        size="lg"
        title="Salary"
        description="The standing monthly salary. PF and ESI are worked out from it by rule."
        hideCloseButton={false}
      >
        {target ? (
          <StructureEditor
            key={`${target.employee_type}-${target.employee_id}`}
            employee={target}
            structure={structure ?? null}
            onSaved={closeEditor}
          />
        ) : (
          <Alert tone="info">Choose an employee.</Alert>
        )}
      </Modal>
    </div>
  );
}
