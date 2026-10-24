import { BookOpenText, Keyboard, UserSearch } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { Alert } from '@/components/ui/Alert';
import { Card, CardBody } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { formatCurrency, todayInputValue } from '@/lib/format';
import { useAuthStore } from '@/store/authStore';

import { AddChargeModal } from '../components/AddChargeModal';
import { CounterAccount } from '../components/counter/CounterAccount';
import { CounterPaymentForm } from '../components/counter/CounterPaymentForm';
import { CounterSearch } from '../components/counter/CounterSearch';
import { ReceiptReadyModal } from '../components/counter/ReceiptReadyModal';
import { FEE_PERMISSIONS } from '../constants';
import { useDayBook, useRemoveCharge, useStudentAccount } from '../hooks/useCollection';
import type { Payment, StudentDue, StudentFeeAccount } from '../types';

/** What is ticked when a student comes up: everything due by today, or else the next instalment. */
function defaultSelection(account: StudentFeeAccount): number[] {
  const today = todayInputValue();
  const outstanding = account.dues
    .filter((due) => due.balance > 0)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  const dueNow = outstanding.filter((due) => due.due_date <= today);
  return (dueNow.length > 0 ? dueNow : outstanding.slice(0, 1)).map((due) => due.id);
}

/** The cashier's own day so far, with the way to the day book. */
function TodaySummary({ name }: { name: string | null }) {
  const today = todayInputValue();
  const { data } = useDayBook(today, name);
  const cash = data?.by_mode.find((entry) => entry.mode === 'cash')?.amount ?? 0;

  return (
    <Link
      to={PATHS.feeDayBook}
      className="flex shrink-0 items-center gap-3 rounded-card border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-card hover:border-brand-300"
    >
      <BookOpenText className="size-5 text-brand-600" aria-hidden />
      <span>
        <span className="block text-xs text-slate-500">Your counter today</span>
        <span className="font-semibold text-slate-900">
          {data ? `${data.totals.receipts} receipts · ${formatCurrency(data.totals.amount)}` : '—'}
        </span>
        {data && data.totals.receipts > 0 && <span className="block text-xs text-slate-500">Cash {formatCurrency(cash)}</span>}
      </span>
    </Link>
  );
}

/**
 * The office fee counter.
 *
 * A parent comes to the window: the cashier finds the student, ticks what is
 * being paid — this quarter's tuition, the books charge, both — takes the
 * money in any mode, and hands over a printed receipt, in one place. The
 * selected student lives in the URL, so a colleague can be sent straight to
 * the account. F2 jumps back to the search.
 */
export default function FeeCollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const studentId = Number(searchParams.get('student_id')) || undefined;
  const searchRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((state) => state.user);
  const canCollect = useAuthStore((state) => state.hasPermission(FEE_PERMISSIONS.create));
  const { data: school } = useSettings();
  const { data: account, isLoading, error } = useStudentAccount(studentId);

  const [selected, setSelected] = useState<number[]>([]);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [addingCharge, setAddingCharge] = useState(false);
  const [removing, setRemoving] = useState<StudentDue | null>(null);
  const removeCharge = useRemoveCharge(studentId ?? 0);

  // A student coming up ticks what is due now.
  const currentStudent = account?.student_id;
  useEffect(() => {
    if (account) setSelected(defaultSelection(account));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStudent]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /** The ticked dues that are still owed, oldest first — the order the money is applied in. */
  const chosen = useMemo(
    () =>
      (account?.dues ?? [])
        .filter((due) => due.balance > 0 && selected.includes(due.id))
        .sort((a, b) => a.due_date.localeCompare(b.due_date)),
    [account, selected],
  );

  const selectStudent = (id: number) => {
    setSearchParams({ student_id: String(id) }, { replace: true });
  };

  const nextStudent = () => {
    setReceipt(null);
    setSearchParams({}, { replace: true });
    window.setTimeout(() => searchRef.current?.focus(), 0);
  };

  const toggle = (dueId: number) =>
    setSelected((current) => (current.includes(dueId) ? current.filter((id) => id !== dueId) : [...current, dueId]));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <CounterSearch ref={searchRef} onSelect={selectStudent} />
        </div>
        <TodaySummary name={user?.name ?? null} />
      </div>

      {error ? (
        <Alert tone="danger" title="Could not load this account">
          {error.message}
        </Alert>
      ) : isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : account ? (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
          <CounterAccount
            account={account}
            selected={selected}
            onToggle={toggle}
            onSelectOutstanding={() => setSelected(account.dues.filter((due) => due.balance > 0).map((due) => due.id))}
            onClearSelection={() => setSelected([])}
            onAddCharge={() => setAddingCharge(true)}
            onRemoveCharge={setRemoving}
            removingId={removeCharge.isPending ? (removing?.id ?? null) : null}
            schoolName={school?.profile.name ?? ''}
          />
          <CounterPaymentForm account={account} dues={chosen} onCollected={setReceipt} canCollect={canCollect} />
        </div>
      ) : (
        <Card>
          <CardBody>
            <EmptyState
              icon={<UserSearch className="size-6" />}
              title="Who is paying?"
              description="Search for the student above — by name, admission number, or the father’s name or phone number. Their dues come up ready to collect."
              action={
                <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Keyboard className="size-3.5" aria-hidden /> Press F2 to jump to the search, ↑ ↓ and Enter to choose.
                </p>
              }
            />
          </CardBody>
        </Card>
      )}

      {account && (
        <AddChargeModal
          isOpen={addingCharge}
          onClose={() => setAddingCharge(false)}
          studentId={account.student_id}
          studentName={account.student_name}
          onAdded={(ids) => setSelected((current) => [...new Set([...current, ...ids])])}
        />
      )}

      <ConfirmDialog
        isOpen={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() =>
          removing &&
          removeCharge.mutate(removing.id, {
            onSuccess: () => {
              setSelected((current) => current.filter((id) => id !== removing.id));
              setRemoving(null);
            },
          })
        }
        title="Remove this charge?"
        message={removing ? `${removing.installment_name} (${formatCurrency(removing.balance)}) will be taken off the account.` : ''}
        confirmLabel="Remove charge"
        isDestructive
        isLoading={removeCharge.isPending}
      />

      <ReceiptReadyModal payment={receipt} school={school} guardianPhone={account?.guardian_phone} onNext={nextStudent} />
    </div>
  );
}
