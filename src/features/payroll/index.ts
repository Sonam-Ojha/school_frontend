/** Public surface of the payroll module. */

export { ComponentFormModal } from './components/ComponentFormModal';
export { PayrollStats } from './components/PayrollStats';
export { PayslipSheet } from './components/PayslipSheet';
export { RunFormModal } from './components/RunFormModal';
export { StructureEditor } from './components/StructureEditor';

export {
  CALCULATION_LABELS,
  CALCULATION_OPTIONS,
  COMPONENT_TYPE_LABELS,
  COMPONENT_TYPE_OPTIONS,
  COMPONENT_TYPE_TONES,
  DEFAULT_WORKING_DAYS,
  EMPLOYEE_TYPE_LABELS,
  EMPLOYEE_TYPE_OPTIONS,
  MAX_BASIC_SALARY,
  MAX_COMPONENT_PERCENT,
  PAYROLL_PERMISSIONS,
  RUN_STATUS_LABELS,
  RUN_STATUS_OPTIONS,
  RUN_STATUS_TONES,
  RUN_TRANSITIONS,
  STATUTORY_CODES,
  canTransition,
} from './constants';

export {
  EPS_RATE,
  ESI_RATE_EMPLOYEE,
  ESI_RATE_EMPLOYER,
  ESI_WAGE_CEILING,
  PF_RATE_EMPLOYEE,
  PF_RATE_EMPLOYER,
  PF_WAGE_CEILING,
  esiFor,
  pfFor,
  proRate,
  statutoryEligibility,
  type EsiContribution,
  type PfContribution,
  type PfOptions,
} from './statutory';

export {
  componentKeys,
  payrollKeys,
  runKeys,
  useApproveRun,
  useComponentCatalogue,
  useComponents,
  useCreateComponent,
  useCreateRun,
  useDeleteComponent,
  useDeleteRun,
  useDownloadPayslips,
  useExportRegister,
  useExportRun,
  useMarkPaid,
  usePayrollSummary,
  usePayslip,
  useProcessRun,
  useRun,
  useRuns,
  useSaveStructure,
  useStatutoryRegister,
  useStructure,
  useStructures,
  useUnassignedEmployees,
  useUpdateComponent,
} from './hooks/usePayroll';

export { payrollService, type StructureQuery } from './services/payrollService';

export {
  approveRunSchema,
  componentSchema,
  markPaidSchema,
  runSchema,
  structureLineSchema,
  structureSchema,
  type ApproveRunInput,
  type ComponentInput,
  type MarkPaidInput,
  type RunInput,
  type StructureInput,
  type StructureLineInput,
} from './schemas';

export type {
  CalculationMethod,
  ComponentType,
  EmployeeType,
  EsiRegisterRow,
  PayrollRun,
  PayrollRunDetail,
  PayrollSummary,
  Payslip,
  PayslipLine,
  PfRegisterRow,
  RunStatus,
  SalaryComponent,
  SalaryStructure,
  StatutoryRegister,
  StructureLine,
  UnassignedEmployee,
} from './types';
