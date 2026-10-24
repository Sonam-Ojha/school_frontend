import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';

interface ReasonModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isPending: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** Turning a voucher down or cancelling one needs a reason the books can show. */
export function ReasonModal({ isOpen, title, description, confirmLabel, isPending, onConfirm, onClose }: ReasonModalProps) {
  const [reason, setReason] = useState('');
  const short = reason.trim().length < 5;

  const close = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="sm"
      title={title}
      description={description}
      closeOnOverlayClick={!isPending}
      footer={
        <>
          <Button variant="outline" onClick={close} disabled={isPending}>
            Back
          </Button>
          <Button variant="danger" disabled={short} isLoading={isPending} onClick={() => onConfirm(reason.trim())}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <label htmlFor="expense-reason" className="text-sm font-medium text-slate-700">
        Reason
      </label>
      <Textarea
        id="expense-reason"
        rows={3}
        className="mt-1"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        maxLength={200}
        placeholder="e.g. Entered twice — already paid on an earlier voucher"
        autoFocus
      />
      {short && reason.length > 0 && <p className="mt-1 text-xs text-slate-500">At least 5 characters.</p>}
    </Modal>
  );
}
