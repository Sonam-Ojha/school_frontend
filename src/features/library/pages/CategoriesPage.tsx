import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Column } from '@/components/table/types';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { CategoryFormModal } from '../components/CategoryFormModal';
import { LIBRARY_PERMISSIONS } from '../constants';
import { useCategories, useDeleteCategory } from '../hooks/useLibrary';
import type { BookCategory } from '../types';

export default function CategoriesPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(LIBRARY_PERMISSIONS.update);
  const canDelete = hasPermission(LIBRARY_PERMISSIONS.delete);

  const table = useTableQueryState({ defaultSortBy: 'name', defaultSortDir: 'asc' });
  const { data, isLoading, isFetching, error } = useCategories(table.queryParams);
  const deleteCategory = useDeleteCategory();

  const categoryForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editing, setEditing] = useState<BookCategory | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BookCategory | null>(null);

  const columns: Column<BookCategory>[] = [
    {
      key: 'name',
      header: 'Category',
      sortable: true,
      cell: (category) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{category.name}</p>
          {category.description && (
            <p className="truncate text-xs text-slate-500">{category.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      cell: (category) => <code className="text-xs text-slate-600">{category.code}</code>,
    },
    {
      key: 'books_count',
      header: 'Titles',
      sortable: true,
      align: 'right',
      cell: (category) => category.books_count,
    },
    {
      key: 'is_active',
      header: 'Status',
      hideBelow: 'sm',
      cell: (category) => (
        <Badge tone={category.is_active ? 'success' : 'neutral'} withDot>
          {category.is_active ? 'Active' : 'Retired'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (category) => (
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${category.name}`}
              onClick={() => {
                setEditing(category);
                categoryForm.open();
              }}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Delete ${category.name}`}
              onClick={() => {
                setPendingDelete(category);
                deleteDialog.open();
              }}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
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
                searchPlaceholder="Name or code"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                actions={
                  <Can permissions={[LIBRARY_PERMISSIONS.create]}>
                    <Button
                      onClick={() => {
                        setEditing(null);
                        categoryForm.open();
                      }}
                      leftIcon={<Plus className="size-4" />}
                    >
                      Add category
                    </Button>
                  </Can>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<Tags className="size-6" />}
                title="No categories"
                description="Categories shelve the collection. Add the first one."
              />
            }
          />
        </CardBody>
      </Card>

      {categoryForm.isOpen && (
        <CategoryFormModal
          key={editing?.id ?? 'new'}
          isOpen={categoryForm.isOpen}
          onClose={() => {
            categoryForm.close();
            setEditing(null);
          }}
          category={editing}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteCategory.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteCategory.isPending}
        isDestructive
        title={`Delete ${pendingDelete?.name ?? 'this category'}?`}
        confirmLabel="Delete category"
        message={
          pendingDelete && pendingDelete.books_count > 0 ? (
            <Alert tone="warning">
              {pendingDelete.books_count} title{pendingDelete.books_count === 1 ? ' is' : 's are'}{' '}
              filed under it. Move them first, or retire the category instead of deleting it.
            </Alert>
          ) : (
            'This cannot be undone.'
          )
        }
      />
    </>
  );
}
