import { Spinner } from '@/components/ui/Spinner';

interface FullPageLoaderProps {
  label?: string;
}

/** Boot/route-transition loader. Occupies the viewport, never the layout. */
export function FullPageLoader({ label = 'Loading…' }: FullPageLoaderProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50">
      <Spinner size="lg" className="text-brand-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
