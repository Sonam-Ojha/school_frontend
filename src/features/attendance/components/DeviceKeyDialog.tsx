import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { env } from '@/config/env';

import type { RegisteredDevice } from '../types';

interface DeviceKeyDialogProps {
  /** The reader whose key was just issued, or null when there is nothing to show. */
  device: RegisteredDevice | null;
  onClose: () => void;
}

/**
 * Shows a reader's key, once, with what to do with it.
 *
 * The API never returns the key again, so this is the only moment anybody can
 * copy it — which is why it is a dialog that has to be dismissed, not a toast
 * that fades.
 */
export function DeviceKeyDialog({ device, onClose }: DeviceKeyDialogProps) {
  const server = env.apiBaseUrl.replace(/\/api\/v\d+$/, '');

  return (
    <Modal
      isOpen={device !== null}
      onClose={onClose}
      size="lg"
      title={device ? `${device.name} is registered` : ''}
      description="Point the reader at this server and its scans appear on the attendance sheet as they happen."
      footer={<Button onClick={onClose}>I have noted the key</Button>}
    >
      {device && (
        <div className="space-y-5 text-sm text-slate-700">
          <Alert tone="warning" title="This key is shown once">
            Copy it now. It cannot be read back later — only replaced, from the reader&apos;s edit
            screen.
          </Alert>

          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Key</p>
            <code className="mt-1 block rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm break-all text-slate-900 select-all">
              {device.push_key}
            </code>
          </div>

          <div>
            <p className="font-medium text-slate-900">ZKTeco, eSSL and readers like them</p>
            <p className="mt-1">
              In the reader&apos;s network settings, switch on the cloud server (ADMS) and enter this
              server&apos;s address. The reader then reports by itself and is recognised by its
              serial number, <code>{device.serial_number}</code> — no key is entered on the device.
            </p>
            <code className="mt-2 block rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs break-all">
              {server}
            </code>
          </div>

          <div>
            <p className="font-medium text-slate-900">Any other reader or attendance software</p>
            <p className="mt-1">
              Have it send each scan to the address below, with the key in an{' '}
              <code>X-Device-Key</code> header:
            </p>
            <code className="mt-2 block rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs break-all whitespace-pre-wrap">
              {`POST ${env.apiBaseUrl}/devices/attendance\n{ "scans": [ { "id": "ADM-0012", "at": "2026-10-12 08:41:07" } ] }`}
            </code>
          </div>

          <p className="text-slate-600">
            Either way, enrol each person on the reader under their admission number or employee
            ID. That is how a scan is matched to them.
          </p>
        </div>
      )}
    </Modal>
  );
}
