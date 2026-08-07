import { Search, UserSearch } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useStudents } from '@/features/students/hooks/useStudents';

import { CollectPaymentModal } from '../components/CollectPaymentModal';
import { StudentDuesCard } from '../components/StudentDuesCard';
import { useStudentAccount } from '../hooks/useCollection';

/**
 * Fee collection.
 *
 * Find the student first, then act on their account — the cashier has a name
 * or an admission number in front of them, not a student id. The selected
 * student lives in the URL so a colleague can be sent straight to the account.
 */
export default function FeeCollectionPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const collectModal = useDisclosure();

  const studentId = searchParams.get('student_id')
    ? Number(searchParams.get('student_id'))
    : undefined;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  // Only search once there is enough to narrow on — a single letter would
  // return the whole school.
  const canSearch = debouncedSearch.trim().length >= 2;
  const { data: results, isLoading: isSearching } = useStudents({
    search: debouncedSearch,
    per_page: 8,
    status: 'active',
  });

  const { data: account, isLoading, error } = useStudentAccount(studentId);

  const selectStudent = (id: number) => {
    setSearchParams({ student_id: String(id) }, { replace: true });
    setSearch('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <label htmlFor="fee-student-search" className="mb-1.5 block text-sm font-medium text-slate-700">
            Find a student
          </label>

          <div className="relative max-w-lg">
            <Input
              id="fee-student-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or admission number…"
              leftIcon={<Search className="size-4" />}
            />

            {canSearch && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-overlay">
                {isSearching ? (
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : results && results.data.length > 0 ? (
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {results.data.map((student) => (
                      <li key={student.id}>
                        <button
                          type="button"
                          onClick={() => selectStudent(student.id)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
                        >
                          <Avatar name={student.full_name} src={student.photo_url} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-slate-900">
                              {student.full_name}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              <code>{student.admission_no}</code>
                              {` · ${student.class_name}${student.section_name ? ` — ${student.section_name}` : ''}`}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-4 text-sm text-slate-500">
                    No active student matches “{debouncedSearch}”.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {error ? (
        <Alert tone="danger" title="Could not load this account">
          {error.message}
        </Alert>
      ) : isLoading ? (
        <Card>
          <CardBody className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardBody>
        </Card>
      ) : account ? (
        <>
          <StudentDuesCard account={account} onCollect={collectModal.open} />

          <CollectPaymentModal
            // Remount per student so the amount defaults to their balance.
            key={account.student_id}
            isOpen={collectModal.isOpen}
            onClose={collectModal.close}
            account={account}
            onCollected={(payment) =>
              navigate(toPath(PATHS.feeReceipt, { id: payment.id }))
            }
          />
        </>
      ) : (
        <Card>
          <CardBody>
            <EmptyState
              icon={<UserSearch className="size-6" />}
              title="No student selected"
              description="Search by name or admission number to see their fee position and take a payment."
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
