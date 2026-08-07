import { ChartColumnBig } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface ChartFrameProps {
  /** Screen-reader description. A chart with no text is a chart nobody can read. */
  ariaLabel: string;
  height?: number;
  className?: string;
  legend?: { label: string; colour: string }[];
  /** Rendered instead of the plot when there is nothing to draw. */
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

/**
 * Shared shell for every chart: sizing, legend, and the empty state.
 *
 * The plot itself is an SVG with a `viewBox` and no width, so it scales to
 * whatever column it lands in — a fixed-width chart is a chart that breaks on
 * a phone.
 */
export function ChartFrame({
  ariaLabel,
  height = 200,
  className,
  legend,
  isEmpty = false,
  emptyMessage = 'Nothing to chart yet.',
  children,
}: ChartFrameProps) {
  if (isEmpty) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 text-slate-400',
          className,
        )}
        style={{ height }}
      >
        <ChartColumnBig className="size-6" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div role="img" aria-label={ariaLabel}>
        {children}
      </div>

      {legend && legend.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {legend.map((entry) => (
            <li key={entry.label} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: entry.colour }}
              />
              {entry.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Horizontal gridlines and their labels, shared by the bar and line charts. */
export function Gridlines({
  ticks,
  width,
  height,
  format,
}: {
  ticks: number[];
  width: number;
  height: number;
  format: (value: number) => string;
}) {
  const max = ticks[ticks.length - 1] || 1;

  return (
    <g aria-hidden>
      {ticks.map((tick) => {
        const y = height - (tick / max) * height;

        return (
          <g key={tick}>
            <line
              x1={0}
              x2={width}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeWidth={1}
              className="text-slate-200"
            />
            <text
              x={-8}
              y={y + 4}
              textAnchor="end"
              className="fill-slate-400 text-[10px]"
            >
              {format(tick)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
