import { cn } from '@/lib/cn';

/** The product, as the website and the Super Admin console name it. */
export const BRAND = {
  name: 'KLIMB School ERP',
  /** What the wordmark says. */
  mark: 'KLIMB',
  /** What follows the wordmark. */
  product: 'School ERP',
  logo: '/klimb-logo.png',
} as const;

interface BrandLogoProps {
  /** `dark` for dark backgrounds (the website's header and footer). */
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  /** Show "School ERP" beside the wordmark. */
  withName?: boolean;
  /** A second line under the name, e.g. "Super Admin". */
  caption?: string;
  className?: string;
}

const HEIGHT = { sm: 'h-6', md: 'h-8', lg: 'h-11' } as const;
const TEXT = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' } as const;

/** The square "K" mark (the tab icon), for places too narrow for the wordmark, like a collapsed menu. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/favicon.svg"
      alt={BRAND.mark}
      className={cn('size-9 shrink-0 rounded-lg', className)}
      draggable={false}
    />
  );
}

/** The KLIMB wordmark, with the product's name beside it. */
export function BrandLogo({
  tone = 'light',
  size = 'md',
  withName = true,
  caption,
  className,
}: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img
        src={BRAND.logo}
        alt={BRAND.mark}
        className={cn('w-auto shrink-0 rounded-md', HEIGHT[size])}
        draggable={false}
      />
      {(withName || caption) && (
        <span className="flex flex-col leading-tight">
          {withName && (
            <span
              className={cn(
                'font-semibold tracking-tight whitespace-nowrap',
                TEXT[size],
                tone === 'dark' ? 'text-white' : 'text-slate-900',
              )}
            >
              {BRAND.product}
            </span>
          )}
          {caption && (
            <span
              className={cn(
                'text-xs whitespace-nowrap',
                tone === 'dark' ? 'text-slate-400' : 'text-slate-500',
              )}
            >
              {caption}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
