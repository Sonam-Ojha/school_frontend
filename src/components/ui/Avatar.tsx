import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';
import type { Size } from '@/types/common';

const SIZES: Record<Size, string> = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-xs',
  lg: 'size-12 text-sm',
};

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: Size;
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const base = cn(
    'inline-flex shrink-0 items-center justify-center rounded-full',
    'ring-1 ring-slate-200',
    SIZES[size],
    className,
  );

  if (src) {
    return <img src={src} alt={name} className={cn(base, 'object-cover')} loading="lazy" />;
  }

  return (
    <span className={cn(base, 'bg-brand-100 font-semibold text-brand-700')} aria-hidden>
      {initials(name)}
    </span>
  );
}
