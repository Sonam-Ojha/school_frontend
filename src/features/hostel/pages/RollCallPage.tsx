import { Printer, UserCheck } from 'lucide-react';
import { useMemo } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatDate, todayInputValue } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';
import { useQueryParams } from '@/hooks/useQueryParams';

import { RollCallSheet } from '../components/RollCallSheet';
import {
  HOSTEL_PERMISSIONS,
  ROLL_CALL_STATUS_LABELS,
  ROLL_CALL_STATUS_TONES,
} from '../constants';
import { useHostels, useRollCall, useSaveRollCall } from '../hooks/useHostel';
import type { RollCallStatus } from '../types';

const today = () => todayInputValue();

/**
 * The evening roll call.
 *
 * One block, one night. Deliberately not the attendance module's sheet: a
 * hostel night has no half day, and it has two states class attendance has
 * never needed — signed out on a pass and expected back, and back after
 * curfew. The batching and the not-yet-marked-versus-absent distinction are
 * the same, because those are properties of taking a register, not of school.
 */
export default function RollCallPage() {
  const { searchParams, patch } = useQueryParams();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canMark = hasPermission(HOSTEL_PERMISSIONS.update);

  const { hostels, hostelOptions } = useHostels();

  const hostelId = Number(searchParams.get('hostel_id')) || hostels[0]?.id || 0;
  const date = searchParams.get('date') || today();

  const query = useMemo(() => ({ hostelId, date }), [hostelId, date]);
  const { data: rollCall, isLoading, error } = useRollCall(query);
  const saveRollCall = useSaveRollCall(query);


  const summary = rollCall?.summary;

  return (
    <div className="space-y-4">
      <Card className="print-hidden">
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label
              htmlFor="roll-call-hostel"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Block
            </label>
            <Select
              id="roll-call-hostel"
              value={hostelId || ''}
              options={hostelOptions}
              placeholder="Select a block"
              onChange={(event) => patch({ hostel_id: event.target.value || undefined })}
              className="w-56"
            />
          </div>

          <div>
            <label
              htmlFor="roll-call-date"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Night of
            </label>
            <Input
              id="roll-call-date"
              type="date"
              value={date}
              // A register cannot be taken for a night that has not happened.
              max={today()}
              onChange={(event) => patch({ date: event.target.value || undefined })}
              className="w-44"
            />
          </div>

          {rollCall && (
            <div className="flex flex-wrap items-end gap-2 sm:ml-auto">
              <Can permissions={[HOSTEL_PERMISSIONS.print]}>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="size-4" />}
                >
                  Print
                </Button>
              </Can>
            </div>
          )}
        </CardBody>
      </Card>

      {hostelId === 0 ? (
        <Card>
          <CardBody>
            <Alert tone="info">Choose a block to take its roll call.</Alert>
          </CardBody>
        </Card>
      ) : error ? (
        <Alert tone="danger" title="Could not load this roll call">
          {error.message}
        </Alert>
      ) : isLoading ? (
        <Card>
          <CardBody className="space-y-2">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </CardBody>
        </Card>
      ) : rollCall ? (
        <>
          {summary && (
            <Card className="print-hidden">
              <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                <div>
                  <p className="text-xs text-slate-500">Residents</p>
                  <p className="mt-0.5 text-lg font-semibold text-slate-900">{summary.total}</p>
                </div>

                {(
                  ['present', 'absent', 'on_leave', 'out_pass', 'late_return'] as RollCallStatus[]
                ).map((status) => (
                  <div key={status}>
                    <p className="text-xs text-slate-500">{ROLL_CALL_STATUS_LABELS[status]}</p>
                    <p
                      className={cn(
                        'mt-0.5 text-lg font-semibold',
                        status === 'absent' && summary.absent > 0
                          ? 'text-red-700'
                          : 'text-slate-900',
                      )}
                    >
                      {summary[status]}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {summary && summary.absent > 0 && (
            <Alert
              tone="danger"
              title={`${summary.absent} resident${summary.absent === 1 ? '' : 's'} unaccounted for`}
            >
              Marked absent with no leave and no pass. Somebody should know where they are.
            </Alert>
          )}

          <Card>
            <CardHeader
              title={`${rollCall.hostel_name} — ${formatDate(rollCall.date)}`}
              description={
                summary
                  ? `${summary.marked} of ${summary.total} called`
                  : undefined
              }
              className="print-hidden"
              actions={
                summary && summary.unmarked === 0 ? (
                  <Badge tone="success" withDot>
                    Complete
                  </Badge>
                ) : (
                  <Badge tone={ROLL_CALL_STATUS_TONES.out_pass} withDot>
                    In progress
                  </Badge>
                )
              }
            />

            <CardBody className="p-0">
              <div className="print-target">
                <h2 className="hidden px-4 pt-4 text-base font-semibold text-slate-900 print:block">
                  {rollCall.hostel_name} — roll call, {formatDate(rollCall.date)}
                </h2>

                <RollCallSheet
                  rollCall={rollCall}
                  isSaving={saveRollCall.isPending}
                  canMark={canMark}
                  onSave={(entries) => saveRollCall.mutate(entries)}
                />
              </div>
            </CardBody>
          </Card>
        </>
      ) : (
        <Card>
          <CardBody>
            <Alert tone="info" title="Nothing to call">
              <span className="flex items-center gap-2">
                <UserCheck className="size-4 shrink-0" aria-hidden />
                No student was resident in this block on this night.
              </span>
            </Alert>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
