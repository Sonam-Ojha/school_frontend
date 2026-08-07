import { formatCurrency, formatDate, formatNumber } from '@/lib/format';

import type { ReportCell, ValueFormat } from './types';

/**
 * One formatter for every figure in the module.
 *
 * Charts, table cells, footers, headline stats and the tooltip all go through
 * it, so a rupee is written the same way wherever it appears — which is not a
 * cosmetic matter when the reader is comparing a chart to the table under it.
 */
export function formatValue(value: ReportCell, format: ValueFormat): string {
  if (value === null || value === '') return '—';

  switch (format) {
    case 'money':
      return formatCurrency(Number(value));
    case 'percent':
      return `${Math.round(Number(value) * 10) / 10}%`;
    case 'number':
      return formatNumber(Number(value));
    case 'date':
      return formatDate(String(value));
    default:
      return String(value);
  }
}

/**
 * The terse form, for chart axes.
 *
 * `₹12,50,000` written five times up the side of a chart is five times wider
 * than the chart has room for; `₹12.5L` says the same thing.
 */
export function formatAxis(value: number, format: ValueFormat): string {
  if (format === 'percent') return `${Math.round(value)}%`;

  if (format === 'money') {
    if (Math.abs(value) >= 10_000_000) return `₹${trim(value / 10_000_000)}Cr`;
    if (Math.abs(value) >= 100_000) return `₹${trim(value / 100_000)}L`;
    if (Math.abs(value) >= 1_000) return `₹${trim(value / 1_000)}k`;
    return `₹${Math.round(value)}`;
  }

  if (Math.abs(value) >= 1_000) return `${trim(value / 1_000)}k`;
  return String(Math.round(value * 10) / 10);
}

const trim = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};
