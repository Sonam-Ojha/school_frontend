import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { toast } from '@/store/toastStore';

import { StudentIdCard } from '../components/StudentIdCard';
import { useStudent } from '../hooks/useStudents';
import { studentService } from '../services/studentService';

/**
 * Printable ID card.
 *
 * Two routes to paper: the browser's own print dialog, which uses the
 * `print-target` rules in `styles/index.css`, and a server-rendered PDF for
 * batch runs that must match exactly.
 */
export default function StudentIdCardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: student, isLoading, error } = useStudent(id);
  const { data: school } = useSettings();
  const [isDownloading, setIsDownloading] = useState(false);

  const breadcrumbs = [
    { label: 'Dashboard', to: PATHS.dashboard },
    { label: 'Students', to: PATHS.students },
    ...(student
      ? [
          { label: student.full_name, to: toPath(PATHS.studentProfile, { id: student.id }) },
          { label: 'ID card' },
        ]
      : [{ label: 'ID card' }]),
  ];

  const downloadPdf = async () => {
    if (!student) return;
    setIsDownloading(true);
    try {
      await studentService.downloadIdCard(student.id, student.admission_no);
    } catch (downloadError) {
      toast.error(
        'Could not download the card',
        downloadError instanceof Error ? downloadError.message : 'Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="ID card" breadcrumbs={breadcrumbs} />
        <Skeleton className="h-56 w-full max-w-xl" />
      </>
    );
  }

  if (error || !student) {
    return (
      <>
        <PageHeader title="ID card" breadcrumbs={breadcrumbs} />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this student">
              {error?.message ?? 'The record no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.students)}>
              Back to students
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* The whole header is hidden when printing. */}
      <div className="print-hidden">
        <PageHeader
          title="Student ID card"
          description={`${student.full_name} · ${student.admission_no}`}
          breadcrumbs={breadcrumbs}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => navigate(toPath(PATHS.studentProfile, { id: student.id }))}
                leftIcon={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>
              <Button
                variant="outline"
                isLoading={isDownloading}
                onClick={downloadPdf}
                leftIcon={<Download className="size-4" />}
              >
                Download PDF
              </Button>
              <Button onClick={() => window.print()} leftIcon={<Printer className="size-4" />}>
                Print
              </Button>
            </>
          }
        />

        {!school && (
          <Alert tone="warning" className="mb-4">
            School details are still loading — the card will print without the school name and
            logo until they arrive.
          </Alert>
        )}
      </div>

      <Card>
        <CardBody>
          <p className="print-hidden mb-4 text-xs text-slate-500">
            Cards are sized to CR80 (85.6 × 54 mm). Print at 100% scale — “fit to page” will
            resize them.
          </p>
          {/* The print rules isolate this subtree; everything else is hidden. */}
          <div className="print-target">
            <StudentIdCard student={student} school={school} />
          </div>
        </CardBody>
      </Card>
    </>
  );
}
