import { Barcode } from '@/components/ui/Barcode';

import type { Book, BookCopy } from '../types';

interface BarcodeLabelSheetProps {
  book: Book;
  copies: BookCopy[];
  schoolName?: string;
}

/**
 * A sheet of barcode labels, sized for a three-column sticker page.
 *
 * Each label carries the barcode, the accession number under it, and enough
 * of the title and author to identify the book when the sticker is peeled off
 * and the librarian is holding it over the wrong shelf. Fixed dimensions in
 * millimetres rather than a responsive grid: this is going through a printer
 * onto pre-cut stock, where "roughly a third of the width" is not good enough.
 */
export function BarcodeLabelSheet({ book, copies, schoolName }: BarcodeLabelSheetProps) {
  return (
    <div className="print-exact bg-white">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {copies.map((copy) => (
          <div
            key={copy.id}
            // 63.5 × 33.9 mm — the standard three-across address label.
            className="flex break-inside-avoid flex-col items-center justify-center gap-1 rounded border border-slate-300 p-2 text-center print:h-[33.9mm] print:w-[63.5mm] print:rounded-none print:border-dashed"
          >
            {schoolName && (
              <p className="w-full truncate text-[8px] font-semibold tracking-wide text-slate-500 uppercase">
                {schoolName}
              </p>
            )}

            <Barcode value={copy.accession_no} height={32} narrowWidth={1.6} />

            <p className="w-full truncate text-[9px] leading-tight font-medium text-slate-900">
              {book.title}
            </p>
            <p className="w-full truncate text-[8px] leading-tight text-slate-500">
              {book.author}
              {book.shelf_no ? ` · ${book.shelf_no}` : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
