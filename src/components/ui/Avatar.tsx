import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';
import type { Size } from '@/types/common';

const SIZES: Record<Size, string> = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-xs',
  lg: 'size-12 text-sm',
};

/** The online dot grows with the avatar, so it reads at every size. */
const DOTS: Record<Size, string> = {
  sm: 'size-2.5',
  md: 'size-3',
  lg: 'size-3.5',
};

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: Size;
  className?: string;
  /**
   * A green dot at the corner for somebody known to be online — the
   * signed-in person themselves, wherever their own avatar appears.
   */
  online?: boolean;
}

export function Avatar({ name, src, size = 'md', className, online = false }: AvatarProps) {
  const base = cn(
    'inline-flex shrink-0 items-center justify-center rounded-full',
    'ring-1 ring-slate-200',
    SIZES[size],
    className,
  );

  const face = src ? (
    <img src={src} alt={name} className={cn(base, 'object-cover')} loading="lazy" />
  ) : (
    <span className={cn(base, 'bg-brand-100 font-semibold text-brand-700')} aria-hidden>
      {initials(name)}
    </span>
  );

  if (!online) return face;

  return (
    <span className="relative inline-flex shrink-0">
      {face}
      <span
        className={cn('absolute right-0 bottom-0 rounded-full bg-emerald-500 ring-2 ring-white', DOTS[size])}
        title="Online"
      >
        <span className="sr-only">Online</span>
      </span>
    </span>
  );
}
