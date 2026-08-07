import { ArrowLeft, Download, Printer } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { toast } from '@/store/toastStore';

import { PayslipSheet } from '../components/PayslipSheet';
import { PAYROLL_PERMISSIONS } from '../constants';
import { usePayslip } from '../hooks/usePayroll';
import { payrollService } from '../services/payrollService';

export default function PayslipPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: payslip, isLoading, error } = usePayslip(id);
  const { data: school } = useSettings();
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async () => {
    if (!payslip) return;
    setIsDownloading(true);
    try {
      await payrollService.downloadPayslip(payslip);
    } catch (downloadError) {
      toast.error(
        'Could not download the payslip',
        downloadError instanceof Error ? downloadError.message : 'Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Payslip" />
        <Skeleton className="h-[60vh] w-full max-w-3xl" />
      </>
    );
  }

  if (error || !payslip) {
    return (
      <>
        <PageHeader title="Payslip" />
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load this payslip">
              {error?.message ?? 'It no longer exists.'}
            </Alert>
            <Button variant="outline" className="mt-4" onClick={() => navigate(PATHS.payrollRuns)}>
              Back to payroll
            </Button>
          </CardBody>
        </Card>
      </>
    );
  }

  const runPath = toPath(PATHS.payrollRunDetail, { id: payslip.run_id });

  return (
    <>
      {/* The whole header is hidden when printing. */}
      <div className="print-hidden">
        <PageHeader
          title={`Payslip — ${payslip.employee_name}`}
          description={`${payslip.month} · ${payslip.designation}`}
          breadcrumbs={[
            { label: 'Payroll', to: PATHS.payrollRuns },
            { label: payslip.month, to: runPath },
            { label: 'Payslip' },
          ]}
          actions={
            <>
              <Button
                variant="outline"
                onClick={() => navigate(runPath)}
                leftIcon={<ArrowLeft className="size-4" />}
              >
                Back
              </Button>

              <Can permissions={[PAYROLL_PERMISSIONS.print]}>
                <Button
                  variant="outline"
                  isLoading={isDownloading}
                  onClick={download}
                  leftIcon={<Download className="size-4" />}
                >
                  Download PDF
                </Button>
                <Button onClick={() => window.print()} leftIcon={<Printer className="size-4" />}>
                  Print
                </Button>
              </Can>
            </>
          }
        />

        {!payslip.is_frozen && (
          <Alert tone="warning" className="mb-4" title="Provisional">
            This run has not been processed, so the figures still move with the salary on file.
            They are frozen the moment it is.
          </Alert>
        )}
      </div>

      <Card>
        <CardBody>
          {/* The print rules isolate this subtree; everything else is hidden. */}
          <div className="print-target">
            <PayslipSheet payslip={payslip} school={school} />
          </div>
        </CardBody>
      </Card>
    </>
  );
}
