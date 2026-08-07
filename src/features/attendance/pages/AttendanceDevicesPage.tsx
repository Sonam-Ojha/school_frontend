import { Alert } from '@/components/ui/Alert';

import { BiometricDevicesCard } from '../components/BiometricDevicesCard';
import { QrSessionsCard } from '../components/QrSessionsCard';

/**
 * Capture devices — the QR and biometric side of attendance.
 *
 * Both write into the same attendance records the manual sheet does; the only
 * difference downstream is the source recorded on each entry.
 */
export default function AttendanceDevicesPage() {
  return (
    <div className="space-y-6">
      <Alert tone="info">
        QR and biometric check-ins land in the same sheets as manual marking. Each entry keeps
        the source it came from, so a disputed mark can be traced back.
      </Alert>

      <QrSessionsCard />
      <BiometricDevicesCard />
    </div>
  );
}
