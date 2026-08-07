import { Plus, Route as RouteIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import type { Column } from '@/components/table/types';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/time';
import { useAuthStore } from '@/store/authStore';

import { RouteFormModal } from '../components/RouteFormModal';
import { TRANSPORT_PERMISSIONS } from '../constants';
import { useDeleteRoute, useRoutes } from '../hooks/useTransport';
import type { TransportRoute } from '../types';

export default function RoutesPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(TRANSPORT_PERMISSIONS.update);
  const canDelete = hasPermission(TRANSPORT_PERMISSIONS.delete);

  const table = useTableQueryState({ defaultSortBy: 'code', defaultSortDir: 'asc' });
  const { data, isLoading, isFetching, error } = useRoutes(table.queryParams);
  const deleteRoute = useDeleteRoute();

  const routeForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState<TransportRoute | null>(null);

  const columns: Column<TransportRoute>[] = [
    {
      key: 'name',
      header: 'Route',
      sortable: true,
      cell: (route) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">
            <code className="text-xs text-slate-500">{route.code}</code> {route.name}
          </p>
          {route.description && (
            <p className="truncate text-xs text-slate-500">{route.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'vehicle_registration',
      header: 'Bus',
      hideBelow: 'md',
      cell: (route) =>
        route.vehicle_id ? (
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-900">{route.vehicle_name}</p>
            <p className="truncate text-xs text-slate-500">
              <code>{route.vehicle_registration}</code>
            </p>
          </div>
        ) : (
          <Badge tone="warning">No bus</Badge>
        ),
    },
    {
      key: 'driver_name',
      header: 'Driver',
      hideBelow: 'xl',
      cell: (route) => route.driver_name ?? '—',
    },
    {
      key: 'start_time',
      header: 'Runs',
      hideBelow: 'lg',
      cell: (route) =>
        route.start_time && route.end_time ? (
          <span className="text-sm whitespace-nowrap text-slate-700">
            {formatTime(route.start_time)} – {formatTime(route.end_time)}
          </span>
        ) : (
          <span className="text-xs text-slate-400">No stops</span>
        ),
    },
    {
      key: 'stops_count',
      header: 'Stops',
      sortable: true,
      align: 'right',
      hideBelow: 'sm',
      cell: (route) => route.stops_count,
    },
    {
      key: 'students_count',
      header: 'Occupancy',
      sortable: true,
      align: 'right',
      cell: (route) => {
        if (route.capacity === 0) {
          return <span className="text-xs text-slate-400">{route.students_count} · no bus</span>;
        }

        const full = route.seats_available <= 0;

        return (
          <div>
            <p className={cn('text-sm font-semibold', full ? 'text-amber-700' : 'text-slate-900')}>
              {route.students_count}
              <span className="text-xs font-normal text-slate-400"> of {route.capacity}</span>
            </p>
            <p className="text-xs whitespace-nowrap text-slate-500">
              {full ? 'full' : `${route.seats_available} free`}
            </p>
          </div>
        );
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      hideBelow: 'sm',
      cell: (route) => (
        <Badge tone={route.is_active ? 'success' : 'neutral'} withDot>
          {route.is_active ? 'In service' : 'Suspended'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (route) =>
        canDelete ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              setPendingDelete(route);
              deleteDialog.open();
            }}
          >
            Delete
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
            onRowClick={(route) => navigate(toPath(PATHS.transportRouteDetail, { id: route.id }))}
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Route name or code"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                actions={
                  <Can permissions={[TRANSPORT_PERMISSIONS.create]}>
                    <Button onClick={routeForm.open} leftIcon={<Plus className="size-4" />}>
                      Add route
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<RouteIcon className="size-6" />}
                title="No routes"
                description="Add the first route, then give it stops."
              />
            }
          />
        </CardBody>
      </Card>

      {routeForm.isOpen && (
        <RouteFormModal
          isOpen={routeForm.isOpen}
          onClose={routeForm.close}
          onCreated={(route) => navigate(toPath(PATHS.transportRouteDetail, { id: route.id }))}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteRoute.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteRoute.isPending}
        isDestructive
        title={`Delete ${pendingDelete?.name ?? 'this route'}?`}
        confirmLabel="Delete route"
        message={
          pendingDelete && pendingDelete.students_count > 0 ? (
            <Alert tone="warning">
              {pendingDelete.students_count} student
              {pendingDelete.students_count === 1 ? ' is' : 's are'} on this route. Move them
              first, or suspend the route instead of deleting it.
            </Alert>
          ) : (
            'Its stops go with it. This cannot be undone.'
          )
        }
      />

      {!canUpdate && (
        <p className="mt-4 text-xs text-slate-500">You have read-only access to transport.</p>
      )}
    </>
  );
}
