import { BookOpen, FileSpreadsheet, Plus } from 'lucide-react';
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

import { BookFormModal } from '../components/BookFormModal';
import { LibraryStats } from '../components/LibraryStats';
import { buildBookColumns } from '../components/bookColumns';
import { LIBRARY_PERMISSIONS } from '../constants';
import {
  useBook,
  useBooks,
  useCategoryOptions,
  useDeleteBook,
  useExportBooks,
} from '../hooks/useLibrary';
import type { Book } from '../types';

const AVAILABILITY_OPTIONS = [
  { label: 'Available now', value: 'available' },
  { label: 'All copies out', value: 'unavailable' },
  { label: 'No copies yet', value: 'none' },
];

export default function BookCataloguePage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'title',
    defaultSortDir: 'asc',
    filterKeys: ['category_id', 'availability'],
  });

  const { data, isLoading, isFetching, error } = useBooks(table.queryParams);
  const { categoryOptions } = useCategoryOptions();
  const exportBooks = useExportBooks();
  const deleteBook = useDeleteBook();

  const bookForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Book | null>(null);

  // The form needs the full record; the table row is the summary shape.
  const { data: editing } = useBook(editingId ?? undefined);

  const columns = buildBookColumns({
    onEdit: (book) => {
      setEditingId(book.id);
      bookForm.open();
    },
    onDelete: (book) => {
      setPendingDelete(book);
      deleteDialog.open();
    },
    canUpdate: hasPermission(LIBRARY_PERMISSIONS.update),
    canDelete: hasPermission(LIBRARY_PERMISSIONS.delete),
  });

  return (
    <div className="space-y-4">
      <LibraryStats />

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
            onRowClick={(book) => navigate(toPath(PATHS.libraryBookDetail, { id: book.id }))}
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Title, author or ISBN"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <>
                    <Select
                      aria-label="Filter by category"
                      value={table.filters.category_id ?? ''}
                      options={categoryOptions}
                      placeholder="All categories"
                      onChange={(event) =>
                        table.setFilter('category_id', event.target.value || undefined)
                      }
                      className="w-48"
                    />
                    <Select
                      aria-label="Filter by availability"
                      value={table.filters.availability ?? ''}
                      options={AVAILABILITY_OPTIONS}
                      placeholder="Any availability"
                      onChange={(event) =>
                        table.setFilter('availability', event.target.value || undefined)
                      }
                      className="w-44"
                    />
                  </>
                }
                actions={
                  <>
                    <Can permissions={[LIBRARY_PERMISSIONS.export]}>
                      <Button
                        variant="outline"
                        isLoading={exportBooks.isPending}
                        onClick={() =>
                          exportBooks.mutate({ params: table.queryParams, format: 'excel' })
                        }
                        leftIcon={<FileSpreadsheet className="size-4" />}
                      >
                        Export
                      </Button>
                    </Can>

                    <Can permissions={[LIBRARY_PERMISSIONS.create]}>
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          bookForm.open();
                        }}
                        leftIcon={<Plus className="size-4" />}
                      >
                        Add book
                      </Button>
                    </Can>
                  </>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<BookOpen className="size-6" />}
                title="No books"
                description={
                  table.hasActiveFilters
                    ? 'Nothing matches these filters.'
                    : 'Add the first title to start the catalogue.'
                }
              />
            }
          />
        </CardBody>
      </Card>

      {/* Keyed so switching between books rebuilds the form's defaults. */}
      {bookForm.isOpen && (editingId === null || editing) && (
        <BookFormModal
          key={editingId ?? 'new'}
          isOpen={bookForm.isOpen}
          onClose={() => {
            bookForm.close();
            setEditingId(null);
          }}
          book={editingId === null ? null : (editing ?? null)}
          onCreated={(book) => navigate(toPath(PATHS.libraryBookDetail, { id: book.id }))}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          deleteBook.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={deleteBook.isPending}
        isDestructive
        title={`Delete ${pendingDelete?.title ?? 'this book'}?`}
        confirmLabel="Delete book"
        message={
          pendingDelete && pendingDelete.issued_copies > 0 ? (
            <Alert tone="warning">
              {pendingDelete.issued_copies} cop
              {pendingDelete.issued_copies === 1 ? 'y is' : 'ies are'} still out on loan. They
              have to come back first.
            </Alert>
          ) : (
            'Its copies and their accession numbers go with it. This cannot be undone.'
          )
        }
      />
    </div>
  );
}
