import type { CSSProperties } from 'react';

import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

interface TableSkeletonProps {
  rows?: number;
  columns: number;
}

/**
 * Row-shaped placeholder rendered inside the real `<tbody>` so the table's
 * column widths do not jump when data arrives.
 */
export function TableSkeleton({ rows = 8, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-100 last:border-0">
          {Array.from({ length: columns }, (_, colIndex) => (
            <td key={colIndex} className="px-4 py-3.5">
              <Skeleton
                className={cn('h-3.5', colIndex === 0 ? 'w-3/4' : 'w-1/2')}
                // Stagger so the shimmer reads as a list, not a solid block.
                style={{ animationDelay: `${rowIndex * 60}ms` } satisfies CSSProperties}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
