import { CalendarPlus, FileDown, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { DataTable } from '@/components/table/DataTable';
import { TableToolbar } from '@/components/table/TableToolbar';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { useTableQueryState } from '@/hooks/useTableQueryState';
import { useAuthStore } from '@/store/authStore';

import { ApplyModal } from '../components/ApplyModal';
import { LeaveStats } from '../components/LeaveStats';
import { ReviewModal } from '../components/ReviewModal';
import { buildApplicationColumns } from '../components/applicationColumns';
import {
  APPLICANT_TYPE_OPTIONS,
  LEAVE_PERMISSIONS,
  STATUS_OPTIONS,
} from '../constants';
import {
  useApplications,
  useExportApplications,
  useLeaveTypeCatalogue,
} from '../hooks/useLeave';
import type { ApplicantType, LeaveApplication } from '../types';

/**
 * The leave register.
 *
 * Student, teacher and staff leave are one list filtered by applicant rather
 * than three screens: the workflow, the columns and the decision are identical
 * in all three cases, and three copies of it would be three places to fix a
 * bug in the approval rules.
 */
export default function ApplicationsPage() {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const table = useTableQueryState({
    defaultSortBy: 'applied_at',
    defaultSortDir: 'desc',
    filterKeys: ['applicant_type', 'status', 'leave_type_id', 'from', 'to'],
  });

  const { data, isLoading, isFetching, error } = useApplications(table.queryParams);
  const { types } = useLeaveTypeCatalogue();
  const exportApplications = useExportApplications();

  const applyModal = useDisclosure();
  const [reviewing, setReviewing] = useState<{
    application: LeaveApplication;
    decision: 'approved' | 'rejected';
  } | null>(null);

  const columns = buildApplicationColumns({
    onReview: (application, decision) => setReviewing({ application, decision }),
    canApprove: hasPermission(LEAVE_PERMISSIONS.approve),
  });

  return (
    <div className="space-y-4">
      <LeaveStats />

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={data?.data}
            meta={data?.meta}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            sortBy={table.sortBy}
            sortDir={table.sortDir}
            onSort={table.toggleSort}
            onPageChange={table.setPage}
            onPerPageChange={table.setPerPage}
            onRowClick={(application) =>
              navigate(toPath(PATHS.leaveApplicationDetail, { id: application.id }))
            }
            toolbar={
              <TableToolbar
                search={table.search}
                onSearchChange={table.setSearch}
                searchPlaceholder="Name or identifier"
                hasActiveFilters={table.hasActiveFilters}
                onResetFilters={table.resetFilters}
                filters={
                  <>
                    <Select
                      aria-label="Filter by applicant"
                      value={table.filters.applicant_type ?? ''}
                      options={APPLICANT_TYPE_OPTIONS}
                      placeholder="Everybody"
                      onChange={(event) =>
                        table.setFilter('applicant_type', event.target.value || undefined)
                      }
                      className="w-36"
                    />
                    <Select
                      aria-label="Filter by status"
                      value={table.filters.status ?? ''}
                      options={STATUS_OPTIONS}
                      placeholder="Any status"
                      onChange={(event) =>
                        table.setFilter('status', event.target.value || undefined)
                      }
                      className="w-44"
                    />
                    <Select
                      aria-label="Filter by leave type"
                      value={table.filters.leave_type_id ?? ''}
                      options={types.map((type) => ({ label: type.name, value: type.id }))}
                      placeholder="Any type"
                      onChange={(event) =>
                        table.setFilter('leave_type_id', event.target.value || undefined)
                      }
                      className="w-44"
                    />
                  </>
                }
                actions={
                  <>
                    <Can permissions={[LEAVE_PERMISSIONS.export]}>
                      <Button
                        variant="outline"
                        leftIcon={<FileDown className="size-4" />}
                        isLoading={exportApplications.isPending}
                        onClick={() =>
                          exportApplications.mutate({
                            params: table.queryParams,
                            format: 'excel',
                          })
                        }
                      >
                        Export
                      </Button>
                    </Can>

                    <Can permissions={[LEAVE_PERMISSIONS.create]}>
                      <Button
                        onClick={applyModal.open}
                        leftIcon={<CalendarPlus className="size-4" />}
                      >
                        Apply for leave
                      </Button>
                    </Can>
                  </>
                }
              />
            }
            emptyState={
              <EmptyState
                icon={<ListChecks className="size-6" />}
                title="Nothing here"
                description={
                  table.hasActiveFilters
                    ? 'No application matches these filters.'
                    : 'Nobody has applied for leave yet.'
                }
              />
            }
          />
        </CardBody>
      </Card>

      {applyModal.isOpen && (
        <ApplyModal
          isOpen={applyModal.isOpen}
          onClose={applyModal.close}
          defaultApplicantType={
            (table.filters.applicant_type as ApplicantType | undefined) ?? 'student'
          }
        />
      )}

      {reviewing && (
        <ReviewModal
          key={`${reviewing.application.id}-${reviewing.decision}`}
          isOpen
          onClose={() => setReviewing(null)}
          application={reviewing.application}
          decision={reviewing.decision}
        />
      )}
    </div>
  );
}
