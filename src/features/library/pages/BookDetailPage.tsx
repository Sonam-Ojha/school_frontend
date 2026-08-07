import { ArrowLeft, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { AddCopiesModal } from '../components/AddCopiesModal';
import { BarcodeLabelSheet } from '../components/BarcodeLabelSheet';
import { BookFormModal } from '../components/BookFormModal';
import {
  COPY_CONDITION_LABELS,
  COPY_STATUS_LABELS,
  COPY_STATUS_TONES,
  LIBRARY_PERMISSIONS,
} from '../constants';
import { useBook, useDownloadLabels, useRemoveCopy } from '../hooks/useLibrary';
import type { BookCopy } from '../types';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookId = Number(id);

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(LIBRARY_PERMISSIONS.update);
  const canDelete = hasPermission(LIBRARY_PERMISSIONS.delete);

  const { data: book, isLoading, error } = useBook(id);
  const { data: school } = useSettings();
  const downloadLabels = useDownloadLabels(bookId);
  const removeCopy = useRemoveCopy(bookId);

  const editForm = useDisclosure();
  const copiesForm = useDisclosure();
  const deleteDialog = useDisclosure();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pendingDelete, setPendingDelete] = useState<BookCopy | null>(null);

  const toggleCopy = (copyId: number) => {
    setSelectedIds((current) =>
      current.includes(copyId)
        ? current.filter((entry) => entry !== copyId)
        : [...current, copyId],
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load this book">
            {error?.message ?? 'It no longer exists.'}
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(PATHS.libraryCatalogue)}
          >
            Back to the catalogue
          </Button>
        </CardBody>
      </Card>
    );
  }

  const selectedCopies = book.copies.filter((copy) => selectedIds.includes(copy.id));
  const labelCopies = selectedCopies.length > 0 ? selectedCopies : book.copies;

  return (
    <>
      <div className="print-hidden">
        <PageHeader
          title={book.title}
          description={`${book.author}${book.subtitle ? ` · ${book.subtitle}` : ''}`}
          breadcrumbs={[
            { label: 'Library', to: PATHS.libraryCatalogue },
            { label: book.title },
          ]}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => navigate(PATHS.libraryCatalogue)}
                leftIcon={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>

              <Can permissions={[LIBRARY_PERMISSIONS.update]}>
                <Button
                  variant="outline"
                  onClick={editForm.open}
                  leftIcon={<Pencil className="size-4" />}
                >
                  Edit
                </Button>
              </Can>

              <Can permissions={[LIBRARY_PERMISSIONS.create]}>
                <Button onClick={copiesForm.open} leftIcon={<Plus className="size-4" />}>
                  Add copies
                </Button>
              </Can>
            </>
          }
        />

        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Details" />
            <CardBody>
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                {[
                  ['Category', book.category_name],
                  ['ISBN', book.isbn ?? '—'],
                  ['Publisher', book.publisher ?? '—'],
                  ['Edition', book.edition ?? '—'],
                  ['Published', book.publication_year === null ? '—' : String(book.publication_year)],
                  ['Language', book.language],
                  ['Pages', book.pages === null ? '—' : String(book.pages)],
                  ['Replacement price', formatCurrency(book.price)],
                  ['Shelf', book.shelf_no ?? '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="truncate text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>

              {book.description && (
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                  {book.description}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Copies" />
            <CardBody className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-lg font-semibold text-slate-900">{book.total_copies}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Available</p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    book.available_copies === 0 ? 'text-amber-700' : 'text-emerald-700',
                  )}
                >
                  {book.available_copies}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">On loan</p>
                <p className="text-lg font-semibold text-slate-900">{book.issued_copies}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="mb-4">
          <CardHeader
            title="Physical copies"
            description="Each has its own accession number and barcode."
            actions={
              book.copies.length > 0 && (
                <Can permissions={[LIBRARY_PERMISSIONS.print]}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {selectedCopies.length > 0
                        ? `${selectedCopies.length} selected`
                        : 'All copies'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={downloadLabels.isPending}
                      onClick={() => downloadLabels.mutate(labelCopies.map((copy) => copy.id))}
                    >
                      Download labels
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.print()}
                      leftIcon={<Printer className="size-4" />}
                    >
                      Print labels
                    </Button>
                  </div>
                </Can>
              )
            }
          />

          <CardBody className={book.copies.length === 0 ? undefined : 'p-0'}>
            {book.copies.length === 0 ? (
              <EmptyState
                icon={<Plus className="size-6" />}
                title="No copies yet"
                description="A book with no copies cannot be borrowed. Add the ones on the shelf."
              />
            ) : (
              <div className="scrollbar-thin overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                      <th scope="col" className="w-10 px-3 py-2">
                        <span className="sr-only">Select</span>
                      </th>
                      <th scope="col" className="px-3 py-2 text-left">Accession</th>
                      <th scope="col" className="px-3 py-2 text-left">Status</th>
                      <th scope="col" className="px-3 py-2 text-left">Condition</th>
                      <th scope="col" className="hidden px-3 py-2 text-left sm:table-cell">
                        Acquired
                      </th>
                      <th scope="col" className="hidden px-3 py-2 text-right lg:table-cell">
                        Price
                      </th>
                      <th scope="col" className="px-3 py-2 text-right">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {book.copies.map((copy) => (
                      <tr key={copy.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2">
                          <Checkbox
                            checked={selectedIds.includes(copy.id)}
                            onChange={() => toggleCopy(copy.id)}
                            aria-label={`Select ${copy.accession_no} for printing`}
                          />
                        </td>

                        <td className="px-3 py-2">
                          <code className="text-xs font-medium text-slate-900">
                            {copy.accession_no}
                          </code>
                          {copy.shelf_no && (
                            <p className="text-xs text-slate-500">{copy.shelf_no}</p>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          <Badge tone={COPY_STATUS_TONES[copy.status]} withDot>
                            {COPY_STATUS_LABELS[copy.status]}
                          </Badge>
                          {copy.current_loan && (
                            <p
                              className={cn(
                                'mt-0.5 text-xs',
                                copy.current_loan.is_overdue ? 'text-red-600' : 'text-slate-500',
                              )}
                            >
                              {copy.current_loan.member_name} · due{' '}
                              {formatDate(copy.current_loan.due_on)}
                            </p>
                          )}
                        </td>

                        <td className="px-3 py-2 text-slate-700">
                          {COPY_CONDITION_LABELS[copy.condition]}
                        </td>
                        <td className="hidden px-3 py-2 text-slate-700 sm:table-cell">
                          {formatDate(copy.acquired_on)}
                        </td>
                        <td className="hidden px-3 py-2 text-right text-slate-700 lg:table-cell">
                          {formatCurrency(copy.price)}
                        </td>

                        <td className="px-3 py-2 text-right">
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              iconOnly
                              // A copy on loan is somewhere in the school, not
                              // something to delete out of the register.
                              disabled={copy.status === 'issued'}
                              title={
                                copy.status === 'issued'
                                  ? 'This copy is out on loan'
                                  : 'Remove this copy'
                              }
                              aria-label={`Remove copy ${copy.accession_no}`}
                              onClick={() => {
                                setPendingDelete(copy);
                                deleteDialog.open();
                              }}
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Only the labels print — everything above is screen furniture. */}
      {book.copies.length > 0 && (
        <div className="print-target">
          <BarcodeLabelSheet
            book={book}
            copies={labelCopies}
            schoolName={school?.profile.name}
          />
        </div>
      )}

      {editForm.isOpen && (
        <BookFormModal isOpen={editForm.isOpen} onClose={editForm.close} book={book} />
      )}

      {copiesForm.isOpen && (
        <AddCopiesModal isOpen={copiesForm.isOpen} onClose={copiesForm.close} book={book} />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.close}
        onConfirm={() => {
          if (!pendingDelete) return;
          removeCopy.mutate(pendingDelete.id, {
            onSuccess: () => {
              deleteDialog.close();
              setPendingDelete(null);
            },
          });
        }}
        isLoading={removeCopy.isPending}
        isDestructive
        title={`Remove copy ${pendingDelete?.accession_no ?? ''}?`}
        confirmLabel="Remove copy"
        message="Its accession number is retired with it and will not be reused."
      />

      {!canUpdate && (
        <p className="print-hidden mt-4 text-xs text-slate-500">
          You have read-only access to the catalogue.
        </p>
      )}
    </>
  );
}
