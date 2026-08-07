import { Users } from 'lucide-react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';

import { AUDIENCE_OPTIONS, CHANNEL_LABELS, LARGE_AUDIENCE } from '../constants';
import { useAudiencePreview } from '../hooks/useCommunication';
import type { AudienceInput } from '../schemas';
import type { Channel } from '../types';

interface AudiencePickerProps {
  value: AudienceInput;
  onChange: (audience: AudienceInput) => void;
  /** The channels chosen, so the reachable counts shown are the relevant ones. */
  channels: Channel[];
  disabled?: boolean;
}

/**
 * Who a message goes to.
 *
 * An audience is a query, not a list — pick "Class 8, section A" and the
 * message reaches the class as it is when it sends, not as it was when
 * somebody drafted it. The live count matters more than it looks: "send" next
 * to nine hundred people should not feel like saving a form, and the number
 * of parents with no phone number is worth knowing beforehand rather than
 * discovering in a failure report.
 */
export function AudiencePicker({
  value,
  onChange,
  channels,
  disabled = false,
}: AudiencePickerProps) {
  const { classOptions, sectionOptions } = useClassOptions(value.class_id);
  const { data: preview, isFetching } = useAudiencePreview(value);

  const isLarge = (preview?.total ?? 0) >= LARGE_AUDIENCE;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor="audience-type"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Send to
          </label>
          <Select
            id="audience-type"
            value={value.type}
            options={AUDIENCE_OPTIONS}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                ...value,
                type: event.target.value as AudienceInput['type'],
                // The class below belongs to the old audience type.
                class_id: null,
                section_id: null,
                recipient_ids: [],
              })
            }
          />
        </div>

        {value.type === 'class' && (
          <>
            <div>
              <label
                htmlFor="audience-class"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Class
              </label>
              <Select
                id="audience-class"
                value={value.class_id ?? ''}
                options={classOptions}
                placeholder="Choose a class"
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    ...value,
                    class_id: event.target.value ? Number(event.target.value) : null,
                    section_id: null,
                  })
                }
              />
            </div>

            <div>
              <label
                htmlFor="audience-section"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Section
              </label>
              <Select
                id="audience-section"
                value={value.section_id ?? ''}
                options={sectionOptions}
                placeholder={value.class_id ? 'Every section' : 'Choose a class first'}
                disabled={disabled || sectionOptions.length === 0}
                onChange={(event) =>
                  onChange({
                    ...value,
                    section_id: event.target.value ? Number(event.target.value) : null,
                  })
                }
              />
            </div>
          </>
        )}
      </div>

      {value.type === 'custom' && (
        <Alert tone="info">
          Individual recipients are chosen on the people screens — open a class or a staff list
          and use “Message selected”. This audience holds{' '}
          {value.recipient_ids.length} chosen so far.
        </Alert>
      )}

      {isFetching && !preview ? (
        <Skeleton className="h-16 w-full" />
      ) : preview ? (
        <div
          className={cn(
            'rounded-lg border p-3',
            isLarge ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-slate-50',
          )}
        >
          <div className="flex items-center gap-2">
            <Users className="size-4 shrink-0 text-slate-500" aria-hidden />
            <p className="text-sm font-semibold text-slate-900">
              {formatNumber(preview.total)} recipient{preview.total === 1 ? '' : 's'}
            </p>
            {isLarge && <Badge tone="warning">Large send</Badge>}
          </div>

          {channels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {channels.map((channel) => {
                const reachable = preview.reachable[channel] ?? 0;
                const missing = preview.total - reachable;

                return (
                  <Badge key={channel} tone={missing > 0 ? 'warning' : 'success'}>
                    {CHANNEL_LABELS[channel]} · {formatNumber(reachable)}
                    {missing > 0 && ` (${formatNumber(missing)} unreachable)`}
                  </Badge>
                );
              })}
            </div>
          )}

          {preview.sample.length > 0 && (
            <p className="mt-2 truncate text-xs text-slate-500">
              {preview.sample.join(', ')}
              {preview.total > preview.sample.length &&
                ` and ${formatNumber(preview.total - preview.sample.length)} more`}
            </p>
          )}

          {preview.unreachable > 0 && (
            <p className="mt-1.5 text-xs font-medium text-amber-700">
              {formatNumber(preview.unreachable)} have no usable contact detail at all and will
              be skipped.
            </p>
          )}
        </div>
      ) : (
        <Alert tone="info">Choose an audience to see how many people it reaches.</Alert>
      )}
    </div>
  );
}
