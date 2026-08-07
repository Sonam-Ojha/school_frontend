import { ScanBarcode, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

interface BarcodeScanInputProps {
  label: string;
  /** Fired on Enter or on the button — never per keystroke. */
  onScan: (accessionNo: string) => void;
  onClear?: () => void;
  /** The value currently looked up, shown as a dismissible chip. */
  scanned?: string | null;
  isLoading?: boolean;
  hint?: string;
  /** Takes focus on mount and after every scan — a desk runs hands-free. */
  autoFocus?: boolean;
  className?: string;
}

/**
 * The barcode field at a circulation desk.
 *
 * A handheld scanner is a keyboard that types very fast and presses Enter, so
 * there is nothing to integrate: a plain text input that submits on Enter *is*
 * the scanner support. Which is why this does not search per keystroke —
 * a scanner delivers twelve characters in under a tenth of a second, and
 * looking up each prefix would fire a dozen requests for one scan.
 *
 * It re-focuses itself after each scan because the next thing a librarian
 * does is scan the next book, and reaching for the mouse between them is the
 * whole cost of a bad desk screen.
 */
export function BarcodeScanInput({
  label,
  onScan,
  onClear,
  scanned = null,
  isLoading = false,
  hint,
  autoFocus = true,
  className,
}: BarcodeScanInputProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus, scanned]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    onScan(trimmed.toUpperCase());
    setValue('');
  };

  return (
    <form onSubmit={submit} className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Scan or type an accession number"
          autoComplete="off"
          // Uppercase as it is typed: accession numbers are stored uppercase,
          // and a scanner sends what is printed.
          className="uppercase"
          leftIcon={<ScanBarcode className="size-4" />}
        />

        <Button type="submit" isLoading={isLoading} disabled={!value.trim()}>
          Find
        </Button>
      </div>

      {scanned && (
        <div
          className={cn(
            'mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200',
            'bg-slate-50 py-1 pr-1 pl-3 text-xs',
          )}
        >
          <code className="font-medium text-slate-700">{scanned}</code>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              aria-label={`Clear ${scanned}`}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      )}

      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </form>
  );
}
