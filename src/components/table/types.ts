import type { ReactNode } from 'react';

export type ColumnAlign = 'left' | 'center' | 'right';

/** Breakpoint below which a column is hidden — mobile-first column priority. */
export type ColumnBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

export interface Column<TRow> {
  /** Stable identifier, unique within the table. */
  key: string;
  header: ReactNode;
  /** Cell renderer. Defaults to `row[key]` when omitted. */
  cell?: (row: TRow, index: number) => ReactNode;
  /** Enables the sort control. Requires the API to accept `sortKey`. */
  sortable?: boolean;
  /** `sort_by` value sent to the API. Defaults to `key`. */
  sortKey?: string;
  align?: ColumnAlign;
  /** Hidden below this breakpoint. Keep the 2–3 most important columns unset. */
  hideBelow?: ColumnBreakpoint;
  headerClassName?: string;
  cellClassName?: string;
  /** Inline width, e.g. `'12rem'` or `'1%'` for a shrink-to-fit action column. */
  width?: string;
}
