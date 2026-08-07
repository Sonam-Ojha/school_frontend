import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect, type ComponentType } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';
import { useToastStore, type Toast, type ToastVariant } from '@/store/toastStore';

const VARIANTS: Record<
  ToastVariant,
  { wrapper: string; icon: string; Icon: ComponentType<{ className?: string }> }
> = {
  success: { wrapper: 'border-emerald-200', icon: 'text-emerald-600', Icon: CheckCircle2 },
  error: { wrapper: 'border-red-200', icon: 'text-red-600', Icon: XCircle },
  warning: { wrapper: 'border-amber-200', icon: 'text-amber-600', Icon: AlertTriangle },
  info: { wrapper: 'border-brand-200', icon: 'text-brand-600', Icon: Info },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const { wrapper, icon, Icon } = VARIANTS[toast.variant];

  useEffect(() => {
    if (toast.duration === 0) return; // pinned until dismissed
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-white p-3.5',
        'shadow-overlay',
        wrapper,
      )}
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', icon)} aria-hidden />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm break-words text-slate-500">{toast.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="-m-1 rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/**
 * Global toast outlet. Mounted once at the app root; anything in the app can
 * publish to it via the imperative `toast` helper, including non-React code.
 */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      // Bottom-anchored on mobile so it never covers the header nav.
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col gap-2 p-4',
        'sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-auto sm:w-96',
      )}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  );
}
