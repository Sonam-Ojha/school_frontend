import { BookCheck, ScanBarcode } from 'lucide-react';
import { useMemo, useState } from 'react';

import { PersonSearch, type PersonResult } from '@/components/person/PersonSearch';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, formatDate, todayInputValue } from '@/lib/format';

import { BarcodeScanInput } from '../components/BarcodeScanInput';
import { MemberCard } from '../components/MemberCard';
import { COPY_STATUS_LABELS, LOAN_DAYS, MEMBER_TYPE_LABELS } from '../constants';
import {
  useCopyLookup,
  useIssueBook,
  useMember,
  useMemberSearch,
} from '../hooks/useLibrary';
import type { LibraryMember, MemberType } from '../types';

/** Today plus the loan period for this member type. */
function defaultDueDate(memberType: MemberType): string {
  const due = new Date();
  due.setDate(due.getDate() + LOAN_DAYS[memberType]);
  return due.toISOString().slice(0, 10);
}

/**
 * The issue desk.
 *
 * Scan the book, find the member, hand it over. The barcode comes first
 * because that is the object physically in the librarian's hand, and because
 * the scan answers half the question on its own — a copy already out cannot
 * be issued to anybody.
 */
export default function IssueDeskPage() {
  const [scanned, setScanned] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [selected, setSelected] = useState<{ type: MemberType; id: number } | null>(null);
  const [dueOn, setDueOn] = useState('');

  const lookup = useCopyLookup(scanned);
  const { data: results, isLoading: isSearching } = useMemberSearch(
    { search: debouncedSearch },
    debouncedSearch.trim().length >= 2,
  );
  const { data: memberData } = useMember(selected?.type ?? null, selected?.id ?? null);
  const issueBook = useIssueBook();

  const member = memberData?.member ?? null;

  const personResults = useMemo<PersonResult[]>(
    () =>
      (results ?? []).map((entry) => ({
        key: `${entry.member_type}-${entry.member_id}`,
        name: entry.name,
        photoUrl: entry.photo_url,
        identifier: entry.identifier,
        detail: [MEMBER_TYPE_LABELS[entry.member_type], entry.detail]
          .filter(Boolean)
          .join(' · '),
        badge: (
          <Badge tone={entry.can_borrow ? 'success' : 'danger'}>
            {entry.active_loans}/{entry.borrow_limit}
          </Badge>
        ),
        // A blocked member is shown and explained rather than hidden — "why
        // isn't he in the list" is a question nobody should have to ask.
        disabled: !entry.can_borrow,
        disabledReason: entry.blocked_reason,
      })),
    [results],
  );

  const selectMember = (result: PersonResult, entry: LibraryMember) => {
    setSelected({ type: entry.member_type, id: entry.member_id });
    setSearch(result.name);
    setDueOn(defaultDueDate(entry.member_type));
  };

  const copy = lookup.data?.copy ?? null;
  const book = lookup.data?.book ?? null;
  const isOnLoan = lookup.data?.loan !== null && lookup.data?.loan !== undefined;
  const isIssuable = copy !== null && copy.status === 'available';

  const canIssue = isIssuable && member !== null && member.can_borrow && dueOn !== '';

  const reset = () => {
    setScanned(null);
    setSelected(null);
    setSearch('');
    setDueOn('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader title="1 · Scan the book" />
          <CardBody>
            <BarcodeScanInput
              label="Accession number"
              onScan={setScanned}
              onClear={() => setScanned(null)}
              scanned={scanned}
              isLoading={lookup.isFetching}
              hint="A handheld scanner types the number and presses Enter — nothing to set up."
            />
          </CardBody>
        </Card>

        {scanned && (
          <Card>
            <CardBody>
              {lookup.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : lookup.error ? (
                <Alert tone="danger" title="No such copy">
                  Nothing in the catalogue has the accession number <code>{scanned}</code>.
                </Alert>
              ) : copy && book ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-900">{book.title}</p>
                    <p className="text-sm text-slate-500">
                      {book.author} · <code>{copy.accession_no}</code>
                    </p>
                  </div>

                  {isIssuable ? (
                    <Alert tone="success">On the shelf and ready to go out.</Alert>
                  ) : isOnLoan ? (
                    <Alert tone="warning" title="Already on loan">
                      {lookup.data?.loan?.member_name} has it, due back{' '}
                      {formatDate(lookup.data?.loan?.due_on ?? '')}. Take the return first.
                    </Alert>
                  ) : (
                    <Alert tone="danger" title={COPY_STATUS_LABELS[copy.status]}>
                      This copy is not available to lend.
                    </Alert>
                  )}
                </div>
              ) : null}
            </CardBody>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader title="2 · Find the member" />
          <CardBody>
            <PersonSearch
              label="Student or teacher"
              placeholder="Name, admission number or employee id…"
              value={search}
              onChange={(value) => {
                setSearch(value);
                if (selected) setSelected(null);
              }}
              results={personResults}
              isLoading={isSearching}
              onSelect={(result) => {
                const entry = (results ?? []).find(
                  (candidate) => `${candidate.member_type}-${candidate.member_id}` === result.key,
                );
                if (entry) selectMember(result, entry);
              }}
              hint="Students and teachers both borrow — one search covers the whole school."
            />
          </CardBody>
        </Card>

        {member && <MemberCard member={member} />}

        {member && isIssuable && (
          <Card>
            <CardHeader title="3 · Issue" />
            <CardBody className="space-y-4">
              <div>
                <label
                  htmlFor="issue-due-on"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Due back
                </label>
                <Input
                  id="issue-due-on"
                  type="date"
                  value={dueOn}
                  min={todayInputValue()}
                  onChange={(event) => setDueOn(event.target.value)}
                  className="w-48"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  {MEMBER_TYPE_LABELS[member.member_type]}s keep a book for{' '}
                  {LOAN_DAYS[member.member_type]} days.
                </p>
              </div>

              {member.outstanding_fine > 0 && (
                <Alert tone="warning">
                  {formatCurrency(member.outstanding_fine)} is outstanding on their account.
                </Alert>
              )}

              <Button
                fullWidth
                isLoading={issueBook.isPending}
                disabled={!canIssue}
                leftIcon={<BookCheck className="size-4" />}
                onClick={() =>
                  issueBook.mutate(
                    {
                      copy_id: copy!.id,
                      member_type: member.member_type,
                      member_id: member.member_id,
                      due_on: dueOn,
                      remarks: '',
                    },
                    { onSuccess: reset },
                  )
                }
              >
                Issue {book?.title}
              </Button>
            </CardBody>
          </Card>
        )}

        {!scanned && !member && (
          <Card>
            <CardBody>
              <EmptyState
                icon={<ScanBarcode className="size-6" />}
                title="Ready to issue"
                description="Scan a book and find the member borrowing it."
              />
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
