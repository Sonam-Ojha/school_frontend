import { useMemo } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/cn';

import {
  AVAILABLE_PLACEHOLDERS,
  extractPlaceholders,
  renderTemplate,
  smsCost,
} from '../composition';
import { SEGMENT_WARNING } from '../constants';
import type { Channel } from '../types';

interface BodyEditorProps {
  value: string;
  onChange: (body: string) => void;
  /** SMS costing and the segment counter only appear when SMS is a channel. */
  channels: Channel[];
  label?: string;
  rows?: number;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
}

/**
 * The message body, with what it costs.
 *
 * The segment counter is the point. An SMS is billed per segment, not per
 * message, and one curly quote pasted from a word processor pushes the whole
 * body into UCS-2 — which more than halves what fits and can triple the bill
 * on a send to nine hundred parents. Showing it live is cheaper than
 * explaining it afterwards.
 */
export function BodyEditor({
  value,
  onChange,
  channels,
  label = 'Message',
  rows = 6,
  disabled = false,
  hasError = false,
  id = 'message-body',
}: BodyEditorProps) {
  const isSms = channels.includes('sms');
  const cost = useMemo(() => smsCost(value), [value]);
  const placeholders = useMemo(() => extractPlaceholders(value), [value]);

  /** A worked example, so a placeholder means something before it is sent. */
  const preview = useMemo(() => {
    const values = Object.fromEntries(
      AVAILABLE_PLACEHOLDERS.map((entry) => [entry.key, entry.example]),
    );
    return renderTemplate(value, values);
  }, [value]);

  const insert = (key: string) => onChange(`${value}{{${key}}}`);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>

        {isSms && value.length > 0 && (
          <span
            className={cn(
              'font-mono text-xs tabular-nums',
              cost.segments > SEGMENT_WARNING ? 'font-semibold text-amber-700' : 'text-slate-500',
            )}
          >
            {cost.characters} chars · {cost.segments} segment{cost.segments === 1 ? '' : 's'} ·{' '}
            {cost.encoding}
          </span>
        )}
      </div>

      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        disabled={disabled}
        hasError={hasError}
        placeholder="Dear {{guardian_name}}, …"
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-500">Insert:</span>
        {AVAILABLE_PLACEHOLDERS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            disabled={disabled}
            onClick={() => insert(entry.key)}
            title={`Example: ${entry.example}`}
            className={cn(
              'rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[11px]',
              'text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {entry.key}
          </button>
        ))}
      </div>

      {isSms && cost.forcedBy && (
        <p className="text-xs text-amber-700">
          The character “{cost.forcedBy}” is outside the GSM alphabet, so the whole message is
          sent as unicode — {cost.segments} segments instead of{' '}
          {smsCost(value.replace(/[^\x20-\x7E\n\r]/g, '')).segments}. Replacing curly quotes and
          dashes with plain ones usually fixes it.
        </p>
      )}

      {isSms && cost.segments > SEGMENT_WARNING && (
        <p className="text-xs font-medium text-amber-700">
          {cost.segments} segments is billed as {cost.segments} messages per recipient.
        </p>
      )}

      {placeholders.length > 0 && (
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="mb-1 text-xs font-medium text-slate-600">
            How it reads, with example values
          </p>
          <p className="text-sm whitespace-pre-wrap text-slate-800">{preview.body}</p>

          {preview.missing.length > 0 && (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              Unknown placeholder{preview.missing.length === 1 ? '' : 's'}:{' '}
              {preview.missing.map((key) => (
                <Badge key={key} tone="danger" className="ml-1">
                  {key}
                </Badge>
              ))}{' '}
              — these will be sent as written.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
