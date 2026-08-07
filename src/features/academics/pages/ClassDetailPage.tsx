import { Pencil, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatNumber } from '@/lib/format';

import { CapacityBar } from '../components/CapacityBar';
import { ClassFormModal } from '../components/ClassFormModal';
import { SectionsCard } from '../components/SectionsCard';
import { CLASS_PERMISSIONS, SHIFT_LABELS, SHIFT_TONES } from '../constants';
import { useSchoolClass } from '../hooks/useClasses';
import type { Shift } from '../types';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: schoolClass, isLoading, error } = useSchoolClass(id);
  const editModal = useDisclosure();

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Classes', to: PATHS.classes },
    { label: schoolClass?.name ?? 'Class' },
  ];

  if (isLoading) {
    return (
      <>
        <PageHeader title="Class" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-24 w-full" />
          </CardBody>
        </Card>
      </>
    );
  }

  if (error || !schoolClass) {
    return (
      <>
        <PageHeader title="Class" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this class">
              {error?.message ?? 'The class no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.classes)}>
              Back to classes
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  // Which shifts this class actually runs, derived from its sections.
  const shifts = [...new Set(schoolClass.sections.map((section) => section.shift))] as Shift[];
  const hasCapacity = schoolClass.total_capacity > 0;

  return (
    <>
      <PageHeader
        title={schoolClass.name}
        description={`Level ${schoolClass.level}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Can permissions={[CLASS_PERMISSIONS.update]}>
            <Button onClick={editModal.open} leftIcon={<Pencil className="size-4" />}>
              Edit class
            </Button>
          </Can>
        }
      />

      {!schoolClass.is_active && (
        <Alert tone="warning" title="This class is inactive" className="mb-4">
          It will not appear when admitting students or assigning teachers. Existing records are
          unaffected.
        </Alert>
      )}

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-slate-900">{schoolClass.name}</p>
            {schoolClass.is_active ? (
              <Badge tone="success" withDot>
                Active
              </Badge>
            ) : (
              <Badge tone="neutral">Inactive</Badge>
            )}
            {shifts.map((shift) => (
              <Badge key={shift} tone={SHIFT_TONES[shift]}>
                {SHIFT_LABELS[shift]}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Sections" value={formatNumber(schoolClass.sections_count)} />
            <Stat label="Students" value={formatNumber(schoolClass.students_count)} />
            <Stat
              label="Total capacity"
              value={hasCapacity ? formatNumber(schoolClass.total_capacity) : '—'}
            />
            <Stat
              label="Seats free"
              value={
                hasCapacity
                  ? formatNumber(Math.max(0, schoolClass.total_capacity - schoolClass.students_count))
                  : '—'
              }
            />
          </div>

          {hasCapacity ? (
            <CapacityBar
              enrolled={schoolClass.students_count}
              capacity={schoolClass.total_capacity}
              showLabel={false}
            />
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="size-3.5" aria-hidden />
              Capacity is the sum of this class&apos;s sections. Add a section to set it.
            </p>
          )}
        </CardBody>
      </Card>

      <SectionsCard schoolClass={schoolClass} />

      <ClassFormModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        schoolClass={schoolClass}
      />
    </>
  );
}
