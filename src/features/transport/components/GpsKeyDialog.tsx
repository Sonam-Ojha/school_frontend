import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { env } from '@/config/env';

import type { RegisteredGpsDevice } from '../types';

interface GpsKeyDialogProps {
  /** The tracker whose key was just issued, or null when there is nothing to show. */
  device: RegisteredGpsDevice | null;
  onClose: () => void;
}

/**
 * Shows a tracker's key, once, with where to point the tracker.
 *
 * The API never returns the key again, so this is a dialog that has to be
 * dismissed rather than a toast that fades.
 */
export function GpsKeyDialog({ device, onClose }: GpsKeyDialogProps) {
  const address = `${env.apiBaseUrl}/devices/gps`;

  return (
    <Modal
      isOpen={device !== null}
      onClose={onClose}
      size="lg"
      title="Tracker registered"
      description="Point the tracker at this server and the bus appears on the tracking screen as it reports."
      footer={<Button onClick={onClose}>I have noted the key</Button>}
    >
      {device && (
        <div className="space-y-5 text-sm text-slate-700">
          <Alert tone="warning" title="This key is shown once">
            Copy it now. It cannot be read back later — only replaced, from the tracker&apos;s edit
            screen.
          </Alert>

          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Key</p>
            <code className="mt-1 block rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm break-all text-slate-900 select-all">
              {device.push_key}
            </code>
          </div>

          <div>
            <p className="font-medium text-slate-900">A phone on the bus</p>
            <p className="mt-1">
              Install the free <strong>Traccar Client</strong> app on a phone that rides with the
              bus. Enter the address below as the server URL and the key above as the device
              identifier, then switch the service on.
            </p>
            <code className="mt-2 block rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs break-all">
              {address}
            </code>
          </div>

          <div>
            <p className="font-medium text-slate-900">A fitted tracker or a tracking platform</p>
            <p className="mt-1">
              Anything that can call a web address works: have it report each position to the same
              address, identified by the key or by the ID registered here,{' '}
              <code>{device.imei}</code>.
            </p>
            <code className="mt-2 block rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs break-all whitespace-pre-wrap">
              {`${address}?id=${device.push_key}&lat=28.6139&lon=77.2090&speed=18&bearing=90`}
            </code>
            <p className="mt-2 text-slate-600">
              Speed is in knots, as trackers send it. A tracker that only speaks its maker&apos;s own
              protocol reports to the maker&apos;s platform first; set that platform to forward
              positions here.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
