import { useMemo } from 'react';

import { encodeCode39 } from '@/lib/barcode';
import { cn } from '@/lib/cn';

interface BarcodeProps {
  value: string;
  /** Bar height in pixels. Labels want 40–56; a spine sticker wants less. */
  height?: number;
  /** Width of a narrow bar. Below 2 most handheld scanners struggle. */
  narrowWidth?: number;
  /** Print the human-readable value beneath the bars. */
  showValue?: boolean;
  className?: string;
}

/**
 * A scannable Code 39 barcode, drawn as inline SVG.
 *
 * SVG rather than a canvas or an image so it stays crisp at any print
 * resolution — a barcode rasterised at screen density is a barcode a scanner
 * cannot read off paper.
 *
 * Marked `print-exact` because browsers strip background colours when
 * printing by default, and a barcode without its bars is a white rectangle.
 */
export function Barcode({
  value,
  height = 48,
  narrowWidth = 2,
  showValue = true,
  className,
}: BarcodeProps) {
  const bars = useMemo(() => {
    try {
      return encodeCode39(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!bars) {
    return (
      <span className={cn('text-xs text-red-600', className)}>
        “{value}” cannot be printed as a barcode.
      </span>
    );
  }

  const totalUnits = bars.reduce((total, bar) => total + bar.units, 0);
  const width = totalUnits * narrowWidth;

  let offset = 0;
  const rects = bars.map((bar, index) => {
    const x = offset;
    offset += bar.units * narrowWidth;
    return bar.isBar ? { key: index, x, width: bar.units * narrowWidth } : null;
  });

  return (
    <span className={cn('print-exact inline-flex flex-col items-center gap-1', className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Barcode: ${value}`}
        // Scales down on a narrow screen without losing the bar ratios.
        className="h-auto max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width={width} height={height} fill="#fff" />
        {rects.map(
          (rect) =>
            rect && (
              <rect key={rect.key} x={rect.x} y={0} width={rect.width} height={height} fill="#000" />
            ),
        )}
      </svg>

      {showValue && (
        <span className="font-mono text-[11px] tracking-widest text-slate-900">
          {value.toUpperCase()}
        </span>
      )}
    </span>
  );
}
