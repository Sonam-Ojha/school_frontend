/** Public surface of the fee management module. */

export { CollectPaymentModal } from './components/CollectPaymentModal';
export { DiscountFormModal } from './components/DiscountFormModal';
export { FeeStructureForm } from './components/FeeStructureForm';
export { FeeTypeFormModal } from './components/FeeTypeFormModal';
export { PaymentReceipt } from './components/PaymentReceipt';
export { StudentDuesCard } from './components/StudentDuesCard';
export {
  buildDiscountColumns,
  buildDueReportColumns,
  buildFeeTypeColumns,
  buildPaymentColumns,
  buildStructureColumns,
} from './components/columns';

export {
  DUE_STATUS_LABELS,
  DUE_STATUS_TONES,
  FEE_CATEGORY_LABELS,
  FEE_PERMISSIONS,
  FREQUENCY_LABELS,
  PAYMENT_MODE_LABELS,
  PAYMENT_MODE_OPTIONS,
  REFERENCE_REQUIRED_MODES,
} from './constants';

export {
  accountKeys,
  dueKeys,
  paymentKeys,
  useCancelPayment,
  useCollectPayment,
  useDownloadReceipt,
  useDueReport,
  useExportDueReport,
  usePayment,
  usePayments,
  useStudentAccount,
} from './hooks/useCollection';

export {
  discountKeys,
  feeTypeKeys,
  structureKeys,
  useCreateDiscount,
  useCreateFeeType,
  useCreateStructure,
  useDeleteDiscount,
  useDeleteFeeType,
  useDeleteStructure,
  useDiscountOptions,
  useDiscounts,
  useFeeStructure,
  useFeeStructures,
  useFeeTypeOptions,
  useFeeTypes,
  useUpdateDiscount,
  useUpdateFeeType,
  useUpdateStructure,
} from './hooks/useFeeCatalogue';

export { collectionService } from './services/collectionService';
export { feeService } from './services/feeService';

export {
  cancelPaymentSchema,
  collectPaymentSchema,
  discountSchema,
  feeStructureSchema,
  feeTypeSchema,
  type CollectPaymentInput,
  type DiscountInput,
  type FeeStructureInput,
  type FeeTypeInput,
} from './schemas';

export type {
  Discount,
  DueReportRow,
  FeeStructure,
  FeeStructureDetail,
  FeeType,
  Installment,
  Payment,
  StudentDue,
  StudentFeeAccount,
} from './types';
