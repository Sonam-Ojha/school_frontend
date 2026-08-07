import { RotateCw, ScanBarcode, Undo2 } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/format';

import { BarcodeScanInput } from '../components/BarcodeScanInput';
import { ReturnModal } from '../components/ReturnModal';
import {
  FINE_PER_DAY,
  LIBRARY_PERMISSIONS,
  MAX_RENEWALS,
  MEMBER_TYPE_LABELS,
} from '../constants';
import { useCopyLookup, useRenewLoan } from '../hooks/useLibrary';

/**
 * The return desk.
 *
 * One scan, one answer: who has this, how late is it, what is owed. The fine
 * shown here is live — it is what the member owes at this moment — and is
 * frozen the instant the return is recorded, so the figure on the receipt
 * cannot keep climbing after the book is back on the shelf.
 */
export default function ReturnDeskPage() {
  const [scanned, setScanned] = useState<string | null>(null);
  const lookup = useCopyLookup(scanned);
  const renewLoan = useRenewLoan();
  const returnModal = useDisclosure();

  const copy = lookup.data?.copy ?? null;
  const book = lookup.data?.book ?? null;
  const loan = lookup.data?.loan ?? null;

  const canRenew = loan !== null && loan.renewals < MAX_RENEWALS && loan.days_overdue === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader title="Scan the returned book" />
        <CardBody>
          <BarcodeScanInput
            label="Accession number"
            onScan={setScanned}
            onClear={() => setScanned(null)}
            scanned={scanned}
            isLoading={lookup.isFetching}
            hint="The scan finds the loan — there is nobody to look up separately."
          />
        </CardBody>
      </Card>

      {!scanned ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<ScanBarcode className="size-6" />}
              title="Ready to take returns"
              description="Scan a book to see who has it and what is owed."
            />
          </CardBody>
        </Card>
      ) : lookup.isLoading ? (
        <Card>
          <CardBody className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-20 w-full" />
          </CardBody>
        </Card>
      ) : lookup.error ? (
        <Alert tone="danger" title="No such copy">
          Nothing in the catalogue has the accession number <code>{scanned}</code>.
        </Alert>
      ) : !loan ? (
        <Card>
          <CardBody className="space-y-3">
            <div>
              <p className="font-semibold text-slate-900">{book?.title}</p>
              <p className="text-sm text-slate-500">
                {book?.author} · <code>{copy?.accession_no}</code>
              </p>
            </div>
            <Alert tone="info" title="Not on loan">
              This copy is not out with anybody — there is nothing to return.
            </Alert>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={book?.title ?? 'Book'}
            description={`${book?.author} · ${copy?.accession_no}`}
            actions={
              loan.days_overdue > 0 ? (
                <Badge tone="danger" withDot>
                  {loan.days_overdue} days overdue
                </Badge>
              ) : (
                <Badge tone="success" withDot>
                  On time
                </Badge>
              )
            }
          />

          <CardBody className="space-y-4">
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Borrowed by</dt>
                <dd className="truncate font-medium text-slate-900">{loan.member_name}</dd>
                <dd className="truncate text-xs text-slate-500">
                  <code>{loan.member_identifier}</code> ·{' '}
                  {MEMBER_TYPE_LABELS[loan.member_type]}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Issued</dt>
                <dd className="text-slate-900">{formatDate(loan.issued_on)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Due</dt>
                <dd
                  className={cn(
                    loan.days_overdue > 0 ? 'font-medium text-red-700' : 'text-slate-900',
                  )}
                >
                  {formatDate(loan.due_on)}
                </dd>
              </div>
            </dl>

            {loan.fine_due > 0 ? (
              <Alert tone="warning" title={`Fine due: ${formatCurrency(loan.fine_due)}`}>
                {loan.days_overdue} days overdue at {formatCurrency(FINE_PER_DAY)} a day, capped
                at the book's replacement price. It is fixed when the return is recorded.
              </Alert>
            ) : (
              <Alert tone="success">Nothing owed on this loan.</Alert>
            )}

            {loan.renewals > 0 && (
              <p className="text-xs text-slate-500">
                Renewed {loan.renewals} of {MAX_RENEWALS} times.
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Can permissions={[LIBRARY_PERMISSIONS.update]}>
                <Button
                  fullWidth
                  onClick={returnModal.open}
                  leftIcon={<Undo2 className="size-4" />}
                >
                  Accept return
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  isLoading={renewLoan.isPending}
                  disabled={!canRenew}
                  title={
                    loan.days_overdue > 0
                      ? 'An overdue book has to come back before it can go out again'
                      : loan.renewals >= MAX_RENEWALS
                        ? `Already renewed ${MAX_RENEWALS} times`
                        : undefined
                  }
                  onClick={() => renewLoan.mutate({ loan_id: loan.id, remarks: '' })}
                  leftIcon={<RotateCw className="size-4" />}
                >
                  Renew instead
                </Button>
              </Can>
            </div>
          </CardBody>
        </Card>
      )}

      {loan && returnModal.isOpen && (
        <ReturnModal
          isOpen={returnModal.isOpen}
          onClose={returnModal.close}
          loan={loan}
          onReturned={() => setScanned(null)}
        />
      )}
    </div>
  );
}
