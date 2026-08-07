import { Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/table/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';

import type { Book } from '../types';

interface BookColumnOptions {
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * Availability as a fraction rather than a percentage.
 *
 * "2 of 5" is what a librarian needs at the desk; "40%" makes them do the
 * arithmetic back again.
 */
function renderAvailability(book: Book) {
  if (book.total_copies === 0) {
    return <span className="text-xs text-slate-400">No copies</span>;
  }

  const none = book.available_copies === 0;

  return (
    <div>
      <p className={cn('text-sm font-semibold', none ? 'text-amber-700' : 'text-slate-900')}>
        {book.available_copies}
        <span className="text-xs font-normal text-slate-400"> of {book.total_copies}</span>
      </p>
      {book.issued_copies > 0 && (
        <p className="text-xs whitespace-nowrap text-slate-500">{book.issued_copies} out</p>
      )}
    </div>
  );
}

export function buildBookColumns({
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: BookColumnOptions): Column<Book>[] {
  return [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      cell: (book) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{book.title}</p>
          <p className="truncate text-xs text-slate-500">
            {book.author}
            {book.publication_year ? ` · ${book.publication_year}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'category_name',
      header: 'Category',
      sortable: true,
      hideBelow: 'md',
      cell: (book) => <Badge tone="info">{book.category_name}</Badge>,
    },
    {
      key: 'isbn',
      header: 'ISBN',
      hideBelow: 'xl',
      cell: (book) =>
        book.isbn ? <code className="text-xs text-slate-600">{book.isbn}</code> : '—',
    },
    {
      key: 'shelf_no',
      header: 'Shelf',
      hideBelow: 'lg',
      cell: (book) => book.shelf_no ?? '—',
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'right',
      hideBelow: 'lg',
      cell: (book) => formatCurrency(book.price),
    },
    {
      key: 'available_copies',
      header: 'Available',
      sortable: true,
      align: 'right',
      cell: renderAvailability,
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      width: '1%',
      cell: (book) => (
        <div className="flex justify-end gap-1">
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Edit ${book.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(book);
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
              aria-label={`Delete ${book.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(book);
              }}
            >
              <Trash2 className="size-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
