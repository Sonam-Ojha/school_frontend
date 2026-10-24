import { CheckCircle2, Download, MessageCircle, Printer, UserSearch } from 'lucide-react';
import { useState } from 'react';

import { PrintOnly } from '@/components/feedback/PrintOnly';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Modal } from '@/components/ui/Modal';
import type { SchoolSettings } from '@/features/settings/types';
import { formatCurrency, formatDate, whatsAppLink } from '@/lib/format';

import { useDownloadReceipt } from '../../hooks/useCollection';
import type { Payment } from '../../types';
import { PaymentReceipt } from '../PaymentReceipt';

interface ReceiptReadyModalProps {
  payment: Payment | null;
  school: SchoolSettings | undefined;
  guardianPhone: string | null | undefined;
  onNext: () => void;
}

/**
 * The receipt, the moment the money is in: print it (two copies — the
 * parent's and the school's), download it, or send it to the parent on
 * WhatsApp, then on to the next person in the queue.
 */
export function ReceiptReadyModal({ payment, school, guardianPhone, onNext }: ReceiptReadyModalProps) {
  const [twoCopies, setTwoCopies] = useState(true);
  const download = useDownloadReceipt();
  if (!payment) return null;

  const classLabel = `${payment.class_name}${payment.section_name ? ` — ${payment.section_name}` : ''}`;
  const message = [
    'Dear Parent,',
    `We have received ${formatCurrency(payment.amount)} towards the fees of ${payment.student_name} (${classLabel}).`,
    `Receipt no. ${payment.receipt_no}, dated ${formatDate(payment.paid_at)}.`,
    typeof payment.balance_after === 'number'
      ? payment.balance_after > 0
        ? `Balance still due: ${formatCurrency(payment.balance_after)}.`
        : 'All dues are now clear.'
      : '',
    'Thank you.',
    school?.profile.name ? `— ${school.profile.name}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const whatsApp = whatsAppLink(guardianPhone, message);

  return (
    <>
      <Modal
        isOpen
        onClose={onNext}
        size="xl"
        title={
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />
            Receipt {payment.receipt_no} issued
          </span>
        }
        description={`${formatCurrency(payment.amount)} received from ${payment.received_from ?? payment.student_name}.`}
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <Checkbox label="Two copies (parent + school)" checked={twoCopies} onChange={(event) => setTwoCopies(event.target.checked)} />
            <div className="flex flex-wrap gap-2">
              {whatsApp && (
                <a
                  href={whatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </a>
              )}
              <Button
                variant="outline"
                leftIcon={<Download className="size-4" />}
                isLoading={download.isPending}
                onClick={() => download.mutate(payment)}
              >
                PDF
              </Button>
              <Button variant="outline" leftIcon={<UserSearch className="size-4" />} onClick={onNext}>
                Next student
              </Button>
              <Button leftIcon={<Printer className="size-4" />} onClick={() => window.print()} autoFocus>
                Print receipt
              </Button>
            </div>
          </div>
        }
      >
        <div className="max-h-[60vh] overflow-y-auto rounded-lg bg-slate-100 p-3">
          <PaymentReceipt payment={payment} school={school} />
        </div>
      </Modal>

      {/* What the printer gets: one sheet, both copies when asked. */}
      <PrintOnly>
        <PaymentReceipt payment={payment} school={school} copies={twoCopies ? 2 : 1} />
      </PrintOnly>
    </>
  );
}
