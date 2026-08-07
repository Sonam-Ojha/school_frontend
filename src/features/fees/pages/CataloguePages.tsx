import { BadgePercent, Layers, Plus } from 'lucide-react';
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

import { DiscountFormModal } from '../components/DiscountFormModal';
import { FeeTypeFormModal } from '../components/FeeTypeFormModal';
import { buildDiscountColumns, buildFeeTypeColumns } from '../components/columns';
import { FEE_CATEGORY_OPTIONS, FEE_PERMISSIONS } from '../constants';
import {
  useDeleteDiscount,
  useDeleteFeeType,
  useDiscounts,
  useFeeTypes,
} from '../hooks/useFeeCatalogue';
import type { Discount, FeeType } from '../types';

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

/**
 * The two catalogue tables.
 *
 * They share a shape — list, modal, delete guard — so they live together
 * rather than in two files of near-identical wiring.
 */

export function FeeTypesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const table = useTableQueryState({
    defaultSortBy: 'name',
    defaultSortDir: 'asc',
    filterKeys: ['category', 'status'],
  });

  const { data, isLoading, isFetching, error } = useFeeTypes(table.queryParams);
  const deleteType = useDeleteFeeType();

  const modal = useDisclosure();
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FeeType | null>(null);

  const openCreate = () => {
    setEditing(null);
    modal.open();
  };

  const columns = buildFeeTypeColumns({
    onEdit: (feeType) => {
      setEditing(feeType);
      modal.open();
    },
    onDelete: setPendingDelete,
    canUpdate: hasPermission(FEE_PERMISSIONS.update),
    canDelete: hasPermission(FEE_PERMISSIONS.delete),
  });

  const inUse = (pendingDelete?.structures_count ?? 0) > 0;

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
            searchPlaceholder="Search fee types…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <>
                <Select
                  aria-label="Filter by category"
                  value={table.filters.category ?? ''}
                  options={FEE_CATEGORY_OPTIONS}
                  placeholder="All categories"
                  onChange={(event) => table.setFilter('category', event.target.value || undefined)}
                  className="h-9 w-auto min-w-36 text-sm"
                />
                <Select
                  aria-label="Filter by status"
                  value={table.filters.status ?? ''}
                  options={STATUS_OPTIONS}
                  placeholder="All types"
                  onChange={(event) => table.setFilter('status', event.target.value || undefined)}
                  className="h-9 w-auto min-w-32 text-sm"
                />
              </>
            }
            actions={
              <Can permissions={[FEE_PERMISSIONS.create]}>
                <Button onClick={openCreate} leftIcon={<Plus className="size-4" />}>
                  New fee type
                </Button>
              </Can>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<Layers className="size-6" />}
            title={table.hasActiveFilters ? 'No fee types match' : 'No fee types yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Create the fee lines a structure will be built from.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[FEE_PERMISSIONS.create]}>
                  <Button onClick={openCreate}>New fee type</Button>
                </Can>
              )
            }
          />
        }
      />

      <FeeTypeFormModal
        key={editing?.id ?? 'create'}
        isOpen={modal.isOpen}
        onClose={modal.close}
        feeType={editing}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteType.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteType.isPending}
        isDestructive={!inUse}
        title={inUse ? 'This fee type is in use' : 'Delete this fee type?'}
        confirmLabel={inUse ? 'Try anyway' : 'Delete fee type'}
        message={
          pendingDelete ? (
            inUse ? (
              <>
                <strong>{pendingDelete.name}</strong> appears in{' '}
                {pendingDelete.structures_count} fee structure
                {pendingDelete.structures_count === 1 ? '' : 's'}. Remove it from those first, or
                mark it inactive to keep the history intact.
              </>
            ) : (
              <>
                <strong>{pendingDelete.name}</strong> will be removed. This cannot be undone.
              </>
            )
          ) : null
        }
      />
    </>
  );
}

export function DiscountsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const table = useTableQueryState({
    defaultSortBy: 'name',
    defaultSortDir: 'asc',
    filterKeys: ['status'],
  });

  const { data, isLoading, isFetching, error } = useDiscounts(table.queryParams);
  const deleteDiscount = useDeleteDiscount();

  const modal = useDisclosure();
  const [editing, setEditing] = useState<Discount | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Discount | null>(null);

  const openCreate = () => {
    setEditing(null);
    modal.open();
  };

  const columns = buildDiscountColumns({
    onEdit: (discount) => {
      setEditing(discount);
      modal.open();
    },
    onDelete: setPendingDelete,
    canUpdate: hasPermission(FEE_PERMISSIONS.update),
    canDelete: hasPermission(FEE_PERMISSIONS.delete),
  });

  const inUse = (pendingDelete?.usages_count ?? 0) > 0;

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
            searchPlaceholder="Search discounts…"
            hasActiveFilters={table.hasActiveFilters}
            onResetFilters={table.resetFilters}
            filters={
              <Select
                aria-label="Filter by status"
                value={table.filters.status ?? ''}
                options={STATUS_OPTIONS}
                placeholder="All discounts"
                onChange={(event) => table.setFilter('status', event.target.value || undefined)}
                className="h-9 w-auto min-w-32 text-sm"
              />
            }
            actions={
              <Can permissions={[FEE_PERMISSIONS.create]}>
                <Button onClick={openCreate} leftIcon={<Plus className="size-4" />}>
                  New discount
                </Button>
              </Can>
            }
          />
        }
        emptyState={
          <EmptyState
            icon={<BadgePercent className="size-6" />}
            title={table.hasActiveFilters ? 'No discounts match' : 'No discounts yet'}
            description={
              table.hasActiveFilters
                ? 'Try a different search term or clear the filters.'
                : 'Create the concessions your cashiers can apply at collection.'
            }
            action={
              table.hasActiveFilters ? (
                <Button variant="outline" onClick={table.resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Can permissions={[FEE_PERMISSIONS.create]}>
                  <Button onClick={openCreate}>New discount</Button>
                </Can>
              )
            }
          />
        }
      />

      <DiscountFormModal
        key={editing?.id ?? 'create'}
        isOpen={modal.isOpen}
        onClose={modal.close}
        discount={editing}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteDiscount.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
        isLoading={deleteDiscount.isPending}
        isDestructive={!inUse}
        title={inUse ? 'This discount has been used' : 'Delete this discount?'}
        confirmLabel={inUse ? 'Try anyway' : 'Delete discount'}
        message={
          pendingDelete ? (
            inUse ? (
              <>
                <strong>{pendingDelete.name}</strong> has been applied to{' '}
                {pendingDelete.usages_count} payment
                {pendingDelete.usages_count === 1 ? '' : 's'}. Deleting it would leave those
                receipts referencing nothing — mark it inactive instead.
              </>
            ) : (
              <>
                <strong>{pendingDelete.name}</strong> will be removed. This cannot be undone.
              </>
            )
          ) : null
        }
      />
    </>
  );
}
