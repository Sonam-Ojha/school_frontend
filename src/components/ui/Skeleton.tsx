import type { CSSProperties } from 'react';

import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

/** Base shimmer block. Compose it rather than adding one-off loading markup. */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div aria-hidden style={style} className={cn('animate-pulse rounded-md bg-slate-200', className)} />
  );
}

/** Placeholder for a block of body copy. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          // Ragged last line reads as text rather than a solid block.
          className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-card border border-slate-200 bg-white p-5', className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-3 h-8 w-1/2" />
      <SkeletonText lines={2} className="mt-4" />
    </div>
  );
}
