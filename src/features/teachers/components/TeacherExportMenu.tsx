import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useDismiss } from '@/hooks/useDismiss';
import type { ListQueryParams } from '@/types/api';

import { useExportTeachers } from '../hooks/useTeachers';

interface TeacherExportMenuProps {
  /** The current view's query params — exports match what is on screen. */
  params: ListQueryParams;
  total: number | undefined;
  hasActiveFilters: boolean;
}

export function TeacherExportMenu({ params, total, hasActiveFilters }: TeacherExportMenuProps) {
  const { isOpen, close, toggle } = useDisclosure();
  const containerRef = useRef<HTMLDivElement>(null);
  const exportTeachers = useExportTeachers();

  useDismiss(isOpen, containerRef, close);

  const run = (format: 'pdf' | 'excel') => {
    close();
    exportTeachers.mutate({ format, params });
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        onClick={toggle}
        isLoading={exportTeachers.isPending}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        leftIcon={<Download className="size-4" />}
        rightIcon={<ChevronDown className="size-4" />}
      >
        Export
      </Button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-64 rounded-lg border border-slate-200 bg-white py-1 shadow-overlay"
        >
          <p className="border-b border-slate-100 px-3 py-2 text-xs text-slate-500">
            {/* Say plainly whether this is the filtered set or everything. */}
            {hasActiveFilters
              ? `Exports the ${total ?? 0} filtered record${total === 1 ? '' : 's'}.`
              : `Exports all ${total ?? 0} record${total === 1 ? '' : 's'}.`}
          </p>

          <button
            type="button"
            role="menuitem"
            onClick={() => run('excel')}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="size-4 text-emerald-600" aria-hidden />
            Excel (.xlsx)
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => run('pdf')}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <FileText className="size-4 text-red-600" aria-hidden />
            PDF (.pdf)
          </button>
        </div>
      )}
    </div>
  );
}
