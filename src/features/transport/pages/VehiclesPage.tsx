import { Bus, FileSpreadsheet, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { FleetStats } from '../components/FleetStats';
import { VehicleFormModal } from '../components/VehicleFormModal';
import { buildVehicleColumns } from '../components/vehicleColumns';
import {
  COMPLIANCE_LABELS,
  TRANSPORT_PERMISSIONS,
  VEHICLE_STATUS_OPTIONS,
} from '../constants';
import { useDeleteVehicle, useExportVehicles, useVehicles } from '../hooks/useTransport';
import type { ComplianceStatus, Vehicle } from '../types';

const COMPLIANCE_OPTIONS = (Object.keys(COMPLIANCE_LABELS) as ComplianceStatus[]).map(
  (status) => ({ label: COMPLIANCE_LABELS[status], value: status }),
);

export default function VehiclesPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'name',
    defaultSortDir: 'asc',
    filterKeys: ['status', 'compliance'],
  });

  const { data, isLoading, isFetching, error } = useVehicles(table.queryParams);
  const exportVehicles = useExportVehicles();
  const deleteVehicle = useDeleteVehicle();

  const vehicleForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);

  const columns = buildVehicleColumns({
    onEdit: (vehicle) => {
      setEditing(vehicle);
      vehicleForm.open();
    },
    onDelete: (vehicle) => {
      setPendingDelete(vehicle);
      deleteDialog.open();
    },
    canUpdate: hasPermission(TRANSPORT_PERMISSIONS.update),
    canDelete: hasPermission(TRANSPORT_PERMISSIONS.delete),
  });

  return (
    <div className="space-y-4">
      <FleetStats />

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
            onRowClick={(vehicle) =>
              navigate(toPath(PATHS.transportVehicleDetail, { id: vehicle.id }))
            }
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Name, registration or driver"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <>
                    <Select
                      aria-label="Filter by status"
                      value={table.filters.status ?? ''}
                      options={VEHICLE_STATUS_OPTIONS}
                      placeholder="Any status"
                      onChange={(event) =>
                        table.setFilter('status', event.target.value || undefined)
                      }
                      className="w-44"
                    />
                    <Select
                      aria-label="Filter by paperwork"
                      value={table.filters.compliance ?? ''}
                      options={COMPLIANCE_OPTIONS}
                      placeholder="Any paperwork"
                      onChange={(event) =>
                        table.setFilter('compliance', event.target.value || undefined)
                      }
                      className="w-44"
                    />
                  </>
                }
                actions={
                  <>
                    <Can permissions={[TRANSPORT_PERMISSIONS.export]}>
                      <Button
                        variant="outline"
                        isLoading={exportVehicles.isPending}
                        onClick={() =>
                          exportVehicles.mutate({ params: table.queryParams, format: 'excel' })
                        }
                        leftIcon={<FileSpreadsheet className="size-4" />}
                      >
                        Export
                      </Button>
                    </Can>

                    <Can permissions={[TRANSPORT_PERMISSIONS.create]}>
                      <Button
                        onClick={() => {
                          setEditing(null);
                          vehicleForm.open();
                        }}
                        leftIcon={<Plus className="size-4" />}
                      >
                        Add bus
                      </Button>
                    </Can>
                  </>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<Bus className="size-6" />}
                title="No buses"
                description={
                  table.hasActiveFilters
                    ? 'Nothing matches these filters.'
                    : 'Add the first bus to start the fleet register.'
                }
              />
            }
          />
        </CardBody>
      </Card>

      {vehicleForm.isOpen && (
        <VehicleFormModal
          key={editing?.id ?? 'new'}
          isOpen={vehicleForm.isOpen}
          onClose={() => {
            vehicleForm.close();
            setEditing(null);
          }}
          vehicle={editing}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteVehicle.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteVehicle.isPending}
        isDestructive
        title={`Delete ${pendingDelete?.name ?? 'this bus'}?`}
        confirmLabel="Delete bus"
        message={
          pendingDelete?.route_id ? (
            <Alert tone="warning">
              It is running {pendingDelete.route_name}. Take it off the route first, or mark it
              retired instead of deleting it.
            </Alert>
          ) : (
            'Its papers and tracker registration go with it. This cannot be undone.'
          )
        }
      />
    </div>
  );
}
