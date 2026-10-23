import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import type { AuthSessionToken } from '@/features/auth/types';
import type { RoleDetail, RolePayload } from '@/features/roles/types';
import type { AcademicYear, SchoolSettings } from '@/features/settings/types';
import type { StudentDetail, StudentDocument } from '@/features/students/types';
import type { SchoolClass, Section, Shift, Subject } from '@/features/academics/types';
import type {
  AttendanceEntry,
  AttendanceStatus,
  AttendanceType,
  BiometricDevice,
  Holiday,
  QrSession,
} from '@/features/attendance/types';
import type {
  Discount,
  FeeStructureDetail,
  FeeType,
  Payment,
  StudentDue,
} from '@/features/fees/types';
import type {
  HomeworkAttachment,
  HomeworkDetail,
  Submission,
} from '@/features/homework/types';
import type { FileAttachment } from '@/components/attachments';
import type {
  AssignmentDetail,
  AssignmentSubmission,
  Evaluation,
  RubricCriterion,
} from '@/features/assignments/types';
import type {
  ExamDetail,
  ExamPaper,
  ExamResults,
  PaperMark,
  ReportCard,
  ResultSubject,
  StudentResult,
} from '@/features/exams/types';
import {
  BORROW_LIMITS,
  LOAN_DAYS,
  MAX_RENEWALS,
  RENEWAL_DAYS,
  // Aliased: the fee module has its own late-payment fine, on a different
  // policy. Two fines, two rules — deliberately not one shared function.
  fineFor as libraryFineFor,
} from '@/features/library/constants';
import type {
  Book,
  BookCategory,
  BookCopy,
  BookDetail,
  CopyCondition,
  LibraryMember,
  Loan,
  MemberType,
} from '@/features/library/types';
import {
  BEDS_FOR_ROOM_TYPE,
  GENDER_FOR_HOSTEL,
  MAX_BEDS_PER_ROOM as MAX_BEDS_PER_ROOM_MOCK,
  ROLL_CALL_GRACE_DAYS,
  messChargeFor,
} from '@/features/hostel/constants';
import type {
  Bed,
  Hostel,
  HostelAllocation,
  HostelCharge,
  HostelRoom,
  HostelRoomDetail,
  MessPlan,
  RollCall,
  RollCallEntry,
  RollCallStatus,
  RoomStatus,
  RoomType,
} from '@/features/hostel/types';
import { extractPlaceholders, smsCost } from '@/features/communication/composition';
import {
  STALE_DEVICE_DAYS,
  TEMPLATE_ONLY_CHANNELS,
} from '@/features/communication/constants';
import type {
  Audience,
  AudienceType,
  Channel,
  ChannelDelivery,
  ChannelHealth,
  Message,
  MessageStatus,
  MessageTemplate,
  Notice,
  NoticePriority,
  NoticeStatus,
  PushDevice,
  TemplateApproval,
  TemplateCategory,
} from '@/features/communication/types';
import { DEFAULT_WORKING_DAYS, canTransition } from '@/features/payroll/constants';
import {
  PF_WAGE_CEILING as PF_CEILING_MOCK,
  esiFor,
  pfFor,
  proRate,
} from '@/features/payroll/statutory';
import type {
  CalculationMethod,
  ComponentType,
  EmployeeType,
  PayrollRun,
  PayrollRunDetail,
  Payslip,
  PayslipLine,
  RunStatus,
  SalaryComponent,
  SalaryStructure,
  StructureLine,
  UnassignedEmployee,
} from '@/features/payroll/types';
import {
  ABSENT_STATUSES,
  CONSUMING_STATUSES,
  MAX_BACKDATED_DAYS,
  PORTION_DAYS,
  // Aliased: the payroll module has its own state machine, imported above
  // under the bare name. Two workflows, two tables — deliberately separate.
  canTransition as canLeaveTransition,
} from '@/features/leave/constants';
import type {
  ApplicantType as LeaveApplicantType,
  AwayToday,
  DayPortion,
  Entitlement,
  LeaveApplication,
  LeaveBalance,
  LeaveStatus,
  LeaveType,
  LeaveUsageRow,
} from '@/features/leave/types';
import {
  ACTIVITY_FEED_SIZE,
  LIST_PREVIEW_SIZE,
  VIEW_FOR_ROLE,
} from '@/features/dashboard/constants';
import {
  AGEING_BUCKETS,
  CHRONIC_ABSENCE_PERCENT,
  COHORT_PREVIEW_SIZE,
  RISK_THRESHOLD,
  RISK_WEIGHTS,
} from '@/features/analytics/constants';
import type {
  Analysis,
  AnalysisKey,
  AnalyticsDomain,
  Insight,
  IntelligenceProvider,
} from '@/features/analytics/types';
import { BELL_PREVIEW_SIZE } from '@/features/notifications/constants';
import type {
  AppNotification,
  NotificationDelivery,
  NotificationPreferences,
  NotificationPriority,
  NotificationType,
  UnreadSummary,
} from '@/features/notifications/types';
import type {
  ActivityEntry,
  DashboardAlert,
  DashboardData,
  DashboardList,
  DashboardListItem,
  DashboardPanel,
  DashboardStat,
  DashboardSubject,
  DashboardView,
  StatIcon,
} from '@/features/dashboard/types';
import {
  ATTENDANCE_CONCERN_PERCENT,
  HEAVY_LOAD_PERIODS,
  MONTH_LABELS,
  MONTH_SHORT,
} from '@/features/reports/constants';
import type {
  ReportKey,
  ReportPoint,
  ReportResult,
  ReportRow,
} from '@/features/reports/types';
import type { StaffDocument, StaffMemberDetail } from '@/features/staff/types';
import {
  BLOCKING_DOCUMENTS,
  DOCUMENT_KINDS,
  POSITION_STALE_SECONDS,
  TRIP_FARE_MULTIPLIER,
  complianceFor,
  worstCompliance,
} from '@/features/transport/constants';
import type {
  DocumentKind,
  GpsDevice,
  GpsStatus,
  RouteDetail,
  RouteStop,
  TransportAssignment,
  TransportRoute,
  TripType,
  Vehicle,
  VehicleDocument,
  VehiclePosition,
} from '@/features/transport/types';
import type { TeacherDetail, TeacherDocument } from '@/features/teachers/types';
import {
  MAX_PERIODS_PER_DAY,
  MAX_PERIODS_PER_WEEK,
  WEEKDAYS,
  WEEKDAY_LABELS,
} from '@/features/timetable/constants';
import type {
  AvailabilityEntry,
  LoadEntry,
  Period,
  Room,
  TeacherWorkload,
  TimetableGrid,
  TimetableScope,
  TimetableSlot,
  TimetableSummary,
  Weekday,
} from '@/features/timetable/types';
import { http } from '@/lib/axios';
import { GRADE_BANDS, PASS_PERCENT, gradeFor, percentFor } from '@/lib/grading';
import { fromMinor, sumAmounts, toMinor } from '@/lib/money';
import {
  bucketBy,
  confidenceFor,
  correlation,
  correlationLabel,
  linearRegression,
  mean,
  median,
  round,
  stdDev,
  weightedScore,
  zScore,
} from '@/lib/statistics';
import { durationBetween, formatTimeRange, overlaps, toMinutes } from '@/lib/time';
import { PATHS, toPath } from '@/app/router/paths';
import { ROLES, type AuthUser } from '@/types/auth';

import {
  academicYears as seedYears,
  accounts,
  permissions,
  roles as seedRoles,
  secrets as seedSecrets,
  settings as seedSettings,
  SHARED_PASSWORD,
  toRoleSummary,
} from './data';
import { classes as seedClasses, subjects as seedSubjects } from './academicsData';
import {
  devices as seedDevices,
  holidays as seedHolidays,
  qrSessions as seedQrSessions,
} from './attendanceData';
import { studentDocuments as seedDocuments, students as seedStudents } from './studentData';
import {
  discounts as seedDiscounts,
  feeStructures as seedStructures,
  feeTypes as seedFeeTypes,
} from './feeData';
import { homework as seedHomework, nextAttachmentId } from './homeworkData';
import {
  assignments as seedAssignments,
  nextAssignmentAttachmentId as seedAssignmentAttachmentId,
  nextCriterionId as seedCriterionId,
} from './assignmentData';
import {
  exams as seedExams,
  nextExamId as seedNextExamId,
  nextPaperId as seedNextPaperId,
  seededMarkedPapers,
} from './examData';
import {
  books as seedBooks,
  categories as seedCategories,
  nextBookId as seedNextBookId,
  nextCategoryId as seedNextCategoryId,
  seededCopyCounts,
} from './libraryData';
import {
  hostelSeed,
  nextHostelId as seedNextHostelId,
  nextRoomId as seedNextHostelRoomId,
  roomSeed as hostelRoomSeed,
} from './hostelData';
import {
  nextNoticeId as seedNextNoticeId,
  nextTemplateId as seedNextTemplateId,
  noticeSeed,
  templateSeed,
} from './communicationData';
import {
  BASIC_BANDS,
  DEFAULT_BASIC,
  componentSeed,
  nextComponentId as seedNextComponentId,
} from './payrollData';
import {
  applicationShapes,
  leaveTypeSeed,
  nextLeaveTypeId as seedNextLeaveTypeId,
} from './leaveData';
import {
  notificationShapes,
  preferenceCatalogue,
  type NotificationAudience,
  type NotificationShape,
} from './notificationData';
import { staff as seedStaff, staffDocuments as seedStaffDocuments } from './staffData';
import {
  documentDate,
  gpsDeviceSeed,
  nextGpsDeviceId as seedNextGpsDeviceId,
  nextRouteId as seedNextRouteId,
  nextVehicleId as seedNextVehicleId,
  routeSeed,
  vehicleSeed,
} from './transportData';
import {
  nextPeriodId as seedNextPeriodId,
  nextRoomId as seedNextRoomId,
  periods as seedPeriods,
  rooms as seedRooms,
} from './timetableData';
import {
  teacherDocuments as seedTeacherDocuments,
  teachers as seedTeachers,
} from './teacherData';

/**
 * Development mock API.
 *
 * Replaces the axios adapter so every request the app makes is answered
 * locally, letting the whole UI be driven before the Laravel backend exists.
 * Installed only from `main.tsx` behind `import.meta.env.DEV`, so the bundler
 * drops this module entirely from production builds.
 *
 * State lives in memory: created roles and profile edits survive navigation
 * but reset on a full page reload. That is deliberate — it keeps the mock
 * honest about being a stand-in rather than a database.
 */

// --- mutable state ----------------------------------------------------------

let roles: RoleDetail[] = seedRoles.map((role) => ({ ...role }));
let nextRoleId = roles.length + 1;
let currentUser: AuthUser | null = null;

let settings: SchoolSettings = structuredClone(seedSettings);
const secrets = { ...seedSecrets };
let academicYears: AcademicYear[] = seedYears.map((year) => ({ ...year }));
let nextYearId = academicYears.length + 1;

let students: StudentDetail[] = seedStudents.map((student) => ({ ...student }));
let nextStudentId = students.length + 1;

const documentsByStudent: Record<number, StudentDocument[]> = structuredClone(seedDocuments);
let nextDocumentId = 100;

let teachers: TeacherDetail[] = seedTeachers.map((teacher) => ({ ...teacher }));
let nextTeacherId = teachers.length + 1;
const documentsByTeacher: Record<number, TeacherDocument[]> = structuredClone(seedTeacherDocuments);

let classes: SchoolClass[] = structuredClone(seedClasses);
let nextClassId = classes.length + 1;
let nextSectionId = 1000;

let subjects: Subject[] = structuredClone(seedSubjects);
let nextSubjectId = subjects.length + 1;

let holidays: Holiday[] = structuredClone(seedHolidays);
let nextHolidayId = holidays.length + 1;
let devices: BiometricDevice[] = structuredClone(seedDevices);
let qrSessions: QrSession[] = structuredClone(seedQrSessions);
let nextQrSessionId = 1;

/**
 * Marks keyed by `type|date|person_id`.
 *
 * A flat map rather than per-day sheets, because that is what a real
 * `attendance` table is — the sheet is assembled from the roster plus
 * whatever marks exist.
 */
const attendanceMarks = new Map<
  string,
  { status: AttendanceStatus; source: AttendanceEntry['source']; remarks: string | null }
>();

const markKey = (type: AttendanceType, date: string, personId: number) =>
  `${type}|${date}|${personId}`;

let feeTypes: FeeType[] = structuredClone(seedFeeTypes);
let nextFeeTypeId = feeTypes.length + 1;
let discounts: Discount[] = structuredClone(seedDiscounts);
let nextDiscountId = discounts.length + 1;
let feeStructures: FeeStructureDetail[] = structuredClone(seedStructures);
let nextStructureId = feeStructures.length + 1;

let payments: Payment[] = [];
let nextPaymentId = 1;
let nextReceiptSeq = 1;

/**
 * Paid amount per due, keyed `studentId|dueId`.
 *
 * Dues themselves are derived from the student's structure — only what has
 * actually been paid is stored, which is what a real `fee_payments` ledger
 * holds.
 */
let homeworkList: HomeworkDetail[] = structuredClone(seedHomework);
let nextHomeworkId = homeworkList.length + 1;
let nextHomeworkAttachmentId = nextAttachmentId;

/**
 * Submissions keyed `homeworkId|studentId`.
 *
 * Only rows that exist are stored; the list is assembled from the roster, so
 * "not handed in" is a derived state rather than a record nobody wrote.
 */
const submissionsByHomework = new Map<string, Omit<Submission, 'student_name' | 'admission_no' | 'photo_url' | 'status' | 'days_late'>>();
const submissionKey = (homeworkId: number, studentId: number) => `${homeworkId}|${studentId}`;
let nextSubmissionId = 1;

let assignmentList: AssignmentDetail[] = structuredClone(seedAssignments);
let nextAssignmentId = assignmentList.length + 1;
let nextAssignmentAttachmentId = seedAssignmentAttachmentId;
let nextCriterionId = seedCriterionId;

/**
 * Assignment submissions keyed `assignmentId|studentId`.
 *
 * Only rows that exist are stored; the list is assembled from the roster, so
 * "not handed in" is a derived state rather than a record nobody wrote.
 */
type StoredAssignmentSubmission = Pick<
  AssignmentSubmission,
  'id' | 'assignment_id' | 'student_id' | 'submitted_at' | 'attempt' | 'student_note' | 'attachments' | 'evaluation'
>;

const assignmentSubmissions = new Map<string, StoredAssignmentSubmission>();
const assignmentSubmissionKey = (assignmentId: number, studentId: number) =>
  `${assignmentId}|${studentId}`;
let nextAssignmentSubmissionId = 1;

const paidByDue = new Map<string, number>();

/**
 * Discount credited against each due, keyed the same way.
 *
 * A discount is a credit on the ledger, not a note on the receipt — it has to
 * reduce what is owed, or paying "balance minus concession" would leave the
 * concession itself outstanding.
 */
const discountByDue = new Map<string, number>();

/** Per-payment record of what it credited, so a cancellation can reverse it. */
const discountAllocationsByPayment = new Map<number, { due_id: number; amount: number }[]>();

const dueKey = (studentId: number, dueId: number) => `${studentId}|${dueId}`;

/**
 * Transport, held as the four records it is.
 *
 * A vehicle stores no driver name and a stop stores no student count — both
 * are resolved on read from the staff roster and the assignment list, so a
 * staff member's rename or a student leaving cannot leave a stale label on a
 * bus that nobody thinks to look at.
 */
interface StoredVehicle {
  id: number;
  registration_no: string;
  name: string;
  make: string | null;
  model: string | null;
  manufacture_year: number | null;
  capacity: number;
  fuel_type: Vehicle['fuel_type'];
  status: Vehicle['status'];
  driver_id: number | null;
  attendant_id: number | null;
  expiries: Record<DocumentKind, string | null>;
  odometer_km: number | null;
  notes: string | null;
  created_at: string;
}

interface StoredRoute {
  id: number;
  name: string;
  code: string;
  description: string | null;
  vehicle_id: number | null;
  distance_km: number | null;
  is_active: boolean;
  created_at: string;
}

interface StoredStop {
  id: number;
  route_id: number;
  name: string;
  sequence: number;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  pickup_time: string;
  drop_time: string;
  fare: number;
}

interface StoredAssignment {
  id: number;
  student_id: number;
  route_id: number;
  stop_id: number;
  trip: TripType;
  start_date: string;
  end_date: string | null;
}

interface StoredGpsDevice {
  id: number;
  imei: string;
  sim_number: string | null;
  provider: string;
  vehicle_id: number | null;
  installed_on: string;
  /** Minutes ago the device last reported. Null means it never has. */
  last_ping_minutes_ago: number | null;
}

let vehicleList: StoredVehicle[] = [];
let nextVehicleId = seedNextVehicleId;
let routeList: StoredRoute[] = [];
let nextRouteId = seedNextRouteId;
let stopList: StoredStop[] = [];
let nextStopId = 1;
let transportAssignments: StoredAssignment[] = [];
let nextTransportAssignmentId = 1;
let gpsDeviceList: StoredGpsDevice[] = [];
let nextGpsDeviceId = seedNextGpsDeviceId;

/**
 * Boarding, held as the four records it is.
 *
 * A bed stores no occupant and a room stores no bed count — both are resolved
 * from the allocations on read, so vacating somebody cannot leave a stale
 * name on a bed nobody thinks to look at.
 */
interface StoredHostel {
  id: number;
  name: string;
  code: string;
  type: Hostel['type'];
  address: string | null;
  warden_id: number | null;
  mess_charge: number;
  is_active: boolean;
  created_at: string;
}

interface StoredHostelRoom {
  id: number;
  hostel_id: number;
  room_no: string;
  floor: number;
  type: RoomType;
  monthly_rent: number;
  has_ac: boolean;
  has_attached_bath: boolean;
  /** Only the states a person sets — `full` is derived from the beds. */
  status: Exclude<RoomStatus, 'full'>;
  notes: string | null;
  created_at: string;
}

interface StoredBed {
  id: number;
  room_id: number;
  bed_no: string;
  /** Never `occupied` — that follows from an allocation. */
  status: Exclude<Bed['status'], 'occupied'>;
  notes: string | null;
}

interface StoredAllocation {
  id: number;
  student_id: number;
  bed_id: number;
  mess_plan: MessPlan;
  allocated_on: string;
  vacated_on: string | null;
  reason: string | null;
}

interface StoredRollCallMark {
  allocation_id: number;
  date: string;
  status: RollCallStatus;
  remarks: string | null;
  marked_at: string;
  marked_by: string;
}

let hostelList: StoredHostel[] = [];
let nextHostelId = seedNextHostelId;
let hostelRoomList: StoredHostelRoom[] = [];
let nextHostelRoomId = seedNextHostelRoomId;
let bedList: StoredBed[] = [];
let nextBedId = 1;
const hostelAllocations: StoredAllocation[] = [];
let nextHostelAllocationId = 1;

/** `allocationId|date` — the same flat shape the attendance marks use. */
const rollCallMarks = new Map<string, StoredRollCallMark>();
const rollCallKey = (allocationId: number, date: string) => `${allocationId}|${date}`;

/** Months already billed, keyed `hostelId|YYYY-MM`, so none is raised twice. */
const raisedMonths = new Map<string, number>();

/**
 * Leave, held as the two records it is.
 *
 * An application stores an applicant type and id rather than a copy of the
 * person: the rosters are the rosters, and a leave record carrying its own
 * stale name would start disagreeing with the register the day somebody
 * married. `days` is not stored either — it is working days between two
 * dates, and the holiday calendar it depends on can change after the fact.
 */
interface StoredLeaveType {
  id: number;
  name: string;
  code: string;
  applies_to: LeaveApplicantType[];
  annual_quota: number | null;
  is_paid: boolean;
  requires_document: boolean;
  allows_backdated: boolean;
  max_consecutive_days: number | null;
  is_active: boolean;
  created_at: string;
}

interface StoredLeaveApplication {
  id: number;
  applicant_type: LeaveApplicantType;
  applicant_id: number;
  leave_type_id: number;
  from_date: string;
  to_date: string;
  day_portion: DayPortion;
  reason: string;
  document_name: string | null;
  status: LeaveStatus;
  applied_at: string;
  applied_by: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
}

let leaveTypes: StoredLeaveType[] = [];
let nextLeaveTypeId = seedNextLeaveTypeId;
let leaveApplications: StoredLeaveApplication[] = [];
let nextLeaveApplicationId = 1;

/**
 * Payroll, held as the four records it is.
 *
 * A structure stores no employee name and a payslip stores no live salary —
 * the first is resolved from the roster on read, and the second is frozen at
 * processing so a later pay revision cannot rewrite a payslip somebody has
 * already been handed.
 */
interface StoredComponent {
  id: number;
  name: string;
  code: string;
  type: ComponentType;
  calculation: CalculationMethod;
  value: number;
  is_statutory: boolean;
  is_taxable: boolean;
  affects_pf: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface StoredStructureLine {
  component_id: number;
  value: number;
}

interface StoredStructure {
  id: number;
  employee_type: EmployeeType;
  employee_id: number;
  basic: number;
  effective_from: string;
  pf_on_full_wage: boolean;
  pf_excluded: boolean;
  lines: StoredStructureLine[];
  is_active: boolean;
  updated_at: string;
}

interface StoredRun {
  id: number;
  month: string;
  status: RunStatus;
  processed_at: string | null;
  processed_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  paid_at: string | null;
  paid_reference: string | null;
  notes: string | null;
  created_at: string;
}

let componentList: StoredComponent[] = [];
let nextComponentId = seedNextComponentId;
const structureList: StoredStructure[] = [];
let nextPayrollStructureId = 1;
let runList: StoredRun[] = [];
let nextRunId = 1;

/** Frozen payslips, keyed by run. Written once, at processing. */
const payslipsByRun = new Map<number, Payslip[]>();
let nextPayslipId = 1;

/**
 * Communication, held as the three records it is.
 *
 * A message stores its audience as a *query* rather than a list of names, so
 * the count on a scheduled send is what the class is on the day it goes, not
 * what it was when somebody drafted it. Only the delivery figures are frozen,
 * and only once it has actually gone.
 */
interface StoredTemplate {
  id: number;
  name: string;
  code: string;
  channel: Channel;
  category: TemplateCategory;
  subject: string | null;
  body: string;
  approval: TemplateApproval;
  approval_note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StoredAudience {
  type: AudienceType;
  class_id: number | null;
  section_id: number | null;
  recipient_ids: number[];
}

interface StoredMessage {
  id: number;
  subject: string;
  body: string;
  channels: Channel[];
  template_id: number | null;
  audience: StoredAudience;
  status: MessageStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_by: string | null;
  /** Written once, when it goes. Null while it is still waiting. */
  deliveries: ChannelDelivery[] | null;
  recipients_count: number;
  notice_id: number | null;
  created_at: string;
}

interface StoredNotice {
  id: number;
  title: string;
  body: string;
  category: TemplateCategory;
  priority: NoticePriority;
  audience: StoredAudience;
  status: NoticeStatus;
  is_pinned: boolean;
  publish_at: string;
  expires_at: string | null;
  published_by: string | null;
  published_at: string | null;
  approved_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

let templateList: StoredTemplate[] = [];
let nextTemplateId = seedNextTemplateId;
let messageList: StoredMessage[] = [];
let nextMessageId = 1;
let noticeList: StoredNotice[] = [];
let nextNoticeId = seedNextNoticeId;
let pushDeviceList: PushDevice[] = [];

let bookList: Book[] = structuredClone(seedBooks);
let nextBookId = seedNextBookId;
let categoryList: BookCategory[] = structuredClone(seedCategories);
let nextCategoryId = seedNextCategoryId;

/**
 * Copies and loans, held flat.
 *
 * A copy stores no book title and a loan stores no member name — both are
 * resolved on read, so renaming a book or a student cannot leave a stale
 * label behind on a five-year-old loan.
 */
interface StoredCopy {
  id: number;
  book_id: number;
  accession_no: string;
  status: BookCopy['status'];
  condition: CopyCondition;
  acquired_on: string;
  price: number;
  shelf_no: string | null;
  remarks: string | null;
}

interface StoredLoan {
  id: number;
  copy_id: number;
  member_type: MemberType;
  member_id: number;
  issued_on: string;
  due_on: string;
  returned_on: string | null;
  is_lost: boolean;
  renewals: number;
  /** Frozen at return; null while the book is still out and the fine accrues. */
  frozen_fine: number | null;
  fine_paid: number;
  fine_waived: number;
  issued_by: string | null;
  received_by: string | null;
  remarks: string | null;
}

let copyList: StoredCopy[] = [];
let nextCopyId = 1;
let loanList: StoredLoan[] = [];
let nextLoanId = 1;

let periodList: Period[] = structuredClone(seedPeriods);
let nextPeriodId = seedNextPeriodId;
let roomList: Room[] = structuredClone(seedRooms);
let nextRoomId = seedNextRoomId;

/**
 * The timetable, as the only record it actually is.
 *
 * Names are not stored — a slot holds ids and the read path resolves them, so
 * renaming a subject cannot leave a stale label in three thousand cells.
 */
interface StoredSlot {
  id: number;
  class_id: number;
  section_id: number;
  day_of_week: Weekday;
  period_id: number;
  subject_id: number;
  teacher_id: number;
  room_id: number | null;
}

let timetableSlots: StoredSlot[] = [];
let nextSlotId = 1;

let examList: ExamDetail[] = structuredClone(seedExams);
let nextExamId = seedNextExamId;
let nextPaperId = seedNextPaperId;

/**
 * Marks, keyed by paper and student.
 *
 * Held flat rather than nested under the paper so a result — which reads
 * across every paper a student sat — is a lookup per subject instead of a
 * scan of the whole schedule.
 */
const examMarks = new Map<
  string,
  { marks_obtained: number | null; is_absent: boolean; remarks: string | null }
>();
const examMarkKey = (paperId: number, studentId: number) => `${paperId}|${studentId}`;

/**
 * Published results, keyed by exam, class and section.
 *
 * The ranks are frozen at publication rather than recomputed on read: a
 * printed report card that says "4th of 38" must keep saying that after a
 * later mark correction moves somebody else up.
 */
const publishedResults = new Map<
  string,
  { published_at: string; remarks: string | null; ranks: Record<number, number> }
>();
const resultKey = (examId: number, classId: number, sectionId: number | null) =>
  `${examId}|${classId}|${sectionId ?? 'all'}`;

let staff: StaffMemberDetail[] = seedStaff.map((member) => ({ ...member }));
let nextStaffId = staff.length + 1;
const documentsByStaff: Record<number, StaffDocument[]> = structuredClone(seedStaffDocuments);

// The seeded documents must be reflected in each owner's count.
for (const key of Object.keys(documentsByStudent)) {
  const id = Number(key);
  students = students.map((student) =>
    student.id === id ? { ...student, documents_count: documentsByStudent[id].length } : student,
  );
}

for (const key of Object.keys(documentsByTeacher)) {
  const id = Number(key);
  teachers = teachers.map((teacher) =>
    teacher.id === id ? { ...teacher, documents_count: documentsByTeacher[id].length } : teacher,
  );
}

for (const key of Object.keys(documentsByStaff)) {
  const id = Number(key);
  staff = staff.map((member) =>
    member.id === id ? { ...member, documents_count: documentsByStaff[id].length } : member,
  );
}

/**
 * The request body is validated client-side before it gets here, so a mock
 * handler can take it at face value. Real controllers must not.
 */
const asGroup = <K extends keyof SchoolSettings>(body: unknown): SchoolSettings[K] =>
  body as SchoolSettings[K];

/** Stamp the mutation time and keep the embedded current session in step. */
function touchSettings(patch: Partial<SchoolSettings>): SchoolSettings {
  settings = {
    ...settings,
    ...patch,
    current_academic_year: academicYears.find((year) => year.is_current) ?? null,
    updated_at: new Date().toISOString(),
  };
  return settings;
}

let sessions: AuthSessionToken[] = [
  {
    id: 1,
    name: 'Chrome on Windows',
    ip_address: '192.168.1.24',
    user_agent: navigator.userAgent,
    last_used_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    is_current: true,
  },
  {
    id: 2,
    name: 'Safari on iOS',
    ip_address: '192.168.1.31',
    last_used_at: new Date(Date.now() - 86_400_000).toISOString(),
    user_agent: 'Mozilla/5.0 (iPhone)',
    created_at: new Date(Date.now() - 7 * 86_400_000).toISOString(),
    is_current: false,
  },
];

// --- response helpers -------------------------------------------------------

const ok = <T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
  headers: Record<string, string> = {},
): AxiosResponse<T> => ({
  data,
  status,
  statusText: 'OK',
  headers,
  config,
});

/** File response, complete with the header the download helper parses. */
const fileResponse = (
  config: InternalAxiosRequestConfig,
  body: string,
  filename: string,
): AxiosResponse<Blob> =>
  ok(config, new Blob([body], { type: 'text/plain' }), 200, {
    'content-disposition': `attachment; filename="${filename}"`,
  });

const failure = (
  config: InternalAxiosRequestConfig,
  status: number,
  message: string,
  errors?: Record<string, string[]>,
) =>
  Promise.reject(
    new AxiosError(message, String(status), config, {}, {
      data: { message, ...(errors ? { errors } : {}) },
      status,
      statusText: 'Error',
      headers: {},
      config,
    } as AxiosResponse),
  );

/** Laravel-style 422 so `applyServerErrors` has something real to map. */
const unprocessable = (
  config: InternalAxiosRequestConfig,
  errors: Record<string, string[]>,
  message = 'The given data was invalid.',
) => failure(config, 422, message, errors);

/** Network latency, so skeletons and pending states are actually visible. */
const latency = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// --- request parsing --------------------------------------------------------

interface ParsedRequest {
  method: string;
  path: string;
  params: URLSearchParams;
  body: Record<string, unknown>;
  /** Present for multipart uploads, where `body` is empty. */
  formData: FormData | null;
}

function parse(config: InternalAxiosRequestConfig): ParsedRequest {
  const raw = (config.url ?? '').replace(config.baseURL ?? '', '');
  const [path] = raw.split('?');

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(config.params ?? {})) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }

  let body: Record<string, unknown> = {};
  if (typeof config.data === 'string') {
    try {
      body = JSON.parse(config.data) as Record<string, unknown>;
    } catch {
      body = {};
    }
  } else if (config.data && !(config.data instanceof FormData)) {
    body = config.data as Record<string, unknown>;
  }

  return {
    method: (config.method ?? 'get').toUpperCase(),
    path: path.replace(/\/$/, ''),
    params,
    body,
    formData: config.data instanceof FormData ? config.data : null,
  };
}

// --- roles: list shaping ----------------------------------------------------

function listRoles(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const sortBy = params.get('sort_by') ?? 'name';
  const sortDir = params.get('sort_dir') === 'desc' ? -1 : 1;

  let rows = roles.map(toRoleSummary);

  if (search) rows = rows.filter((role) => role.name.toLowerCase().includes(search));

  rows.sort((a, b) => {
    const left = a[sortBy as keyof typeof a];
    const right = b[sortBy as keyof typeof b];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sortDir;
    return String(left).localeCompare(String(right)) * sortDir;
  });

  if (params.get('per_page') === 'all') return { data: rows };

  const perPage = Number(params.get('per_page')) || 25;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), lastPage);
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);

  return {
    data: slice,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: slice.length ? start + 1 : null,
      last_page: lastPage,
      path: '/roles',
      per_page: perPage,
      to: slice.length ? start + slice.length : null,
      total,
    },
  };
}

// --- students ---------------------------------------------------------------

const findStudent = (path: string): StudentDetail | undefined => {
  const id = Number(/\/students\/(\d+)/.exec(path)?.[1]);
  return students.find((student) => student.id === id);
};

const syncDocumentCount = (id: number) => {
  students = students.map((student) =>
    student.id === id
      ? { ...student, documents_count: (documentsByStudent[id] ?? []).length }
      : student,
  );
};

const syncTeacherDocumentCount = (id: number) => {
  teachers = teachers.map((teacher) =>
    teacher.id === id
      ? { ...teacher, documents_count: (documentsByTeacher[id] ?? []).length }
      : teacher,
  );
};

/** Search + filters, shared by the list and the export so they never diverge. */
function filterStudents(params: URLSearchParams): StudentDetail[] {
  const search = (params.get('search') ?? '').trim().toLowerCase();

  return students.filter((student) => {
    if (
      search &&
      ![student.full_name, student.admission_no, student.primary_guardian_phone ?? '', student.phone ?? '']
        .join(' ')
        .toLowerCase()
        .includes(search)
    ) {
      return false;
    }

    const classId = params.get('class_id');
    if (classId && student.class_id !== Number(classId)) return false;

    const sectionId = params.get('section_id');
    if (sectionId && student.section_id !== Number(sectionId)) return false;

    const status = params.get('status');
    if (status && student.status !== status) return false;

    const gender = params.get('gender');
    if (gender && student.gender !== gender) return false;

    return true;
  });
}

function listStudents(params: URLSearchParams) {
  const sortBy = params.get('sort_by') ?? 'admission_no';
  const sortDir = params.get('sort_dir') === 'desc' ? -1 : 1;

  const rows = filterStudents(params).sort((a, b) => {
    const left = a[sortBy as keyof StudentDetail];
    const right = b[sortBy as keyof StudentDetail];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sortDir;
    return String(left ?? '').localeCompare(String(right ?? '')) * sortDir;
  });

  const perPage = Number(params.get('per_page')) || 25;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), lastPage);
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);

  return {
    data: slice,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: slice.length ? start + 1 : null,
      last_page: lastPage,
      path: '/students',
      per_page: perPage,
      to: slice.length ? start + slice.length : null,
      total,
    },
  };
}

/**
 * Assemble a stored record from a create/update payload.
 *
 * Resolves the denormalised fields a real API would fill from relations —
 * class and section names, the primary guardian's contact details.
 */
function buildStudentFromPayload(id: number, body: Record<string, unknown>): StudentDetail {
  const payload = body as unknown as StudentDetail & {
    guardians: StudentDetail['guardians'];
  };

  const klass = classes.find((entry) => entry.id === payload.class_id);
  const section = klass?.sections.find((entry) => entry.id === payload.section_id);
  const guardians = (payload.guardians ?? []).map((guardian, index) => ({
    ...guardian,
    id: id * 100 + index,
  }));
  const primary = guardians.find((guardian) => guardian.is_primary) ?? guardians[0];

  return {
    ...payload,
    id,
    full_name: [payload.first_name, payload.last_name].filter(Boolean).join(' '),
    photo_url: null,
    class_name: klass?.name ?? 'Unassigned',
    section_name: section?.name ?? null,
    academic_year_id: 3,
    academic_year_name: '2025-2026',
    guardians,
    primary_guardian_name: primary?.name ?? null,
    primary_guardian_phone: primary?.phone ?? null,
    documents_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// --- teachers ---------------------------------------------------------------

const findTeacher = (path: string): TeacherDetail | undefined => {
  const id = Number(/\/teachers\/(\d+)/.exec(path)?.[1]);
  return teachers.find((teacher) => teacher.id === id);
};

function filterTeachers(params: URLSearchParams): TeacherDetail[] {
  const search = (params.get('search') ?? '').trim().toLowerCase();

  return teachers.filter((teacher) => {
    if (
      search &&
      ![teacher.full_name, teacher.employee_id, teacher.email, teacher.phone]
        .join(' ')
        .toLowerCase()
        .includes(search)
    ) {
      return false;
    }

    const department = params.get('department');
    if (department && teacher.department !== department) return false;

    const status = params.get('status');
    if (status && teacher.status !== status) return false;

    const employmentType = params.get('employment_type');
    if (employmentType && teacher.employment_type !== employmentType) return false;

    const subjectId = params.get('subject_id');
    if (subjectId && !teacher.subjects.some((subject) => subject.id === Number(subjectId))) {
      return false;
    }

    return true;
  });
}

function listTeachers(params: URLSearchParams) {
  const sortBy = params.get('sort_by') ?? 'full_name';
  const sortDir = params.get('sort_dir') === 'desc' ? -1 : 1;

  const rows = filterTeachers(params).sort((a, b) => {
    const left = a[sortBy as keyof TeacherDetail];
    const right = b[sortBy as keyof TeacherDetail];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sortDir;
    return String(left ?? '').localeCompare(String(right ?? '')) * sortDir;
  });

  const perPage = Number(params.get('per_page')) || 25;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), lastPage);
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);

  return {
    data: slice,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: slice.length ? start + 1 : null,
      last_page: lastPage,
      path: '/teachers',
      per_page: perPage,
      to: slice.length ? start + slice.length : null,
      total,
    },
  };
}

/** Whole years between two dates, used to total prior experience. */
const yearsBetween = (from: string, to: string | null): number => {
  const start = new Date(from).getTime();
  const end = to ? new Date(to).getTime() : Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.floor((end - start) / (365.25 * 24 * 60 * 60 * 1000));
};

/**
 * Assemble a stored teacher from a create/update payload.
 *
 * Resolves what a real API would fill from relations: subject records from
 * their ids, class and section names, the class-teacher summary, and the
 * total experience computed from the experience rows.
 */
function buildTeacherFromPayload(id: number, body: Record<string, unknown>): TeacherDetail {
  const payload = body as unknown as TeacherDetail & {
    subject_ids: number[];
    class_assignments: { class_id: number; section_id: number | null; is_class_teacher: boolean }[];
    experiences: { from_date: string; to_date: string | null }[];
  };

  const assigned = (payload.subject_ids ?? [])
    .map((subjectId) => subjects.find((subject) => subject.id === subjectId))
    .filter((subject): subject is (typeof subjects)[number] => Boolean(subject));

  const assignments = (payload.class_assignments ?? []).map((assignment) => {
    const klass = classes.find((entry) => entry.id === assignment.class_id);
    const section = klass?.sections.find((entry) => entry.id === assignment.section_id);

    return {
      class_id: assignment.class_id,
      class_name: klass?.name ?? 'Unassigned',
      section_id: assignment.section_id,
      section_name: section?.name ?? null,
      is_class_teacher: assignment.is_class_teacher,
    };
  });

  const classTeacherOf = assignments.find((assignment) => assignment.is_class_teacher);

  const experienceYears = (payload.experiences ?? []).reduce(
    (total, experience) => total + yearsBetween(experience.from_date, experience.to_date),
    0,
  );

  return {
    ...payload,
    id,
    full_name: [payload.first_name, payload.last_name].filter(Boolean).join(' '),
    photo_url: null,
    subjects: assigned,
    subjects_count: assigned.length,
    class_assignments: assignments,
    classes_count: assignments.length,
    class_teacher_of: classTeacherOf
      ? `${classTeacherOf.class_name}${classTeacherOf.section_name ? ` — ${classTeacherOf.section_name}` : ''}`
      : null,
    experience_years: experienceYears,
    qualifications: (payload.qualifications ?? []).map((qualification, index) => ({
      ...qualification,
      id: id * 100 + index,
    })),
    experiences: (payload.experiences ?? []).map((experience, index) => ({
      ...experience,
      id: id * 200 + index,
    })) as TeacherDetail['experiences'],
    documents_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// --- staff ------------------------------------------------------------------

const findStaff = (path: string): StaffMemberDetail | undefined => {
  const id = Number(/\/staff\/(\d+)/.exec(path)?.[1]);
  return staff.find((member) => member.id === id);
};

const syncStaffDocumentCount = (id: number) => {
  staff = staff.map((member) =>
    member.id === id
      ? { ...member, documents_count: (documentsByStaff[id] ?? []).length }
      : member,
  );
};

function listStaff(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();

  const filtered = staff.filter((member) => {
    if (
      search &&
      ![member.full_name, member.employee_id, member.phone, member.email]
        .join(' ')
        .toLowerCase()
        .includes(search)
    ) {
      return false;
    }

    for (const [key, value] of [
      ['staff_type', member.staff_type],
      ['status', member.status],
      ['employment_type', member.employment_type],
      ['shift', member.shift],
    ] as const) {
      const wanted = params.get(key);
      if (wanted && value !== wanted) return false;
    }

    return true;
  });

  const sortBy = params.get('sort_by') ?? 'full_name';
  const sortDir = params.get('sort_dir') === 'desc' ? -1 : 1;

  const rows = filtered.sort((a, b) => {
    const left = a[sortBy as keyof StaffMemberDetail];
    const right = b[sortBy as keyof StaffMemberDetail];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sortDir;
    return String(left ?? '').localeCompare(String(right ?? '')) * sortDir;
  });

  const perPage = Number(params.get('per_page')) || 25;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), lastPage);
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);

  return {
    data: slice,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: slice.length ? start + 1 : null,
      last_page: lastPage,
      path: '/staff',
      per_page: perPage,
      to: slice.length ? start + slice.length : null,
      total,
    },
  };
}

function buildStaffFromPayload(id: number, body: Record<string, unknown>): StaffMemberDetail {
  const payload = body as unknown as StaffMemberDetail;

  return {
    ...payload,
    id,
    full_name: [payload.first_name, payload.last_name].filter(Boolean).join(' '),
    photo_url: null,
    documents_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// --- classes & sections -----------------------------------------------------

const findClass = (path: string): SchoolClass | undefined => {
  const id = Number(/\/academics\/classes\/(\d+)/.exec(path)?.[1]);
  return classes.find((entry) => entry.id === id);
};

/** Recompute the aggregates a real API would derive from the sections. */
function withAggregates(schoolClass: SchoolClass): SchoolClass {
  return {
    ...schoolClass,
    sections_count: schoolClass.sections.length,
    students_count: schoolClass.sections.reduce((total, s) => total + s.students_count, 0),
    total_capacity: schoolClass.sections.reduce((total, s) => total + s.capacity, 0),
    updated_at: new Date().toISOString(),
  };
}

const saveClass = (updated: SchoolClass) => {
  const stamped = withAggregates(updated);
  classes = classes.map((entry) => (entry.id === stamped.id ? stamped : entry));
  return stamped;
};

/** The index returns aggregates without the nested sections. */
const toClassSummary = ({ sections: _sections, ...rest }: SchoolClass) => rest;

function listClasses(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const status = params.get('status');

  const filtered = classes.filter((entry) => {
    if (search && !entry.name.toLowerCase().includes(search)) return false;
    if (status === 'active' && !entry.is_active) return false;
    if (status === 'inactive' && entry.is_active) return false;
    return true;
  });

  const sortBy = params.get('sort_by') ?? 'level';
  const sortDir = params.get('sort_dir') === 'desc' ? -1 : 1;

  const rows = filtered.map(toClassSummary).sort((a, b) => {
    const left = a[sortBy as keyof typeof a];
    const right = b[sortBy as keyof typeof b];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sortDir;
    return String(left ?? '').localeCompare(String(right ?? '')) * sortDir;
  });

  const perPage = Number(params.get('per_page')) || 25;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), lastPage);
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);

  return {
    data: slice,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: slice.length ? start + 1 : null,
      last_page: lastPage,
      path: '/academics/classes',
      per_page: perPage,
      to: slice.length ? start + slice.length : null,
      total,
    },
  };
}

// --- subjects ---------------------------------------------------------------

const findSubject = (path: string): Subject | undefined => {
  const id = Number(/\/academics\/subjects\/(\d+)/.exec(path)?.[1]);
  return subjects.find((entry) => entry.id === id);
};

/**
 * Teachers assigned to a subject, derived from the teacher records.
 *
 * subject↔teacher is one relationship; keeping the teachers as the single
 * source and deriving the subject side means the two views cannot disagree.
 */
const teachersForSubject = (subjectId: number) =>
  teachers
    .filter((teacher) => teacher.subjects.some((subject) => subject.id === subjectId))
    .map((teacher) => ({
      id: teacher.id,
      full_name: teacher.full_name,
      employee_id: teacher.employee_id,
      designation: teacher.designation,
      photo_url: teacher.photo_url,
    }));

/** Recompute the aggregates a real API would derive. */
function withSubjectAggregates(subject: Subject): Subject {
  return {
    ...subject,
    total_max_marks:
      (subject.has_theory ? (subject.theory_max_marks ?? 0) : 0) +
      (subject.has_practical ? (subject.practical_max_marks ?? 0) : 0),
    teachers_count: teachersForSubject(subject.id).length,
    updated_at: new Date().toISOString(),
  };
}

const withTeachers = (subject: Subject) => ({
  ...withSubjectAggregates(subject),
  teachers: teachersForSubject(subject.id),
});

function listSubjects(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const component = params.get('component');
  const status = params.get('status');
  const elective = params.get('elective');

  const filtered = subjects.map(withSubjectAggregates).filter((subject) => {
    if (search && ![subject.name, subject.code].join(' ').toLowerCase().includes(search)) {
      return false;
    }
    if (component === 'theory' && !subject.has_theory) return false;
    if (component === 'practical' && !subject.has_practical) return false;
    if (component === 'both' && !(subject.has_theory && subject.has_practical)) return false;
    if (status === 'active' && !subject.is_active) return false;
    if (status === 'inactive' && subject.is_active) return false;
    if (elective === 'yes' && !subject.is_elective) return false;
    if (elective === 'no' && subject.is_elective) return false;
    return true;
  });

  const sortBy = params.get('sort_by') ?? 'name';
  const sortDir = params.get('sort_dir') === 'desc' ? -1 : 1;

  const rows = filtered.sort((a, b) => {
    const left = a[sortBy as keyof Subject];
    const right = b[sortBy as keyof Subject];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sortDir;
    return String(left ?? '').localeCompare(String(right ?? '')) * sortDir;
  });

  const perPage = Number(params.get('per_page')) || 25;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), lastPage);
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);

  return {
    data: slice,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: slice.length ? start + 1 : null,
      last_page: lastPage,
      path: '/academics/subjects',
      per_page: perPage,
      to: slice.length ? start + slice.length : null,
      total,
    },
  };
}

function buildSubjectFromPayload(id: number, body: Record<string, unknown>): Subject {
  const payload = body as unknown as Subject;

  return withSubjectAggregates({
    ...payload,
    id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

// --- attendance -------------------------------------------------------------

const todayIso = () => new Date().toISOString().slice(0, 10);

/** Sunday is the weekly off; Saturdays are working days at this school. */
const isWeekend = (date: string) => new Date(`${date}T00:00:00`).getDay() === 0;

/** The holiday covering a date for a population, if any. */
function holidayFor(date: string, type: AttendanceType): Holiday | null {
  const audience = type === 'student' ? 'students' : 'employees';

  return (
    holidays.find(
      (holiday) =>
        date >= holiday.start_date &&
        date <= holiday.end_date &&
        (holiday.scope === 'all' || holiday.scope === audience),
    ) ?? null
  );
}

/**
 * Approved leave covering a date.
 *
 * A real lookup against the leave register — the two modules share one
 * discriminator (`ApplicantType` *is* `AttendanceType`) precisely so a person
 * on approved leave is the same person whose attendance row gets locked. Only
 * `ABSENT_STATUSES` counts: a pending request is not permission to be away,
 * and a cancelled one is permission withdrawn.
 */
function leaveFor(type: AttendanceType, date: string, personId: number) {
  const application = leaveApplications.find(
    (entry) =>
      entry.applicant_type === type &&
      entry.applicant_id === personId &&
      ABSENT_STATUSES.includes(entry.status) &&
      date >= entry.from_date &&
      date <= entry.to_date,
  );

  if (!application) return null;

  const leaveType = leaveTypes.find((entry) => entry.id === application.leave_type_id);

  return {
    id: application.id,
    type: leaveType?.name ?? 'Leave',
    reason: application.reason,
    from_date: application.from_date,
    to_date: application.to_date,
  };
}

/** The roster a sheet is built from. */
function rosterFor(type: AttendanceType, classId: number | null, sectionId: number | null) {
  if (type === 'student') {
    return students
      .filter((student) => student.status === 'active')
      .filter((student) => (classId ? student.class_id === classId : true))
      .filter((student) => (sectionId ? student.section_id === sectionId : true))
      .map((student) => ({
        person_id: student.id,
        person_name: student.full_name,
        identifier: student.admission_no,
        photo_url: student.photo_url,
        group_label: student.section_name
          ? `${student.class_name} — ${student.section_name}`
          : student.class_name,
      }));
  }

  if (type === 'teacher') {
    return teachers
      .filter((teacher) => teacher.status === 'active')
      .map((teacher) => ({
        person_id: teacher.id,
        person_name: teacher.full_name,
        identifier: teacher.employee_id,
        photo_url: teacher.photo_url,
        group_label: teacher.department,
      }));
  }

  return staff
    .filter((member) => member.status === 'active')
    .map((member) => ({
      person_id: member.id,
      person_name: member.full_name,
      identifier: member.employee_id,
      photo_url: member.photo_url,
      group_label: member.designation,
    }));
}

function buildSheet(type: AttendanceType, date: string, classId: number | null, sectionId: number | null) {
  const holiday = holidayFor(date, type);
  const weekend = isWeekend(date);
  const future = date > todayIso();

  const entries: AttendanceEntry[] = rosterFor(type, classId, sectionId).map((person) => {
    const leave = leaveFor(type, date, person.person_id);
    const mark = attendanceMarks.get(markKey(type, date, person.person_id));

    // An approved leave wins over whatever was marked — attendance must not
    // contradict it.
    if (leave) {
      return {
        ...person,
        status: 'leave' as const,
        source: 'leave' as const,
        check_in_at: null,
        check_out_at: null,
        remarks: null,
        leave,
      };
    }

    return {
      ...person,
      status: mark?.status ?? null,
      source: mark?.source ?? null,
      check_in_at:
        mark && mark.source !== 'manual' ? `${date}T08:${String(30 + (person.person_id % 25)).slice(0, 2)}:00Z` : null,
      check_out_at: null,
      remarks: mark?.remarks ?? null,
      leave: null,
    };
  });

  const summary = {
    present: 0, absent: 0, late: 0, half_day: 0, leave: 0, unmarked: 0, total: entries.length,
  };

  for (const entry of entries) {
    if (entry.status) summary[entry.status] += 1;
    else summary.unmarked += 1;
  }

  const lockReason = holiday
    ? `${holiday.name} — attendance is not taken.`
    : weekend
      ? 'Sunday is a weekly off.'
      : future
        ? 'This date has not happened yet.'
        : null;

  return {
    date,
    type,
    class_id: classId,
    section_id: sectionId,
    holiday,
    is_locked: lockReason !== null,
    lock_reason: lockReason,
    entries,
    summary,
  };
}

/** Deterministic history, so a monthly report is never empty on a fresh boot. */
function seededStatus(personId: number, date: string): AttendanceStatus {
  const day = new Date(`${date}T00:00:00`).getDate();
  const seed = (personId * 31 + day * 7) % 100;

  if (seed < 82) return 'present';
  if (seed < 90) return 'absent';
  if (seed < 95) return 'late';
  if (seed < 98) return 'half_day';
  return 'leave';
}

function buildMonthlyReport(
  type: AttendanceType,
  year: number,
  month: number,
  classId: number | null,
  sectionId: number | null,
) {
  const totalDays = new Date(year, month, 0).getDate();
  const today = todayIso();

  const nonWorking: number[] = [];
  const workingDates: { day: number; date: string }[] = [];

  for (let day = 1; day <= totalDays; day += 1) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (isWeekend(date) || holidayFor(date, type)) nonWorking.push(day);
    // A day that has not happened is not yet a working day either.
    else if (date <= today) workingDates.push({ day, date });
    else nonWorking.push(day);
  }

  const rows = rosterFor(type, classId, sectionId).map((person) => {
    const days: Record<number, AttendanceStatus | null> = {};
    const counts = { present: 0, absent: 0, late: 0, half_day: 0, leave: 0 };

    for (const { day, date } of workingDates) {
      const mark = attendanceMarks.get(markKey(type, date, person.person_id));
      // Approved leave outranks both a mark and the seeded history: the
      // register must not say somebody was present on a day the school
      // granted them off.
      const status = leaveFor(type, date, person.person_id)
        ? ('leave' as const)
        : (mark?.status ?? seededStatus(person.person_id, date));

      days[day] = status;
      counts[status] += 1;
    }

    const working = workingDates.length;
    // Late still counts as attending — the student was there.
    const attended = counts.present + counts.late;

    return {
      person_id: person.person_id,
      person_name: person.person_name,
      identifier: person.identifier,
      group_label: person.group_label,
      days,
      present_days: counts.present,
      absent_days: counts.absent,
      leave_days: counts.leave,
      late_days: counts.late,
      working_days: working,
      attendance_percent: working === 0 ? 0 : Math.round((attended / working) * 100),
    };
  });

  return {
    year,
    month,
    type,
    working_days: workingDates.length,
    non_working_days: nonWorking,
    rows,
  };
}

function listHolidays(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const year = params.get('year');
  const type = params.get('type');
  const scope = params.get('scope');

  const filtered = holidays.filter((holiday) => {
    if (search && !holiday.name.toLowerCase().includes(search)) return false;
    if (year && !holiday.start_date.startsWith(year)) return false;
    if (type && holiday.type !== type) return false;
    if (scope && holiday.scope !== scope) return false;
    return true;
  });

  if (params.get('per_page') === 'all') return { data: filtered };

  const sortBy = params.get('sort_by') ?? 'start_date';
  const sortDir = params.get('sort_dir') === 'desc' ? -1 : 1;

  const rows = filtered.sort((a, b) => {
    const left = a[sortBy as keyof Holiday];
    const right = b[sortBy as keyof Holiday];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sortDir;
    return String(left ?? '').localeCompare(String(right ?? '')) * sortDir;
  });

  const perPage = Number(params.get('per_page')) || 25;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), lastPage);
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);

  return {
    data: slice,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: slice.length ? start + 1 : null,
      last_page: lastPage,
      path: '/holidays',
      per_page: perPage,
      to: slice.length ? start + slice.length : null,
      total,
    },
  };
}

const holidayDays = (start: string, end: string) =>
  Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;

// --- fees -------------------------------------------------------------------

/** All money maths in paise, then back — see `lib/money.ts` for the why. */
const minor = (amount: number) => Math.round(amount * 100);
const major = (paise: number) => Math.round(paise) / 100;

/** Overdue fine: ₹10 a day after a 7-day grace period, capped at ₹1000. */
function fineFor(daysOverdue: number): number {
  if (daysOverdue <= 7) return 0;
  return Math.min(1000, (daysOverdue - 7) * 10);
}

const daysBetween = (from: string, to: string) =>
  Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);

/**
 * Shared date helpers.
 *
 * Declared up here with `daysBetween` rather than beside the first module
 * that wanted them: several sections seed themselves at module load, and a
 * `const` defined further down the file is in the temporal dead zone when
 * an earlier section's seeder runs.
 */
const TODAY_DATE = () => new Date().toISOString().slice(0, 10);

/**
 * All of it in UTC, deliberately.
 *
 * `new Date('2026-08-07T00:00:00')` is parsed as *local* midnight but
 * `toISOString()` formats in UTC, so a naive round-trip shifts by a day
 * anywhere east of Greenwich — which is where this school is. Parsing with
 * the `Z` and stepping with `setUTCDate` keeps `shiftDate`, `TODAY_DATE` and
 * `daysBetween` on one clock.
 */
const shiftDate = (from: string, days: number): string => {
  const date = new Date(`${from}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const structureForStudent = (student: StudentDetail) =>
  feeStructures.find((entry) => entry.is_active && entry.class_id === student.class_id) ?? null;

/** Structures that have at least one student billed against them. */
function structureStudentCount(structureId: number): number {
  const structure = feeStructures.find((entry) => entry.id === structureId);
  if (!structure) return 0;

  return students.filter(
    (student) => student.status === 'active' && student.class_id === structure.class_id,
  ).length;
}

function buildAccount(student: StudentDetail) {
  const structure = structureForStudent(student);
  const today = todayIso();

  const dues: StudentDue[] = (structure?.installments ?? []).map((installment) => {
    const key = dueKey(student.id, installment.id);
    const paid = paidByDue.get(key) ?? 0;
    const discount = discountByDue.get(key) ?? 0;
    const overdueDays = installment.due_date < today ? daysBetween(installment.due_date, today) : 0;

    const gross = installment.amount;
    // No fine once the instalment is settled — a paid due stops accruing.
    const fine = minor(paid) + minor(discount) >= minor(gross) ? 0 : fineFor(overdueDays);
    const payable = major(minor(gross) - minor(discount) + minor(fine));
    const balance = major(Math.max(0, minor(payable) - minor(paid)));

    const status: StudentDue['status'] =
      balance <= 0 ? 'paid' : paid > 0 ? 'partial' : overdueDays > 0 ? 'overdue' : 'pending';

    return {
      id: installment.id,
      installment_id: installment.id,
      installment_name: installment.name,
      sequence: installment.sequence,
      due_date: installment.due_date,
      gross_amount: gross,
      discount_amount: discount,
      fine_amount: fine,
      payable_amount: payable,
      paid_amount: paid,
      balance,
      status,
      days_overdue: balance > 0 ? overdueDays : 0,
    };
  });

  const sum = (pick: (due: StudentDue) => number) => major(dues.reduce((t, d) => t + minor(pick(d)), 0));

  return {
    student_id: student.id,
    student_name: student.full_name,
    admission_no: student.admission_no,
    photo_url: student.photo_url,
    class_name: student.class_name,
    section_name: student.section_name,
    structure_id: structure?.id ?? null,
    structure_name: structure?.name ?? null,
    total_payable: sum((d) => d.payable_amount),
    total_discount: sum((d) => d.discount_amount),
    total_fine: sum((d) => d.fine_amount),
    total_paid: sum((d) => d.paid_amount),
    balance: sum((d) => d.balance),
    dues,
  };
}

const withStructureCounts = (structure: FeeStructureDetail) => ({
  ...structure,
  total_amount: major(structure.items.reduce((t, item) => t + minor(item.amount), 0)),
  items_count: structure.items.length,
  installments_count: structure.installments.length,
  students_count: structureStudentCount(structure.id),
});

const toStructureSummary = ({ items: _i, installments: _n, ...rest }: FeeStructureDetail) => rest;

/** Assemble a stored structure from a create/update payload. */
function buildStructureFromPayload(id: number, body: Record<string, unknown>): FeeStructureDetail {
  const payload = body as unknown as FeeStructureDetail & {
    items: { fee_type_id: number; amount: number; frequency: string }[];
    installments: { sequence: number; name: string; due_date: string; amount: number }[];
  };

  const klass = classes.find((entry) => entry.id === payload.class_id);
  const section = klass?.sections.find((entry) => entry.id === payload.section_id);
  const year = academicYears.find((entry) => entry.id === payload.academic_year_id);

  const items = (payload.items ?? []).map((item, index) => {
    const feeType = feeTypes.find((entry) => entry.id === item.fee_type_id);
    return {
      id: id * 1000 + index,
      fee_type_id: item.fee_type_id,
      fee_type_name: feeType?.name ?? 'Unknown',
      fee_type_code: feeType?.code ?? '—',
      amount: item.amount,
      frequency: item.frequency as FeeStructureDetail['items'][number]['frequency'],
    };
  });

  const installments = (payload.installments ?? []).map((installment, index) => ({
    id: id * 1000 + 500 + index,
    sequence: installment.sequence,
    name: installment.name,
    due_date: installment.due_date,
    amount: installment.amount,
  }));

  return {
    ...payload,
    id,
    class_name: klass?.name ?? 'Unassigned',
    section_name: section?.name ?? null,
    academic_year_name: year?.name ?? `${new Date().getFullYear()}`,
    items,
    installments,
    total_amount: major(items.reduce((t, item) => t + minor(item.amount), 0)),
    items_count: items.length,
    installments_count: installments.length,
    students_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/** Fee types with their live usage count, which blocks deletion. */
const withTypeUsage = (feeType: FeeType) => ({
  ...feeType,
  structures_count: feeStructures.filter((structure) =>
    structure.items.some((item) => item.fee_type_id === feeType.id),
  ).length,
});

const withDiscountUsage = (discount: Discount) => ({
  ...discount,
  usages_count: payments.filter((payment) => !payment.is_cancelled && payment.discount_amount > 0 && payment.remarks?.includes(discount.code)).length,
});

function paginate<T>(rows: T[], params: URLSearchParams, path: string) {
  const perPage = Number(params.get('per_page')) || 25;
  const total = rows.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), lastPage);
  const start = (page - 1) * perPage;
  const slice = rows.slice(start, start + perPage);

  return {
    data: slice,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: slice.length ? start + 1 : null,
      last_page: lastPage,
      path,
      per_page: perPage,
      to: slice.length ? start + slice.length : null,
      total,
    },
  };
}

function sortRows<T>(rows: T[], params: URLSearchParams, fallback: string) {
  const sortBy = params.get('sort_by') ?? fallback;
  const sortDir = params.get('sort_dir') === 'desc' ? -1 : 1;

  return [...rows].sort((a, b) => {
    const left = (a as Record<string, unknown>)[sortBy];
    const right = (b as Record<string, unknown>)[sortBy];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * sortDir;
    return String(left ?? '').localeCompare(String(right ?? '')) * sortDir;
  });
}

/** The outstanding-dues report, built from every active student's account. */
function buildDueReport(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const classId = params.get('class_id');
  const sectionId = params.get('section_id');
  const overdueOnly = params.get('overdue_only') === '1';

  const rows = students
    .filter((student) => student.status === 'active')
    .filter((student) => (classId ? student.class_id === Number(classId) : true))
    .filter((student) => (sectionId ? student.section_id === Number(sectionId) : true))
    .filter((student) =>
      search
        ? [student.full_name, student.admission_no].join(' ').toLowerCase().includes(search)
        : true,
    )
    .map((student) => {
      const account = buildAccount(student);
      const overdue = account.dues.filter((due) => due.status === 'overdue');
      const primary = student.guardians.find((guardian) => guardian.is_primary);

      return {
        student_id: student.id,
        student_name: student.full_name,
        admission_no: student.admission_no,
        class_name: student.class_name,
        section_name: student.section_name,
        guardian_name: primary?.name ?? null,
        guardian_phone: primary?.phone ?? null,
        total_payable: account.total_payable,
        total_paid: account.total_paid,
        balance: account.balance,
        days_overdue: overdue[0]?.days_overdue ?? 0,
        overdue_installments: overdue.length,
      };
    })
    .filter((row) => row.balance > 0)
    .filter((row) => (overdueOnly ? row.days_overdue > 0 : true));

  const sorted = sortRows(rows, params, 'balance');
  const page = paginate(sorted, params, '/fees/reports/dues');

  return {
    ...page,
    totals: {
      students: rows.length,
      total_payable: major(rows.reduce((t, r) => t + minor(r.total_payable), 0)),
      total_paid: major(rows.reduce((t, r) => t + minor(r.total_paid), 0)),
      total_outstanding: major(rows.reduce((t, r) => t + minor(r.balance), 0)),
      overdue_students: rows.filter((row) => row.days_overdue > 0).length,
    },
  };
}

// --- homework ---------------------------------------------------------------

const findHomework = (path: string): HomeworkDetail | undefined => {
  const id = Number(/\/homework\/(\d+)/.exec(path)?.[1]);
  return homeworkList.find((entry) => entry.id === id);
};

/** Students the homework is set for. */
const homeworkRoster = (homework: HomeworkDetail) =>
  students
    .filter((student) => student.status === 'active')
    .filter((student) => student.class_id === homework.class_id)
    .filter((student) => (homework.section_id ? student.section_id === homework.section_id : true));

/**
 * Assemble one student's submission row.
 *
 * Status is derived, never stored: a stored "late" would go stale the moment
 * the due date moved.
 */
function buildSubmission(homework: HomeworkDetail, student: StudentDetail): Submission {
  const stored = submissionsByHomework.get(submissionKey(homework.id, student.id));

  const daysLate =
    stored?.submitted_at && stored.submitted_at.slice(0, 10) > homework.due_date
      ? daysBetween(homework.due_date, stored.submitted_at.slice(0, 10))
      : 0;

  const status: Submission['status'] = !stored?.submitted_at
    ? 'pending'
    : stored.marks_obtained !== null
      ? 'graded'
      : daysLate > 0
        ? 'late'
        : 'submitted';

  return {
    id: stored?.id ?? homework.id * 100_000 + student.id,
    homework_id: homework.id,
    student_id: student.id,
    student_name: student.full_name,
    admission_no: student.admission_no,
    photo_url: student.photo_url,
    status,
    submitted_at: stored?.submitted_at ?? null,
    days_late: daysLate,
    student_note: stored?.student_note ?? null,
    attachments: stored?.attachments ?? [],
    marks_obtained: stored?.marks_obtained ?? null,
    remarks: stored?.remarks ?? null,
    graded_at: stored?.graded_at ?? null,
    graded_by: stored?.graded_by ?? null,
  };
}

function buildSubmissions(homework: HomeworkDetail) {
  const rows = homeworkRoster(homework).map((student) => buildSubmission(homework, student));

  const graded = rows.filter((row) => row.marks_obtained !== null);
  const averageMinor = graded.length
    ? Math.round(
        graded.reduce((total, row) => total + (row.marks_obtained ?? 0) * 100, 0) / graded.length,
      )
    : null;

  return {
    data: rows,
    summary: {
      total: rows.length,
      pending: rows.filter((row) => row.status === 'pending').length,
      submitted: rows.filter((row) => row.status === 'submitted').length,
      late: rows.filter((row) => row.status === 'late').length,
      graded: graded.length,
      average_marks: averageMinor === null ? null : averageMinor / 100,
    },
  };
}

/** Live counts a real API would compute from the submissions table. */
function withHomeworkCounts(homework: HomeworkDetail): HomeworkDetail {
  const roster = homeworkRoster(homework);
  const rows = roster.map((student) => buildSubmission(homework, student));

  return {
    ...homework,
    is_overdue: homework.status === 'published' && homework.due_date < todayIso(),
    attachments_count: homework.attachments.length,
    students_count: homework.status === 'draft' ? 0 : roster.length,
    submitted_count: rows.filter((row) => row.submitted_at !== null).length,
    graded_count: rows.filter((row) => row.marks_obtained !== null).length,
  };
}

const toHomeworkSummary = ({ description: _d, attachments: _a, ...rest }: HomeworkDetail) => rest;

function listHomework(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();

  const rows = homeworkList
    .map(withHomeworkCounts)
    .filter((homework) => {
      if (search && !homework.title.toLowerCase().includes(search)) return false;

      const classId = params.get('class_id');
      if (classId && homework.class_id !== Number(classId)) return false;

      const sectionId = params.get('section_id');
      if (sectionId && homework.section_id !== Number(sectionId)) return false;

      const subjectId = params.get('subject_id');
      if (subjectId && homework.subject_id !== Number(subjectId)) return false;

      const status = params.get('status');
      if (status && homework.status !== status) return false;

      if (params.get('overdue') === '1' && !homework.is_overdue) return false;

      return true;
    })
    .map(toHomeworkSummary);

  return paginate(sortRows(rows, params, 'due_date'), params, '/homework');
}

function buildHomeworkFromPayload(id: number, body: Record<string, unknown>): HomeworkDetail {
  const payload = body as unknown as HomeworkDetail;

  const klass = classes.find((entry) => entry.id === payload.class_id);
  const section = klass?.sections.find((entry) => entry.id === payload.section_id);
  const subject = subjects.find((entry) => entry.id === payload.subject_id);
  const teacher = teachers.find((entry) => entry.email === currentUser?.email) ?? teachers[0];

  return {
    ...payload,
    id,
    class_name: klass?.name ?? 'Unassigned',
    section_name: section?.name ?? null,
    subject_name: subject?.name ?? 'Unknown',
    subject_code: subject?.code ?? '—',
    teacher_id: teacher?.id ?? 0,
    teacher_name: currentUser?.name ?? teacher?.full_name ?? 'Unknown',
    status: 'draft',
    is_overdue: false,
    attachments: [],
    attachments_count: 0,
    students_count: 0,
    submitted_count: 0,
    graded_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// --- assignments ------------------------------------------------------------

const findAssignment = (path: string): AssignmentDetail | undefined => {
  const id = Number(/\/assignments\/(\d+)/.exec(path)?.[1]);
  return assignmentList.find((entry) => entry.id === id);
};

/** Students the assignment is set for. */
const assignmentRoster = (assignment: AssignmentDetail) =>
  students
    .filter((student) => student.status === 'active')
    .filter((student) => student.class_id === assignment.class_id)
    .filter((student) =>
      assignment.section_id ? student.section_id === assignment.section_id : true,
    );

/** Build an attachment record from a multipart upload. */
function attachmentFromUpload(file: FormDataEntryValue | null | undefined, basePath: string): FileAttachment {
  const mime = file instanceof File ? file.type : 'application/octet-stream';
  const name = file instanceof File ? file.name : 'upload';

  const kind: FileAttachment['kind'] = mime === 'application/pdf'
    ? 'pdf'
    : mime.startsWith('image/')
      ? 'image'
      : mime.startsWith('video/')
        ? 'video'
        : 'other';

  return {
    id: nextAssignmentAttachmentId++,
    kind,
    file_name: name,
    mime_type: mime,
    size_bytes: file instanceof File ? file.size : 0,
    url: `${basePath}/${name}`,
    thumbnail_url: kind === 'image' || kind === 'video' ? `${basePath}/thumbs/${name}` : null,
    // A real backend probes the container for this.
    duration_seconds: kind === 'video' ? 180 : null,
    uploaded_at: new Date().toISOString(),
  };
}

/** A draft has no rows yet, but the marks card still needs a shape to read. */
const emptySubmissions = () => ({
  data: [],
  summary: {
    total: 0,
    pending: 0,
    submitted: 0,
    under_review: 0,
    evaluated: 0,
    returned: 0,
    average_marks: null,
    highest_marks: null,
    lowest_marks: null,
    pass_count: 0,
    fail_count: 0,
    distribution: GRADE_BANDS.map((band) => ({ grade: band.grade, count: 0 })),
    marks_published: false,
    published_at: null,
  },
});

/** The rubric, or the single synthetic criterion used without one. */
const criteriaOf = (assignment: AssignmentDetail): RubricCriterion[] =>
  assignment.rubric.length > 0
    ? assignment.rubric
    : [{ id: 0, name: 'Overall', description: null, max_marks: assignment.max_marks }];

/**
 * Work out an evaluation from per-criterion marks.
 *
 * The total, the penalty and the grade are computed here rather than accepted
 * from the client — two answers to "what did they score" is one too many.
 */
function computeEvaluation(
  assignment: AssignmentDetail,
  scores: { criterion_id: number; marks_awarded: number; comment: string | null }[],
  daysLate: number,
  waivePenalty: boolean,
  feedback: string | null,
): Evaluation {
  const rawMarks = scores.reduce((total, score) => total + (Number(score.marks_awarded) || 0), 0);

  const penaltyPerDay = (assignment.max_marks * assignment.late_penalty_percent) / 100;
  const latePenalty =
    waivePenalty || daysLate === 0
      ? 0
      : Math.min(rawMarks, Math.round(penaltyPerDay * daysLate * 100) / 100);

  const finalMarks = Math.max(0, Math.round((rawMarks - latePenalty) * 100) / 100);
  const percentage =
    assignment.max_marks > 0 ? Math.round((finalMarks / assignment.max_marks) * 1000) / 10 : 0;

  return {
    criteria_scores: scores,
    raw_marks: Math.round(rawMarks * 100) / 100,
    late_penalty: latePenalty,
    final_marks: finalMarks,
    percentage,
    grade: gradeFor(percentage),
    feedback,
    evaluated_by: currentUser?.name ?? 'System',
    evaluated_at: new Date().toISOString(),
    returned_at: null,
  };
}

/**
 * Assemble one student's submission row.
 *
 * Status is derived, never stored: a stored "late" would go stale the moment
 * the due date moved.
 */
function buildAssignmentSubmission(
  assignment: AssignmentDetail,
  student: StudentDetail,
): AssignmentSubmission {
  const stored = assignmentSubmissions.get(assignmentSubmissionKey(assignment.id, student.id));

  const daysLate =
    stored?.submitted_at && stored.submitted_at.slice(0, 10) > assignment.due_date
      ? daysBetween(assignment.due_date, stored.submitted_at.slice(0, 10))
      : 0;

  const status: AssignmentSubmission['status'] = !stored?.submitted_at
    ? 'pending'
    : stored.evaluation?.returned_at
      ? 'returned'
      : stored.evaluation
        ? 'evaluated'
        : // Resubmitted after a return, and waiting to be looked at again.
          (stored.attempt ?? 1) > 1
          ? 'under_review'
          : daysLate > 0
            ? 'late'
            : 'submitted';

  return {
    id: stored?.id ?? assignment.id * 100_000 + student.id,
    assignment_id: assignment.id,
    student_id: student.id,
    student_name: student.full_name,
    admission_no: student.admission_no,
    photo_url: student.photo_url,
    status,
    submitted_at: stored?.submitted_at ?? null,
    days_late: daysLate,
    attempt: stored?.attempt ?? 1,
    student_note: stored?.student_note ?? null,
    attachments: stored?.attachments ?? [],
    evaluation: stored?.evaluation ?? null,
    marks_published: assignment.marks_published_at !== null && Boolean(stored?.evaluation),
  };
}

/** A final evaluation — a returned one is not a result. */
const isMarked = (row: AssignmentSubmission) =>
  row.evaluation !== null && row.evaluation.returned_at === null;

function buildAssignmentSubmissions(assignment: AssignmentDetail) {
  const rows = assignmentRoster(assignment).map((student) =>
    buildAssignmentSubmission(assignment, student),
  );

  const marked = rows.filter(isMarked);
  const marks = marked.map((row) => row.evaluation!.final_marks);

  const averageMinor = marks.length
    ? Math.round(marks.reduce((total, value) => total + value * 100, 0) / marks.length)
    : null;

  const countOf = (status: AssignmentSubmission['status']) =>
    rows.filter((row) => row.status === status).length;

  return {
    data: rows,
    summary: {
      total: rows.length,
      pending: countOf('pending'),
      submitted: countOf('submitted') + countOf('late'),
      under_review: countOf('under_review'),
      evaluated: marked.length,
      returned: countOf('returned'),

      average_marks: averageMinor === null ? null : averageMinor / 100,
      highest_marks: marks.length ? Math.max(...marks) : null,
      lowest_marks: marks.length ? Math.min(...marks) : null,

      pass_count: marked.filter((row) => row.evaluation!.percentage >= PASS_PERCENT).length,
      fail_count: marked.filter((row) => row.evaluation!.percentage < PASS_PERCENT).length,
      distribution: GRADE_BANDS.map((band) => ({
        grade: band.grade,
        count: marked.filter((row) => row.evaluation!.grade === band.grade).length,
      })),

      marks_published: assignment.marks_published_at !== null,
      published_at: assignment.marks_published_at,
    },
  };
}

/** Live counts a real API would compute from the submissions table. */
function withAssignmentCounts(assignment: AssignmentDetail): AssignmentDetail {
  const roster = assignmentRoster(assignment);
  const rows = roster.map((student) => buildAssignmentSubmission(assignment, student));

  return {
    ...assignment,
    is_overdue: assignment.status === 'published' && assignment.due_date < todayIso(),
    has_rubric: assignment.rubric.length > 0,
    attachments_count: assignment.attachments.length,
    students_count: assignment.status === 'draft' ? 0 : roster.length,
    submitted_count: rows.filter((row) => row.submitted_at !== null).length,
    evaluated_count: rows.filter(isMarked).length,
  };
}

const toAssignmentSummary = ({
  instructions: _i,
  rubric: _r,
  attachments: _a,
  ...rest
}: AssignmentDetail) => rest;

function listAssignments(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();

  const rows = assignmentList
    .map(withAssignmentCounts)
    .filter((assignment) => {
      if (search && !assignment.title.toLowerCase().includes(search)) return false;

      const classId = params.get('class_id');
      if (classId && assignment.class_id !== Number(classId)) return false;

      const sectionId = params.get('section_id');
      if (sectionId && assignment.section_id !== Number(sectionId)) return false;

      const subjectId = params.get('subject_id');
      if (subjectId && assignment.subject_id !== Number(subjectId)) return false;

      const type = params.get('type');
      if (type && assignment.type !== type) return false;

      const status = params.get('status');
      if (status && assignment.status !== status) return false;

      const marksPublished = params.get('marks_published');
      if (marksPublished === '1' && assignment.marks_published_at === null) return false;
      if (marksPublished === '0' && assignment.marks_published_at !== null) return false;

      if (params.get('overdue') === '1' && !assignment.is_overdue) return false;

      return true;
    })
    .map(toAssignmentSummary);

  return paginate(sortRows(rows, params, 'due_date'), params, '/assignments');
}

function buildAssignmentFromPayload(
  id: number,
  body: Record<string, unknown>,
): AssignmentDetail {
  const payload = body as unknown as AssignmentDetail;

  const klass = classes.find((entry) => entry.id === payload.class_id);
  const section = klass?.sections.find((entry) => entry.id === payload.section_id);
  const subject = subjects.find((entry) => entry.id === payload.subject_id);
  const teacher = teachers.find((entry) => entry.email === currentUser?.email) ?? teachers[0];

  // A criterion the teacher just added arrives without an id.
  const rubric = (payload.rubric ?? []).map((criterion) => ({
    ...criterion,
    id: criterion.id && criterion.id > 0 ? criterion.id : nextCriterionId++,
  }));

  return {
    ...payload,
    id,
    class_name: klass?.name ?? 'Unassigned',
    section_name: section?.name ?? null,
    subject_name: subject?.name ?? 'Unknown',
    subject_code: subject?.code ?? '—',
    teacher_id: teacher?.id ?? 0,
    teacher_name: currentUser?.name ?? teacher?.full_name ?? 'Unknown',
    status: 'draft',
    is_overdue: false,
    rubric,
    has_rubric: rubric.length > 0,
    attachments: [],
    attachments_count: 0,
    students_count: 0,
    submitted_count: 0,
    evaluated_count: 0,
    marks_published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Seed submissions for the assignments that are already live.
 *
 * Without this the marks card, the grade spread and the "published marks"
 * state would only ever be reachable by hand-marking a class of thirty. The
 * spread is derived from student ids rather than randomised, so a reload shows
 * the same picture twice.
 */
function seedAssignmentSubmissions(): void {
  for (const assignment of assignmentList) {
    if (assignment.status === 'draft') continue;

    const marksReleased = assignment.marks_published_at !== null;

    assignmentRoster(assignment).forEach((student, index) => {
      const bucket = (student.id + index) % 10;
      // Two in ten never hand anything in — the state a teacher chases.
      if (bucket === 0 || bucket === 7) return;

      const daysLate = assignment.allows_late_submission && bucket === 3 ? 2 : 0;
      const submittedOn = new Date(assignment.due_date);
      submittedOn.setDate(submittedOn.getDate() + (daysLate || -1));

      const stored: StoredAssignmentSubmission = {
        id: nextAssignmentSubmissionId++,
        assignment_id: assignment.id,
        student_id: student.id,
        submitted_at: `${submittedOn.toISOString().slice(0, 10)}T09:30:00.000Z`,
        attempt: 1,
        student_note: bucket === 5 ? 'Handed in as a printed copy.' : null,
        attachments: [],
        evaluation: null,
      };

      // Released assignments are marked throughout; a live one is part-marked,
      // so both "still to evaluate" and "evaluated" are on screen at once.
      if (marksReleased || bucket % 2 === 1) {
        const share = 0.5 + bucket * 0.045;
        const scores = criteriaOf(assignment).map((criterion) => ({
          criterion_id: criterion.id,
          marks_awarded: Math.round(criterion.max_marks * share * 2) / 2,
          comment: null,
        }));

        stored.evaluation = computeEvaluation(
          assignment,
          scores,
          daysLate,
          false,
          bucket === 9 ? 'Excellent work — the analysis is the strongest in the class.' : null,
        );
      }

      assignmentSubmissions.set(
        assignmentSubmissionKey(assignment.id, student.id),
        stored,
      );
    });
  }
}

seedAssignmentSubmissions();

/** `students.csv`-style marks export, as the real endpoint would stream it. */
function marksCsv(assignment: AssignmentDetail): string {
  const header = [
    'Admission no',
    'Student',
    'Status',
    'Submitted at',
    'Days late',
    'Raw marks',
    'Late penalty',
    `Final marks (out of ${assignment.max_marks})`,
    'Percentage',
    'Grade',
    'Feedback',
  ].join(',');

  const rows = buildAssignmentSubmissions(assignment).data.map((row) =>
    [
      row.admission_no,
      `"${row.student_name}"`,
      row.status,
      row.submitted_at ?? '',
      row.days_late,
      row.evaluation?.raw_marks ?? '',
      row.evaluation?.late_penalty ?? '',
      row.evaluation?.final_marks ?? '',
      row.evaluation?.percentage ?? '',
      row.evaluation?.grade ?? '',
      `"${(row.evaluation?.feedback ?? '').replace(/"/g, '""')}"`,
    ].join(','),
  );

  return [header, ...rows].join('\n');
}

// --- communication ----------------------------------------------------------

/**
 * The guardian a school contacts first.
 *
 * Their email is on the nested guardian record rather than denormalised onto
 * the student, so it is read from there — the denormalised phone exists for
 * the list column, not as a second home for the contact details.
 */
const primaryGuardian = (student: StudentDetail) =>
  student.guardians.find((guardian) => guardian.is_primary) ?? student.guardians[0] ?? null;

const findTemplate = (id: number) => templateList.find((entry) => entry.id === id);
const findMessage = (id: number) => messageList.find((entry) => entry.id === id);
const findNotice = (id: number) => noticeList.find((entry) => entry.id === id);

/**
 * Resolve an audience against the live rosters.
 *
 * An audience is a query, not a list — so a message scheduled for tomorrow
 * reaches the class as it is tomorrow. Returns the people themselves, because
 * the count and the reachability breakdown are both readings of them.
 */
function resolveAudience(audience: StoredAudience) {
  const activeStudents = students.filter((student) => student.status === 'active');

  switch (audience.type) {
    case 'all_students':
      return activeStudents.map((student) => ({
        name: student.full_name,
        phone: student.phone ?? null,
        email: student.email ?? null,
        push: true,
      }));

    case 'all_guardians':
      return activeStudents.map((student) => ({
        name: student.primary_guardian_name ?? `${student.full_name}'s guardian`,
        phone: student.primary_guardian_phone ?? null,
        email: primaryGuardian(student)?.email ?? null,
        push: true,
      }));

    case 'all_teachers':
      return teachers
        .filter((teacher) => teacher.status === 'active')
        .map((teacher) => ({
          name: teacher.full_name,
          phone: teacher.phone,
          email: teacher.email,
          push: true,
        }));

    case 'all_staff':
      return staff
        .filter((member) => member.status === 'active')
        .map((member) => ({
          name: member.full_name,
          phone: member.phone,
          email: member.email,
          push: true,
        }));

    case 'class':
      return activeStudents
        .filter((student) => student.class_id === audience.class_id)
        .filter((student) =>
          audience.section_id ? student.section_id === audience.section_id : true,
        )
        .map((student) => ({
          name: student.primary_guardian_name ?? `${student.full_name}'s guardian`,
          phone: student.primary_guardian_phone ?? null,
          email: primaryGuardian(student)?.email ?? null,
          push: true,
        }));

    case 'custom':
      return activeStudents
        .filter((student) => audience.recipient_ids.includes(student.id))
        .map((student) => ({
          name: student.full_name,
          phone: student.primary_guardian_phone ?? null,
          email: primaryGuardian(student)?.email ?? null,
          push: true,
        }));

    default:
      return [];
  }
}

/** How many of an audience each channel could actually reach. */
function audienceReach(audience: StoredAudience) {
  const people = resolveAudience(audience);

  const reachable: Record<Channel, number> = {
    sms: people.filter((person) => Boolean(person.phone)).length,
    // WhatsApp rides on the same number as SMS.
    whatsapp: people.filter((person) => Boolean(person.phone)).length,
    email: people.filter((person) => Boolean(person.email)).length,
    push: people.filter((person) => person.push).length,
  };

  return {
    people,
    total: people.length,
    reachable,
    // Somebody with neither a phone nor an email cannot be reached at all.
    unreachable: people.filter((person) => !person.phone && !person.email).length,
  };
}

function audienceLabel(audience: StoredAudience): string {
  if (audience.type === 'class') {
    const klass = classes.find((entry) => entry.id === audience.class_id);
    const section = klass?.sections.find((entry) => entry.id === audience.section_id);
    return section
      ? `${klass?.name ?? 'Class'} — ${section.name}`
      : `${klass?.name ?? 'Class'}, every section`;
  }

  const labels: Record<AudienceType, string> = {
    all_students: 'Every student',
    all_guardians: 'Every guardian',
    all_teachers: 'Every teacher',
    all_staff: 'Every staff member',
    class: 'One class',
    custom: `${audience.recipient_ids.length} chosen`,
  };

  return labels[audience.type];
}

const hydrateAudience = (audience: StoredAudience): Audience => ({
  type: audience.type,
  class_id: audience.class_id,
  section_id: audience.section_id,
  recipients: [],
});

function hydrateTemplate(template: StoredTemplate): MessageTemplate {
  return {
    id: template.id,
    name: template.name,
    code: template.code,
    channel: template.channel,
    category: template.category,
    subject: template.subject,
    body: template.body,
    // Derived on read, so a body edited to add a token cannot leave a stale
    // placeholder list behind it.
    placeholders: extractPlaceholders(template.body),
    approval: template.approval,
    approval_note: template.approval_note,
    is_active: template.is_active,
    segments: template.channel === 'sms' ? smsCost(template.body).segments : null,
    created_at: template.created_at,
    updated_at: template.updated_at,
  };
}

function hydrateMessage(message: StoredMessage): Message {
  const deliveries = message.deliveries ?? [];

  return {
    id: message.id,
    subject: message.subject,
    body: message.body,
    channels: message.channels,
    template_id: message.template_id,
    template_name: message.template_id
      ? (findTemplate(message.template_id)?.name ?? null)
      : null,
    audience: hydrateAudience(message.audience),
    audience_label: audienceLabel(message.audience),
    recipients_count: message.recipients_count,
    status: message.status,
    scheduled_at: message.scheduled_at,
    sent_at: message.sent_at,
    created_by: message.created_by,
    deliveries,
    total_sent: deliveries.reduce((sum, entry) => sum + entry.sent, 0),
    total_delivered: deliveries.reduce((sum, entry) => sum + entry.delivered, 0),
    total_failed: deliveries.reduce((sum, entry) => sum + entry.failed, 0),
    notice_id: message.notice_id,
    created_at: message.created_at,
  };
}

/**
 * Is a notice on the board right now?
 *
 * Derived from the dates rather than stored, so a notice whose window has
 * closed comes down on its own instead of waiting for somebody to notice.
 */
function noticeIsLive(notice: StoredNotice): boolean {
  if (notice.status !== 'published') return false;

  const today = TODAY_DATE();
  if (notice.publish_at > today) return false;
  if (notice.expires_at !== null && notice.expires_at < today) return false;

  return true;
}

function hydrateNotice(notice: StoredNotice): Notice {
  const today = TODAY_DATE();

  // A published notice past its end date reports as expired without anybody
  // having to run a job.
  const status: NoticeStatus =
    notice.status === 'published' && notice.expires_at !== null && notice.expires_at < today
      ? 'expired'
      : notice.status;

  return {
    id: notice.id,
    title: notice.title,
    body: notice.body,
    category: notice.category,
    priority: notice.priority,
    audience: hydrateAudience(notice.audience),
    audience_label: audienceLabel(notice.audience),
    status,
    is_pinned: notice.is_pinned,
    publish_at: notice.publish_at,
    expires_at: notice.expires_at,
    is_live: noticeIsLive(notice),
    published_by: notice.published_by,
    published_at: notice.published_at,
    approved_by: notice.approved_by,
    attachment_name: null,
    attachment_url: null,
    announcements_count: messageList.filter((message) => message.notice_id === notice.id).length,
    created_by: notice.created_by,
    created_at: notice.created_at,
    updated_at: notice.updated_at,
  };
}

// --- communication: channel health ------------------------------------------

/**
 * Whether each channel can send.
 *
 * SMS and email are the settings module's to configure, so their readiness is
 * read from there rather than duplicated. WhatsApp and push are this module's
 * — the first needs an approved template, the second a registered handset.
 */
function channelHealth(): ChannelHealth[] {
  const sentOn = (channel: Channel) =>
    messageList
      .filter((message) => message.status === 'sent' || message.status === 'partial')
      .filter((message) => message.channels.includes(channel))
      .reduce((sum, message) => sum + (message.recipients_count ?? 0), 0);

  const approvedWhatsapp = templateList.filter(
    (template) => template.channel === 'whatsapp' && template.approval === 'approved' && template.is_active,
  ).length;

  const liveDevices = pushDeviceList.filter((device) => !device.is_stale).length;

  return [
    {
      channel: 'sms',
      status: settings.sms.enabled
        ? secrets.smsApiKey
          ? 'ready'
          : 'not_configured'
        : 'disabled',
      detail: settings.sms.enabled
        ? secrets.smsApiKey
          ? null
          : 'No API key stored for the provider.'
        : 'Switched off in school settings.',
      configured_in: 'settings',
      sent_last_30_days: sentOn('sms'),
      registered_devices: null,
    },
    {
      channel: 'email',
      status: settings.email.enabled
        ? secrets.smtpPassword
          ? 'ready'
          : 'not_configured'
        : 'disabled',
      detail: settings.email.enabled
        ? secrets.smtpPassword
          ? null
          : 'No SMTP password stored.'
        : 'Switched off in school settings.',
      configured_in: 'settings',
      sent_last_30_days: sentOn('email'),
      registered_devices: null,
    },
    {
      channel: 'whatsapp',
      // WhatsApp rides on the SMS numbers but needs its own approved template.
      status: approvedWhatsapp > 0 ? 'ready' : 'not_configured',
      detail:
        approvedWhatsapp > 0
          ? null
          : 'No approved template — WhatsApp will not carry a freeform message.',
      configured_in: 'communication',
      sent_last_30_days: sentOn('whatsapp'),
      registered_devices: null,
    },
    {
      channel: 'push',
      status: liveDevices > 0 ? 'ready' : 'not_configured',
      detail: liveDevices > 0 ? null : 'No handset has registered a token yet.',
      configured_in: 'communication',
      sent_last_30_days: sentOn('push'),
      registered_devices: liveDevices,
    },
  ];
}

const isChannelReady = (channel: Channel) =>
  channelHealth().find((entry) => entry.channel === channel)?.status === 'ready';

/**
 * What a send actually did.
 *
 * Deterministic rather than random, so two reads of the same message do not
 * report different delivery figures — a log that changes when you refresh it
 * is a log nobody trusts.
 */
function buildDeliveries(message: StoredMessage): ChannelDelivery[] {
  const reach = audienceReach(message.audience);

  return message.channels.map((channel) => {
    const targeted = reach.reachable[channel] ?? 0;

    // Roughly one in twenty-five fails — a wrong number, a full mailbox.
    const failed = Math.floor(targeted / 25);
    const sent = targeted - failed;
    // And a few more never confirm delivery.
    const delivered = sent - Math.floor(sent / 30);

    return {
      channel,
      targeted,
      sent,
      delivered,
      failed,
      // Only WhatsApp and push report reads.
      read: channel === 'whatsapp' || channel === 'push' ? Math.floor(delivered * 0.6) : null,
      segments: channel === 'sms' ? smsCost(message.body).segments * sent : null,
      error: null,
    };
  });
}

// --- communication: seeding -------------------------------------------------

function seedCommunication(): void {
  templateList = templateSeed.map((seed) => ({
    id: seed.id,
    name: seed.name,
    code: seed.code,
    channel: seed.channel,
    category: seed.category,
    subject: seed.subject ?? null,
    body: seed.body,
    approval: seed.approval ?? (seed.channel === 'whatsapp' ? 'pending' : 'not_required'),
    approval_note: seed.approvalNote ?? null,
    is_active: seed.isActive ?? true,
    created_at: '2025-04-01T00:00:00.000000Z',
    updated_at: '2025-06-01T00:00:00.000000Z',
  }));

  noticeList = noticeSeed.map((seed) => ({
    id: seed.id,
    title: seed.title,
    body: seed.body,
    category: seed.category,
    priority: seed.priority,
    audience: {
      type: seed.audienceType,
      class_id: null,
      section_id: null,
      recipient_ids: [],
    },
    status: seed.status,
    is_pinned: seed.isPinned ?? false,
    publish_at: shiftDate(TODAY_DATE(), seed.publishIn),
    expires_at: seed.expiresIn === null ? null : shiftDate(TODAY_DATE(), seed.expiresIn),
    published_by: seed.status === 'published' || seed.status === 'expired' ? 'Principal' : null,
    published_at:
      seed.status === 'published' || seed.status === 'expired'
        ? `${shiftDate(TODAY_DATE(), seed.publishIn)}T09:00:00.000Z`
        : null,
    approved_by: seed.status === 'published' || seed.status === 'expired' ? 'Principal' : null,
    created_by: 'Office',
    created_at: `${shiftDate(TODAY_DATE(), seed.publishIn - 2)}T09:00:00.000Z`,
    updated_at: `${shiftDate(TODAY_DATE(), seed.publishIn - 2)}T09:00:00.000Z`,
  }));

  // Handsets, drawn from the live rosters so the owner names are real.
  const owners = [
    ...students.filter((student) => student.status === 'active').slice(0, 24).map((student) => ({
      owner_type: 'guardian' as const,
      owner_id: student.id,
      owner_name: student.primary_guardian_name ?? `${student.full_name}'s guardian`,
    })),
    ...teachers.filter((teacher) => teacher.status === 'active').slice(0, 8).map((teacher) => ({
      owner_type: 'teacher' as const,
      owner_id: teacher.id,
      owner_name: teacher.full_name,
    })),
  ];

  pushDeviceList = owners.map((owner, index) => {
    // Roughly one in six has not opened the app in months.
    const daysAgo = index % 6 === 4 ? STALE_DEVICE_DAYS + 20 + index : index % 14;

    return {
      id: index + 1,
      owner_type: owner.owner_type,
      owner_id: owner.owner_id,
      owner_name: owner.owner_name,
      platform: index % 3 === 0 ? 'ios' : index % 7 === 5 ? 'web' : 'android',
      token_preview: `···${String(index * 7919).padStart(6, '0').slice(-6)}`,
      app_version: index % 5 === 2 ? '2.3.1' : '2.4.0',
      last_seen_at: `${shiftDate(TODAY_DATE(), -daysAgo)}T08:30:00.000Z`,
      is_stale: daysAgo > STALE_DEVICE_DAYS,
    };
  });

  /**
   * A handful already sent, one scheduled and one cancelled — so the log has
   * every status on it and the delivery breakdown has something to show
   * without anybody composing anything first.
   */
  const seededSends: {
    subject: string;
    templateCode: string;
    channels: Channel[];
    audienceType: AudienceType;
    daysAgo: number;
    status: MessageStatus;
    noticeId?: number;
  }[] = [
    { subject: 'Absentee alert — today', templateCode: 'ABSENT_DAILY', channels: ['sms'], audienceType: 'all_guardians', daysAgo: 1, status: 'sent' },
    { subject: 'Second-term fee reminder', templateCode: 'FEE_DUE', channels: ['sms', 'email'], audienceType: 'all_guardians', daysAgo: 5, status: 'sent' },
    { subject: 'Half-yearly examination timetable', templateCode: 'EXAM_SCHEDULE', channels: ['email'], audienceType: 'all_students', daysAgo: 10, status: 'sent', noticeId: 2 },
    { subject: 'Parent–teacher meeting on Saturday', templateCode: 'ABSENT_DAILY', channels: ['sms', 'push'], audienceType: 'all_guardians', daysAgo: 3, status: 'sent', noticeId: 1 },
    { subject: 'Sports day — house allocations', templateCode: 'ABSENT_DAILY', channels: ['push'], audienceType: 'all_students', daysAgo: 40, status: 'sent', noticeId: 6 },
    // Partly delivered: email went, SMS did not.
    { subject: 'Results are out', templateCode: 'RESULT_OUT', channels: ['email', 'sms'], audienceType: 'all_guardians', daysAgo: 15, status: 'partial' },
    { subject: 'Staff meeting reminder', templateCode: 'ABSENT_DAILY', channels: ['email'], audienceType: 'all_teachers', daysAgo: -2, status: 'queued' },
    { subject: 'Annual day invitation', templateCode: 'ANNUAL_DAY', channels: ['sms'], audienceType: 'all_guardians', daysAgo: -5, status: 'cancelled' },
  ];

  for (const seed of seededSends) {
    const template = templateList.find((entry) => entry.code === seed.templateCode);
    const audience: StoredAudience = {
      type: seed.audienceType,
      class_id: null,
      section_id: null,
      recipient_ids: [],
    };

    const isFuture = seed.daysAgo < 0;
    const when = shiftDate(TODAY_DATE(), -Math.abs(seed.daysAgo) * (isFuture ? -1 : 1));

    const message: StoredMessage = {
      id: nextMessageId++,
      subject: seed.subject,
      body: template?.body ?? seed.subject,
      channels: seed.channels,
      template_id: template?.id ?? null,
      audience,
      status: seed.status,
      scheduled_at: isFuture ? `${when}T09:00:00.000Z` : null,
      sent_at:
        seed.status === 'sent' || seed.status === 'partial' ? `${when}T09:05:00.000Z` : null,
      created_by: 'Office',
      deliveries: null,
      recipients_count: audienceReach(audience).total,
      notice_id: seed.noticeId ?? null,
      created_at: `${when}T08:55:00.000Z`,
    };

    if (seed.status === 'sent' || seed.status === 'partial') {
      message.deliveries = buildDeliveries(message);

      // A partial send has one channel that failed outright.
      if (seed.status === 'partial' && message.deliveries.length > 1) {
        const broken = message.deliveries[1];
        broken.failed = broken.targeted;
        broken.sent = 0;
        broken.delivered = 0;
        broken.error = 'The gateway rejected the batch — no credit on the account.';
      }
    }

    messageList.push(message);
  }
}

seedCommunication();

function listTemplates(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = templateList.map(hydrateTemplate);

  if (search) {
    rows = rows.filter(
      (template) =>
        template.name.toLowerCase().includes(search) ||
        template.code.toLowerCase().includes(search) ||
        template.body.toLowerCase().includes(search),
    );
  }

  const channel = params.get('channel');
  if (channel) rows = rows.filter((template) => template.channel === channel);

  const category = params.get('category');
  if (category) rows = rows.filter((template) => template.category === category);

  return paginate(sortRows(rows, params, 'name'), params, '/communication/templates');
}

function listMessages(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = messageList.map(hydrateMessage);

  if (search) {
    rows = rows.filter(
      (message) =>
        message.subject.toLowerCase().includes(search) ||
        message.audience_label.toLowerCase().includes(search),
    );
  }

  const status = params.get('status');
  if (status) rows = rows.filter((message) => message.status === status);

  const channel = params.get('channel');
  if (channel) rows = rows.filter((message) => message.channels.includes(channel as Channel));

  return paginate(sortRows(rows, params, 'created_at'), params, '/communication/messages');
}

function listNotices(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = noticeList.map(hydrateNotice);

  if (search) {
    rows = rows.filter(
      (notice) =>
        notice.title.toLowerCase().includes(search) ||
        notice.body.toLowerCase().includes(search),
    );
  }

  const status = params.get('status');
  if (status) rows = rows.filter((notice) => notice.status === status);

  const category = params.get('category');
  if (category) rows = rows.filter((notice) => notice.category === category);

  // Pinned notices sit above the rest whatever the sort says.
  const sorted = sortRows(rows, params, 'publish_at').sort(
    (left, right) => Number(right.is_pinned) - Number(left.is_pinned),
  );

  return paginate(sorted, params, '/communication/notices');
}

function communicationSummary() {
  const messages = messageList.map(hydrateMessage);
  const notices = noticeList.map(hydrateNotice);
  const cutoff = shiftDate(TODAY_DATE(), -30);

  return {
    sent_last_30_days: messages
      .filter((message) => message.sent_at !== null && message.sent_at.slice(0, 10) >= cutoff)
      .reduce((sum, message) => sum + message.recipients_count, 0),
    scheduled: messages.filter((message) => message.status === 'queued').length,
    live_notices: notices.filter((notice) => notice.is_live).length,
    awaiting_approval: notices.filter((notice) => notice.status === 'pending_approval').length,
    channels: channelHealth(),
  };
}

/** The message log as the real export endpoint would stream it. */
function messageLogCsv(rows: Message[]): string {
  const header = [
    'Subject', 'Channels', 'Audience', 'Recipients', 'Status',
    'Scheduled', 'Sent', 'Delivered', 'Failed', 'Raised by',
  ].join(',');

  const lines = rows.map((message) =>
    [
      `"${message.subject.replace(/"/g, '""')}"`,
      `"${message.channels.join(' + ')}"`,
      `"${message.audience_label}"`,
      message.recipients_count,
      message.status,
      message.scheduled_at ?? '',
      message.sent_at ?? '',
      message.total_delivered,
      message.total_failed,
      `"${message.created_by ?? ''}"`,
    ].join(','),
  );

  return [header, ...lines].join('\n');
}

function noticeText(notice: StoredNotice): string {
  const hydrated = hydrateNotice(notice);

  return [
    settings.profile.name,
    '',
    hydrated.title.toUpperCase(),
    `${hydrated.priority.toUpperCase()} · ${hydrated.audience_label}`,
    `Posted ${hydrated.publish_at}${hydrated.expires_at ? ` until ${hydrated.expires_at}` : ''}`,
    '',
    hydrated.body,
    '',
    `Approved by ${hydrated.approved_by ?? 'not yet approved'}`,
  ].join('\n');
}

// --- payroll ----------------------------------------------------------------

const findComponent = (id: number) => componentList.find((entry) => entry.id === id);

const findStructure = (type: EmployeeType, id: number) =>
  structureList.find((entry) => entry.employee_type === type && entry.employee_id === id);

/**
 * Everybody the school pays, from the two rosters it already keeps.
 *
 * Payroll never holds a third copy of these people — a name, a designation or
 * a bank account has exactly one home, and it is not here.
 */
function everyEmployee(): UnassignedEmployee[] {
  return [
    ...teachers
      .filter((teacher) => teacher.status === 'active')
      .map((teacher) => ({
        employee_type: 'teacher' as const,
        employee_id: teacher.id,
        employee_name: teacher.full_name,
        employee_code: teacher.employee_id,
        designation: teacher.designation,
        photo_url: teacher.photo_url,
      })),
    ...staff
      .filter((member) => member.status === 'active')
      .map((member) => ({
        employee_type: 'staff' as const,
        employee_id: member.id,
        employee_name: member.full_name,
        employee_code: member.employee_id,
        designation: member.designation,
        photo_url: member.photo_url,
      })),
  ];
}

/** The roster record behind a structure, for the fields payroll only reads. */
function employeeRecord(type: EmployeeType, id: number) {
  if (type === 'teacher') {
    const teacher = teachers.find((entry) => entry.id === id);
    return teacher
      ? {
          name: teacher.full_name,
          code: teacher.employee_id,
          designation: teacher.designation,
          department: teacher.department,
          photo_url: teacher.photo_url,
          pan: teacher.pan_no,
          is_active: teacher.status === 'active',
        }
      : null;
  }

  const member = staff.find((entry) => entry.id === id);
  return member
    ? {
        name: member.full_name,
        code: member.employee_id,
        designation: member.designation,
        department: null,
        photo_url: member.photo_url,
        pan: member.pan_no,
        is_active: member.status === 'active',
      }
    : null;
}

const withComponentCounts = (component: StoredComponent): SalaryComponent => ({
  ...component,
  structures_count: structureList.filter((structure) =>
    structure.lines.some((line) => line.component_id === component.id),
  ).length,
});

/** What one component works out to at a given basic and gross. */
function componentAmount(
  component: StoredComponent,
  value: number,
  basic: number,
  gross: number,
): number {
  if (component.calculation === 'fixed') return value;
  if (component.calculation === 'percent_of_basic') {
    return fromMinor(Math.round((toMinor(basic) * value) / 100));
  }
  return fromMinor(Math.round((toMinor(gross) * value) / 100));
}

/**
 * Price a structure.
 *
 * Earnings first, because a gross-based deduction needs the gross — which is
 * exactly why an earning may never be defined against it. PF wages are basic
 * plus only the allowances the Act counts, which is not the same as the gross
 * and is the single most common reason a return is rejected.
 */
function priceStructure(structure: StoredStructure) {
  const earningLines: { component: StoredComponent; value: number; amount: number }[] = [];

  for (const line of structure.lines) {
    const component = findComponent(line.component_id);
    if (!component || component.type !== 'earning') continue;
    earningLines.push({
      component,
      value: line.value,
      amount: componentAmount(component, line.value, structure.basic, 0),
    });
  }

  const gross = sumAmounts([structure.basic, ...earningLines.map((line) => line.amount)]);

  const pfWages = sumAmounts([
    structure.basic,
    ...earningLines.filter((line) => line.component.affects_pf).map((line) => line.amount),
  ]);

  const pf = pfFor(pfWages, {
    contributeOnFullWage: structure.pf_on_full_wage,
    isExcluded: structure.pf_excluded,
  });
  const esi = esiFor(gross);

  const deductionLines: { component: StoredComponent; value: number; amount: number }[] = [];

  for (const line of structure.lines) {
    const component = findComponent(line.component_id);
    if (!component || component.type !== 'deduction') continue;
    deductionLines.push({
      component,
      value: line.value,
      amount: componentAmount(component, line.value, structure.basic, gross),
    });
  }

  const totalDeductions = sumAmounts([
    pf.employee,
    esi.employee,
    ...deductionLines.map((line) => line.amount),
  ]);

  return {
    earningLines,
    deductionLines,
    gross,
    pfWages,
    pf,
    esi,
    totalDeductions,
    net: fromMinor(toMinor(gross) - toMinor(totalDeductions)),
  };
}

function hydrateStructure(structure: StoredStructure): SalaryStructure | null {
  const employee = employeeRecord(structure.employee_type, structure.employee_id);
  if (!employee) return null;

  const priced = priceStructure(structure);

  const lines: StructureLine[] = [
    ...priced.earningLines,
    ...priced.deductionLines,
  ]
    .map((line) => ({
      component_id: line.component.id,
      component_code: line.component.code,
      component_name: line.component.name,
      type: line.component.type,
      calculation: line.component.calculation,
      value: line.value,
      amount: line.amount,
      is_statutory: line.component.is_statutory,
    }))
    .sort((left, right) => {
      const leftOrder = findComponent(left.component_id)?.sort_order ?? 0;
      const rightOrder = findComponent(right.component_id)?.sort_order ?? 0;
      return leftOrder - rightOrder;
    });

  return {
    id: structure.id,
    employee_type: structure.employee_type,
    employee_id: structure.employee_id,
    employee_name: employee.name,
    employee_code: employee.code,
    designation: employee.designation,
    department: employee.department,
    photo_url: employee.photo_url,
    basic: structure.basic,
    lines,
    gross: priced.gross,
    total_deductions: priced.totalDeductions,
    net: priced.net,
    pf_applicable: priced.pf.applicable,
    esi_applicable: priced.esi.applicable,
    effective_from: structure.effective_from,
    is_active: structure.is_active,
    updated_at: structure.updated_at,
  };
}

/**
 * Days lost to pay in a month, read from the attendance module.
 *
 * Payroll does not record attendance; it asks the register that already
 * exists. A month the register has nothing for costs a full month, which is
 * the honest answer rather than docking somebody for a gap in the data.
 */
function loticeFor(type: EmployeeType, employeeId: number, month: string) {
  const [year, monthIndex] = month.split('-').map(Number);
  const report = buildMonthlyReport(type, year, monthIndex, null, null);

  const row = report.rows.find((entry) => entry.person_id === employeeId);
  if (!row || row.working_days === 0) {
    return { working_days: DEFAULT_WORKING_DAYS, paid_days: DEFAULT_WORKING_DAYS, lop_days: 0 };
  }

  return {
    working_days: row.working_days,
    paid_days: Math.max(0, row.working_days - row.absent_days),
    lop_days: row.absent_days,
  };
}

/** The bank and statutory identifiers a payslip has to carry. */
const payrollIdentifiers = (type: EmployeeType, employeeId: number) => ({
  // Deterministic stand-ins: a real system holds these on the employee record.
  bank_account: `XXXX${String(employeeId).padStart(4, '0')}`,
  uan: `1001${String(employeeId).padStart(8, '0')}`,
  esi_number: `31${String(employeeId).padStart(15, '0')}`,
  employee_key: `${type}-${employeeId}`,
});

/**
 * Cost one structure for one month.
 *
 * Loss of pay is applied to the whole salary, not only the basic — a month
 * with five unpaid days is five days without house rent allowance too — and
 * the statutory contributions are then computed on what was actually earned,
 * which is what the returns are filed on.
 */
function buildPayslip(structure: StoredStructure, run: StoredRun): Payslip | null {
  const employee = employeeRecord(structure.employee_type, structure.employee_id);
  if (!employee) return null;

  const attendance = loticeFor(structure.employee_type, structure.employee_id, run.month);
  const identifiers = payrollIdentifiers(structure.employee_type, structure.employee_id);

  const rate = (amount: number) =>
    proRate(amount, attendance.paid_days, attendance.working_days);

  const priced = priceStructure(structure);

  const basic = rate(structure.basic);
  const earnings: PayslipLine[] = priced.earningLines.map((line) => ({
    code: line.component.code,
    name: line.component.name,
    amount: rate(line.amount),
    is_statutory: line.component.is_statutory,
  }));

  const gross = sumAmounts([basic, ...earnings.map((line) => line.amount)]);

  const pfWages = sumAmounts([
    basic,
    ...priced.earningLines
      .filter((line) => line.component.affects_pf)
      .map((line) => rate(line.amount)),
  ]);

  const pf = pfFor(pfWages, {
    contributeOnFullWage: structure.pf_on_full_wage,
    isExcluded: structure.pf_excluded,
  });
  const esi = esiFor(gross);

  const deductions: PayslipLine[] = priced.deductionLines.map((line) => ({
    code: line.component.code,
    name: line.component.name,
    // A fixed deduction is not pro-rated: a welfare fund subscription is a
    // subscription, not a wage.
    amount:
      line.component.calculation === 'fixed'
        ? line.amount
        : componentAmount(line.component, line.value, basic, gross),
    is_statutory: line.component.is_statutory,
  }));

  if (pf.applicable) {
    deductions.push({ code: 'PF', name: 'Provident fund', amount: pf.employee, is_statutory: true });
  }
  if (esi.applicable) {
    deductions.push({ code: 'ESI', name: 'ESI', amount: esi.employee, is_statutory: true });
  }

  const totalDeductions = sumAmounts(deductions.map((line) => line.amount));

  return {
    id: nextPayslipId++,
    run_id: run.id,
    month: run.month,
    employee_type: structure.employee_type,
    employee_id: structure.employee_id,
    employee_name: employee.name,
    employee_code: employee.code,
    designation: employee.designation,
    department: employee.department,
    photo_url: employee.photo_url,
    bank_account: identifiers.bank_account,
    pan: employee.pan,
    uan: pf.applicable ? identifiers.uan : null,
    esi_number: esi.applicable ? identifiers.esi_number : null,
    working_days: attendance.working_days,
    paid_days: attendance.paid_days,
    lop_days: attendance.lop_days,
    basic,
    earnings,
    deductions: deductions.sort((left, right) => left.code.localeCompare(right.code)),
    gross,
    total_deductions: totalDeductions,
    net: fromMinor(toMinor(gross) - toMinor(totalDeductions)),
    pf_wages: pf.wages,
    pf_employee: pf.employee,
    pf_employer: pf.employer,
    eps_employer: pf.pension,
    esi_wages: esi.wages,
    esi_employee: esi.employee,
    esi_employer: esi.employer,
    is_frozen: true,
  };
}

function hydrateRun(run: StoredRun): PayrollRun {
  const payslips = payslipsByRun.get(run.id) ?? [];

  return {
    id: run.id,
    month: run.month,
    status: run.status,
    employees_count: payslips.length,
    gross_total: sumAmounts(payslips.map((slip) => slip.gross)),
    deductions_total: sumAmounts(payslips.map((slip) => slip.total_deductions)),
    net_total: sumAmounts(payslips.map((slip) => slip.net)),
    pf_employee_total: sumAmounts(payslips.map((slip) => slip.pf_employee)),
    pf_employer_total: sumAmounts(payslips.map((slip) => slip.pf_employer)),
    esi_employee_total: sumAmounts(payslips.map((slip) => slip.esi_employee)),
    esi_employer_total: sumAmounts(payslips.map((slip) => slip.esi_employer)),
    processed_at: run.processed_at,
    processed_by: run.processed_by,
    approved_at: run.approved_at,
    approved_by: run.approved_by,
    paid_at: run.paid_at,
    notes: run.notes,
    created_at: run.created_at,
  };
}

const hydrateRunDetail = (run: StoredRun): PayrollRunDetail => ({
  ...hydrateRun(run),
  payslips: (payslipsByRun.get(run.id) ?? [])
    .slice()
    .sort((left, right) => left.employee_name.localeCompare(right.employee_name)),
});

const allPayslips = () => [...payslipsByRun.values()].flat();

/**
 * The PF and ESI registers for a month.
 *
 * Read off the payslips rather than recomputed — the return a school files
 * has to match what it actually paid, and two calculations of the same month
 * is one too many.
 */
function buildRegister(month: string) {
  const run = runList.find((entry) => entry.month === month);
  const payslips = run ? (payslipsByRun.get(run.id) ?? []) : [];

  const pfRows = payslips
    .filter((slip) => slip.pf_employee > 0 || slip.pf_employer > 0)
    .map((slip) => ({
      employee_id: slip.employee_id,
      employee_name: slip.employee_name,
      employee_code: slip.employee_code,
      uan: slip.uan,
      pf_wages: slip.pf_wages,
      employee_share: slip.pf_employee,
      employer_share: fromMinor(toMinor(slip.pf_employer) - toMinor(slip.eps_employer)),
      pension_share: slip.eps_employer,
      total: fromMinor(toMinor(slip.pf_employee) + toMinor(slip.pf_employer)),
    }));

  const esiRows = payslips
    .filter((slip) => slip.esi_employee > 0 || slip.esi_employer > 0)
    .map((slip) => ({
      employee_id: slip.employee_id,
      employee_name: slip.employee_name,
      employee_code: slip.employee_code,
      esi_number: slip.esi_number,
      esi_wages: slip.esi_wages,
      employee_share: slip.esi_employee,
      employer_share: slip.esi_employer,
      total: fromMinor(toMinor(slip.esi_employee) + toMinor(slip.esi_employer)),
    }));

  return {
    month,
    run_id: run?.id ?? null,
    run_status: run?.status ?? null,
    pf: {
      rows: pfRows,
      wages: sumAmounts(pfRows.map((row) => row.pf_wages)),
      employee_total: sumAmounts(pfRows.map((row) => row.employee_share)),
      employer_total: sumAmounts(pfRows.map((row) => row.employer_share)),
      pension_total: sumAmounts(pfRows.map((row) => row.pension_share)),
      grand_total: sumAmounts(pfRows.map((row) => row.total)),
    },
    esi: {
      rows: esiRows,
      wages: sumAmounts(esiRows.map((row) => row.esi_wages)),
      employee_total: sumAmounts(esiRows.map((row) => row.employee_share)),
      employer_total: sumAmounts(esiRows.map((row) => row.employer_share)),
      grand_total: sumAmounts(esiRows.map((row) => row.total)),
    },
  };
}

function payrollSummary() {
  const structures = structureList
    .filter((structure) => structure.is_active)
    .map(hydrateStructure)
    .filter((structure): structure is SalaryStructure => structure !== null);

  const assigned = new Set(
    structureList.map((structure) => `${structure.employee_type}-${structure.employee_id}`),
  );
  const missing = everyEmployee().filter(
    (employee) => !assigned.has(`${employee.employee_type}-${employee.employee_id}`),
  );

  const latest = [...runList].sort((left, right) => right.month.localeCompare(left.month))[0];

  return {
    employees_on_payroll: structures.length,
    employees_without_structure: missing.length,
    monthly_gross: sumAmounts(structures.map((structure) => structure.gross)),
    monthly_net: sumAmounts(structures.map((structure) => structure.net)),
    latest_run_month: latest?.month ?? null,
    latest_run_status: latest?.status ?? null,
    unpaid_runs: runList.filter((run) => run.status !== 'paid').length,
  };
}

// --- payroll: seeding -------------------------------------------------------

function seedPayroll(): void {
  componentList = componentSeed.map((seed) => ({
    id: seed.id,
    name: seed.name,
    code: seed.code,
    type: seed.type,
    calculation: seed.calculation,
    value: seed.value,
    is_statutory: seed.isStatutory ?? false,
    is_taxable: seed.type === 'earning' ? (seed.isTaxable ?? false) : false,
    affects_pf: seed.type === 'earning' ? (seed.affectsPf ?? false) : false,
    is_active: seed.isActive ?? true,
    sort_order: seed.sortOrder,
    created_at: '2025-04-01T00:00:00.000000Z',
  }));

  const standardEarnings = componentList.filter(
    (component) => component.type === 'earning' && component.is_active,
  );
  const professionalTax = componentList.find((component) => component.code === 'PT');
  const welfare = componentList.find((component) => component.code === 'SWF');

  /**
   * Not everybody, on purpose.
   *
   * A few employees are left without a structure so the "not on the payroll"
   * warning has something real to report — that gap is the one that silently
   * loses somebody a month's pay.
   */
  everyEmployee().forEach((employee, index) => {
    if (index % 9 === 6) return;

    const band = BASIC_BANDS.find((entry) => entry.match.test(employee.designation));
    const basic = band?.basic ?? DEFAULT_BASIC;

    const lines: StoredStructureLine[] = standardEarnings.map((component) => ({
      component_id: component.id,
      value: component.value,
    }));

    if (professionalTax) {
      lines.push({ component_id: professionalTax.id, value: professionalTax.value });
    }
    // Every third person subscribes to the welfare fund.
    if (welfare && index % 3 === 0) {
      lines.push({ component_id: welfare.id, value: welfare.value });
    }

    structureList.push({
      id: nextPayrollStructureId++,
      employee_type: employee.employee_type,
      employee_id: employee.employee_id,
      basic,
      effective_from: '2025-04-01',
      // The senior band is above the PF ceiling, where contributing on the
      // full wage is a real and ordinary choice.
      pf_on_full_wage: basic >= 60_000,
      pf_excluded: false,
      lines,
      is_active: true,
      updated_at: '2025-06-01T00:00:00.000000Z',
    });
  });

  // Two months already run: one paid and closed, one approved but not yet
  // released — so the register has something to show and the run screen has
  // a live state on first boot.
  const previous = shiftMonth(TODAY_DATE().slice(0, 7), -2);
  const latest = shiftMonth(TODAY_DATE().slice(0, 7), -1);

  for (const [month, status] of [
    [previous, 'paid'],
    [latest, 'approved'],
  ] as [string, RunStatus][]) {
    const run: StoredRun = {
      id: nextRunId++,
      month,
      status,
      processed_at: `${month}-28T10:00:00.000Z`,
      processed_by: 'Accounts',
      approved_at: `${month}-28T14:00:00.000Z`,
      approved_by: 'Principal',
      paid_at: status === 'paid' ? `${month}-30` : null,
      paid_reference: status === 'paid' ? 'NEFT batch 4471' : null,
      notes: null,
      created_at: `${month}-25T09:00:00.000Z`,
    };

    runList.push(run);

    payslipsByRun.set(
      run.id,
      structureList
        .filter((structure) => structure.is_active)
        .map((structure) => buildPayslip(structure, run))
        .filter((slip): slip is Payslip => slip !== null),
    );
  }
}

/** `2026-08` shifted by whole months, on the same UTC clock as everything else. */
function shiftMonth(month: string, months: number): string {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 7);
}

seedPayroll();

function listComponents(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = componentList.map(withComponentCounts);

  if (search) {
    rows = rows.filter(
      (component) =>
        component.name.toLowerCase().includes(search) ||
        component.code.toLowerCase().includes(search),
    );
  }

  const type = params.get('type');
  if (type) rows = rows.filter((component) => component.type === type);

  return paginate(sortRows(rows, params, 'sort_order'), params, '/payroll/components');
}

function listStructures(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = structureList
    .map(hydrateStructure)
    .filter((structure): structure is SalaryStructure => structure !== null);

  if (search) {
    rows = rows.filter(
      (structure) =>
        structure.employee_name.toLowerCase().includes(search) ||
        structure.employee_code.toLowerCase().includes(search),
    );
  }

  const employeeType = params.get('employee_type');
  if (employeeType) rows = rows.filter((structure) => structure.employee_type === employeeType);

  return paginate(sortRows(rows, params, 'employee_name'), params, '/payroll/structures');
}

function listRuns(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = runList.map(hydrateRun);

  if (search) rows = rows.filter((run) => run.month.includes(search));

  const status = params.get('status');
  if (status) rows = rows.filter((run) => run.status === status);

  return paginate(sortRows(rows, params, 'month'), params, '/payroll/runs');
}

/** The payroll register as the real export endpoint would stream it. */
function payrollCsv(payslips: Payslip[]): string {
  const header = [
    'Employee', 'Code', 'Designation', 'Working days', 'Paid days', 'LOP',
    'Basic', 'Gross', 'PF wages', 'PF employee', 'PF employer', 'EPS',
    'ESI employee', 'ESI employer', 'Deductions', 'Net',
  ].join(',');

  const lines = payslips.map((slip) =>
    [
      `"${slip.employee_name}"`,
      slip.employee_code,
      `"${slip.designation}"`,
      slip.working_days,
      slip.paid_days,
      slip.lop_days,
      slip.basic,
      slip.gross,
      slip.pf_wages,
      slip.pf_employee,
      slip.pf_employer,
      slip.eps_employer,
      slip.esi_employee,
      slip.esi_employer,
      slip.total_deductions,
      slip.net,
    ].join(','),
  );

  return [header, ...lines].join('\n');
}

function payslipText(slip: Payslip): string {
  return [
    settings.profile.name,
    `Payslip — ${slip.month}`,
    '',
    `${slip.employee_name} (${slip.employee_code})`,
    `${slip.designation}`,
    `Paid days ${slip.paid_days} of ${slip.working_days}${slip.lop_days > 0 ? ` · LOP ${slip.lop_days}` : ''}`,
    '',
    'EARNINGS',
    `  Basic${' '.repeat(24)}${slip.basic}`,
    ...slip.earnings.map((line) => `  ${line.name.padEnd(28)}${line.amount}`),
    `  Gross${' '.repeat(24)}${slip.gross}`,
    '',
    'DEDUCTIONS',
    ...slip.deductions.map((line) => `  ${line.name.padEnd(28)}${line.amount}`),
    `  Total${' '.repeat(24)}${slip.total_deductions}`,
    '',
    `NET PAY  ${slip.net}`,
  ].join('\n');
}

function registerCsv(month: string, scheme: 'pf' | 'esi'): string {
  const register = buildRegister(month);

  if (scheme === 'pf') {
    const header = ['UAN', 'Employee', 'Code', 'PF wages', 'Employee', 'Employer', 'Pension', 'Total'].join(',');
    const rows = register.pf.rows.map((row) =>
      [
        row.uan ?? '',
        `"${row.employee_name}"`,
        row.employee_code,
        row.pf_wages,
        row.employee_share,
        row.employer_share,
        row.pension_share,
        row.total,
      ].join(','),
    );
    return [header, ...rows].join('\n');
  }

  const header = ['ESI number', 'Employee', 'Code', 'ESI wages', 'Employee', 'Employer', 'Total'].join(',');
  const rows = register.esi.rows.map((row) =>
    [
      row.esi_number ?? '',
      `"${row.employee_name}"`,
      row.employee_code,
      row.esi_wages,
      row.employee_share,
      row.employer_share,
      row.total,
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

// --- hostel -----------------------------------------------------------------

const findHostel = (id: number) => hostelList.find((hostel) => hostel.id === id);
const findHostelRoom = (id: number) => hostelRoomList.find((room) => room.id === id);
const findBed = (id: number) => bedList.find((bed) => bed.id === id);

const bedsOfRoom = (roomId: number) =>
  bedList
    .filter((bed) => bed.room_id === roomId)
    .sort((left, right) => left.bed_no.localeCompare(right.bed_no));

const roomsOfHostel = (hostelId: number) =>
  hostelRoomList.filter((room) => room.hostel_id === hostelId);

const currentResidents = () => hostelAllocations.filter((entry) => entry.vacated_on === null);

/** The live allocation on a bed, if anybody is in it. At most one. */
const occupantOf = (bedId: number) =>
  currentResidents().find((entry) => entry.bed_id === bedId);

function hydrateBed(bed: StoredBed): Bed {
  const room = findHostelRoom(bed.room_id);
  const hostel = room ? findHostel(room.hostel_id) : undefined;
  const allocation = occupantOf(bed.id);
  const student = allocation
    ? students.find((entry) => entry.id === allocation.student_id)
    : undefined;

  return {
    id: bed.id,
    room_id: bed.room_id,
    room_no: room?.room_no ?? '—',
    hostel_id: hostel?.id ?? 0,
    hostel_name: hostel?.name ?? 'Unknown block',
    bed_no: bed.bed_no,
    // Occupancy is derived, never stored: a bed with somebody in it is
    // occupied whatever its own column happens to say.
    status: allocation && student ? 'occupied' : bed.status,
    notes: bed.notes,
    occupant:
      allocation && student
        ? {
            allocation_id: allocation.id,
            student_id: student.id,
            student_name: student.full_name,
            admission_no: student.admission_no,
            photo_url: student.photo_url,
            class_name: student.class_name,
            allocated_on: allocation.allocated_on,
          }
        : null,
  };
}

function hydrateHostelRoom(room: StoredHostelRoom): HostelRoom {
  const hostel = findHostel(room.hostel_id);
  const beds = bedsOfRoom(room.id).map(hydrateBed);

  const occupied = beds.filter((bed) => bed.status === 'occupied').length;
  const available = beds.filter((bed) => bed.status === 'vacant').length;

  /**
   * `full` is a reading of the beds, not a stored flag.
   *
   * A room somebody has taken out of use keeps saying so; otherwise it is
   * full exactly when it has beds and none of them is free.
   */
  const status: RoomStatus =
    room.status !== 'available'
      ? room.status
      : beds.length > 0 && available === 0
        ? 'full'
        : 'available';

  return {
    id: room.id,
    hostel_id: room.hostel_id,
    hostel_name: hostel?.name ?? 'Unknown block',
    hostel_type: hostel?.type ?? 'boys',
    room_no: room.room_no,
    floor: room.floor,
    type: room.type,
    beds_count: beds.length,
    occupied_beds: occupied,
    available_beds: available,
    monthly_rent: room.monthly_rent,
    has_ac: room.has_ac,
    has_attached_bath: room.has_attached_bath,
    status,
    notes: room.notes,
    created_at: room.created_at,
  };
}

const hydrateRoomDetail = (room: StoredHostelRoom): HostelRoomDetail => ({
  ...hydrateHostelRoom(room),
  beds: bedsOfRoom(room.id).map(hydrateBed),
});

function hydrateHostel(hostel: StoredHostel): Hostel {
  const rooms = roomsOfHostel(hostel.id).map(hydrateHostelRoom);
  const warden = hostel.warden_id === null ? null : (staff.find((member) => member.id === hostel.warden_id) ?? null);

  const beds = rooms.reduce((total, room) => total + room.beds_count, 0);
  const occupied = rooms.reduce((total, room) => total + room.occupied_beds, 0);

  return {
    id: hostel.id,
    name: hostel.name,
    code: hostel.code,
    type: hostel.type,
    address: hostel.address,
    warden_id: warden?.id ?? null,
    warden_name: warden?.full_name ?? null,
    warden_phone: warden?.phone ?? null,
    mess_charge: hostel.mess_charge,
    rooms_count: rooms.length,
    beds_count: beds,
    occupied_beds: occupied,
    available_beds: rooms.reduce((total, room) => total + room.available_beds, 0),
    occupancy_percent: beds === 0 ? 0 : Math.round((occupied / beds) * 1000) / 10,
    is_active: hostel.is_active,
    created_at: hostel.created_at,
  };
}

/** What one stay costs a month: the room's rent plus the plan's share of mess. */
function chargeFor(allocation: StoredAllocation) {
  const bed = findBed(allocation.bed_id);
  const room = bed ? findHostelRoom(bed.room_id) : undefined;
  const hostel = room ? findHostel(room.hostel_id) : undefined;

  const rent = room?.monthly_rent ?? 0;
  const mess = hostel ? messChargeFor(allocation.mess_plan, hostel.mess_charge) : 0;

  return { rent, mess, total: fromMinor(toMinor(rent) + toMinor(mess)) };
}

function hydrateAllocation(allocation: StoredAllocation): HostelAllocation | null {
  const student = students.find((entry) => entry.id === allocation.student_id);
  const bed = findBed(allocation.bed_id);
  const room = bed ? findHostelRoom(bed.room_id) : undefined;
  const hostel = room ? findHostel(room.hostel_id) : undefined;
  if (!student || !bed || !room || !hostel) return null;

  const { rent, mess, total } = chargeFor(allocation);

  return {
    id: allocation.id,
    student_id: student.id,
    student_name: student.full_name,
    admission_no: student.admission_no,
    photo_url: student.photo_url,
    gender: student.gender,
    class_name: student.class_name,
    section_name: student.section_name,
    guardian_phone: student.primary_guardian_phone ?? null,
    hostel_id: hostel.id,
    hostel_name: hostel.name,
    room_id: room.id,
    room_no: room.room_no,
    bed_id: bed.id,
    bed_no: bed.bed_no,
    allocated_on: allocation.allocated_on,
    vacated_on: allocation.vacated_on,
    is_active: allocation.vacated_on === null,
    mess_plan: allocation.mess_plan,
    room_rent: rent,
    mess_charge: mess,
    monthly_charge: total,
  };
}

/**
 * `A`, `B`, … then `AA` past the twenty-sixth.
 *
 * Minted by the API rather than typed: a warden furnishing a dormitory should
 * not key sixteen labels, and uniqueness within the room is not something a
 * form can promise.
 */
function mintBedLabel(roomId: number): string {
  const used = new Set(bedsOfRoom(roomId).map((bed) => bed.bed_no));

  for (let index = 0; index < 200; index += 1) {
    const label =
      index < 26
        ? String.fromCharCode(65 + index)
        : `${String.fromCharCode(65 + Math.floor(index / 26) - 1)}${String.fromCharCode(65 + (index % 26))}`;
    if (!used.has(label)) return label;
  }

  return `B${bedsOfRoom(roomId).length + 1}`;
}

/**
 * May this student take this bed?
 *
 * Four rules, in the order somebody at the desk would apply them: the bed is
 * free, the room is open, the student is not already boarding, and the block
 * is for their gender. The reason travels with the refusal.
 */
function allocationError(studentId: number, bedId: number): string | null {
  const student = students.find((entry) => entry.id === studentId);
  if (!student) return 'That student does not exist.';
  if (student.status !== 'active') return `${student.full_name} is not an active student.`;

  const bed = findBed(bedId);
  if (!bed) return 'That bed does not exist.';

  const room = findHostelRoom(bed.room_id);
  const hostel = room ? findHostel(room.hostel_id) : undefined;
  if (!room || !hostel) return 'That bed is not in a room.';

  if (occupantOf(bedId)) return 'Somebody is already in that bed.';
  if (bed.status !== 'vacant') return `That bed is ${bed.status}.`;
  if (room.status !== 'available') return `Room ${room.room_no} is ${room.status}.`;
  if (!hostel.is_active) return `${hostel.name} is closed.`;

  if (student.gender !== GENDER_FOR_HOSTEL[hostel.type]) {
    return `${hostel.name} is a ${hostel.type === 'boys' ? "boys'" : "girls'"} block.`;
  }

  const already = currentResidents().find((entry) => entry.student_id === studentId);
  if (already) {
    const otherBed = findBed(already.bed_id);
    const otherRoom = otherBed ? findHostelRoom(otherBed.room_id) : undefined;
    return `${student.full_name} is already in room ${otherRoom?.room_no ?? 'another room'}.`;
  }

  return null;
}

// --- hostel: roll call ------------------------------------------------------

/** Residents of a block on a given night, from the allocations. */
function residentsOn(hostelId: number, date: string): StoredAllocation[] {
  const roomIds = new Set(roomsOfHostel(hostelId).map((room) => room.id));
  const bedIds = new Set(bedList.filter((bed) => roomIds.has(bed.room_id)).map((bed) => bed.id));

  return hostelAllocations.filter(
    (entry) =>
      bedIds.has(entry.bed_id) &&
      entry.allocated_on <= date &&
      (entry.vacated_on === null || entry.vacated_on >= date),
  );
}

function buildRollCall(hostelId: number, date: string): RollCall | null {
  const hostel = findHostel(hostelId);
  if (!hostel) return null;

  const entries: RollCallEntry[] = residentsOn(hostelId, date)
    .map((allocation) => {
      const student = students.find((entry) => entry.id === allocation.student_id);
      const bed = findBed(allocation.bed_id);
      const room = bed ? findHostelRoom(bed.room_id) : undefined;
      if (!student || !bed || !room) return null;

      const mark = rollCallMarks.get(rollCallKey(allocation.id, date));

      return {
        allocation_id: allocation.id,
        student_id: student.id,
        student_name: student.full_name,
        admission_no: student.admission_no,
        photo_url: student.photo_url,
        class_name: student.class_name,
        room_no: room.room_no,
        bed_no: bed.bed_no,
        status: mark?.status ?? null,
        remarks: mark?.remarks ?? null,
        marked_at: mark?.marked_at ?? null,
        marked_by: mark?.marked_by ?? null,
      };
    })
    .filter((entry): entry is RollCallEntry => entry !== null)
    .sort((left, right) => left.room_no.localeCompare(right.room_no) || left.bed_no.localeCompare(right.bed_no));

  const counted = (status: RollCallStatus) =>
    entries.filter((entry) => entry.status === status).length;

  const marked = entries.filter((entry) => entry.status !== null).length;
  const age = daysBetween(date, TODAY_DATE());

  return {
    hostel_id: hostel.id,
    hostel_name: hostel.name,
    date,
    entries,
    summary: {
      total: entries.length,
      marked,
      unmarked: entries.length - marked,
      present: counted('present'),
      absent: counted('absent'),
      on_leave: counted('on_leave'),
      out_pass: counted('out_pass'),
      late_return: counted('late_return'),
    },
    // A past register is a record, not a draft.
    is_locked: age > ROLL_CALL_GRACE_DAYS,
    lock_reason:
      age > ROLL_CALL_GRACE_DAYS
        ? `Closed — a roll call stays editable for ${ROLL_CALL_GRACE_DAYS} days.`
        : null,
  };
}

// --- hostel: charges --------------------------------------------------------

/**
 * What each resident is charged, and what the fee ledger says they owe.
 *
 * The billed figure is the months raised times the monthly charge; the paid
 * figure comes from the fee side. The hostel never keeps its own payments —
 * a second ledger would be a second answer to what a family owes the school.
 */
function buildCharges(hostelId?: number): HostelCharge[] {
  return currentResidents()
    .map((allocation) => {
      const hydrated = hydrateAllocation(allocation);
      if (!hydrated) return null;
      if (hostelId && hydrated.hostel_id !== hostelId) return null;

      const months = raisedMonths.get(`${hydrated.hostel_id}|__count__${allocation.id}`) ?? 0;
      const billed = fromMinor(toMinor(hydrated.monthly_charge) * months);

      // Paid is what the fee side has taken. Seeded deterministically here so
      // both the settled and the outstanding rows are visible on first boot.
      const settledShare = allocation.id % 3 === 0 ? 1 : allocation.id % 3 === 1 ? 0.5 : 0;
      const paid = fromMinor(Math.round(toMinor(billed) * settledShare));

      return {
        id: allocation.id,
        student_id: hydrated.student_id,
        student_name: hydrated.student_name,
        admission_no: hydrated.admission_no,
        class_name: hydrated.class_name,
        hostel_name: hydrated.hostel_name,
        room_no: hydrated.room_no,
        bed_no: hydrated.bed_no,
        mess_plan: hydrated.mess_plan,
        room_rent: hydrated.room_rent,
        mess_charge: hydrated.mess_charge,
        monthly_charge: hydrated.monthly_charge,
        months_billed: months,
        billed_amount: billed,
        paid_amount: paid,
        balance: fromMinor(toMinor(billed) - toMinor(paid)),
      };
    })
    .filter((charge): charge is HostelCharge => charge !== null);
}

function buildChargeSummary(hostelId?: number) {
  const charges = buildCharges(hostelId);

  const months = [...raisedMonths.keys()]
    .filter((key) => !key.includes('__count__'))
    .filter((key) => (hostelId ? key.startsWith(`${hostelId}|`) : true))
    .map((key) => key.split('|')[1])
    .sort();

  return {
    residents: charges.length,
    monthly_total: sumAmounts(charges.map((charge) => charge.monthly_charge)),
    billed: sumAmounts(charges.map((charge) => charge.billed_amount)),
    collected: sumAmounts(charges.map((charge) => charge.paid_amount)),
    outstanding: sumAmounts(charges.map((charge) => charge.balance)),
    billed_months: [...new Set(months)],
  };
}

// --- hostel: seeding --------------------------------------------------------

function seedHostel(): void {
  const wardens = staff.filter((member) => member.status === 'active');

  hostelList = hostelSeed.map((seed) => ({
    id: seed.id,
    name: seed.name,
    code: seed.code,
    type: seed.type,
    address: seed.address,
    warden_id: seed.wardenIndex === null ? null : (wardens[seed.wardenIndex]?.id ?? null),
    mess_charge: seed.mess_charge,
    is_active: seed.is_active ?? true,
    created_at: '2025-04-01T00:00:00.000000Z',
  }));

  hostelRoomList = hostelRoomSeed.map((seed, index) => ({
    id: index + 1,
    hostel_id: seed.hostelId,
    room_no: seed.room_no,
    floor: seed.floor,
    type: seed.type,
    monthly_rent: seed.monthly_rent,
    has_ac: seed.has_ac ?? false,
    has_attached_bath: seed.has_attached_bath ?? true,
    status: seed.status ?? 'available',
    notes: seed.notes ?? null,
    created_at: '2025-04-01T00:00:00.000000Z',
  }));

  for (const room of hostelRoomList) {
    const seed = hostelRoomSeed[room.id - 1];
    const count = seed.beds ?? BEDS_FOR_ROOM_TYPE[room.type];

    for (let index = 0; index < count; index += 1) {
      bedList.push({
        id: nextBedId++,
        room_id: room.id,
        bed_no: mintBedLabel(room.id),
        status: 'vacant',
        notes: null,
      });
    }
  }

  // Fill from the live roster, boys into boys' blocks and girls into girls'.
  const byGender = {
    male: students.filter((entry) => entry.status === 'active' && entry.gender === 'male'),
    female: students.filter((entry) => entry.status === 'active' && entry.gender === 'female'),
  };
  const cursor = { male: 0, female: 0 };

  /**
   * Counts across the whole run, not per room.
   *
   * A per-room index never gets past three in a seed of quads and triples, so
   * the mess-plan cycle below would never fire and every resident would end
   * up on full board — hiding both of the other plans.
   */
  let placed = 0;

  for (const room of hostelRoomList) {
    const seed = hostelRoomSeed[room.id - 1];
    const hostel = findHostel(room.hostel_id);
    if (!hostel || !hostel.is_active || room.status !== 'available') continue;

    const gender = GENDER_FOR_HOSTEL[hostel.type] as 'male' | 'female';
    const beds = bedsOfRoom(room.id);
    const target = Math.round(beds.length * (seed.fill ?? 0));

    for (let index = 0; index < target; index += 1) {
      const student = byGender[gender][cursor[gender]];
      if (!student) break;
      cursor[gender] += 1;

      hostelAllocations.push({
        id: nextHostelAllocationId++,
        student_id: student.id,
        bed_id: beds[index].id,
        // Roughly one in seven skips the mess, one in five takes half board.
        mess_plan: placed % 7 === 4 ? 'none' : placed % 5 === 2 ? 'breakfast_dinner' : 'full',
        allocated_on: '2025-06-01',
        vacated_on: null,
        reason: null,
      });
      placed += 1;
    }
  }

  // Two months already raised for the blocks that are running, so the fees
  // screen has billed and outstanding rows on first boot.
  for (const hostel of hostelList.filter((entry) => entry.is_active)) {
    for (const month of ['2025-06', '2025-07']) {
      raisedMonths.set(`${hostel.id}|${month}`, 1);
    }
  }
  for (const allocation of currentResidents()) {
    const bed = findBed(allocation.bed_id);
    const room = bed ? findHostelRoom(bed.room_id) : undefined;
    if (!room) continue;
    raisedMonths.set(`${room.hostel_id}|__count__${allocation.id}`, 2);
  }

  /**
   * Last night's roll call, mostly taken.
   *
   * A handful left uncalled on purpose — the "still to call" figure is what
   * the screen exists to surface, and a fully-marked seed would hide it.
   */
  const lastNight = shiftDate(TODAY_DATE(), -1);

  for (const hostel of hostelList.filter((entry) => entry.is_active)) {
    residentsOn(hostel.id, lastNight).forEach((allocation, index) => {
      if (index % 11 === 7) return;

      const status: RollCallStatus =
        index % 23 === 5
          ? 'absent'
          : index % 17 === 3
            ? 'on_leave'
            : index % 13 === 6
              ? 'out_pass'
              : index % 29 === 9
                ? 'late_return'
                : 'present';

      rollCallMarks.set(rollCallKey(allocation.id, lastNight), {
        allocation_id: allocation.id,
        date: lastNight,
        status,
        remarks:
          status === 'present'
            ? null
            : status === 'on_leave'
              ? 'Home for a family function.'
              : status === 'out_pass'
                ? 'Signed out to the market, back by 8.'
                : status === 'late_return'
                  ? 'Back at 22:40.'
                  : 'Not in the building at lights out.',
        marked_at: `${lastNight}T21:00:00.000Z`,
        marked_by: 'Warden',
      });
    });
  }
}

seedHostel();

function listHostelRooms(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = hostelRoomList.map(hydrateHostelRoom);

  if (search) {
    rows = rows.filter(
      (room) =>
        room.room_no.toLowerCase().includes(search) ||
        room.hostel_name.toLowerCase().includes(search),
    );
  }

  const hostelId = params.get('hostel_id');
  if (hostelId) rows = rows.filter((room) => room.hostel_id === Number(hostelId));

  const type = params.get('type');
  if (type) rows = rows.filter((room) => room.type === type);

  const status = params.get('status');
  if (status) rows = rows.filter((room) => room.status === status);

  return paginate(sortRows(rows, params, 'room_no'), params, '/hostel/rooms');
}

function listHostelAllocations(params: URLSearchParams) {
  let rows = hostelAllocations
    .map(hydrateAllocation)
    .filter((entry): entry is HostelAllocation => entry !== null);

  const search = (params.get('search') ?? '').toLowerCase();
  if (search) {
    rows = rows.filter(
      (entry) =>
        entry.student_name.toLowerCase().includes(search) ||
        entry.admission_no.toLowerCase().includes(search) ||
        entry.room_no.toLowerCase().includes(search),
    );
  }

  const hostelId = params.get('hostel_id');
  if (hostelId) rows = rows.filter((entry) => entry.hostel_id === Number(hostelId));

  const residency = params.get('residency');
  if (residency === 'active') rows = rows.filter((entry) => entry.is_active);
  if (residency === 'past') rows = rows.filter((entry) => !entry.is_active);

  return paginate(sortRows(rows, params, 'student_name'), params, '/hostel/allocations');
}

function hostelSummary() {
  const hostels = hostelList.map(hydrateHostel);
  const beds = hostels.reduce((total, hostel) => total + hostel.beds_count, 0);
  const occupied = hostels.reduce((total, hostel) => total + hostel.occupied_beds, 0);

  const tonight = TODAY_DATE();
  const unmarked = hostelList
    .filter((hostel) => hostel.is_active)
    .reduce((total, hostel) => {
      const call = buildRollCall(hostel.id, tonight);
      return total + (call?.summary.unmarked ?? 0);
    }, 0);

  return {
    hostels: hostels.length,
    rooms: hostelRoomList.length,
    beds,
    occupied_beds: occupied,
    available_beds: hostels.reduce((total, hostel) => total + hostel.available_beds, 0),
    occupancy_percent: beds === 0 ? 0 : Math.round((occupied / beds) * 1000) / 10,
    unmarked_tonight: unmarked,
    outstanding_fees: buildChargeSummary().outstanding,
  };
}

/** The occupancy sheet a warden pins up, as the real export would render it. */
function occupancyText(hostel: StoredHostel): string {
  const hydrated = hydrateHostel(hostel);

  const header = [
    settings.profile.name,
    `${hydrated.code} — ${hydrated.name}`,
    `Warden: ${hydrated.warden_name ?? 'not assigned'}`,
    `${hydrated.occupied_beds} of ${hydrated.beds_count} beds occupied`,
    '',
  ];

  const lines = roomsOfHostel(hostel.id)
    .map(hydrateRoomDetail)
    .sort((left, right) => left.room_no.localeCompare(right.room_no))
    .map((room) =>
      [
        `${room.room_no}  (${room.available_beds} free of ${room.beds_count})`,
        ...room.beds.map(
          (bed) =>
            `      ${bed.bed_no}  ${bed.occupant ? `${bed.occupant.student_name} — ${bed.occupant.admission_no}` : `(${bed.status})`}`,
        ),
      ].join('\n'),
    );

  return [...header, ...lines].join('\n');
}

function residentsCsv(rows: HostelAllocation[]): string {
  const header = [
    'Student', 'Admission no', 'Class', 'Hostel', 'Room', 'Bed',
    'Mess plan', 'Rent', 'Mess', 'Monthly', 'From', 'To',
  ].join(',');

  const lines = rows.map((entry) =>
    [
      `"${entry.student_name}"`,
      entry.admission_no,
      `"${entry.class_name}${entry.section_name ? ` — ${entry.section_name}` : ''}"`,
      `"${entry.hostel_name}"`,
      entry.room_no,
      entry.bed_no,
      entry.mess_plan,
      entry.room_rent,
      entry.mess_charge,
      entry.monthly_charge,
      entry.allocated_on,
      entry.vacated_on ?? '',
    ].join(','),
  );

  return [header, ...lines].join('\n');
}

// --- leave ------------------------------------------------------------------

const findLeaveType = (id: number) => leaveTypes.find((type) => type.id === id);
const findLeaveApplication = (id: number) =>
  leaveApplications.find((application) => application.id === id);

/**
 * The applicant, read from the roster rather than stored on the application.
 *
 * `rosterFor` is the attendance module's own roster builder, reused verbatim:
 * leave and attendance have to agree about who these people are, and two
 * copies of the same three queries is how they would start disagreeing.
 */
const leaveApplicant = (type: LeaveApplicantType, id: number) =>
  rosterFor(type, null, null).find((person) => person.person_id === id) ?? null;

/** The roster record itself, for the fields the sheet shape drops. */
function leaveApplicantEmail(type: LeaveApplicantType, id: number): string | null {
  if (type === 'student') return students.find((entry) => entry.id === id)?.email ?? null;
  if (type === 'teacher') return teachers.find((entry) => entry.id === id)?.email ?? null;
  return staff.find((entry) => entry.id === id)?.email ?? null;
}

/**
 * Working days in a range: weekends and holidays come out.
 *
 * The holiday calendar belongs to the attendance module and is read from it —
 * leave taken over the mid-term break is not leave, and a school that charged
 * it to somebody's balance would be taking days they never had off.
 */
function leaveWorkingDays(from: string, to: string, type: LeaveApplicantType) {
  const excluded: string[] = [];
  const span = daysBetween(from, to);
  if (span < 0) return { working_days: 0, excluded };

  let working = 0;

  for (let offset = 0; offset <= span; offset += 1) {
    const date = shiftDate(from, offset);
    if (isWeekend(date) || holidayFor(date, type)) excluded.push(date);
    else working += 1;
  }

  return { working_days: working, excluded };
}

/** What a request costs: working days, halved when it is half a day. */
function leaveDaysFor(
  from: string,
  to: string,
  portion: DayPortion,
  type: LeaveApplicantType,
) {
  const { working_days, excluded } = leaveWorkingDays(from, to, type);
  return { days: working_days * PORTION_DAYS[portion], working_days, excluded };
}

const applicationDays = (application: StoredLeaveApplication) =>
  leaveDaysFor(
    application.from_date,
    application.to_date,
    application.day_portion,
    application.applicant_type,
  ).days;

function hydrateLeaveType(stored: StoredLeaveType): LeaveType {
  return {
    ...stored,
    applications_count: leaveApplications.filter(
      (application) => application.leave_type_id === stored.id,
    ).length,
  };
}

function hydrateLeaveApplication(stored: StoredLeaveApplication): LeaveApplication {
  const person = leaveApplicant(stored.applicant_type, stored.applicant_id);
  const type = findLeaveType(stored.leave_type_id);
  const today = TODAY_DATE();

  return {
    id: stored.id,
    applicant_type: stored.applicant_type,
    applicant_id: stored.applicant_id,
    applicant_name: person?.person_name ?? 'Former member',
    applicant_identifier: person?.identifier ?? '—',
    photo_url: person?.photo_url ?? null,
    applicant_detail: person?.group_label ?? null,

    leave_type_id: stored.leave_type_id,
    leave_type_name: type?.name ?? 'Leave',
    leave_type_code: type?.code ?? '—',
    is_paid: type?.is_paid ?? true,

    from_date: stored.from_date,
    to_date: stored.to_date,
    day_portion: stored.day_portion,
    days: applicationDays(stored),

    reason: stored.reason,
    document_name: stored.document_name,

    status: stored.status,
    applied_at: stored.applied_at,
    applied_by: stored.applied_by,
    reviewed_at: stored.reviewed_at,
    reviewed_by: stored.reviewed_by,
    review_note: stored.review_note,

    has_started: stored.from_date <= today,
    is_current:
      ABSENT_STATUSES.includes(stored.status) &&
      stored.from_date <= today &&
      stored.to_date >= today,
  };
}

/**
 * What one person has left, per leave type.
 *
 * Pending days are deducted alongside approved ones — `CONSUMING_STATUSES` is
 * the list, and without it somebody could file thirty days across ten
 * requests with every one of them looking affordable.
 */
function leaveEntitlements(type: LeaveApplicantType, personId: number): Entitlement[] {
  return leaveTypes
    .filter((entry) => entry.is_active && entry.applies_to.includes(type))
    .map((entry) => {
      const rows = leaveApplications.filter(
        (application) =>
          application.applicant_type === type &&
          application.applicant_id === personId &&
          application.leave_type_id === entry.id,
      );

      const total = (statuses: LeaveStatus[]) =>
        rows
          .filter((application) => statuses.includes(application.status))
          .reduce((sum, application) => sum + applicationDays(application), 0);

      const taken = total(['approved']);
      const pending = total(['pending']);
      const consumed = total(CONSUMING_STATUSES);

      return {
        leave_type_id: entry.id,
        leave_type_name: entry.name,
        leave_type_code: entry.code,
        quota: entry.annual_quota,
        taken,
        pending,
        available: entry.annual_quota === null ? null : entry.annual_quota - consumed,
      };
    });
}

function buildLeaveBalance(type: LeaveApplicantType, personId: number): LeaveBalance | null {
  const person = leaveApplicant(type, personId);
  if (!person) return null;

  const entitlements = leaveEntitlements(type, personId);
  const quotaed = entitlements.filter((entry) => entry.quota !== null);

  return {
    id: `${type}-${personId}`,
    applicant_type: type,
    applicant_id: personId,
    applicant_name: person.person_name,
    applicant_identifier: person.identifier,
    photo_url: person.photo_url,
    applicant_detail: person.group_label,
    entitlements,
    total_quota: quotaed.reduce((sum, entry) => sum + (entry.quota ?? 0), 0),
    total_taken: entitlements.reduce((sum, entry) => sum + entry.taken, 0),
    total_pending: entitlements.reduce((sum, entry) => sum + entry.pending, 0),
    total_available: quotaed.reduce((sum, entry) => sum + (entry.available ?? 0), 0),
  };
}

const LEAVE_ROSTER_TYPES: LeaveApplicantType[] = ['student', 'teacher', 'staff'];

function listLeaveBalances(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const only = params.get('applicant_type') as LeaveApplicantType | null;

  const rows = (only ? [only] : LEAVE_ROSTER_TYPES).flatMap((type) =>
    rosterFor(type, null, null)
      .filter(
        (person) =>
          !search ||
          person.person_name.toLowerCase().includes(search) ||
          person.identifier.toLowerCase().includes(search),
      )
      .map((person) => buildLeaveBalance(type, person.person_id))
      .filter((balance): balance is LeaveBalance => balance !== null),
  );

  return paginate(sortRows(rows, params, 'applicant_name'), params, '/leave/balances');
}

function listLeaveApplications(params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const applicantType = params.get('applicant_type');
  const status = params.get('status');
  const leaveTypeId = params.get('leave_type_id');
  const from = params.get('from');
  const to = params.get('to');

  const rows = leaveApplications.map(hydrateLeaveApplication).filter((application) => {
    if (applicantType && application.applicant_type !== applicantType) return false;
    if (status && application.status !== status) return false;
    if (leaveTypeId && application.leave_type_id !== Number(leaveTypeId)) return false;
    // Overlap, not containment: a fortnight's leave belongs in a report on any
    // week of it.
    if (from && application.to_date < from) return false;
    if (to && application.from_date > to) return false;

    if (search) {
      const haystack =
        `${application.applicant_name} ${application.applicant_identifier}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });

  return paginate(sortRows(rows, params, 'applied_at'), params, '/leave/applications');
}

/** Days of an application that fall inside a window, working days only. */
function leaveDaysInWindow(
  application: StoredLeaveApplication,
  from: string,
  to: string,
): number {
  const start = application.from_date > from ? application.from_date : from;
  const end = application.to_date < to ? application.to_date : to;
  if (end < start) return 0;

  const { working_days } = leaveWorkingDays(start, end, application.applicant_type);
  return working_days * PORTION_DAYS[application.day_portion];
}

function buildLeaveReport(from: string, to: string, only: LeaveApplicantType | null) {
  const taken = leaveApplications.filter(
    (application) =>
      ABSENT_STATUSES.includes(application.status) &&
      application.to_date >= from &&
      application.from_date <= to &&
      (!only || application.applicant_type === only),
  );

  // Column order follows the leave-type register, not the order applications
  // happen to arrive in — a report whose columns move between runs is a
  // report nobody can compare.
  const columns = leaveTypes
    .filter((type) => taken.some((application) => application.leave_type_id === type.id))
    .map((type) => ({ code: type.code, name: type.name }));

  const byPerson = new Map<string, LeaveUsageRow>();
  const totalsByType: Record<string, number> = {};

  for (const application of taken) {
    const days = leaveDaysInWindow(application, from, to);
    if (days === 0) continue;

    const type = findLeaveType(application.leave_type_id);
    const code = type?.code ?? '—';
    const key = `${application.applicant_type}|${application.applicant_id}`;

    let row = byPerson.get(key);
    if (!row) {
      const person = leaveApplicant(application.applicant_type, application.applicant_id);
      row = {
        applicant_type: application.applicant_type,
        applicant_id: application.applicant_id,
        applicant_name: person?.person_name ?? 'Former member',
        applicant_identifier: person?.identifier ?? '—',
        applicant_detail: person?.group_label ?? null,
        by_type: {},
        total_days: 0,
        applications: 0,
        unpaid_days: 0,
      };
      byPerson.set(key, row);
    }

    row.by_type[code] = (row.by_type[code] ?? 0) + days;
    row.total_days += days;
    row.applications += 1;
    if (type && !type.is_paid) row.unpaid_days += days;

    totalsByType[code] = (totalsByType[code] ?? 0) + days;
  }

  const rows = [...byPerson.values()].sort((left, right) =>
    right.total_days - left.total_days ||
    left.applicant_name.localeCompare(right.applicant_name),
  );

  return {
    from_date: from,
    to_date: to,
    applicant_type: only,
    columns,
    rows,
    totals: {
      people: rows.length,
      applications: rows.reduce((sum, row) => sum + row.applications, 0),
      days: rows.reduce((sum, row) => sum + row.total_days, 0),
      unpaid_days: rows.reduce((sum, row) => sum + row.unpaid_days, 0),
      by_type: totalsByType,
    },
  };
}

function buildAwayToday(only: LeaveApplicantType | null): AwayToday[] {
  const today = TODAY_DATE();

  return leaveApplications
    .filter(
      (application) =>
        ABSENT_STATUSES.includes(application.status) &&
        application.from_date <= today &&
        application.to_date >= today &&
        (!only || application.applicant_type === only),
    )
    .map((application) => {
      const person = leaveApplicant(application.applicant_type, application.applicant_id);
      const type = findLeaveType(application.leave_type_id);

      return {
        application_id: application.id,
        applicant_type: application.applicant_type,
        applicant_id: application.applicant_id,
        applicant_name: person?.person_name ?? 'Former member',
        applicant_identifier: person?.identifier ?? '—',
        applicant_detail: person?.group_label ?? null,
        photo_url: person?.photo_url ?? null,
        leave_type_name: type?.name ?? 'Leave',
        day_portion: application.day_portion,
        from_date: application.from_date,
        to_date: application.to_date,
        // Working days still to run, today included — "back on Monday" is the
        // answer somebody wants, not "three calendar days".
        days_remaining: Math.max(
          1,
          leaveWorkingDays(today, application.to_date, application.applicant_type).working_days,
        ),
      };
    })
    .sort((left, right) => left.applicant_name.localeCompare(right.applicant_name));
}

function buildLeaveSummary() {
  const today = TODAY_DATE();
  const month = today.slice(0, 7);
  const away = buildAwayToday(null);

  const awayByType = { student: 0, teacher: 0, staff: 0 } as Record<LeaveApplicantType, number>;
  for (const person of away) awayByType[person.applicant_type] += 1;

  const pending = leaveApplications.filter((entry) => entry.status === 'pending');

  return {
    pending: pending.length,
    // Undecided, and the leave has already begun — somebody is either absent
    // without permission or at work expecting not to be.
    overdue_decisions: pending.filter((entry) => entry.from_date <= today).length,
    away_today: away.length,
    approved_this_month: leaveApplications.filter(
      (entry) => entry.status === 'approved' && entry.from_date.startsWith(month),
    ).length,
    away_by_type: awayByType,
  };
}

/** A person may not hold two live applications over the same days. */
const overlappingLeave = (
  type: LeaveApplicantType,
  personId: number,
  from: string,
  to: string,
  ignoreId = 0,
) =>
  leaveApplications.find(
    (entry) =>
      entry.id !== ignoreId &&
      entry.applicant_type === type &&
      entry.applicant_id === personId &&
      CONSUMING_STATUSES.includes(entry.status) &&
      entry.from_date <= to &&
      entry.to_date >= from,
  );

function leaveRegisterText(rows: LeaveApplication[]): string {
  const header = 'Applicant,Type,Leave,From,To,Days,Status,Reviewed by,Reason';

  const lines = rows.map((row) =>
    [
      row.applicant_name,
      row.applicant_type,
      row.leave_type_code,
      row.from_date,
      row.to_date,
      row.days,
      row.status,
      row.reviewed_by ?? '',
      row.reason.replace(/[\n,]/g, ' '),
    ].join(','),
  );

  return [header, ...lines].join('\n');
}

function leaveUsageText(report: ReturnType<typeof buildLeaveReport>): string {
  const header = ['Applicant', 'Type', ...report.columns.map((column) => column.code), 'Total', 'Unpaid'].join(',');

  const lines = report.rows.map((row) =>
    [
      row.applicant_name,
      row.applicant_type,
      ...report.columns.map((column) => row.by_type[column.code] ?? 0),
      row.total_days,
      row.unpaid_days,
    ].join(','),
  );

  return [header, ...lines].join('\n');
}

// --- leave: seeding ---------------------------------------------------------

/**
 * Applications laid down against the live rosters.
 *
 * Every one is filed the way the API would accept it — a type the applicant
 * may actually ask for, short enough for that type's limit, backdated only
 * where the type allows it, and never overlapping another live request for
 * the same person. A seed that broke its own write rules would be a seed that
 * proved nothing.
 */
function seedLeave(): void {
  leaveTypes = leaveTypeSeed.map((seed) => ({
    id: seed.id,
    name: seed.name,
    code: seed.code,
    applies_to: seed.applies_to,
    annual_quota: seed.annual_quota,
    is_paid: seed.is_paid,
    requires_document: seed.requires_document,
    allows_backdated: seed.allows_backdated,
    max_consecutive_days: seed.max_consecutive_days,
    is_active: seed.is_active ?? true,
    created_at: '2025-04-01T00:00:00.000000Z',
  }));

  const today = TODAY_DATE();
  const rosters: Record<LeaveApplicantType, ReturnType<typeof rosterFor>> = {
    student: rosterFor('student', null, null),
    teacher: rosterFor('teacher', null, null),
    staff: rosterFor('staff', null, null),
  };
  const cursor: Record<LeaveApplicantType, number> = { student: 0, teacher: 0, staff: 0 };

  // Weighted towards students, who are most of any school's leave register.
  const order: LeaveApplicantType[] = ['student', 'teacher', 'student', 'staff', 'student', 'teacher'];

  let counter = 0;

  for (let round = 0; round < 2; round += 1) {
    for (const shape of applicationShapes) {
      const applicantType = order[counter % order.length];
      counter += 1;

      const roster = rosters[applicantType];
      if (roster.length === 0) continue;

      const person = roster[cursor[applicantType] % roster.length];
      cursor[applicantType] += 1;

      const from = shiftDate(today, shape.fromOffset);
      const to = shiftDate(from, shape.span - 1);
      const portion: DayPortion = shape.half ?? 'full';
      const { days } = leaveDaysFor(from, to, portion, applicantType);

      // A range that is entirely holiday or weekend is not leave at all.
      if (days === 0) continue;
      if (overlappingLeave(applicantType, person.person_id, from, to)) continue;

      const backdated = from < today;

      const candidates = leaveTypes.filter(
        (type) =>
          type.is_active &&
          type.applies_to.includes(applicantType) &&
          (!backdated || type.allows_backdated) &&
          (type.max_consecutive_days === null || days <= type.max_consecutive_days) &&
          (type.annual_quota === null || days <= type.annual_quota) &&
          (!type.requires_document || shape.document !== undefined),
      );
      if (candidates.length === 0) continue;

      const leaveType = candidates[counter % candidates.length];

      // Filed in advance where the type demands it, the morning after where
      // it does not — which is how sick leave actually reaches an office.
      const appliedOn = backdated ? shiftDate(from, 1) : shiftDate(from, -3);
      const decided = shape.status !== 'pending' && shape.status !== 'withdrawn';

      leaveApplications.push({
        id: nextLeaveApplicationId++,
        applicant_type: applicantType,
        applicant_id: person.person_id,
        leave_type_id: leaveType.id,
        from_date: from,
        to_date: to,
        day_portion: portion,
        reason: shape.reason,
        document_name: shape.document ?? null,
        status: shape.status,
        applied_at: `${appliedOn}T09:${String(10 + (counter % 45)).padStart(2, '0')}:00.000000Z`,
        applied_by: round === 1 && counter % 3 === 0 ? 'Front desk' : null,
        reviewed_at: decided ? `${shiftDate(appliedOn, 1)}T11:20:00.000000Z` : null,
        reviewed_by: decided ? 'Principal' : null,
        review_note: shape.note ?? null,
      });
    }
  }

  /**
   * One application against the retired type, so it carries a count and
   * cannot be deleted — the "retire it instead" path the screen warns about.
   */
  const retired = leaveTypes.find((type) => !type.is_active);
  const teacher = rosters.teacher[rosters.teacher.length - 1];

  if (retired && teacher) {
    const from = shiftDate(today, -120);
    const to = shiftDate(from, 9);

    if (!overlappingLeave('teacher', teacher.person_id, from, to)) {
      leaveApplications.push({
        id: nextLeaveApplicationId++,
        applicant_type: 'teacher',
        applicant_id: teacher.person_id,
        leave_type_id: retired.id,
        from_date: from,
        to_date: to,
        day_portion: 'full',
        reason: 'Refresher course at the regional institute',
        document_name: 'course-letter.pdf',
        status: 'approved',
        applied_at: `${shiftDate(from, -14)}T10:00:00.000000Z`,
        applied_by: null,
        reviewed_at: `${shiftDate(from, -12)}T10:00:00.000000Z`,
        reviewed_by: 'Principal',
        review_note: 'Approved. Arrange cover for the senior sections.',
      });
    }
  }
}

seedLeave();

// --- transport --------------------------------------------------------------

/** Whole days from today to a date. Negative once it has passed. */
function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return daysBetween(TODAY_DATE(), date);
}

const findVehicle = (id: number) => vehicleList.find((vehicle) => vehicle.id === id);
const findRoute = (id: number) => routeList.find((route) => route.id === id);
const findStop = (id: number) => stopList.find((stop) => stop.id === id);

const stopsOfRoute = (routeId: number) =>
  stopList
    .filter((stop) => stop.route_id === routeId)
    .sort((left, right) => left.sequence - right.sequence);

const activeTransportAssignments = () => transportAssignments.filter((entry) => entry.end_date === null);

const routeStudentCount = (routeId: number) =>
  activeTransportAssignments().filter((entry) => entry.route_id === routeId).length;

const stopStudentCount = (stopId: number) =>
  activeTransportAssignments().filter((entry) => entry.stop_id === stopId).length;

/** The route a bus is on, if any. One bus, one route. */
const routeOfVehicle = (vehicleId: number) =>
  routeList.find((route) => route.vehicle_id === vehicleId);

/** Drivers are staff — this module never keeps a second copy of them. */
const driverRecord = (id: number | null) =>
  id === null ? null : (staff.find((member) => member.id === id) ?? null);

function buildDocuments(vehicle: StoredVehicle): VehicleDocument[] {
  return DOCUMENT_KINDS.map((kind) => {
    const expiresOn = vehicle.expiries[kind];
    const daysRemaining = daysUntil(expiresOn);

    return {
      kind,
      expires_on: expiresOn,
      days_remaining: daysRemaining,
      status: complianceFor(daysRemaining),
    };
  });
}

/**
 * Can this bus legally carry children?
 *
 * Only insurance and fitness ground a bus. A lapsed permit or pollution
 * certificate is a fine, not a crime, and blocking on all four would stop a
 * school running over a piece of paper nobody can renew in a morning.
 */
function blockingDocuments(vehicle: StoredVehicle): DocumentKind[] {
  return buildDocuments(vehicle)
    .filter((document) => BLOCKING_DOCUMENTS.includes(document.kind))
    .filter((document) => document.status === 'expired')
    .map((document) => document.kind);
}

function hydrateVehicle(vehicle: StoredVehicle): Vehicle {
  const driver = driverRecord(vehicle.driver_id);
  const attendant = driverRecord(vehicle.attendant_id);
  const route = routeOfVehicle(vehicle.id);
  const device = gpsDeviceList.find((entry) => entry.vehicle_id === vehicle.id);
  const documents = buildDocuments(vehicle);

  return {
    id: vehicle.id,
    registration_no: vehicle.registration_no,
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    manufacture_year: vehicle.manufacture_year,
    capacity: vehicle.capacity,
    fuel_type: vehicle.fuel_type,
    status: vehicle.status,
    driver_id: driver?.id ?? null,
    driver_name: driver?.full_name ?? null,
    driver_phone: driver?.phone ?? null,
    attendant_id: attendant?.id ?? null,
    attendant_name: attendant?.full_name ?? null,
    route_id: route?.id ?? null,
    route_name: route?.name ?? null,
    gps_device_id: device?.id ?? null,
    gps_imei: device?.imei ?? null,
    documents,
    compliance: worstCompliance(documents.map((document) => document.status)),
    odometer_km: vehicle.odometer_km,
    notes: vehicle.notes,
    created_at: vehicle.created_at,
  };
}

const hydrateStop = (stop: StoredStop): RouteStop => ({
  id: stop.id,
  route_id: stop.route_id,
  name: stop.name,
  sequence: stop.sequence,
  landmark: stop.landmark,
  latitude: stop.latitude,
  longitude: stop.longitude,
  pickup_time: stop.pickup_time,
  drop_time: stop.drop_time,
  fare: stop.fare,
  students_count: stopStudentCount(stop.id),
});

function hydrateRoute(route: StoredRoute): TransportRoute {
  const stops = stopsOfRoute(route.id);
  const vehicle = route.vehicle_id === null ? null : (findVehicle(route.vehicle_id) ?? null);
  const driver = vehicle ? driverRecord(vehicle.driver_id) : null;

  const students = routeStudentCount(route.id);
  const capacity = vehicle?.capacity ?? 0;

  return {
    id: route.id,
    name: route.name,
    code: route.code,
    description: route.description,
    vehicle_id: vehicle?.id ?? null,
    vehicle_registration: vehicle?.registration_no ?? null,
    vehicle_name: vehicle?.name ?? null,
    driver_name: driver?.full_name ?? null,
    capacity,
    distance_km: route.distance_km,
    // The run's ends come from the stops, so they cannot drift from them.
    start_time: stops[0]?.pickup_time ?? null,
    end_time: stops.at(-1)?.drop_time ?? null,
    stops_count: stops.length,
    students_count: students,
    seats_available: Math.max(0, capacity - students),
    is_active: route.is_active,
    created_at: route.created_at,
  };
}

const hydrateRouteDetail = (route: StoredRoute): RouteDetail => ({
  ...hydrateRoute(route),
  stops: stopsOfRoute(route.id).map(hydrateStop),
});

function hydrateTransportAssignment(assignment: StoredAssignment): TransportAssignment | null {
  const student = students.find((entry) => entry.id === assignment.student_id);
  const route = findRoute(assignment.route_id);
  const stop = findStop(assignment.stop_id);
  if (!student || !route || !stop) return null;

  return {
    id: assignment.id,
    student_id: student.id,
    student_name: student.full_name,
    admission_no: student.admission_no,
    photo_url: student.photo_url,
    class_name: student.class_name,
    section_name: student.section_name,
    route_id: route.id,
    route_name: route.name,
    stop_id: stop.id,
    stop_name: stop.name,
    trip: assignment.trip,
    // Derived from the stop, so a fare change reaches everybody boarding there.
    fare: fromMinor(Math.round(toMinor(stop.fare) * TRIP_FARE_MULTIPLIER[assignment.trip])),
    start_date: assignment.start_date,
    end_date: assignment.end_date,
    is_active: assignment.end_date === null,
  };
}

/**
 * Whether a driver may be put on a bus.
 *
 * Their licence is the staff module's record; transport only reads it. A
 * lapsed licence, or a staff member no longer in service, is a refusal — and
 * the reason travels with it so the picker can say why.
 */
function driverStanding(member: StaffMemberDetail) {
  const days = daysUntil(member.licence_expiry);

  const blockedReason =
    member.status !== 'active'
      ? 'Not in service'
      : !member.licence_number
        ? 'No licence recorded'
        : days === null
          ? 'No licence expiry recorded'
          : days < 0
            ? `Licence lapsed ${Math.abs(days)} days ago`
            : null;

  return { days, blockedReason };
}

function buildDrivers() {
  return staff
    .filter((member) => member.staff_type === 'driver')
    .map((member) => {
      const { days, blockedReason } = driverStanding(member);
      const vehicle = vehicleList.find((entry) => entry.driver_id === member.id);
      const route = vehicle ? routeOfVehicle(vehicle.id) : undefined;

      return {
        id: member.id,
        full_name: member.full_name,
        employee_id: member.employee_id,
        phone: member.phone,
        photo_url: member.photo_url,
        status: member.status,
        licence_number: member.licence_number,
        licence_expiry: member.licence_expiry,
        licence_days_remaining: days,
        vehicle_id: vehicle?.id ?? null,
        vehicle_registration: vehicle?.registration_no ?? null,
        route_id: route?.id ?? null,
        route_name: route?.name ?? null,
        can_drive: blockedReason === null,
        blocked_reason: blockedReason,
      };
    })
    .sort((left, right) => left.full_name.localeCompare(right.full_name));
}

// --- GPS --------------------------------------------------------------------

const gpsStatusOf = (device: StoredGpsDevice): GpsStatus => {
  if (device.vehicle_id === null) return 'unassigned';
  if (device.last_ping_minutes_ago === null) return 'offline';
  if (device.last_ping_minutes_ago * 60 > POSITION_STALE_SECONDS) return 'offline';

  const vehicle = findVehicle(device.vehicle_id);
  // A bus in the workshop reports from the yard: parked, not missing.
  return vehicle?.status === 'active' ? 'online' : 'idle';
};

const hydrateGpsDevice = (device: StoredGpsDevice): GpsDevice => {
  const vehicle = device.vehicle_id === null ? null : (findVehicle(device.vehicle_id) ?? null);
  const pingedAt =
    device.last_ping_minutes_ago === null
      ? null
      : new Date(Date.now() - device.last_ping_minutes_ago * 60_000).toISOString();

  return {
    id: device.id,
    imei: device.imei,
    sim_number: device.sim_number,
    provider: device.provider,
    vehicle_id: vehicle?.id ?? null,
    vehicle_registration: vehicle?.registration_no ?? null,
    status: gpsStatusOf(device),
    last_ping_at: pingedAt,
    installed_on: device.installed_on,
  };
};

/**
 * A plausible live position for each tracked bus.
 *
 * Derived from the clock rather than randomised, so two polls a second apart
 * do not teleport the bus across the city — and so the morning run actually
 * progresses while somebody watches it. A real device pushes this; the shape
 * is what matters.
 */
function buildPositions(): VehiclePosition[] {
  const now = new Date();
  const minutesToday = now.getHours() * 60 + now.getMinutes();

  const positions: VehiclePosition[] = [];

  for (const device of gpsDeviceList) {
    if (device.vehicle_id === null) continue;

    const build = (): VehiclePosition | null => {
      const vehicle = findVehicle(device.vehicle_id!);
      if (!vehicle) return null;

      const route = routeOfVehicle(vehicle.id);
      const stops = route ? stopsOfRoute(route.id) : [];
      const status = gpsStatusOf(device);

      // Progress through the morning run, by the clock.
      const first = stops[0] ? (toMinutes(stops[0].pickup_time) ?? 0) : 0;
      const last = stops.at(-1) ? (toMinutes(stops.at(-1)!.pickup_time) ?? 0) : 0;
      const span = Math.max(1, last - first);

      const rawProgress = ((minutesToday - first) / span) * 100;
      const progress = stops.length === 0 ? 0 : Math.min(100, Math.max(0, rawProgress));

      const passedCount = Math.floor((progress / 100) * stops.length);
      const lastStop = stops[Math.max(0, passedCount - 1)] ?? null;
      const nextStop = stops[passedCount] ?? null;

      // Interpolate between the two surveyed stops it is between.
      const from = lastStop ?? stops[0] ?? null;
      const to = nextStop ?? stops.at(-1) ?? null;
      const share = stops.length > 1 ? ((progress / 100) * stops.length) % 1 : 0;

      const latitude =
        from?.latitude !== null && from?.latitude !== undefined && to?.latitude !== null && to?.latitude !== undefined
          ? from.latitude + (to.latitude - from.latitude) * share
          : 12.9716;
      const longitude =
        from?.longitude !== null && from?.longitude !== undefined && to?.longitude !== null && to?.longitude !== undefined
          ? from.longitude + (to.longitude - from.longitude) * share
          : 77.5946;

      const onRun = progress > 0 && progress < 100 && status === 'online';
      const driver = driverRecord(vehicle.driver_id);

      return {
        vehicle_id: vehicle.id,
        registration_no: vehicle.registration_no,
        vehicle_name: vehicle.name,
        route_id: route?.id ?? null,
        route_name: route?.name ?? null,
        driver_name: driver?.full_name ?? null,
        latitude: Math.round(latitude * 1e6) / 1e6,
        longitude: Math.round(longitude * 1e6) / 1e6,
        speed_kmph: onRun ? 18 + ((vehicle.id * 7 + minutesToday) % 22) : 0,
        heading_degrees: (vehicle.id * 53 + minutesToday) % 360,
        recorded_at: new Date(
          Date.now() - (device.last_ping_minutes_ago ?? 0) * 60_000,
        ).toISOString(),
        is_stale: status === 'offline',
        status,
        last_stop_id: lastStop?.id ?? null,
        last_stop_name: lastStop?.name ?? null,
        next_stop_id: nextStop?.id ?? null,
        next_stop_name: nextStop?.name ?? null,
        eta_minutes: nextStop
          ? Math.max(0, (toMinutes(nextStop.pickup_time) ?? minutesToday) - minutesToday)
          : null,
        progress_percent: Math.round(progress),
        students_on_board: route ? Math.round(routeStudentCount(route.id) * (progress / 100)) : 0,
      };
    };

    const position = build();
    if (position) positions.push(position);
  }

  return positions;
}

// --- transport: seeding -----------------------------------------------------

function seedTransport(): void {
  const drivers = staff.filter(
    (member) => member.staff_type === 'driver' && member.status === 'active',
  );

  vehicleList = vehicleSeed.map((seed, index) => ({
    id: seed.id,
    registration_no: seed.registration_no,
    name: seed.name,
    make: seed.make,
    model: seed.model,
    manufacture_year: seed.manufacture_year,
    capacity: seed.capacity,
    fuel_type: seed.fuel_type,
    status: seed.status,
    // Drivers come from the live staff roster; a retired bus gets nobody.
    driver_id: seed.status === 'retired' ? null : (drivers[index % Math.max(1, drivers.length)]?.id ?? null),
    attendant_id: null,
    expiries: {
      insurance: seed.insurance === null ? null : documentDate(seed.insurance),
      fitness: seed.fitness === null ? null : documentDate(seed.fitness),
      permit: seed.permit === null ? null : documentDate(seed.permit),
      pollution: seed.pollution === null ? null : documentDate(seed.pollution),
    },
    odometer_km: seed.odometer_km,
    notes: seed.notes,
    created_at: '2025-04-01T00:00:00.000000Z',
  }));

  routeList = routeSeed.map((seed) => ({
    id: seed.id,
    name: seed.name,
    code: seed.code,
    description: seed.description,
    vehicle_id: seed.vehicleId,
    distance_km: seed.distance_km,
    is_active: seed.is_active,
    created_at: '2025-04-01T00:00:00.000000Z',
  }));

  for (const seed of routeSeed) {
    seed.stops.forEach((stop, index) => {
      stopList.push({
        id: nextStopId++,
        route_id: seed.id,
        name: stop.name,
        sequence: index + 1,
        landmark: stop.landmark,
        latitude: stop.lat,
        longitude: stop.lng,
        pickup_time: stop.pickup,
        drop_time: stop.drop,
        fare: stop.fare,
      });
    });
  }

  gpsDeviceList = gpsDeviceSeed.map((seed) => ({
    id: seed.id,
    imei: seed.imei,
    sim_number: seed.sim_number,
    provider: seed.provider,
    vehicle_id: seed.vehicleId,
    installed_on: '2025-04-10',
    last_ping_minutes_ago: seed.lastPingMinutesAgo,
  }));

  // Fill the routes from the live student roster, never past the bus's seats.
  const riders = students.filter((student) => student.status === 'active');
  const runningRoutes = routeList.filter((route) => route.is_active && route.vehicle_id !== null);

  let cursor = 0;
  for (const route of runningRoutes) {
    const vehicle = route.vehicle_id === null ? null : findVehicle(route.vehicle_id);
    const stops = stopsOfRoute(route.id);
    if (!vehicle || stops.length === 0) continue;

    // A little under half the seats, so the "seats free" figure is meaningful
    // and assigning somebody at the desk still works on a fresh clone.
    const target = Math.min(Math.floor(vehicle.capacity * 0.45), riders.length - cursor);

    for (let index = 0; index < target; index += 1) {
      const student = riders[cursor++];
      if (!student) break;

      transportAssignments.push({
        id: nextTransportAssignmentId++,
        student_id: student.id,
        route_id: route.id,
        stop_id: stops[index % stops.length].id,
        // Roughly one in seven takes the bus only one way.
        trip: index % 7 === 3 ? 'pickup' : index % 11 === 5 ? 'drop' : 'both',
        start_date: '2025-06-01',
        end_date: null,
      });
    }
  }
}

seedTransport();

function listVehicles(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = vehicleList.map(hydrateVehicle);

  if (search) {
    rows = rows.filter(
      (vehicle) =>
        vehicle.name.toLowerCase().includes(search) ||
        vehicle.registration_no.toLowerCase().includes(search) ||
        (vehicle.driver_name ?? '').toLowerCase().includes(search),
    );
  }

  const status = params.get('status');
  if (status) rows = rows.filter((vehicle) => vehicle.status === status);

  const compliance = params.get('compliance');
  if (compliance) rows = rows.filter((vehicle) => vehicle.compliance === compliance);

  return paginate(sortRows(rows, params, 'name'), params, '/transport/vehicles');
}

function listRoutes(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = routeList.map(hydrateRoute);

  if (search) {
    rows = rows.filter(
      (route) =>
        route.name.toLowerCase().includes(search) || route.code.toLowerCase().includes(search),
    );
  }

  if (params.get('is_active') === '1') rows = rows.filter((route) => route.is_active);

  return paginate(sortRows(rows, params, 'code'), params, '/transport/routes');
}

function listTransportAssignments(params: URLSearchParams) {
  let rows = transportAssignments
    .map(hydrateTransportAssignment)
    .filter((entry): entry is TransportAssignment => entry !== null);

  const routeId = params.get('route_id');
  if (routeId) rows = rows.filter((entry) => entry.route_id === Number(routeId));

  const stopId = params.get('stop_id');
  if (stopId) rows = rows.filter((entry) => entry.stop_id === Number(stopId));

  const search = (params.get('search') ?? '').toLowerCase();
  if (search) {
    rows = rows.filter(
      (entry) =>
        entry.student_name.toLowerCase().includes(search) ||
        entry.admission_no.toLowerCase().includes(search),
    );
  }

  return paginate(sortRows(rows, params, 'student_name'), params, '/transport/assignments');
}

function transportSummary() {
  const vehicles = vehicleList.map(hydrateVehicle);
  const devices = gpsDeviceList.map(hydrateGpsDevice).filter((device) => device.vehicle_id !== null);

  return {
    vehicles: vehicles.length,
    active_vehicles: vehicles.filter((vehicle) => vehicle.status === 'active').length,
    routes: routeList.filter((route) => route.is_active).length,
    students: activeTransportAssignments().length,
    expired_documents: vehicles.filter(
      (vehicle) => vehicle.status !== 'retired' && blockingDocuments(
        vehicleList.find((entry) => entry.id === vehicle.id)!,
      ).length > 0,
    ).length,
    expiring_documents: vehicles.filter(
      (vehicle) => vehicle.status !== 'retired' && vehicle.compliance === 'expiring',
    ).length,
    gps_online: devices.filter((device) => device.status === 'online').length,
    gps_offline: devices.filter((device) => device.status === 'offline').length,
  };
}

/**
 * Renumber a route's stops so the sequence is contiguous from one.
 *
 * Called after every insert, move and delete. Gaps in a sequence are how a
 * "stop 4" ends up between stops 6 and 7 six months later.
 */
function resequence(routeId: number): void {
  stopsOfRoute(routeId).forEach((stop, index) => {
    stop.sequence = index + 1;
  });
}

/**
 * Do a stop's times fit where it sits on the run?
 *
 * A bus visits its stops in order, so a stop later in the sequence cannot be
 * picked up earlier than the one before it. Checked on both sides, because a
 * move is as capable of breaking the order as an edit is.
 */
function timeOrderError(
  routeId: number,
  sequence: number,
  pickupTime: string,
  ignoreStopId?: number,
): string | null {
  const others = stopsOfRoute(routeId).filter((stop) => stop.id !== ignoreStopId);

  const before = others.filter((stop) => stop.sequence < sequence).at(-1);
  const after = others.find((stop) => stop.sequence >= sequence);

  if (before && pickupTime <= before.pickup_time) {
    return `${before.name} is stop ${before.sequence} at ${before.pickup_time} — a later stop cannot be earlier.`;
  }
  if (after && pickupTime >= after.pickup_time) {
    return `${after.name} is at ${after.pickup_time} — an earlier stop cannot be later.`;
  }

  return null;
}

/**
 * May this driver be put on this bus?
 *
 * Two rules: a licence that still lets them drive, and not already behind
 * another wheel. Returns the reason rather than a boolean so the 422 can say
 * which of the two it was.
 */
function driverAssignmentError(driverId: number | null, vehicleId: number | null): string | null {
  if (driverId === null) return null;

  const member = staff.find((entry) => entry.id === driverId);
  if (!member) return 'That staff member does not exist.';
  if (member.staff_type !== 'driver') return `${member.full_name} is not a driver.`;

  const { blockedReason } = driverStanding(member);
  if (blockedReason) return `${member.full_name}: ${blockedReason.toLowerCase()}.`;

  const other = vehicleList.find(
    (vehicle) => vehicle.driver_id === driverId && vehicle.id !== vehicleId,
  );
  if (other) return `${member.full_name} already drives ${other.name}.`;

  return null;
}

/**
 * May this bus be put on this route?
 *
 * A bus is in one place at seven in the morning, and one whose insurance or
 * fitness has lapsed may not carry children at all.
 */
function vehicleAssignmentError(vehicleId: number | null, routeId: number | null): string | null {
  if (vehicleId === null) return null;

  const vehicle = findVehicle(vehicleId);
  if (!vehicle) return 'That bus does not exist.';

  if (vehicle.status === 'retired') return `${vehicle.name} is retired.`;

  const other = routeList.find((route) => route.vehicle_id === vehicleId && route.id !== routeId);
  if (other) return `${vehicle.name} already runs ${other.name}.`;

  const lapsed = blockingDocuments(vehicle);
  if (lapsed.length > 0) {
    return `${vehicle.name} cannot carry children — ${lapsed.join(' and ')} has lapsed.`;
  }

  return null;
}

/** One tracker per bus — two would report two positions for one vehicle. */
function trackerFitError(vehicleId: number | null, deviceId: number | null): string | null {
  if (vehicleId === null) return null;

  const vehicle = findVehicle(vehicleId);
  if (!vehicle) return 'That bus does not exist.';

  const other = gpsDeviceList.find(
    (device) => device.vehicle_id === vehicleId && device.id !== deviceId,
  );
  if (other) return `${vehicle.name} already has tracker ${other.imei} fitted.`;

  return null;
}

/** The route sheet a driver carries, as the real export would render it. */
function routeSheetText(route: StoredRoute): string {
  const detail = hydrateRouteDetail(route);

  const header = [
    settings.profile.name,
    `${detail.code} — ${detail.name}`,
    `${detail.vehicle_name ?? 'No bus'} · ${detail.driver_name ?? 'No driver'}`,
    `${detail.stops_count} stops · ${detail.students_count} students`,
    '',
  ];

  const lines = detail.stops.map((stop) => {
    const boarding = activeTransportAssignments()
      .filter((entry) => entry.stop_id === stop.id)
      .map((entry) => students.find((student) => student.id === entry.student_id)?.full_name)
      .filter(Boolean);

    return [
      `${stop.sequence}. ${stop.name}  ${stop.pickup_time} / ${stop.drop_time}`,
      ...boarding.map((name) => `      ${name}`),
    ].join('\n');
  });

  return [...header, ...lines].join('\n');
}

function fleetCsv(rows: Vehicle[]): string {
  const header = [
    'Name', 'Registration', 'Make', 'Model', 'Year', 'Seats', 'Fuel', 'Status',
    'Driver', 'Route', 'Insurance', 'Fitness', 'Permit', 'Pollution', 'Papers',
  ].join(',');

  const lines = rows.map((vehicle) => {
    const expiry = (kind: DocumentKind) =>
      vehicle.documents.find((document) => document.kind === kind)?.expires_on ?? '';

    return [
      `"${vehicle.name}"`,
      vehicle.registration_no,
      vehicle.make ?? '',
      vehicle.model ?? '',
      vehicle.manufacture_year ?? '',
      vehicle.capacity,
      vehicle.fuel_type,
      vehicle.status,
      `"${vehicle.driver_name ?? ''}"`,
      `"${vehicle.route_name ?? ''}"`,
      expiry('insurance'),
      expiry('fitness'),
      expiry('permit'),
      expiry('pollution'),
      vehicle.compliance,
    ].join(',');
  });

  return [header, ...lines].join('\n');
}

// --- library ----------------------------------------------------------------

const TODAY = () => new Date().toISOString().slice(0, 10);

const findBook = (id: number) => bookList.find((book) => book.id === id);
const findCopy = (id: number) => copyList.find((copy) => copy.id === id);
const findLoan = (id: number) => loanList.find((loan) => loan.id === id);

/** The open loan on a copy, if it is out. At most one by construction. */
const openLoanFor = (copyId: number) =>
  loanList.find((loan) => loan.copy_id === copyId && loan.returned_on === null);

/**
 * How overdue a loan is right now.
 *
 * Live while the book is out and frozen at the return date afterwards — a
 * returned loan that kept counting would have a receipt whose figure changed
 * every time somebody opened it.
 */
function overdueDays(loan: StoredLoan): number {
  const asOf = loan.returned_on ?? TODAY();
  return Math.max(0, daysBetween(loan.due_on, asOf));
}

/**
 * What a loan has been charged.
 *
 * A lost book is charged its replacement price outright rather than by the
 * day. Otherwise the fine accrues live until the moment of return, when it is
 * frozen — after that the stored figure is the answer, whatever the calendar
 * does next.
 */
function fineAmountFor(loan: StoredLoan): number {
  if (loan.frozen_fine !== null) return loan.frozen_fine;

  const copy = findCopy(loan.copy_id);
  const book = copy ? findBook(copy.book_id) : undefined;
  const price = book?.price ?? 0;

  if (loan.is_lost) return price;

  return libraryFineFor(overdueDays(loan), price);
}

const fineDueFor = (loan: StoredLoan): number =>
  Math.max(0, fromMinor(toMinor(fineAmountFor(loan)) - toMinor(loan.fine_paid) - toMinor(loan.fine_waived)));

/** Students and teachers both borrow — the roster depends on the type. */
function memberRecord(type: MemberType, id: number) {
  if (type === 'student') {
    const student = students.find((entry) => entry.id === id);
    return student
      ? {
          name: student.full_name,
          identifier: student.admission_no,
          photo_url: student.photo_url,
          detail: `${student.class_name}${student.section_name ? ` — ${student.section_name}` : ''}`,
          is_active: student.status === 'active',
        }
      : null;
  }

  const teacher = teachers.find((entry) => entry.id === id);
  return teacher
    ? {
        name: teacher.full_name,
        identifier: teacher.employee_id,
        photo_url: teacher.photo_url,
        detail: teacher.designation,
        is_active: teacher.status === 'active',
      }
    : null;
}

function hydrateLoan(loan: StoredLoan): Loan | null {
  const copy = findCopy(loan.copy_id);
  const book = copy ? findBook(copy.book_id) : undefined;
  const member = memberRecord(loan.member_type, loan.member_id);
  if (!copy || !book || !member) return null;

  const days = overdueDays(loan);
  const amount = fineAmountFor(loan);

  return {
    id: loan.id,
    copy_id: copy.id,
    accession_no: copy.accession_no,
    book_id: book.id,
    book_title: book.title,
    book_author: book.author,
    member_type: loan.member_type,
    member_id: loan.member_id,
    member_name: member.name,
    member_identifier: member.identifier,
    issued_on: loan.issued_on,
    due_on: loan.due_on,
    returned_on: loan.returned_on,
    status: loan.is_lost
      ? 'lost'
      : loan.returned_on !== null
        ? 'returned'
        : days > 0
          ? 'overdue'
          : 'issued',
    renewals: loan.renewals,
    days_overdue: days,
    fine_amount: amount,
    fine_paid: loan.fine_paid,
    fine_waived: loan.fine_waived,
    fine_due: fineDueFor(loan),
    issued_by: loan.issued_by,
    received_by: loan.received_by,
    remarks: loan.remarks,
  };
}

function hydrateCopy(copy: StoredCopy): BookCopy {
  const book = findBook(copy.book_id);
  const loan = openLoanFor(copy.id);
  const hydratedLoan = loan ? hydrateLoan(loan) : null;

  return {
    id: copy.id,
    book_id: copy.book_id,
    book_title: book?.title ?? 'Unknown',
    accession_no: copy.accession_no,
    status: copy.status,
    condition: copy.condition,
    acquired_on: copy.acquired_on,
    price: copy.price,
    shelf_no: copy.shelf_no,
    remarks: copy.remarks,
    current_loan: hydratedLoan
      ? {
          loan_id: hydratedLoan.id,
          member_name: hydratedLoan.member_name,
          due_on: hydratedLoan.due_on,
          is_overdue: hydratedLoan.days_overdue > 0,
        }
      : null,
  };
}

/**
 * The availability counts, derived from the copies every time.
 *
 * Storing them on the book would mean two places that know how many copies
 * are out, and they would part company the first time a return half-failed.
 */
function withBookCounts(book: Book): Book {
  const copies = copyList.filter((copy) => copy.book_id === book.id);

  return {
    ...book,
    total_copies: copies.length,
    available_copies: copies.filter((copy) => copy.status === 'available').length,
    issued_copies: copies.filter((copy) => copy.status === 'issued').length,
  };
}

const withBookDetail = (book: Book): BookDetail => ({
  ...withBookCounts(book),
  copies: copyList
    .filter((copy) => copy.book_id === book.id)
    .sort((left, right) => left.accession_no.localeCompare(right.accession_no))
    .map(hydrateCopy),
});

const withCategoryCounts = (category: BookCategory): BookCategory => ({
  ...category,
  books_count: bookList.filter((book) => book.category_id === category.id).length,
});

/** `SCI-0007` — the category's code, then a running number within it. */
function mintAccessionNo(book: Book): string {
  const category = categoryList.find((entry) => entry.id === book.category_id);
  const stem = category?.code ?? 'GEN';

  const used = copyList.filter((copy) => copy.accession_no.startsWith(`${stem}-`)).length;
  let sequence = used + 1;

  // The count alone is not enough once a copy has been deleted — its number
  // is retired, and reusing it would put two histories on one barcode.
  while (copyList.some((copy) => copy.accession_no === `${stem}-${String(sequence).padStart(4, '0')}`)) {
    sequence += 1;
  }

  return `${stem}-${String(sequence).padStart(4, '0')}`;
}

/** Loans a member currently holds, and what they owe across all of them. */
function memberStanding(type: MemberType, id: number) {
  const own = loanList.filter((loan) => loan.member_type === type && loan.member_id === id);
  const active = own.filter((loan) => loan.returned_on === null && !loan.is_lost);

  return {
    active: active.length,
    overdue: active.filter((loan) => overdueDays(loan) > 0).length,
    outstandingFine: sumAmounts(own.map(fineDueFor)),
    loans: own,
  };
}

/**
 * May this member take another book?
 *
 * Three rules, in the order a librarian would apply them: nothing overdue,
 * nothing owed, and room under the limit. The reason travels with the answer,
 * because "no" without "why" sends somebody to the office to ask.
 */
function buildMember(type: MemberType, id: number): LibraryMember | null {
  const record = memberRecord(type, id);
  if (!record) return null;

  const standing = memberStanding(type, id);
  const limit = BORROW_LIMITS[type];

  const blockedReason = !record.is_active
    ? 'This member is no longer active.'
    : standing.overdue > 0
      ? `${standing.overdue} book${standing.overdue === 1 ? '' : 's'} overdue — those come back first.`
      : standing.outstandingFine > 0
        ? `₹${standing.outstandingFine} outstanding in fines.`
        : standing.active >= limit
          ? `Already holding ${standing.active} of ${limit} books.`
          : null;

  return {
    member_type: type,
    member_id: id,
    name: record.name,
    identifier: record.identifier,
    photo_url: record.photo_url,
    detail: record.detail,
    active_loans: standing.active,
    overdue_loans: standing.overdue,
    outstanding_fine: standing.outstandingFine,
    borrow_limit: limit,
    can_borrow: blockedReason === null,
    blocked_reason: blockedReason,
  };
}

function searchMembers(term: string, type: MemberType | null): LibraryMember[] {
  const needle = term.toLowerCase();
  const results: LibraryMember[] = [];

  if (type !== 'teacher') {
    for (const student of students.filter((entry) => entry.status === 'active')) {
      if (
        student.full_name.toLowerCase().includes(needle) ||
        student.admission_no.toLowerCase().includes(needle)
      ) {
        const member = buildMember('student', student.id);
        if (member) results.push(member);
      }
      if (results.length >= 8) break;
    }
  }

  if (type !== 'student') {
    for (const teacher of teachers.filter((entry) => entry.status === 'active')) {
      if (
        teacher.full_name.toLowerCase().includes(needle) ||
        teacher.employee_id.toLowerCase().includes(needle)
      ) {
        const member = buildMember('teacher', teacher.id);
        if (member) results.push(member);
      }
      if (results.length >= 12) break;
    }
  }

  return results;
}

function listBooks(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = bookList.map(withBookCounts);

  if (search) {
    rows = rows.filter(
      (book) =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        (book.isbn ?? '').toLowerCase().includes(search),
    );
  }

  const categoryId = params.get('category_id');
  if (categoryId) rows = rows.filter((book) => book.category_id === Number(categoryId));

  const availability = params.get('availability');
  if (availability === 'available') rows = rows.filter((book) => book.available_copies > 0);
  if (availability === 'unavailable') {
    rows = rows.filter((book) => book.total_copies > 0 && book.available_copies === 0);
  }
  if (availability === 'none') rows = rows.filter((book) => book.total_copies === 0);

  return paginate(sortRows(rows, params, 'title'), params, '/library/books');
}

function listCategories(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = categoryList.map(withCategoryCounts);

  if (search) {
    rows = rows.filter(
      (category) =>
        category.name.toLowerCase().includes(search) ||
        category.code.toLowerCase().includes(search),
    );
  }

  return paginate(sortRows(rows, params, 'name'), params, '/library/categories');
}

function listLoans(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = loanList.map(hydrateLoan).filter((loan): loan is Loan => loan !== null);

  if (search) {
    rows = rows.filter(
      (loan) =>
        loan.book_title.toLowerCase().includes(search) ||
        loan.member_name.toLowerCase().includes(search) ||
        loan.accession_no.toLowerCase().includes(search) ||
        loan.member_identifier.toLowerCase().includes(search),
    );
  }

  const status = params.get('status');
  if (status) rows = rows.filter((loan) => loan.status === status);

  const memberType = params.get('member_type');
  if (memberType) rows = rows.filter((loan) => loan.member_type === memberType);

  if (params.get('overdue') === '1') rows = rows.filter((loan) => loan.status === 'overdue');
  if (params.get('has_fine') === '1') rows = rows.filter((loan) => loan.fine_due > 0);

  const memberId = params.get('member_id');
  if (memberId) rows = rows.filter((loan) => loan.member_id === Number(memberId));

  return paginate(sortRows(rows, params, 'due_on'), params, '/library/loans');
}

function librarySummary() {
  const open = loanList.filter((loan) => loan.returned_on === null);

  return {
    total_books: bookList.length,
    total_copies: copyList.length,
    available_copies: copyList.filter((copy) => copy.status === 'available').length,
    issued_copies: copyList.filter((copy) => copy.status === 'issued').length,
    overdue_loans: open.filter((loan) => overdueDays(loan) > 0).length,
    outstanding_fines: sumAmounts(loanList.map(fineDueFor)),
  };
}

/**
 * Mint the copies each seeded title says it has, then put some of them out.
 *
 * The loans are spread deliberately: most are current, a few are overdue by
 * enough to have accrued a fine, one is overdue by long enough to hit the
 * price cap, one is lost, and several are already returned — so the loans
 * table, the fines screen and the borrow-block rules all have something real
 * to show on first boot.
 */
function seedLibrary(): void {
  for (const book of bookList) {
    const count = seededCopyCounts[book.id] ?? 0;

    for (let index = 0; index < count; index += 1) {
      copyList.push({
        id: nextCopyId++,
        book_id: book.id,
        accession_no: mintAccessionNo(book),
        status: 'available',
        condition: index === 0 ? 'good' : 'new',
        acquired_on: '2025-04-15',
        price: book.price,
        shelf_no: book.shelf_no,
        remarks: null,
      });
    }
  }

  const borrowers = students.filter((entry) => entry.status === 'active');
  const staffBorrowers = teachers.filter((entry) => entry.status === 'active');
  if (borrowers.length === 0) return;

  /** Days ago the loan was issued, and whether it has come back. */
  const PLAN = [
    { issuedAgo: 5, returned: false, lost: false },
    { issuedAgo: 9, returned: false, lost: false },
    { issuedAgo: 20, returned: false, lost: false },
    // Overdue by roughly a week — a fine of a few rupees.
    { issuedAgo: 24, returned: false, lost: false },
    // Overdue by two months on a ₹40 book — pinned at the price cap.
    { issuedAgo: 78, returned: false, lost: false },
    { issuedAgo: 40, returned: true, lost: false },
    { issuedAgo: 60, returned: true, lost: false },
    { issuedAgo: 95, returned: false, lost: true },
  ];

  const lendable = copyList.filter((copy) => copy.status === 'available');

  PLAN.forEach((plan, index) => {
    // The ₹40 title is copy-cheap and deliberately lands on the capped loan.
    const cheap = bookList.find((book) => book.price <= 50);
    const copy =
      index === 4 && cheap
        ? (lendable.find((entry) => entry.book_id === cheap.id) ?? lendable[index])
        : lendable[index * 3];
    if (!copy || copy.status !== 'available') return;

    const isTeacher = index % 4 === 3 && staffBorrowers.length > 0;
    const memberType: MemberType = isTeacher ? 'teacher' : 'student';
    const member = isTeacher
      ? staffBorrowers[index % staffBorrowers.length]
      : borrowers[index * 5 % borrowers.length];

    const issuedOn = shiftDate(TODAY(), -plan.issuedAgo);
    const dueOn = shiftDate(issuedOn, LOAN_DAYS[memberType]);

    /**
     * A lost loan is a closed loan.
     *
     * The book is not coming back, so the loan is resolved on the day it was
     * written off — leaving it open would make the copy simultaneously lost
     * and still out with somebody, and its fine would keep climbing after the
     * replacement had been paid for.
     */
    const returnedOn = plan.lost
      ? shiftDate(dueOn, 14)
      : plan.returned
        ? shiftDate(dueOn, index % 2 === 0 ? -2 : 4)
        : null;

    const loan: StoredLoan = {
      id: nextLoanId++,
      copy_id: copy.id,
      member_type: memberType,
      member_id: member.id,
      issued_on: issuedOn,
      due_on: dueOn,
      returned_on: returnedOn,
      is_lost: plan.lost,
      renewals: 0,
      frozen_fine: null,
      fine_paid: 0,
      fine_waived: 0,
      issued_by: 'Library desk',
      received_by: returnedOn && !plan.lost ? 'Library desk' : null,
      remarks: plan.lost ? 'Reported lost by the borrower.' : null,
    };

    // A closed loan has its fine frozen at that moment, exactly as the return
    // endpoint does it.
    if (returnedOn !== null) {
      loan.frozen_fine = plan.lost
        ? (findBook(copy.book_id)?.price ?? 0)
        : libraryFineFor(
            Math.max(0, daysBetween(dueOn, returnedOn)),
            findBook(copy.book_id)?.price ?? 0,
          );
    }

    loanList.push(loan);
    copy.status = plan.lost ? 'lost' : returnedOn ? 'available' : 'issued';
  });
}

seedLibrary();

/** The catalogue as the real export endpoint would stream it. */
function catalogueCsv(rows: Book[]): string {
  const header = [
    'Title', 'Author', 'ISBN', 'Category', 'Publisher', 'Year',
    'Language', 'Price', 'Shelf', 'Total copies', 'Available',
  ].join(',');

  const lines = rows.map((book) =>
    [
      `"${book.title.replace(/"/g, '""')}"`,
      `"${book.author}"`,
      book.isbn ?? '',
      book.category_name,
      book.publisher ?? '',
      book.publication_year ?? '',
      book.language,
      book.price,
      `"${book.shelf_no ?? ''}"`,
      book.total_copies,
      book.available_copies,
    ].join(','),
  );

  return [header, ...lines].join('\n');
}

function loansCsv(rows: Loan[]): string {
  const header = [
    'Accession', 'Book', 'Member', 'Identifier', 'Type',
    'Issued', 'Due', 'Returned', 'Status', 'Days overdue',
    'Fine charged', 'Paid', 'Waived', 'Outstanding',
  ].join(',');

  const lines = rows.map((loan) =>
    [
      loan.accession_no,
      `"${loan.book_title.replace(/"/g, '""')}"`,
      `"${loan.member_name}"`,
      loan.member_identifier,
      loan.member_type,
      loan.issued_on,
      loan.due_on,
      loan.returned_on ?? '',
      loan.status,
      loan.days_overdue,
      loan.fine_amount,
      loan.fine_paid,
      loan.fine_waived,
      loan.fine_due,
    ].join(','),
  );

  return [header, ...lines].join('\n');
}

/** Barcode labels, as plain text standing in for the rendered PDF. */
function labelsText(book: Book, copies: StoredCopy[]): string {
  return [
    `${settings.profile.name} — barcode labels`,
    `${book.title} · ${book.author}`,
    '',
    ...copies.map((copy) => `${copy.accession_no}   ${book.title.slice(0, 40)}`),
  ].join('\n');
}

// --- timetable --------------------------------------------------------------

const findPeriod = (id: number) => periodList.find((period) => period.id === id);
const findRoom = (id: number) => roomList.find((room) => room.id === id);

const sectionsOf = (schoolClass: SchoolClass) => schoolClass.sections;

/** Every active class-section in the school, with its class alongside. */
function everySection(): { schoolClass: SchoolClass; section: Section }[] {
  return classes
    .filter((entry) => entry.is_active)
    .flatMap((schoolClass) =>
      sectionsOf(schoolClass)
        .filter((section) => section.is_active)
        .map((section) => ({ schoolClass, section })),
    );
}

const periodsOfShift = (shift: Shift) =>
  periodList
    .filter((period) => period.shift === shift)
    .sort((left, right) => left.sort_order - right.sort_order);

/** Teaching periods only — a break can hold no lesson, so it is not a slot. */
const teachingPeriodsOfShift = (shift: Shift) =>
  periodsOfShift(shift).filter((period) => !period.is_break);

/**
 * The period rows for a grid that spans shifts.
 *
 * A teacher may take a morning section and an afternoon one; their week is
 * the union of both grids, in clock order rather than per-shift order — which
 * is the only ordering that makes sense once two shifts are on one sheet.
 */
function periodsForSlots(slots: StoredSlot[]): Period[] {
  const shifts = new Set<Shift>();

  for (const slot of slots) {
    const period = findPeriod(slot.period_id);
    if (period) shifts.add(period.shift);
  }

  // An empty week still needs a grid to be empty *in*.
  if (shifts.size === 0) shifts.add('morning');

  return periodList
    .filter((period) => shifts.has(period.shift))
    .sort((left, right) => left.start_time.localeCompare(right.start_time));
}

/** Resolve a stored slot's ids into the labels a cell renders. */
function hydrateSlot(slot: StoredSlot): TimetableSlot | null {
  const schoolClass = classes.find((entry) => entry.id === slot.class_id);
  const section = schoolClass?.sections.find((entry) => entry.id === slot.section_id);
  const period = findPeriod(slot.period_id);
  const subject = subjects.find((entry) => entry.id === slot.subject_id);
  const teacher = teachers.find((entry) => entry.id === slot.teacher_id);
  const room = slot.room_id === null ? null : findRoom(slot.room_id);

  // A slot whose class, period, subject or teacher has been deleted is not a
  // cell — it is a dangling row, and rendering it half-resolved helps nobody.
  if (!schoolClass || !section || !period || !subject || !teacher) return null;

  return {
    id: slot.id,
    class_id: schoolClass.id,
    class_name: schoolClass.name,
    section_id: section.id,
    section_name: section.name,
    day_of_week: slot.day_of_week,
    period_id: period.id,
    period_name: period.name,
    start_time: period.start_time,
    end_time: period.end_time,
    subject_id: subject.id,
    subject_name: subject.name,
    subject_code: subject.code,
    teacher_id: teacher.id,
    teacher_name: teacher.full_name,
    room_id: room?.id ?? null,
    room_name: room?.name ?? null,
  };
}

/**
 * The numbers above a grid.
 *
 * `teaching_slots` counts the cells that could hold a lesson — periods that
 * are not breaks, times working days — so "free" means a gap in a timetable
 * rather than a lunch hour.
 */
function buildSummary(
  slots: TimetableSlot[],
  periods: Period[],
  groupBy: (slot: TimetableSlot) => { key: string; label: string },
): TimetableSummary {
  const teachingPeriods = periods.filter((period) => !period.is_break).length;
  const teachingSlots = teachingPeriods * WEEKDAYS.length;

  const perDay = new Map<Weekday, number>();
  for (const slot of slots) perDay.set(slot.day_of_week, (perDay.get(slot.day_of_week) ?? 0) + 1);

  let busiestDay: Weekday | null = null;
  for (const day of WEEKDAYS) {
    const count = perDay.get(day) ?? 0;
    if (count > 0 && count > (perDay.get(busiestDay!) ?? 0)) busiestDay = day;
  }

  const loads = new Map<string, LoadEntry>();
  for (const slot of slots) {
    const { key, label } = groupBy(slot);
    const existing = loads.get(key);
    if (existing) existing.periods += 1;
    else loads.set(key, { key, label, periods: 1 });
  }

  return {
    teaching_slots: teachingSlots,
    filled_slots: slots.length,
    free_slots: Math.max(0, teachingSlots - slots.length),
    busiest_day: busiestDay,
    load: [...loads.values()].sort(
      (left, right) => right.periods - left.periods || left.label.localeCompare(right.label),
    ),
  };
}

const hydrateAll = (slots: StoredSlot[]): TimetableSlot[] =>
  slots.map(hydrateSlot).filter((slot): slot is TimetableSlot => slot !== null);

function buildSectionGrid(classId: number, sectionId: number): TimetableGrid | null {
  const schoolClass = classes.find((entry) => entry.id === classId);
  const section = schoolClass?.sections.find((entry) => entry.id === sectionId);
  if (!schoolClass || !section) return null;

  const slots = hydrateAll(timetableSlots.filter((slot) => slot.section_id === sectionId));
  const periods = periodsOfShift(section.shift);

  return {
    scope: 'section',
    title: `${schoolClass.name} — ${section.name}`,
    subtitle: `${section.students_count} students · ${section.shift} shift${section.room ? ` · ${section.room}` : ''}`,
    periods,
    days: WEEKDAYS,
    slots,
    summary: buildSummary(slots, periods, (slot) => ({
      key: String(slot.subject_id),
      label: slot.subject_name,
    })),
  };
}

function buildTeacherGrid(teacherId: number): TimetableGrid | null {
  const teacher = teachers.find((entry) => entry.id === teacherId);
  if (!teacher) return null;

  const stored = timetableSlots.filter((slot) => slot.teacher_id === teacherId);
  const slots = hydrateAll(stored);
  const periods = periodsForSlots(stored);

  const classTeacherOf = teacher.class_teacher_of;

  return {
    scope: 'teacher',
    title: teacher.full_name,
    subtitle: [teacher.designation, classTeacherOf ? `Class teacher — ${classTeacherOf}` : null]
      .filter(Boolean)
      .join(' · '),
    periods,
    days: WEEKDAYS,
    slots,
    summary: buildSummary(slots, periods, (slot) => ({
      key: `${slot.section_id}`,
      label: `${slot.class_name} — ${slot.section_name}`,
    })),
  };
}

function buildRoomGrid(roomId: number): TimetableGrid | null {
  const room = findRoom(roomId);
  if (!room) return null;

  const stored = timetableSlots.filter((slot) => slot.room_id === roomId);
  const slots = hydrateAll(stored);
  const periods = periodsForSlots(stored);

  return {
    scope: 'room',
    title: room.name,
    subtitle: `Seats ${room.capacity}${room.building ? ` · ${room.building}` : ''}${room.is_active ? '' : ' · unavailable'}`,
    periods,
    days: WEEKDAYS,
    slots,
    summary: buildSummary(slots, periods, (slot) => ({
      key: `${slot.section_id}`,
      label: `${slot.class_name} — ${slot.section_name}`,
    })),
  };
}

/**
 * The denominator for room utilisation: every teaching period in the school's
 * week, across all shifts, because a room can be booked in any of them.
 *
 * A slight overstatement where two shifts overlap in clock time — the same
 * room cannot hold both — so utilisation reads a little low rather than
 * impossibly high. Using the widest single shift instead would read above
 * 100% for any room used morning *and* afternoon, which is worse.
 */
function weeklyRoomCapacityPeriods(): number {
  const shifts: Shift[] = ['morning', 'afternoon', 'evening'];
  const total = shifts.reduce((sum, shift) => sum + teachingPeriodsOfShift(shift).length, 0);
  return total * WEEKDAYS.length;
}

function withRoomCounts(room: Room): Room {
  const allocated = timetableSlots.filter((slot) => slot.room_id === room.id).length;
  const available = weeklyRoomCapacityPeriods();

  return {
    ...room,
    allocated_periods: allocated,
    utilisation_percent: available === 0 ? 0 : Math.round((allocated / available) * 1000) / 10,
  };
}

const withPeriodCounts = (period: Period): Period => ({
  ...period,
  duration_minutes: durationBetween(period.start_time, period.end_time) ?? 0,
  slots_count: timetableSlots.filter((slot) => slot.period_id === period.id).length,
});

function buildWorkload(): TeacherWorkload[] {
  return teachers
    .filter((teacher) => teacher.status === 'active')
    .map((teacher) => {
      const own = timetableSlots.filter((slot) => slot.teacher_id === teacher.id);

      const perDay = new Map<Weekday, number>();
      for (const slot of own) perDay.set(slot.day_of_week, (perDay.get(slot.day_of_week) ?? 0) + 1);

      return {
        teacher_id: teacher.id,
        teacher_name: teacher.full_name,
        employee_id: teacher.employee_id,
        photo_url: teacher.photo_url,
        periods_per_week: own.length,
        max_periods_per_week: MAX_PERIODS_PER_WEEK,
        busiest_day_periods: Math.max(0, ...perDay.values()),
        classes_count: new Set(own.map((slot) => slot.section_id)).size,
        subjects: teacher.subjects.map((subject) => subject.name),
        is_overloaded: own.length > MAX_PERIODS_PER_WEEK,
      };
    })
    .sort((left, right) => right.periods_per_week - left.periods_per_week);
}

/** Teachers listed on the subject's pivot — the same one the subject form writes. */
const teachesSubject = (teacher: TeacherDetail, subjectId: number) =>
  teacher.subjects.some((subject) => subject.id === subjectId);

/** What a person or room is doing in a slot, phrased for the picker. */
const busyLabel = (slot: StoredSlot): string => {
  const hydrated = hydrateSlot(slot);
  return hydrated
    ? `${hydrated.class_name} — ${hydrated.section_name}, ${hydrated.subject_name}`
    : 'another lesson';
};

function buildAvailability(
  day: Weekday,
  periodId: number,
  subjectId: number | null,
  excludeSlotId: number | null,
) {
  const inSlot = timetableSlots.filter(
    (slot) =>
      slot.day_of_week === day && slot.period_id === periodId && slot.id !== excludeSlotId,
  );

  const teacherEntries: AvailabilityEntry[] = teachers
    .filter((teacher) => teacher.status === 'active')
    .filter((teacher) => (subjectId ? teachesSubject(teacher, subjectId) : true))
    .map((teacher) => {
      const clash = inSlot.find((slot) => slot.teacher_id === teacher.id);
      return {
        id: teacher.id,
        name: teacher.full_name,
        busy_with: clash ? busyLabel(clash) : null,
        is_busy: clash !== undefined,
      };
    })
    .sort((left, right) => Number(left.is_busy) - Number(right.is_busy) || left.name.localeCompare(right.name));

  const roomEntries: AvailabilityEntry[] = roomList
    .filter((room) => room.is_active)
    .map((room) => {
      const clash = inSlot.find((slot) => slot.room_id === room.id);
      return {
        id: room.id,
        name: `${room.name} (${room.capacity})`,
        busy_with: clash ? busyLabel(clash) : null,
        is_busy: clash !== undefined,
      };
    })
    .sort((left, right) => Number(left.is_busy) - Number(right.is_busy) || left.name.localeCompare(right.name));

  return {
    day_of_week: day,
    period_id: periodId,
    teachers: teacherEntries,
    rooms: roomEntries,
  };
}

/**
 * Build a plausible timetable from the live rosters.
 *
 * Greedy rather than optimal: walk the week section by section, and for each
 * teaching period take the next subject in the section's rotation and the
 * first qualified teacher who is free. Where nobody is free the cell is left
 * empty — which is honest, and gives the "free periods" figure something real
 * to count. A generator that always filled every cell would hide exactly the
 * problem this screen exists to show.
 */
function seedTimetable(): void {
  const activeTeachers = teachers.filter((teacher) => teacher.status === 'active');
  const teachableSubjects = subjects.filter((subject) => subject.is_active);

  const roomByName = new Map(roomList.map((room) => [room.name, room]));
  const labFor = (code: string) =>
    code === 'PHY'
      ? roomByName.get('Physics laboratory')
      : code === 'CHEM' || code === 'BIO'
        ? roomByName.get('Chemistry laboratory')
        : code === 'CS'
          ? roomByName.get('Computer laboratory')
          : code === 'PE'
            ? roomByName.get('Playground')
            : code === 'ART'
              ? roomByName.get('Art room')
              : null;

  // `day|period|teacherId` and `day|period|roomId`, so a clash is a lookup.
  const teacherBusy = new Set<string>();
  const roomBusy = new Set<string>();
  const key = (day: Weekday, periodId: number, id: number) => `${day}|${periodId}|${id}`;

  /**
   * Periods each teacher already has on each day.
   *
   * The generator has to respect the same daily ceiling the write endpoint
   * enforces — seeding a timetable the API would refuse to accept is a mock
   * that lies about its own rules.
   */
  const perTeacherDay = new Map<string, number>();
  const dayKey = (day: Weekday, teacherId: number) => `${day}|${teacherId}`;

  everySection().forEach(({ schoolClass, section }, sectionIndex) => {
    const periods = teachingPeriodsOfShift(section.shift);
    if (periods.length === 0) return;

    // A rotation offset per section, so two sections of the same class do not
    // request the same subject in the same period all week.
    let rotation = sectionIndex;
    const ownRoom = section.room ? (roomByName.get(section.room) ?? null) : null;

    for (const day of WEEKDAYS) {
      for (const period of periods) {
        const subject = teachableSubjects[rotation % teachableSubjects.length];
        rotation += 1;

        const teacher = activeTeachers.find(
          (candidate) =>
            teachesSubject(candidate, subject.id) &&
            !teacherBusy.has(key(day, period.id, candidate.id)) &&
            (perTeacherDay.get(dayKey(day, candidate.id)) ?? 0) < MAX_PERIODS_PER_DAY,
        );
        // Nobody qualified, free and under their daily ceiling — a genuine
        // hole in the timetable, and one worth showing rather than papering over.
        if (!teacher) continue;

        const preferred = labFor(subject.code) ?? ownRoom;
        const room =
          preferred && preferred.is_active && !roomBusy.has(key(day, period.id, preferred.id))
            ? preferred
            : null;

        timetableSlots.push({
          id: nextSlotId++,
          class_id: schoolClass.id,
          section_id: section.id,
          day_of_week: day,
          period_id: period.id,
          subject_id: subject.id,
          teacher_id: teacher.id,
          room_id: room?.id ?? null,
        });

        teacherBusy.add(key(day, period.id, teacher.id));
        perTeacherDay.set(dayKey(day, teacher.id), (perTeacherDay.get(dayKey(day, teacher.id)) ?? 0) + 1);
        if (room) roomBusy.add(key(day, period.id, room.id));
      }
    }
  });
}

seedTimetable();

function listRooms(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = roomList.map(withRoomCounts);

  if (search) {
    rows = rows.filter(
      (room) =>
        room.name.toLowerCase().includes(search) || room.code.toLowerCase().includes(search),
    );
  }

  const type = params.get('type');
  if (type) rows = rows.filter((room) => room.type === type);

  if (params.get('is_active') === '1') rows = rows.filter((room) => room.is_active);

  return paginate(sortRows(rows, params, 'name'), params, '/timetable/rooms');
}

/** A printable timetable, as the real export endpoint would render it. */
function timetableText(grid: TimetableGrid): string {
  const header = ['Period'.padEnd(22), ...grid.days.map((day) => WEEKDAY_LABELS[day].padEnd(28))]
    .join('')
    .trimEnd();

  const rows = grid.periods.map((period) => {
    const label = `${period.name} ${formatTimeRange(period.start_time, period.end_time)}`;

    if (period.is_break) return `${label.padEnd(22)}${period.name.toUpperCase()}`;

    const cells = grid.days.map((day) => {
      const slot = grid.slots.find(
        (entry) => entry.day_of_week === day && entry.period_id === period.id,
      );
      if (!slot) return '—'.padEnd(28);

      const primary =
        grid.scope === 'section'
          ? slot.subject_name
          : `${slot.class_name} — ${slot.section_name}`;
      const secondary = grid.scope === 'section' ? slot.teacher_name : slot.subject_name;

      return `${primary} (${secondary})`.slice(0, 27).padEnd(28);
    });

    return `${label.padEnd(22)}${cells.join('')}`.trimEnd();
  });

  return [grid.title, grid.subtitle ?? '', '', header, ...rows].join('\n');
}

// --- examinations -----------------------------------------------------------

const findExam = (path: string): ExamDetail | undefined => {
  const id = Number(/\/exams\/(\d+)/.exec(path)?.[1]);
  return examList.find((entry) => entry.id === id);
};

const findPaper = (exam: ExamDetail, path: string): ExamPaper | undefined => {
  const id = Number(/\/papers\/(\d+)/.exec(path)?.[1]);
  return exam.papers.find((paper) => paper.id === id);
};

/** Students who sit a paper: the class, narrowed to a section if it has one. */
const paperRoster = (paper: { class_id: number; section_id: number | null }) =>
  students
    .filter((student) => student.status === 'active')
    .filter((student) => student.class_id === paper.class_id)
    .filter((student) => (paper.section_id ? student.section_id === paper.section_id : true));

const markOf = (paperId: number, studentId: number) => examMarks.get(examMarkKey(paperId, studentId));

/** The live entry counts — never stored, so they cannot drift from the marks. */
function withPaperCounts(paper: ExamPaper): ExamPaper {
  const roster = paperRoster(paper);
  const entered = roster.filter((student) => {
    const mark = markOf(paper.id, student.id);
    return mark !== undefined && (mark.is_absent || mark.marks_obtained !== null);
  }).length;

  return {
    ...paper,
    students_count: roster.length,
    marks_entered: entered,
    // A paper with no roster is not "complete" — there is nothing to mark.
    is_complete: roster.length > 0 && entered === roster.length,
  };
}

function withExamCounts(exam: ExamDetail): ExamDetail {
  const papers = exam.papers.map(withPaperCounts);

  return {
    ...exam,
    papers,
    papers_count: papers.length,
    classes_count: new Set(papers.map((paper) => paper.class_id)).size,
    marks_entered_papers: papers.filter((paper) => paper.is_complete).length,
  };
}

/** The list row drops the schedule — the index does not render it. */
const toExamSummary = ({ papers: _papers, ...rest }: ExamDetail) => rest;

const endOf = (paper: { start_time: string; duration_minutes: number }) => {
  const [hours, minutes] = paper.start_time.split(':').map(Number);
  return hours * 60 + minutes + paper.duration_minutes;
};

const startOf = (paper: { start_time: string }) => {
  const [hours, minutes] = paper.start_time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * A paper clashes when the same students would be sitting two at once.
 *
 * Sections matter: a whole-class paper collides with every section's, while
 * two different sections may sit different subjects in the same slot.
 */
function findClash(exam: ExamDetail, candidate: ExamPaper, ignoreId?: number): ExamPaper | null {
  return (
    exam.papers.find((paper) => {
      if (paper.id === ignoreId) return false;
      if (paper.class_id !== candidate.class_id) return false;
      if (paper.exam_date !== candidate.exam_date) return false;

      const sharesStudents =
        paper.section_id === null ||
        candidate.section_id === null ||
        paper.section_id === candidate.section_id;
      if (!sharesStudents) return false;

      return startOf(paper) < endOf(candidate) && startOf(candidate) < endOf(paper);
    }) ?? null
  );
}

function buildPaperFromPayload(
  id: number,
  examId: number,
  body: Record<string, unknown>,
): ExamPaper {
  const klass = classes.find((entry) => entry.id === Number(body.class_id));
  const section = klass?.sections.find((entry) => entry.id === Number(body.section_id)) ?? null;
  const subject = subjects.find((entry) => entry.id === Number(body.subject_id));

  return {
    id,
    exam_id: examId,
    class_id: klass?.id ?? 0,
    class_name: klass?.name ?? 'Unknown class',
    section_id: section?.id ?? null,
    section_name: section?.name ?? null,
    subject_id: subject?.id ?? 0,
    subject_name: subject?.name ?? 'Unknown subject',
    subject_code: subject?.code ?? '—',
    exam_date: String(body.exam_date ?? ''),
    start_time: String(body.start_time ?? '09:30'),
    duration_minutes: Number(body.duration_minutes) || 60,
    room: (body.room as string | null) ?? null,
    max_marks: Number(body.max_marks) || 0,
    pass_marks: Number(body.pass_marks) || 0,
    students_count: 0,
    marks_entered: 0,
    is_complete: false,
  };
}

const saveExam = (updated: ExamDetail) => {
  examList = examList.map((entry) => (entry.id === updated.id ? updated : entry));
  return withExamCounts(updated);
};

/** The marks sheet for one paper, with the tallies the header shows. */
function buildPaperMarks(paper: ExamPaper) {
  const counted = withPaperCounts(paper);

  const data: PaperMark[] = paperRoster(paper).map((student) => {
    const mark = markOf(paper.id, student.id);
    const obtained = mark?.is_absent ? null : (mark?.marks_obtained ?? null);

    return {
      student_id: student.id,
      student_name: student.full_name,
      admission_no: student.admission_no,
      photo_url: student.photo_url,
      roll_no: student.roll_no,
      marks_obtained: obtained,
      is_absent: mark?.is_absent ?? false,
      remarks: mark?.remarks ?? null,
      is_pass: obtained === null ? null : obtained >= paper.pass_marks,
    };
  });

  const scored = data.filter((row) => row.marks_obtained !== null).map((row) => row.marks_obtained!);

  return {
    paper: counted,
    data,
    summary: {
      total: data.length,
      entered: counted.marks_entered,
      absent: data.filter((row) => row.is_absent).length,
      passed: data.filter((row) => row.is_pass === true).length,
      failed: data.filter((row) => row.is_pass === false).length,
      average: scored.length
        ? Math.round((scored.reduce((sum, value) => sum + value, 0) / scored.length) * 100) / 100
        : null,
      highest: scored.length ? Math.max(...scored) : null,
      lowest: scored.length ? Math.min(...scored) : null,
    },
  };
}

/** Papers a student sits: their class, and their section or the whole class. */
const papersForStudent = (exam: ExamDetail, student: StudentDetail) =>
  exam.papers
    .filter((paper) => paper.class_id === student.class_id)
    .filter((paper) => paper.section_id === null || paper.section_id === student.section_id)
    .sort((left, right) => left.subject_name.localeCompare(right.subject_name));

/**
 * One student's whole exam, computed from their marks.
 *
 * Unmarked papers are left out of the totals entirely rather than counted as
 * a zero — an exam still being marked would otherwise fail the whole class.
 */
function buildStudentResult(exam: ExamDetail, student: StudentDetail): StudentResult {
  const subjectRows: ResultSubject[] = papersForStudent(exam, student).map((paper) => {
    const mark = markOf(paper.id, student.id);
    const isAbsent = mark?.is_absent ?? false;
    const obtained = isAbsent ? null : (mark?.marks_obtained ?? null);
    const percent = percentFor(obtained ?? 0, paper.max_marks);

    return {
      paper_id: paper.id,
      subject_id: paper.subject_id,
      subject_name: paper.subject_name,
      subject_code: paper.subject_code,
      max_marks: paper.max_marks,
      pass_marks: paper.pass_marks,
      marks_obtained: obtained,
      is_absent: isAbsent,
      percent: obtained === null ? 0 : percent,
      grade: obtained === null ? '—' : gradeFor(percent),
      // Absence is a fail; not yet marked is not.
      is_pass: obtained === null ? isAbsent === false : obtained >= paper.pass_marks,
    };
  });

  const graded = subjectRows.filter((row) => row.marks_obtained !== null || row.is_absent);
  const total = graded.reduce((sum, row) => sum + (row.marks_obtained ?? 0), 0);
  const totalMax = graded.reduce((sum, row) => sum + row.max_marks, 0);
  const percent = percentFor(total, totalMax);
  const failedSubjects = graded.filter((row) => !row.is_pass).length;

  return {
    student_id: student.id,
    student_name: student.full_name,
    admission_no: student.admission_no,
    roll_no: student.roll_no,
    photo_url: student.photo_url,
    class_id: student.class_id,
    class_name: student.class_name,
    section_name: student.section_name,
    subjects: subjectRows,
    total_marks: total,
    total_max_marks: totalMax,
    percent,
    grade: graded.length === 0 ? '—' : gradeFor(percent),
    // A pass needs every subject passed *and* the aggregate over the line.
    is_pass: graded.length > 0 && failedSubjects === 0 && percent >= PASS_PERCENT,
    failed_subjects: failedSubjects,
    rank: null,
  };
}

function buildResults(
  exam: ExamDetail,
  classId: number,
  sectionId: number | null,
): ExamResults {
  const klass = classes.find((entry) => entry.id === classId);
  const section = klass?.sections.find((entry) => entry.id === sectionId) ?? null;

  const roster = paperRoster({ class_id: classId, section_id: sectionId });
  const published = publishedResults.get(resultKey(exam.id, classId, sectionId));

  const rows = roster
    .map((student) => buildStudentResult(exam, student))
    .sort(
      (left, right) =>
        right.total_marks - left.total_marks ||
        left.student_name.localeCompare(right.student_name),
    )
    // Ranks come from the frozen map, so a later correction cannot reshuffle
    // a card that has already been printed.
    .map((row) => ({ ...row, rank: published?.ranks[row.student_id] ?? null }));

  const appeared = rows.filter((row) => row.total_max_marks > 0);
  const passed = appeared.filter((row) => row.is_pass);
  const percents = appeared.map((row) => row.percent);

  return {
    exam_id: exam.id,
    class_id: classId,
    class_name: klass?.name ?? 'Unknown class',
    section_id: sectionId,
    section_name: section?.name ?? null,
    is_published: published !== undefined,
    rows,
    summary: {
      students: rows.length,
      appeared: appeared.length,
      passed: passed.length,
      failed: appeared.length - passed.length,
      pass_percent: appeared.length
        ? Math.round((passed.length / appeared.length) * 1000) / 10
        : 0,
      class_average: percents.length
        ? Math.round((percents.reduce((sum, value) => sum + value, 0) / percents.length) * 100) /
          100
        : null,
      highest_percent: percents.length ? Math.max(...percents) : null,
      distribution: GRADE_BANDS.map((band) => ({
        grade: band.grade,
        count: appeared.filter((row) => row.grade === band.grade).length,
      })),
    },
  };
}

function buildReportCard(exam: ExamDetail, student: StudentDetail): ReportCard {
  // A section-scoped publication takes precedence over a class-wide one.
  const published =
    publishedResults.get(resultKey(exam.id, student.class_id, student.section_id)) ??
    publishedResults.get(resultKey(exam.id, student.class_id, null));

  const cohort = paperRoster({ class_id: student.class_id, section_id: null });
  const result = buildStudentResult(exam, student);

  // The class teacher is whoever the academics module would name; the mock
  // picks deterministically so the card is stable across reloads.
  const classTeacher = teachers.filter((teacher) => teacher.status === 'active')[
    student.class_id % Math.max(1, teachers.filter((teacher) => teacher.status === 'active').length)
  ];

  return {
    exam: {
      id: exam.id,
      name: exam.name,
      type: exam.type,
      academic_year_name: exam.academic_year_name,
      start_date: exam.start_date,
      end_date: exam.end_date,
    },
    result: { ...result, rank: published?.ranks[student.id] ?? null },
    class_strength: cohort.length,
    attendance_percent: buildExamAttendance(exam, student.id),
    class_teacher_name: classTeacher?.full_name ?? null,
    remarks: published?.remarks ?? null,
    published_at: published?.published_at ?? null,
  };
}

/**
 * Attendance across the exam window, read from the attendance module rather
 * than recorded again here — one answer to "how often were they present".
 */
function buildExamAttendance(exam: ExamDetail, studentId: number): number | null {
  const from = new Date(exam.start_date);
  const to = new Date(exam.end_date);

  let counted = 0;
  let present = 0;

  for (let day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {
    const date = day.toISOString().slice(0, 10);
    if (holidayFor(date, 'student')) continue;

    counted += 1;
    const stored = attendanceMarks.get(markKey('student', date, studentId));
    const status = stored?.status ?? seededStatus(studentId, date);
    if (status === 'present' || status === 'late') present += 1;
  }

  return counted === 0 ? null : Math.round((present / counted) * 1000) / 10;
}

function listExams(params: URLSearchParams) {
  const search = (params.get('search') ?? '').toLowerCase();

  let rows = examList.map((exam) => toExamSummary(withExamCounts(exam)));

  if (search) {
    rows = rows.filter(
      (exam) =>
        exam.name.toLowerCase().includes(search) ||
        exam.academic_year_name.toLowerCase().includes(search),
    );
  }

  const type = params.get('type');
  if (type) rows = rows.filter((exam) => exam.type === type);

  const status = params.get('status');
  if (status) rows = rows.filter((exam) => exam.status === status);

  const yearId = params.get('academic_year_id');
  if (yearId) rows = rows.filter((exam) => exam.academic_year_id === Number(yearId));

  return paginate(sortRows(rows, params, 'start_date'), params, '/exams');
}

function buildExamFromPayload(id: number, body: Record<string, unknown>): ExamDetail {
  const year = academicYears.find((entry) => entry.id === Number(body.academic_year_id));

  return {
    id,
    name: String(body.name ?? '').trim(),
    type: (body.type as ExamDetail['type']) ?? 'unit_test',
    academic_year_id: year?.id ?? 0,
    academic_year_name: year?.name ?? 'Unknown year',
    start_date: String(body.start_date ?? ''),
    end_date: String(body.end_date ?? ''),
    status: 'draft',
    description: (body.description as string | null) ?? null,
    papers_count: 0,
    classes_count: 0,
    marks_entered_papers: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    papers: [],
  };
}

/**
 * Fill in marks for the papers the seed says are already marked.
 *
 * Deterministic, so a reload gives the same results — and deliberately spread
 * so every band of the grade scale, a failure, an absence and a topper are
 * all on the first results screen opened.
 */
function seedExamMarks(): void {
  for (const exam of examList) {
    const marked = seededMarkedPapers[exam.id] ?? 0;

    exam.papers.slice(0, marked).forEach((paper) => {
      paperRoster(paper).forEach((student, index) => {
        const bucket = (student.id * 7 + paper.id * 3) % 10;

        // One in twenty-five is absent, and one in ten fails outright.
        if ((student.id + paper.id) % 25 === 0) {
          examMarks.set(examMarkKey(paper.id, student.id), {
            marks_obtained: null,
            is_absent: true,
            remarks: 'Absent — medical leave',
          });
          return;
        }

        const share = bucket === 0 ? 0.32 : 0.42 + bucket * 0.065;
        const marks = Math.min(paper.max_marks, Math.round(paper.max_marks * share));

        examMarks.set(examMarkKey(paper.id, student.id), {
          marks_obtained: marks,
          is_absent: false,
          remarks: index === 0 && bucket >= 8 ? 'Excellent paper.' : null,
        });
      });
    });
  }

  // An exam seeded as published has its results released and ranked, so the
  // published view is reachable without marking a whole class by hand.
  for (const exam of examList.filter((entry) => entry.status === 'published')) {
    for (const classId of new Set(exam.papers.map((paper) => paper.class_id))) {
      freezeRanks(exam, classId, null, 'Promoted to the next term.');
    }
  }
}

/** Publishing: rank by total marks, and keep the map. */
function freezeRanks(
  exam: ExamDetail,
  classId: number,
  sectionId: number | null,
  remarks: string | null,
): void {
  const rows = paperRoster({ class_id: classId, section_id: sectionId })
    .map((student) => buildStudentResult(exam, student))
    .filter((row) => row.total_max_marks > 0)
    .sort(
      (left, right) =>
        right.total_marks - left.total_marks ||
        left.student_name.localeCompare(right.student_name),
    );

  const ranks: Record<number, number> = {};
  rows.forEach((row, index) => {
    // Equal totals share a position, and the next one skips — 1, 2, 2, 4.
    const previous = rows[index - 1];
    ranks[row.student_id] =
      previous && previous.total_marks === row.total_marks
        ? ranks[previous.student_id]
        : index + 1;
  });

  publishedResults.set(resultKey(exam.id, classId, sectionId), {
    published_at: new Date().toISOString(),
    remarks,
    ranks,
  });
}

seedExamMarks();

/** The results sheet as the real export endpoint would stream it. */
function resultsCsv(results: ExamResults): string {
  // Every row carries the same papers, so the first defines the columns.
  const columns = results.rows[0]?.subjects ?? [];

  const header = [
    'Rank',
    'Admission no',
    'Roll no',
    'Student',
    ...columns.map((subject) => `${subject.subject_name} (${subject.max_marks})`),
    'Total',
    'Out of',
    'Percentage',
    'Grade',
    'Result',
  ].join(',');

  const rows = results.rows.map((row) =>
    [
      row.rank ?? '',
      row.admission_no,
      row.roll_no ?? '',
      `"${row.student_name}"`,
      ...columns.map((column) => {
        const scored = row.subjects.find((entry) => entry.subject_id === column.subject_id);
        if (!scored) return '';
        return scored.is_absent ? 'AB' : (scored.marks_obtained ?? '');
      }),
      row.total_marks,
      row.total_max_marks,
      row.percent,
      row.grade,
      row.is_pass ? 'PASS' : 'FAIL',
    ].join(','),
  );

  return [header, ...rows].join('\n');
}

/** A plain-text stand-in for the server-rendered report card PDF. */
function reportCardText(card: ReportCard): string {
  const lines = [
    `${settings.profile.name}`,
    `${card.exam.name} — ${card.exam.academic_year_name}`,
    '',
    `${card.result.student_name} (${card.result.admission_no})`,
    `${card.result.class_name}${card.result.section_name ? ` — ${card.result.section_name}` : ''}`,
    '',
    ...card.result.subjects.map(
      (subject) =>
        `${subject.subject_name.padEnd(24)} ${
          subject.is_absent ? 'AB' : (subject.marks_obtained ?? '—')
        } / ${subject.max_marks}   ${subject.grade}`,
    ),
    '',
    `Total: ${card.result.total_marks} / ${card.result.total_max_marks}  (${card.result.percent}%)`,
    `Grade: ${card.result.grade}    Result: ${card.result.is_pass ? 'PASS' : 'FAIL'}`,
    card.result.rank === null ? '' : `Rank: ${card.result.rank} of ${card.class_strength}`,
    card.attendance_percent === null ? '' : `Attendance: ${card.attendance_percent}%`,
  ];

  return lines.filter((line) => line !== undefined).join('\n');
}

// --- reports ----------------------------------------------------------------

/**
 * The reporting layer.
 *
 * Not one line of this recomputes anything. Attendance percentages come from
 * `buildMonthlyReport`, fee balances from `buildAccount`, teaching load from
 * `buildWorkload`, results from `buildResults` — the same functions the
 * operational screens call. A report that did its own arithmetic would be a
 * second answer to a question the school already has an answer to, and the
 * two would drift the first time a rule changed.
 *
 * Every report returns the same `ReportResult` envelope, which is what lets
 * one table, one chart set and one export path serve all twelve.
 */

const reportStamp = () => new Date().toISOString();

/** Months of a year, stopping at the present one — a future month is not a zero. */
function reportMonths(year: number): { month: number; label: string; prefix: string }[] {
  const now = new Date();
  const last = year === now.getFullYear() ? now.getMonth() + 1 : 12;

  return Array.from({ length: Math.max(1, last) }, (_, index) => ({
    month: index + 1,
    label: MONTH_SHORT[index],
    prefix: `${year}-${String(index + 1).padStart(2, '0')}`,
  }));
}

const activeStudents = () => students.filter((student) => student.status === 'active');

const emptyReport = (
  key: ReportKey,
  title: string,
  params: Record<string, string>,
  reason: string,
): ReportResult => ({
  key,
  title,
  subtitle: null,
  generated_at: reportStamp(),
  params,
  stats: [],
  series: [],
  columns: [],
  rows: [],
  totals: null,
  empty_reason: reason,
});

const percent = (part: number, whole: number) =>
  whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;

// --- reports: attendance ----------------------------------------------------

function reportAttendanceByClass(params: URLSearchParams): ReportResult {
  const year = Number(params.get('year')) || new Date().getFullYear();
  const month = Number(params.get('month')) || new Date().getMonth() + 1;
  const echo = { year: String(year), month: String(month) };

  const rows: ReportRow[] = [];
  const points: ReportPoint[] = [];
  let workingDays = 0;

  for (const klass of classes) {
    // The attendance module's own report, once per class — the percentages
    // here are literally the ones its screen shows.
    const report = buildMonthlyReport('student', year, month, klass.id, null);
    if (report.rows.length === 0) continue;

    workingDays = report.working_days;

    const totals = report.rows.reduce(
      (sum, row) => ({
        present: sum.present + row.present_days,
        absent: sum.absent + row.absent_days,
        leave: sum.leave + row.leave_days,
        late: sum.late + row.late_days,
      }),
      { present: 0, absent: 0, leave: 0, late: 0 },
    );

    const possible = report.rows.length * report.working_days;
    const share = percent(totals.present + totals.late, possible);

    rows.push({
      class_name: klass.name,
      students: report.rows.length,
      working_days: report.working_days,
      present: totals.present,
      absent: totals.absent,
      leave: totals.leave,
      attendance: share,
    });

    points.push({ label: klass.name, value: share });
  }

  if (rows.length === 0) {
    return emptyReport(
      'attendance-by-class',
      'Attendance by class',
      echo,
      workingDays === 0
        ? 'That month has no working days yet — nothing has been marked.'
        : 'No classes have students on the roll.',
    );
  }

  const totalStudents = rows.reduce((sum, row) => sum + Number(row.students), 0);
  const totalPresent = rows.reduce((sum, row) => sum + Number(row.present) + 0, 0);
  const totalPossible = rows.reduce(
    (sum, row) => sum + Number(row.students) * Number(row.working_days),
    0,
  );
  const schoolPercent = percent(
    rows.reduce((sum, row) => sum + Number(row.present), 0),
    totalPossible,
  );
  const concerning = rows.filter((row) => Number(row.attendance) < ATTENDANCE_CONCERN_PERCENT);

  return {
    key: 'attendance-by-class',
    title: `Attendance by class — ${MONTH_LABELS[month - 1]} ${year}`,
    subtitle: `${workingDays} working day${workingDays === 1 ? '' : 's'} in the month`,
    generated_at: reportStamp(),
    params: echo,
    stats: [
      { label: 'School attendance', value: schoolPercent, format: 'percent',
        tone: schoolPercent < ATTENDANCE_CONCERN_PERCENT ? 'danger' : 'success' },
      { label: 'Students', value: totalStudents, format: 'number', hint: `across ${rows.length} classes` },
      { label: 'Working days', value: workingDays, format: 'number' },
      { label: 'Classes below target', value: concerning.length, format: 'number',
        tone: concerning.length > 0 ? 'warning' : 'neutral',
        hint: `under ${ATTENDANCE_CONCERN_PERCENT}%` },
    ],
    series: [
      { key: 'attendance', label: 'Attendance by class', chart: 'bar', format: 'percent', points },
    ],
    columns: [
      { key: 'class_name', label: 'Class', format: 'text' },
      { key: 'students', label: 'Students', format: 'number', total: true },
      { key: 'working_days', label: 'Working days', format: 'number', hideBelow: 'md' },
      { key: 'present', label: 'Present', format: 'number', total: true },
      { key: 'absent', label: 'Absent', format: 'number', total: true, hideBelow: 'sm' },
      { key: 'leave', label: 'Leave', format: 'number', total: true, hideBelow: 'md' },
      { key: 'attendance', label: 'Attendance', format: 'percent' },
    ],
    rows,
    totals: {
      class_name: `${rows.length} classes`,
      students: totalStudents,
      present: totalPresent,
      absent: rows.reduce((sum, row) => sum + Number(row.absent), 0),
      leave: rows.reduce((sum, row) => sum + Number(row.leave), 0),
      // The school figure, not a mean of class percentages — averaging
      // percentages over unequal cohorts weights a class of six like a class
      // of forty.
      attendance: schoolPercent,
    },
    empty_reason: null,
  };
}

function reportAttendanceTrend(params: URLSearchParams): ReportResult {
  const year = Number(params.get('year')) || new Date().getFullYear();
  const classId = params.get('class_id') ? Number(params.get('class_id')) : null;
  const echo = { year: String(year), ...(classId ? { class_id: String(classId) } : {}) };

  const scope = classId ? classes.find((entry) => entry.id === classId) : null;
  const rows: ReportRow[] = [];
  const points: ReportPoint[] = [];

  for (const { month, label } of reportMonths(year)) {
    const report = buildMonthlyReport('student', year, month, classId, null);
    if (report.working_days === 0 || report.rows.length === 0) continue;

    const totals = report.rows.reduce(
      (sum, row) => ({
        present: sum.present + row.present_days,
        absent: sum.absent + row.absent_days,
        leave: sum.leave + row.leave_days,
        late: sum.late + row.late_days,
      }),
      { present: 0, absent: 0, leave: 0, late: 0 },
    );

    const share = percent(
      totals.present + totals.late,
      report.rows.length * report.working_days,
    );

    rows.push({
      month: MONTH_LABELS[month - 1],
      working_days: report.working_days,
      present: totals.present,
      absent: totals.absent,
      leave: totals.leave,
      attendance: share,
    });

    points.push({ label, value: share });
  }

  if (rows.length === 0) {
    return emptyReport(
      'attendance-trend',
      'Attendance trend',
      echo,
      'No month in that year has any marked attendance.',
    );
  }

  const shares = rows.map((row) => Number(row.attendance));
  const best = rows[shares.indexOf(Math.max(...shares))];
  const worst = rows[shares.indexOf(Math.min(...shares))];

  return {
    key: 'attendance-trend',
    title: `Attendance trend — ${year}`,
    subtitle: scope ? `${scope.name} only` : 'Every class',
    generated_at: reportStamp(),
    params: echo,
    stats: [
      { label: 'Average', value: percent(
          rows.reduce((sum, row) => sum + Number(row.present), 0),
          rows.reduce((sum, row) => sum + Number(row.present) + Number(row.absent) + Number(row.leave), 0),
        ), format: 'percent' },
      { label: 'Best month', value: Number(best.attendance), format: 'percent', tone: 'success',
        hint: String(best.month) },
      { label: 'Weakest month', value: Number(worst.attendance), format: 'percent',
        tone: Number(worst.attendance) < ATTENDANCE_CONCERN_PERCENT ? 'danger' : 'neutral',
        hint: String(worst.month) },
      { label: 'Months reported', value: rows.length, format: 'number' },
    ],
    series: [
      { key: 'trend', label: 'Attendance month by month', chart: 'line', format: 'percent', points },
    ],
    columns: [
      { key: 'month', label: 'Month', format: 'text' },
      { key: 'working_days', label: 'Working days', format: 'number', hideBelow: 'sm' },
      { key: 'present', label: 'Present', format: 'number', total: true },
      { key: 'absent', label: 'Absent', format: 'number', total: true, hideBelow: 'sm' },
      { key: 'leave', label: 'Leave', format: 'number', total: true, hideBelow: 'md' },
      { key: 'attendance', label: 'Attendance', format: 'percent' },
    ],
    rows,
    totals: null,
    empty_reason: null,
  };
}

// --- reports: fees ----------------------------------------------------------

function reportFeeCollection(params: URLSearchParams): ReportResult {
  const year = Number(params.get('year')) || new Date().getFullYear();
  const echo = { year: String(year) };

  const roster = activeStudents();
  const rows: ReportRow[] = [];
  const billedPoints: ReportPoint[] = [];
  const collectedPoints: ReportPoint[] = [];

  for (const { label, prefix } of reportMonths(year)) {
    // Billed is what fell due that month, read from each student's structure;
    // collected is what the ledger actually took.
    const billed = roster.reduce((sum, student) => {
      const structure = structureForStudent(student);
      const due = (structure?.installments ?? [])
        .filter((installment) => installment.due_date.startsWith(prefix))
        .reduce((total, installment) => total + minor(installment.amount), 0);
      return sum + due;
    }, 0);

    const collected = payments
      .filter((payment) => !payment.is_cancelled && payment.paid_at.startsWith(prefix))
      .reduce((sum, payment) => sum + minor(payment.amount), 0);

    rows.push({
      month: MONTH_LABELS[Number(prefix.slice(5)) - 1],
      billed: major(billed),
      collected: major(collected),
      shortfall: major(Math.max(0, billed - collected)),
      rate: percent(collected, billed),
    });

    billedPoints.push({ label, value: major(billed) });
    collectedPoints.push({ label, value: major(collected) });
  }

  const totalBilled = rows.reduce((sum, row) => sum + minor(Number(row.billed)), 0);
  const totalCollected = rows.reduce((sum, row) => sum + minor(Number(row.collected)), 0);

  if (totalBilled === 0 && totalCollected === 0) {
    return emptyReport(
      'fee-collection',
      'Collection trend',
      echo,
      'Nothing was billed or collected in that year.',
    );
  }

  return {
    key: 'fee-collection',
    title: `Collection trend — ${year}`,
    subtitle: 'What fell due against what came in',
    generated_at: reportStamp(),
    params: echo,
    stats: [
      { label: 'Billed', value: major(totalBilled), format: 'money' },
      { label: 'Collected', value: major(totalCollected), format: 'money', tone: 'success' },
      { label: 'Shortfall', value: major(Math.max(0, totalBilled - totalCollected)), format: 'money',
        tone: totalCollected < totalBilled ? 'warning' : 'neutral' },
      { label: 'Collection rate', value: percent(totalCollected, totalBilled), format: 'percent' },
    ],
    series: [
      {
        key: 'collection',
        label: 'Billed against collected',
        chart: 'bar',
        format: 'money',
        points: billedPoints,
        companion: { label: 'Collected', points: collectedPoints },
      },
    ],
    columns: [
      { key: 'month', label: 'Month', format: 'text' },
      { key: 'billed', label: 'Billed', format: 'money', total: true },
      { key: 'collected', label: 'Collected', format: 'money', total: true },
      { key: 'shortfall', label: 'Shortfall', format: 'money', total: true, hideBelow: 'sm' },
      { key: 'rate', label: 'Rate', format: 'percent', hideBelow: 'md' },
    ],
    rows,
    totals: {
      month: `${rows.length} months`,
      billed: major(totalBilled),
      collected: major(totalCollected),
      shortfall: major(Math.max(0, totalBilled - totalCollected)),
      rate: percent(totalCollected, totalBilled),
    },
    empty_reason: null,
  };
}

function reportFeeDefaulters(params: URLSearchParams): ReportResult {
  const classId = params.get('class_id') ? Number(params.get('class_id')) : null;
  const echo: Record<string, string> = classId ? { class_id: String(classId) } : {};

  // The fees module's own account builder, so an outstanding figure here is
  // the same rupee the collection desk would ask for.
  const accounts = activeStudents()
    .filter((student) => (classId ? student.class_id === classId : true))
    .map((student) => ({ student, account: buildAccount(student) }))
    .filter((entry) => entry.account.balance > 0);

  if (accounts.length === 0) {
    return emptyReport(
      'fee-defaulters',
      'Outstanding by class',
      echo,
      classId ? 'Nobody in that class owes anything.' : 'Nothing is outstanding.',
    );
  }

  const byClass = new Map<string, { students: number; overdue: number; payable: number; paid: number; balance: number }>();

  for (const { student, account } of accounts) {
    const label = student.class_name;
    const row = byClass.get(label) ?? { students: 0, overdue: 0, payable: 0, paid: 0, balance: 0 };

    row.students += 1;
    if (account.dues.some((due) => due.status === 'overdue')) row.overdue += 1;
    row.payable += minor(account.total_payable);
    row.paid += minor(account.total_paid);
    row.balance += minor(account.balance);

    byClass.set(label, row);
  }

  const rows: ReportRow[] = [...byClass.entries()]
    .map(([className, row]) => ({
      class_name: className,
      students: row.students,
      overdue_students: row.overdue,
      payable: major(row.payable),
      paid: major(row.paid),
      balance: major(row.balance),
    }))
    .sort((left, right) => Number(right.balance) - Number(left.balance));

  const totalBalance = rows.reduce((sum, row) => sum + minor(Number(row.balance)), 0);
  const overdueStudents = rows.reduce((sum, row) => sum + Number(row.overdue_students), 0);

  return {
    key: 'fee-defaulters',
    title: 'Outstanding by class',
    subtitle: `${accounts.length} students with a balance`,
    generated_at: reportStamp(),
    params: echo,
    stats: [
      { label: 'Outstanding', value: major(totalBalance), format: 'money', tone: 'danger' },
      { label: 'Students owing', value: accounts.length, format: 'number',
        hint: `of ${activeStudents().length} on the roll` },
      { label: 'Past the due date', value: overdueStudents, format: 'number',
        tone: overdueStudents > 0 ? 'warning' : 'neutral' },
      { label: 'Classes affected', value: rows.length, format: 'number' },
    ],
    series: [
      {
        key: 'outstanding',
        label: 'Outstanding by class',
        chart: 'bar',
        format: 'money',
        points: rows.map((row) => ({ label: String(row.class_name), value: Number(row.balance) })),
      },
    ],
    columns: [
      { key: 'class_name', label: 'Class', format: 'text' },
      { key: 'students', label: 'Owing', format: 'number', total: true },
      { key: 'overdue_students', label: 'Overdue', format: 'number', total: true, hideBelow: 'sm' },
      { key: 'payable', label: 'Payable', format: 'money', total: true, hideBelow: 'md' },
      { key: 'paid', label: 'Paid', format: 'money', total: true, hideBelow: 'md' },
      { key: 'balance', label: 'Outstanding', format: 'money', total: true },
    ],
    rows,
    totals: {
      class_name: `${rows.length} classes`,
      students: accounts.length,
      overdue_students: overdueStudents,
      payable: major(rows.reduce((sum, row) => sum + minor(Number(row.payable)), 0)),
      paid: major(rows.reduce((sum, row) => sum + minor(Number(row.paid)), 0)),
      balance: major(totalBalance),
    },
    empty_reason: null,
  };
}

// --- reports: students ------------------------------------------------------

function reportStudentStrength(): ReportResult {
  const roster = activeStudents();

  if (roster.length === 0) {
    return emptyReport('student-strength', 'Strength by class', {}, 'Nobody is on the roll.');
  }

  const rows: ReportRow[] = classes
    .map((klass) => {
      const inClass = roster.filter((student) => student.class_id === klass.id);
      const capacity = klass.sections.reduce((sum, section) => sum + section.capacity, 0);

      return {
        class_name: klass.name,
        sections: klass.sections.length,
        boys: inClass.filter((student) => student.gender === 'male').length,
        girls: inClass.filter((student) => student.gender === 'female').length,
        students: inClass.length,
        capacity,
        utilisation: percent(inClass.length, capacity),
      };
    })
    .filter((row) => Number(row.students) > 0 || Number(row.capacity) > 0);

  const boys = roster.filter((student) => student.gender === 'male').length;
  const girls = roster.filter((student) => student.gender === 'female').length;
  const capacity = rows.reduce((sum, row) => sum + Number(row.capacity), 0);

  return {
    key: 'student-strength',
    title: 'Strength by class',
    subtitle: `${roster.length} students on the roll today`,
    generated_at: reportStamp(),
    params: {},
    stats: [
      { label: 'On the roll', value: roster.length, format: 'number' },
      { label: 'Boys', value: boys, format: 'number', hint: `${percent(boys, roster.length)}%` },
      { label: 'Girls', value: girls, format: 'number', hint: `${percent(girls, roster.length)}%` },
      { label: 'Seats filled', value: percent(roster.length, capacity), format: 'percent',
        tone: percent(roster.length, capacity) > 95 ? 'warning' : 'neutral',
        hint: `of ${capacity} places` },
    ],
    series: [
      {
        key: 'strength',
        label: 'Boys and girls by class',
        chart: 'bar',
        format: 'number',
        points: rows.map((row) => ({ label: String(row.class_name), value: Number(row.boys) })),
        companion: {
          label: 'Girls',
          points: rows.map((row) => ({ label: String(row.class_name), value: Number(row.girls) })),
        },
      },
    ],
    columns: [
      { key: 'class_name', label: 'Class', format: 'text' },
      { key: 'sections', label: 'Sections', format: 'number', total: true, hideBelow: 'md' },
      { key: 'boys', label: 'Boys', format: 'number', total: true },
      { key: 'girls', label: 'Girls', format: 'number', total: true },
      { key: 'students', label: 'Total', format: 'number', total: true },
      { key: 'capacity', label: 'Capacity', format: 'number', total: true, hideBelow: 'sm' },
      { key: 'utilisation', label: 'Filled', format: 'percent', hideBelow: 'md' },
    ],
    rows,
    totals: {
      class_name: `${rows.length} classes`,
      sections: rows.reduce((sum, row) => sum + Number(row.sections), 0),
      boys,
      girls,
      students: roster.length,
      capacity,
      utilisation: percent(roster.length, capacity),
    },
    empty_reason: null,
  };
}

function reportStudentAdmissions(params: URLSearchParams): ReportResult {
  const year = Number(params.get('year')) || new Date().getFullYear();
  const echo = { year: String(year) };

  const rows: ReportRow[] = [];
  const points: ReportPoint[] = [];

  for (const { label, prefix } of reportMonths(year)) {
    // Every admission, whatever the student's status now — a report of who
    // joined must not quietly drop the ones who have since left.
    const joined = students.filter((student) => student.admission_date.startsWith(prefix));

    rows.push({
      month: MONTH_LABELS[Number(prefix.slice(5)) - 1],
      admissions: joined.length,
      boys: joined.filter((student) => student.gender === 'male').length,
      girls: joined.filter((student) => student.gender === 'female').length,
      still_active: joined.filter((student) => student.status === 'active').length,
    });

    points.push({ label, value: joined.length });
  }

  const total = rows.reduce((sum, row) => sum + Number(row.admissions), 0);

  if (total === 0) {
    return emptyReport(
      'student-admissions',
      'Admissions',
      echo,
      `Nobody was admitted in ${year}.`,
    );
  }

  const counts = rows.map((row) => Number(row.admissions));
  const busiest = rows[counts.indexOf(Math.max(...counts))];

  return {
    key: 'student-admissions',
    title: `Admissions — ${year}`,
    subtitle: 'Everybody admitted that year, whatever their status now',
    generated_at: reportStamp(),
    params: echo,
    stats: [
      { label: 'Admitted', value: total, format: 'number' },
      { label: 'Busiest month', value: Number(busiest.admissions), format: 'number',
        hint: String(busiest.month) },
      { label: 'Still on the roll', value: rows.reduce((sum, row) => sum + Number(row.still_active), 0),
        format: 'number', tone: 'success' },
      { label: 'Monthly average', value: Math.round((total / rows.length) * 10) / 10, format: 'number' },
    ],
    series: [
      { key: 'admissions', label: 'Admissions month by month', chart: 'line', format: 'number', points },
    ],
    columns: [
      { key: 'month', label: 'Month', format: 'text' },
      { key: 'admissions', label: 'Admitted', format: 'number', total: true },
      { key: 'boys', label: 'Boys', format: 'number', total: true, hideBelow: 'sm' },
      { key: 'girls', label: 'Girls', format: 'number', total: true, hideBelow: 'sm' },
      { key: 'still_active', label: 'Still on the roll', format: 'number', total: true, hideBelow: 'md' },
    ],
    rows,
    totals: {
      month: `${rows.length} months`,
      admissions: total,
      boys: rows.reduce((sum, row) => sum + Number(row.boys), 0),
      girls: rows.reduce((sum, row) => sum + Number(row.girls), 0),
      still_active: rows.reduce((sum, row) => sum + Number(row.still_active), 0),
    },
    empty_reason: null,
  };
}

// --- reports: teachers ------------------------------------------------------

function reportTeacherDepartments(): ReportResult {
  const roster = teachers.filter((teacher) => teacher.status === 'active');

  if (roster.length === 0) {
    return emptyReport('teacher-departments', 'Teachers by department', {}, 'No active teachers.');
  }

  const byDepartment = new Map<string, TeacherDetail[]>();
  for (const teacher of roster) {
    const label = teacher.department ?? 'Unassigned';
    byDepartment.set(label, [...(byDepartment.get(label) ?? []), teacher]);
  }

  const rows: ReportRow[] = [...byDepartment.entries()]
    .map(([department, members]) => ({
      department,
      teachers: members.length,
      class_teachers: members.filter((teacher) => teacher.class_teacher_of !== null).length,
      subjects: new Set(members.flatMap((teacher) => teacher.subjects.map((subject) => subject.id))).size,
      average_experience:
        Math.round(
          (members.reduce((sum, teacher) => sum + teacher.experience_years, 0) / members.length) * 10,
        ) / 10,
    }))
    .sort((left, right) => Number(right.teachers) - Number(left.teachers));

  return {
    key: 'teacher-departments',
    title: 'Teachers by department',
    subtitle: `${roster.length} on the teaching roster`,
    generated_at: reportStamp(),
    params: {},
    stats: [
      { label: 'Teachers', value: roster.length, format: 'number' },
      { label: 'Departments', value: rows.length, format: 'number' },
      { label: 'Class teachers', value: roster.filter((teacher) => teacher.class_teacher_of !== null).length,
        format: 'number' },
      { label: 'Average experience', value:
          Math.round((roster.reduce((sum, teacher) => sum + teacher.experience_years, 0) / roster.length) * 10) / 10,
        format: 'number', hint: 'years' },
    ],
    series: [
      {
        key: 'departments',
        label: 'How the roster divides',
        chart: 'donut',
        format: 'number',
        points: rows.map((row) => ({ label: String(row.department), value: Number(row.teachers) })),
      },
    ],
    columns: [
      { key: 'department', label: 'Department', format: 'text' },
      { key: 'teachers', label: 'Teachers', format: 'number', total: true },
      { key: 'class_teachers', label: 'Class teachers', format: 'number', total: true, hideBelow: 'sm' },
      { key: 'subjects', label: 'Subjects', format: 'number', hideBelow: 'md' },
      { key: 'average_experience', label: 'Avg. experience', format: 'number', hideBelow: 'md' },
    ],
    rows,
    totals: {
      department: `${rows.length} departments`,
      teachers: roster.length,
      class_teachers: roster.filter((teacher) => teacher.class_teacher_of !== null).length,
    },
    empty_reason: null,
  };
}

function reportTeacherWorkload(): ReportResult {
  // The timetable module's own workload builder — the ceiling and the
  // overload flag are its rules, not a second set.
  const workload = buildWorkload();

  if (workload.length === 0) {
    return emptyReport('teacher-workload', 'Teaching load', {}, 'No active teachers.');
  }

  if (workload.every((entry) => entry.periods_per_week === 0)) {
    return emptyReport(
      'teacher-workload',
      'Teaching load',
      {},
      'No timetable has been built yet, so nobody has a load.',
    );
  }

  const rows: ReportRow[] = workload.map((entry) => ({
    teacher_name: entry.teacher_name,
    employee_id: entry.employee_id,
    periods_per_week: entry.periods_per_week,
    busiest_day: entry.busiest_day_periods,
    classes: entry.classes_count,
    subjects: entry.subjects.length,
    utilisation: percent(entry.periods_per_week, entry.max_periods_per_week),
  }));

  const overloaded = workload.filter((entry) => entry.is_overloaded).length;
  const heavy = workload.filter((entry) => entry.periods_per_week >= HEAVY_LOAD_PERIODS).length;
  const total = workload.reduce((sum, entry) => sum + entry.periods_per_week, 0);

  return {
    key: 'teacher-workload',
    title: 'Teaching load',
    subtitle: `${total} periods a week across ${workload.length} teachers`,
    generated_at: reportStamp(),
    params: {},
    stats: [
      { label: 'Periods a week', value: total, format: 'number' },
      { label: 'Average load', value: Math.round((total / workload.length) * 10) / 10, format: 'number',
        hint: 'periods per teacher' },
      { label: 'Heavily loaded', value: heavy, format: 'number',
        tone: heavy > 0 ? 'warning' : 'neutral', hint: `${HEAVY_LOAD_PERIODS}+ periods` },
      { label: 'Over the ceiling', value: overloaded, format: 'number',
        tone: overloaded > 0 ? 'danger' : 'success' },
    ],
    series: [
      {
        key: 'workload',
        label: 'Periods a week per teacher',
        chart: 'bar',
        format: 'number',
        points: workload
          .slice(0, 15)
          .map((entry) => ({ label: entry.teacher_name.split(' ')[0], value: entry.periods_per_week })),
      },
    ],
    columns: [
      { key: 'teacher_name', label: 'Teacher', format: 'text' },
      { key: 'employee_id', label: 'Employee ID', format: 'text', hideBelow: 'md' },
      { key: 'periods_per_week', label: 'Periods', format: 'number', total: true },
      { key: 'busiest_day', label: 'Busiest day', format: 'number', hideBelow: 'sm' },
      { key: 'classes', label: 'Classes', format: 'number', hideBelow: 'md' },
      { key: 'subjects', label: 'Subjects', format: 'number', hideBelow: 'lg' },
      { key: 'utilisation', label: 'Of ceiling', format: 'percent' },
    ],
    rows,
    totals: { teacher_name: `${workload.length} teachers`, periods_per_week: total },
    empty_reason: null,
  };
}

// --- reports: payroll -------------------------------------------------------

/** Payslips of every processed run in a year, month by month. */
function payslipMonths(year: number) {
  return reportMonths(year).map(({ label, prefix }) => {
    const runs = runList.filter((run) => run.month === prefix);
    const slips = runs.flatMap((run) => payslipsByRun.get(run.id) ?? []);
    return { label, prefix, slips };
  });
}

function reportPayrollCost(params: URLSearchParams): ReportResult {
  const year = Number(params.get('year')) || new Date().getFullYear();
  const echo = { year: String(year) };
  const months = payslipMonths(year).filter((entry) => entry.slips.length > 0);

  if (months.length === 0) {
    return emptyReport(
      'payroll-cost',
      'Salary cost',
      echo,
      `No payroll has been processed for ${year}. A run has to be costed before it can be reported.`,
    );
  }

  const rows: ReportRow[] = months.map(({ prefix, slips }) => {
    const gross = slips.reduce((sum, slip) => sum + minor(slip.gross), 0);
    const deductions = slips.reduce((sum, slip) => sum + minor(slip.total_deductions), 0);

    return {
      month: MONTH_LABELS[Number(prefix.slice(5)) - 1],
      employees: slips.length,
      gross: major(gross),
      deductions: major(deductions),
      net: major(gross - deductions),
      average: major(Math.round(gross / slips.length)),
    };
  });

  const totalGross = rows.reduce((sum, row) => sum + minor(Number(row.gross)), 0);
  const totalNet = rows.reduce((sum, row) => sum + minor(Number(row.net)), 0);

  return {
    key: 'payroll-cost',
    title: `Salary cost — ${year}`,
    subtitle: 'Read from the processed payslips, never recomputed',
    generated_at: reportStamp(),
    params: echo,
    stats: [
      { label: 'Gross for the year', value: major(totalGross), format: 'money' },
      { label: 'Paid out', value: major(totalNet), format: 'money', tone: 'info' },
      { label: 'Deductions', value: major(totalGross - totalNet), format: 'money' },
      { label: 'Months processed', value: rows.length, format: 'number' },
    ],
    series: [
      {
        key: 'cost',
        label: 'Gross against net',
        chart: 'line',
        format: 'money',
        points: rows.map((row) => ({ label: String(row.month).slice(0, 3), value: Number(row.gross) })),
        companion: {
          label: 'Net',
          points: rows.map((row) => ({ label: String(row.month).slice(0, 3), value: Number(row.net) })),
        },
      },
    ],
    columns: [
      { key: 'month', label: 'Month', format: 'text' },
      { key: 'employees', label: 'Employees', format: 'number', hideBelow: 'sm' },
      { key: 'gross', label: 'Gross', format: 'money', total: true },
      { key: 'deductions', label: 'Deductions', format: 'money', total: true, hideBelow: 'md' },
      { key: 'net', label: 'Net paid', format: 'money', total: true },
      { key: 'average', label: 'Average', format: 'money', hideBelow: 'lg' },
    ],
    rows,
    totals: {
      month: `${rows.length} months`,
      gross: major(totalGross),
      deductions: major(totalGross - totalNet),
      net: major(totalNet),
    },
    empty_reason: null,
  };
}

function reportPayrollStatutory(params: URLSearchParams): ReportResult {
  const year = Number(params.get('year')) || new Date().getFullYear();
  const echo = { year: String(year) };
  const months = payslipMonths(year).filter((entry) => entry.slips.length > 0);

  if (months.length === 0) {
    return emptyReport(
      'payroll-statutory',
      'PF and ESI',
      echo,
      `No payroll has been processed for ${year}, so there is nothing to return.`,
    );
  }

  const rows: ReportRow[] = months.map(({ prefix, slips }) => {
    // Read off the payslips exactly as the returns are — the figure filed has
    // to match the figure paid, and two calculations of one month is one too
    // many.
    const inPf = slips.filter((slip) => slip.pf_wages > 0);
    const inEsi = slips.filter((slip) => slip.esi_wages > 0);

    /**
     * `pf_employer` is the *whole* employer contribution and `eps_employer`
     * is the pension share inside it — the statutory register makes that
     * explicit by writing the provident share as the difference. Adding the
     * pension on top would overstate every PF return the school files.
     */
    const pf = slips.reduce(
      (sum, slip) => sum + minor(slip.pf_employee) + minor(slip.pf_employer),
      0,
    );
    const pension = slips.reduce((sum, slip) => sum + minor(slip.eps_employer), 0);
    const esi = slips.reduce(
      (sum, slip) => sum + minor(slip.esi_employee) + minor(slip.esi_employer),
      0,
    );

    return {
      month: MONTH_LABELS[Number(prefix.slice(5)) - 1],
      pf_members: inPf.length,
      pf_total: major(pf),
      pension: major(pension),
      esi_members: inEsi.length,
      esi_total: major(esi),
      total: major(pf + esi),
    };
  });

  const pfTotal = rows.reduce((sum, row) => sum + minor(Number(row.pf_total)), 0);
  const esiTotal = rows.reduce((sum, row) => sum + minor(Number(row.esi_total)), 0);

  return {
    key: 'payroll-statutory',
    title: `PF and ESI — ${year}`,
    subtitle: 'Contributions as the monthly returns report them',
    generated_at: reportStamp(),
    params: echo,
    stats: [
      { label: 'Provident fund', value: major(pfTotal), format: 'money' },
      { label: 'ESI', value: major(esiTotal), format: 'money' },
      { label: 'Statutory total', value: major(pfTotal + esiTotal), format: 'money', tone: 'info' },
      { label: 'Months filed', value: rows.length, format: 'number' },
    ],
    series: [
      {
        key: 'statutory',
        label: 'PF against ESI',
        chart: 'bar',
        format: 'money',
        points: rows.map((row) => ({ label: String(row.month).slice(0, 3), value: Number(row.pf_total) })),
        companion: {
          label: 'ESI',
          points: rows.map((row) => ({ label: String(row.month).slice(0, 3), value: Number(row.esi_total) })),
        },
      },
    ],
    columns: [
      { key: 'month', label: 'Month', format: 'text' },
      { key: 'pf_members', label: 'PF members', format: 'number', hideBelow: 'md' },
      { key: 'pf_total', label: 'PF', format: 'money', total: true },
      // Broken out because the return asks for it separately, not because it
      // is extra money — the pension share sits inside the PF total.
      { key: 'pension', label: 'of which pension', format: 'money', total: true, hideBelow: 'lg' },
      { key: 'esi_members', label: 'ESI members', format: 'number', hideBelow: 'md' },
      { key: 'esi_total', label: 'ESI', format: 'money', total: true },
      { key: 'total', label: 'Total', format: 'money', total: true, hideBelow: 'sm' },
    ],
    rows,
    totals: {
      month: `${rows.length} months`,
      pf_total: major(pfTotal),
      pension: major(rows.reduce((sum, row) => sum + minor(Number(row.pension)), 0)),
      esi_total: major(esiTotal),
      total: major(pfTotal + esiTotal),
    },
    empty_reason: null,
  };
}

// --- reports: examinations --------------------------------------------------

function reportExamPerformance(params: URLSearchParams): ReportResult {
  const examId = Number(params.get('exam_id'));
  const exam = examList.find((entry) => entry.id === examId);
  const echo = { exam_id: String(examId) };

  if (!exam) return emptyReport('exam-performance', 'Subject performance', echo, 'That exam no longer exists.');

  const bySubject = new Map<string, { max: number; scores: number[]; passed: number; absent: number; papers: number }>();

  for (const paper of exam.papers) {
    const roster = paperRoster(paper);
    const entry = bySubject.get(paper.subject_name) ?? { max: 0, scores: [], passed: 0, absent: 0, papers: 0 };
    entry.papers += 1;
    entry.max = Math.max(entry.max, paper.max_marks);

    for (const student of roster) {
      const mark = markOf(paper.id, student.id);
      if (!mark) continue;
      if (mark.is_absent) {
        entry.absent += 1;
        continue;
      }
      if (mark.marks_obtained === null) continue;

      entry.scores.push(percentFor(mark.marks_obtained, paper.max_marks));
      if (mark.marks_obtained >= paper.pass_marks) entry.passed += 1;
    }

    bySubject.set(paper.subject_name, entry);
  }

  const rows: ReportRow[] = [...bySubject.entries()]
    .filter(([, entry]) => entry.scores.length > 0)
    .map(([subject, entry]) => ({
      subject,
      papers: entry.papers,
      sat: entry.scores.length,
      absent: entry.absent,
      average: Math.round((entry.scores.reduce((sum, score) => sum + score, 0) / entry.scores.length) * 10) / 10,
      highest: Math.round(Math.max(...entry.scores) * 10) / 10,
      pass_rate: percent(entry.passed, entry.scores.length),
    }))
    .sort((left, right) => Number(right.pass_rate) - Number(left.pass_rate));

  if (rows.length === 0) {
    return emptyReport(
      'exam-performance',
      'Subject performance',
      echo,
      `No marks have been entered for ${exam.name} yet.`,
    );
  }

  const sat = rows.reduce((sum, row) => sum + Number(row.sat), 0);
  const weakest = rows[rows.length - 1];

  return {
    key: 'exam-performance',
    title: `Subject performance — ${exam.name}`,
    subtitle: `${rows.length} subjects · ${sat} papers marked`,
    generated_at: reportStamp(),
    params: echo,
    stats: [
      { label: 'Papers marked', value: sat, format: 'number' },
      { label: 'Pass rate', value: percent(
          rows.reduce((sum, row) => sum + (Number(row.pass_rate) / 100) * Number(row.sat), 0),
          sat,
        ), format: 'percent', tone: 'info' },
      { label: 'Weakest subject', value: Number(weakest.pass_rate), format: 'percent',
        tone: Number(weakest.pass_rate) < 60 ? 'danger' : 'neutral', hint: String(weakest.subject) },
      { label: 'Absent', value: rows.reduce((sum, row) => sum + Number(row.absent), 0), format: 'number' },
    ],
    series: [
      {
        key: 'pass-rate',
        label: 'Pass rate by subject',
        chart: 'bar',
        format: 'percent',
        points: rows.map((row) => ({ label: String(row.subject), value: Number(row.pass_rate) })),
      },
    ],
    columns: [
      { key: 'subject', label: 'Subject', format: 'text' },
      { key: 'papers', label: 'Papers', format: 'number', hideBelow: 'lg' },
      { key: 'sat', label: 'Marked', format: 'number', total: true },
      { key: 'absent', label: 'Absent', format: 'number', total: true, hideBelow: 'md' },
      { key: 'average', label: 'Average', format: 'percent', hideBelow: 'sm' },
      { key: 'highest', label: 'Highest', format: 'percent', hideBelow: 'lg' },
      { key: 'pass_rate', label: 'Pass rate', format: 'percent' },
    ],
    rows,
    totals: {
      subject: `${rows.length} subjects`,
      sat,
      absent: rows.reduce((sum, row) => sum + Number(row.absent), 0),
    },
    empty_reason: null,
  };
}

function reportExamGradeSpread(params: URLSearchParams): ReportResult {
  const examId = Number(params.get('exam_id'));
  const classId = params.get('class_id') ? Number(params.get('class_id')) : null;
  const exam = examList.find((entry) => entry.id === examId);
  const echo = { exam_id: String(examId), ...(classId ? { class_id: String(classId) } : {}) };

  if (!exam) return emptyReport('exam-grade-spread', 'Grade spread', echo, 'That exam no longer exists.');

  // Every class the exam actually reaches, filtered to one if asked.
  const examClasses = [...new Set(exam.papers.map((paper) => paper.class_id))].filter(
    (id) => (classId ? id === classId : true),
  );

  if (examClasses.length === 0) {
    return emptyReport(
      'exam-grade-spread',
      'Grade spread',
      echo,
      classId ? 'That class does not sit this exam.' : 'This exam has no papers yet.',
    );
  }

  // The examinations module's own results builder, so a grade here is the
  // grade on the report card.
  const results = examClasses.map((id) => buildResults(exam, id, null));
  const spread = new Map<string, number>();
  let appeared = 0;
  let passed = 0;

  const rows: ReportRow[] = results.map((result) => {
    appeared += result.summary.appeared;
    passed += result.summary.passed;

    for (const band of result.summary.distribution) {
      spread.set(band.grade, (spread.get(band.grade) ?? 0) + band.count);
    }

    return {
      class_name: result.class_name,
      students: result.summary.students,
      appeared: result.summary.appeared,
      passed: result.summary.passed,
      failed: result.summary.failed,
      pass_percent: result.summary.pass_percent,
      class_average: result.summary.class_average,
      highest: result.summary.highest_percent,
    };
  });

  if (appeared === 0) {
    return emptyReport(
      'exam-grade-spread',
      'Grade spread',
      echo,
      `Nobody has a mark in ${exam.name} yet, so there are no grades to spread.`,
    );
  }

  return {
    key: 'exam-grade-spread',
    title: `Grade spread — ${exam.name}`,
    subtitle: `${appeared} students across ${rows.length} class${rows.length === 1 ? '' : 'es'}`,
    generated_at: reportStamp(),
    params: echo,
    stats: [
      { label: 'Appeared', value: appeared, format: 'number' },
      { label: 'Passed', value: passed, format: 'number', tone: 'success' },
      { label: 'Failed', value: appeared - passed, format: 'number',
        tone: appeared - passed > 0 ? 'danger' : 'neutral' },
      { label: 'Pass rate', value: percent(passed, appeared), format: 'percent' },
    ],
    series: [
      {
        key: 'grades',
        label: 'Grades awarded',
        chart: 'donut',
        format: 'number',
        // Grade order comes from the shared band table, so the chart reads
        // best-to-worst rather than in whatever order a Map happened to fill.
        points: GRADE_BANDS.map((band) => ({
          label: band.grade,
          value: spread.get(band.grade) ?? 0,
        })).filter((point) => point.value > 0),
      },
    ],
    columns: [
      { key: 'class_name', label: 'Class', format: 'text' },
      { key: 'students', label: 'Students', format: 'number', total: true, hideBelow: 'md' },
      { key: 'appeared', label: 'Appeared', format: 'number', total: true },
      { key: 'passed', label: 'Passed', format: 'number', total: true },
      { key: 'failed', label: 'Failed', format: 'number', total: true, hideBelow: 'sm' },
      { key: 'class_average', label: 'Average', format: 'percent', hideBelow: 'lg' },
      { key: 'pass_percent', label: 'Pass rate', format: 'percent' },
    ],
    rows,
    totals: {
      class_name: `${rows.length} classes`,
      students: rows.reduce((sum, row) => sum + Number(row.students), 0),
      appeared,
      passed,
      failed: appeared - passed,
      pass_percent: percent(passed, appeared),
    },
    empty_reason: null,
  };
}

// --- reports: dispatch ------------------------------------------------------

const REPORT_BUILDERS: Record<ReportKey, (params: URLSearchParams) => ReportResult> = {
  'attendance-by-class': reportAttendanceByClass,
  'attendance-trend': reportAttendanceTrend,
  'fee-collection': reportFeeCollection,
  'fee-defaulters': reportFeeDefaulters,
  'student-strength': () => reportStudentStrength(),
  'student-admissions': reportStudentAdmissions,
  'teacher-departments': () => reportTeacherDepartments(),
  'teacher-workload': () => reportTeacherWorkload(),
  'payroll-cost': reportPayrollCost,
  'payroll-statutory': reportPayrollStatutory,
  'exam-performance': reportExamPerformance,
  'exam-grade-spread': reportExamGradeSpread,
};

const isReportKey = (value: string): value is ReportKey => value in REPORT_BUILDERS;

/**
 * The overview: one panel per family.
 *
 * Each is a real report run with its default parameters and reduced to a
 * single chart and a single figure, rather than a separate calculation —
 * which is why a panel and the report it links to can never disagree.
 */
function buildReportsOverview() {
  const year = String(new Date().getFullYear());
  const month = String(new Date().getMonth() + 1);
  const latestExam = [...examList].sort((left, right) =>
    right.start_date.localeCompare(left.start_date),
  )[0];

  const wanted: { key: ReportKey; family: string; params: Record<string, string> }[] = [
    { key: 'attendance-trend', family: 'attendance', params: { year } },
    { key: 'fee-collection', family: 'fees', params: { year } },
    { key: 'student-strength', family: 'students', params: {} },
    { key: 'teacher-departments', family: 'teachers', params: {} },
    { key: 'payroll-cost', family: 'payroll', params: { year } },
    {
      key: 'exam-performance',
      family: 'exams',
      params: latestExam ? { exam_id: String(latestExam.id) } : {},
    },
  ];

  const panels = wanted
    .map(({ key, family, params }) => {
      const result = REPORT_BUILDERS[key](new URLSearchParams({ ...params, month }));
      // A panel with nothing to draw is left out rather than shown as an
      // empty box — the overview is a summary, not a status board.
      if (result.series.length === 0 || result.stats.length === 0) return null;

      return { key, family, title: result.title, stat: result.stats[0], series: result.series[0] };
    })
    .filter((panel) => panel !== null);

  return { generated_at: reportStamp(), panels };
}

/** A report as a flat file — the same rows the screen shows, not the page of them. */
function reportFileBody(result: ReportResult, format: string): string {
  if (format === 'excel') {
    const header = result.columns.map((column) => column.label).join(',');
    const lines = result.rows.map((row) =>
      result.columns
        .map((column) => String(row[column.key] ?? '').replace(/[\n,]/g, ' '))
        .join(','),
    );

    const footer = result.totals
      ? [result.columns.map((column) => String(result.totals?.[column.key] ?? '')).join(',')]
      : [];

    return [header, ...lines, ...footer].join('\n');
  }

  const stats = result.stats.map((stat) => `${stat.label}: ${stat.value}`).join('\n');

  return [
    result.title,
    result.subtitle ?? '',
    `Generated ${result.generated_at}`,
    '',
    stats,
    '',
    result.columns.map((column) => column.label).join('  '),
    ...result.rows.map((row) => result.columns.map((column) => row[column.key] ?? '').join('  ')),
  ].join('\n');
}

// --- analytics --------------------------------------------------------------

/**
 * The analysis layer.
 *
 * Like the reporting layer, it computes no *source* figure: attendance comes
 * from `buildMonthlyReport`, fee balances from `buildAccount`, results from
 * `buildResults`. What it adds is the statistics on top — correlation,
 * regression, z-scores, weighted risk — which is precisely what the reporting
 * layer does not do and why the two are separate modules.
 *
 * Every analysis also emits a **feature vector**: the same numbers it drew
 * its conclusions from, flat and named, ready for a model that does not exist
 * yet. Nothing here predicts anything, and the intelligence field is null
 * until a provider is bound.
 */

const FEATURE_SCHEMA_VERSION = '1.0.0';

const analysisStamp = () => new Date().toISOString();

const emptyAnalysis = (
  key: AnalysisKey,
  domain: AnalyticsDomain,
  title: string,
  params: Record<string, string>,
  reason: string,
): Analysis => ({
  key,
  domain,
  title,
  subtitle: null,
  generated_at: analysisStamp(),
  params,
  method: 'Not run — there was nothing to measure.',
  sample_size: 0,
  confidence: 'low',
  insights: [],
  series: [],
  scatter: null,
  cohort: null,
  features: { schema_version: FEATURE_SCHEMA_VERSION, feature_names: [], target: null, rows: [] },
  intelligence: null,
  empty_reason: reason,
});

/** Attendance percentage per student for a month, from the attendance module. */
function attendanceByStudent(year: number, month: number, classId: number | null) {
  const map = new Map<number, { percent: number; absent: number; working: number }>();

  const scope = classId ? classes.filter((entry) => entry.id === classId) : classes;

  for (const klass of scope) {
    const report = buildMonthlyReport('student', year, month, klass.id, null);
    if (report.working_days === 0) continue;

    for (const row of report.rows) {
      map.set(row.person_id, {
        percent: row.attendance_percent,
        absent: row.absent_days,
        working: report.working_days,
      });
    }
  }

  return map;
}

/** Exam percentage per student for one exam, from the examinations module. */
function performanceByStudent(exam: ExamDetail) {
  const map = new Map<number, number>();

  for (const classId of new Set(exam.papers.map((paper) => paper.class_id))) {
    for (const row of buildResults(exam, classId, null).rows) {
      if (row.total_max_marks > 0) map.set(row.student_id, row.percent);
    }
  }

  return map;
}

/** Homework completion per student — submitted over set, for their class. */
function homeworkByStudent(): Map<number, number> {
  const map = new Map<number, number>();

  for (const student of students.filter((entry) => entry.status === 'active')) {
    const set = homeworkList.filter(
      (entry) => entry.status === 'published' && entry.class_id === student.class_id,
    );
    if (set.length === 0) continue;

    const done = set.filter(
      (entry) => submissionsByHomework.get(submissionKey(entry.id, student.id)) !== undefined,
    ).length;

    map.set(student.id, percent(done, set.length));
  }

  return map;
}

const studentLink = (id: number) => toPath(PATHS.studentProfile, { id });

// --- analytics: performance -------------------------------------------------

function analysePerformanceDrivers(params: URLSearchParams): Analysis {
  const examId = Number(params.get('exam_id'));
  const exam = examList.find((entry) => entry.id === examId) ?? examList[0];
  const now = new Date();
  const year = Number(params.get('year')) || now.getFullYear();
  const month = Number(params.get('month')) || now.getMonth() + 1;

  const echo: Record<string, string> = {
    year: String(year),
    month: String(month),
    ...(exam ? { exam_id: String(exam.id) } : {}),
  };

  if (!exam) {
    return emptyAnalysis(
      'performance-drivers',
      'performance',
      'What moves results',
      echo,
      'No examination has been held, so there are no marks to compare attendance against.',
    );
  }

  const attendance = attendanceByStudent(year, month, null);
  const marks = performanceByStudent(exam);

  // Only students who have both measures. Pairing a mark against a blank
  // would drag the whole line towards the origin.
  const paired = [...marks.entries()]
    .map(([studentId, mark]) => {
      const record = students.find((entry) => entry.id === studentId);
      const seen = attendance.get(studentId);
      return record && seen ? { record, mark, attendance: seen.percent } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (paired.length < 3) {
    return emptyAnalysis(
      'performance-drivers',
      'performance',
      'What moves results',
      echo,
      `Only ${paired.length} students have both a mark in ${exam.name} and an attendance record this month — too few to say anything.`,
    );
  }

  const xs = paired.map((entry) => entry.attendance);
  const ys = paired.map((entry) => entry.mark);
  const r = correlation(xs, ys);
  const fit = linearRegression(xs, ys);
  const confidence = confidenceFor(r, paired.length);

  const insights: Insight[] = [];

  insights.push({
    key: 'correlation',
    headline: `Attendance and marks show a ${correlationLabel(r)} relationship`,
    detail:
      r === null
        ? 'The two do not move together in any measurable way across this cohort.'
        : `Pearson's r is ${r}. ${
            fit ? `The fit accounts for ${Math.round(fit.rSquared * 100)}% of the variation in marks.` : ''
          }`,
    tone: r !== null && Math.abs(r) >= 0.4 ? 'info' : 'neutral',
    evidence: `${paired.length} students who both sat ${exam.name} and were on the register`,
    magnitude: Math.abs(r ?? 0) * 100,
  });

  if (fit && Math.abs(fit.slope) > 0.05) {
    // The slope is the sentence somebody can act on; the coefficient is not.
    insights.push({
      key: 'slope',
      headline: `Each point of attendance is worth about ${round(Math.abs(fit.slope), 2)} marks`,
      detail:
        fit.slope > 0
          ? `A student ten points further up the register scores roughly ${round(fit.slope * 10, 1)} percentage points higher. That is an association, not a proven cause — the same pressures often move both.`
          : 'The line runs the wrong way, which usually means something other than attendance is driving these marks.',
      tone: fit.slope > 0 ? 'success' : 'warning',
      evidence: `Least-squares fit over ${paired.length} students`,
      magnitude: Math.abs(fit.slope) * 50,
    });
  }

  // The gap between the best and worst attenders, which is the version of the
  // finding a head will actually repeat.
  const sorted = [...paired].sort((left, right) => right.attendance - left.attendance);
  const topThird = sorted.slice(0, Math.max(1, Math.floor(sorted.length / 3)));
  const bottomThird = sorted.slice(-Math.max(1, Math.floor(sorted.length / 3)));
  const topMean = mean(topThird.map((entry) => entry.mark));
  const bottomMean = mean(bottomThird.map((entry) => entry.mark));

  if (topMean !== null && bottomMean !== null) {
    insights.push({
      key: 'thirds',
      headline: `The best attenders average ${round(topMean - bottomMean, 1)} points above the worst`,
      detail: `Top third of the register averaged ${round(topMean, 1)}%; the bottom third averaged ${round(bottomMean, 1)}%.`,
      tone: topMean - bottomMean > 10 ? 'warning' : 'neutral',
      evidence: `${topThird.length} students against ${bottomThird.length}`,
      magnitude: Math.abs(topMean - bottomMean),
    });
  }

  return {
    key: 'performance-drivers',
    domain: 'performance',
    title: `What moves results — ${exam.name}`,
    subtitle: `Attendance in ${MONTH_LABELS[month - 1]} against marks in ${exam.name}`,
    generated_at: analysisStamp(),
    params: echo,
    method: `Pearson correlation and least-squares regression over ${paired.length} students with both measures.`,
    sample_size: paired.length,
    confidence,
    insights: insights.sort((left, right) => right.magnitude - left.magnitude),
    series: [],
    scatter: {
      x_label: 'Attendance %',
      y_label: 'Exam %',
      x_is_percent: true,
      y_is_percent: true,
      points: paired.map((entry) => ({
        x: entry.attendance,
        y: entry.mark,
        label: entry.record.full_name,
      })),
      // Only drawn where the relationship is strong enough to justify a line.
      trend:
        fit && r !== null && Math.abs(r) >= 0.3
          ? { slope: fit.slope, intercept: fit.intercept, r_squared: fit.rSquared }
          : null,
    },
    cohort: null,
    features: {
      schema_version: FEATURE_SCHEMA_VERSION,
      feature_names: ['attendance_percent', 'exam_percent'],
      target: 'exam_percent',
      rows: paired.map((entry) => ({
        id: String(entry.record.id),
        label: entry.record.full_name,
        features: { attendance_percent: entry.attendance, exam_percent: entry.mark },
      })),
    },
    intelligence: null,
    empty_reason: null,
  };
}

function analyseAtRiskStudents(params: URLSearchParams): Analysis {
  const now = new Date();
  const year = Number(params.get('year')) || now.getFullYear();
  const month = Number(params.get('month')) || now.getMonth() + 1;
  const classId = params.get('class_id') ? Number(params.get('class_id')) : null;

  const echo: Record<string, string> = {
    year: String(year),
    month: String(month),
    ...(classId ? { class_id: String(classId) } : {}),
  };

  const attendance = attendanceByStudent(year, month, classId);
  const homework = homeworkByStudent();
  const latestExam = [...examList].sort((left, right) =>
    right.start_date.localeCompare(left.start_date),
  )[0];
  const marks = latestExam ? performanceByStudent(latestExam) : new Map<number, number>();

  const roster = students
    .filter((student) => student.status === 'active')
    .filter((student) => (classId ? student.class_id === classId : true));

  if (roster.length === 0) {
    return emptyAnalysis(
      'at-risk-students',
      'performance',
      'Students at risk',
      echo,
      'No active students in scope.',
    );
  }

  const scored = roster
    .map((student) => {
      const seen = attendance.get(student.id) ?? null;
      const mark = marks.get(student.id) ?? null;
      const done = homework.get(student.id) ?? null;
      const account = buildAccount(student);

      // Each part is expressed as *risk*, so 100 is the worst case and the
      // weighted total reads in one direction throughout.
      const feeRisk =
        account.total_payable === 0
          ? null
          : Math.min(100, percent(account.balance, account.total_payable));

      const weighted = weightedScore([
        { value: seen === null ? null : 100 - seen.percent, weight: RISK_WEIGHTS.attendance },
        { value: mark === null ? null : Math.max(0, 100 - mark), weight: RISK_WEIGHTS.marks },
        { value: done === null ? null : 100 - done, weight: RISK_WEIGHTS.homework },
        { value: feeRisk, weight: RISK_WEIGHTS.fees },
      ]);

      return {
        student,
        risk: weighted?.score ?? null,
        coverage: weighted?.coverage ?? 0,
        attendance: seen?.percent ?? null,
        mark,
        homework: done,
        balance: account.balance,
      };
    })
    .filter((entry) => entry.risk !== null);

  const atRisk = scored
    .filter((entry) => entry.risk! >= RISK_THRESHOLD)
    .sort((left, right) => right.risk! - left.risk!);

  const risks = scored.map((entry) => entry.risk!);
  const insights: Insight[] = [];

  insights.push({
    key: 'count',
    headline:
      atRisk.length === 0
        ? 'Nobody is above the risk threshold'
        : `${atRisk.length} students are above the risk threshold`,
    detail:
      atRisk.length === 0
        ? `Every student scored under ${RISK_THRESHOLD} on the composite measure.`
        : `That is ${percent(atRisk.length, scored.length)}% of the ${scored.length} scored. The score weights attendance ${RISK_WEIGHTS.attendance * 100}%, marks ${RISK_WEIGHTS.marks * 100}%, homework ${RISK_WEIGHTS.homework * 100}% and fee arrears ${RISK_WEIGHTS.fees * 100}%.`,
    tone: atRisk.length === 0 ? 'success' : atRisk.length > scored.length / 5 ? 'danger' : 'warning',
    evidence: `${scored.length} students with at least one measure recorded`,
    magnitude: atRisk.length,
  });

  const thin = scored.filter((entry) => entry.coverage < 0.6).length;
  if (thin > 0) {
    insights.push({
      key: 'coverage',
      headline: `${thin} scores rest on less than two thirds of their inputs`,
      detail:
        'Missing measures are dropped and the remaining weights renormalised rather than counted as zero — a student with no marks yet is not a student who scored nothing.',
      tone: 'neutral',
      evidence: 'Coverage is the share of intended weight actually available',
      magnitude: thin / 2,
    });
  }

  const worst = atRisk[0];
  if (worst) {
    insights.push({
      key: 'worst',
      headline: `${worst.student.full_name} scores highest at ${worst.risk}`,
      detail: [
        worst.attendance !== null ? `${worst.attendance}% attendance` : null,
        worst.mark !== null ? `${round(worst.mark, 1)}% in the last exam` : null,
        worst.balance > 0 ? `${major(minor(worst.balance))} outstanding` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      tone: 'danger',
      evidence: `${worst.student.class_name}${worst.student.section_name ? ` — ${worst.student.section_name}` : ''}`,
      magnitude: worst.risk!,
    });
  }

  const median50 = median(risks);

  return {
    key: 'at-risk-students',
    domain: 'performance',
    title: 'Students at risk',
    subtitle: `Composite score over attendance, marks, homework and arrears · median ${median50 ?? '—'}`,
    generated_at: analysisStamp(),
    params: echo,
    method: `Weighted composite on 0–100, missing inputs dropped and the remainder renormalised. At or above ${RISK_THRESHOLD} is on the list.`,
    sample_size: scored.length,
    confidence: scored.length >= 30 ? 'high' : scored.length >= 12 ? 'moderate' : 'low',
    insights: insights.sort((left, right) => right.magnitude - left.magnitude),
    series: [
      {
        key: 'distribution',
        label: 'How risk is distributed',
        chart: 'bar',
        format: 'number',
        points: bucketBy(
          scored,
          (entry) => entry.risk!,
          [
            { label: '0–20', upTo: 20 },
            { label: '21–35', upTo: 35 },
            { label: '36–45', upTo: 45 },
            { label: '46–60', upTo: 60 },
            { label: '61+', upTo: Number.POSITIVE_INFINITY },
          ],
        ).map((bucket) => ({ label: bucket.label, value: bucket.count })),
      },
    ],
    scatter: null,
    cohort: {
      key: 'at-risk',
      title: 'Who to look at first',
      description: 'Ranked by the composite score. The export carries every row, not just these.',
      columns: [
        { key: 'risk', label: 'Risk', format: 'number' },
        { key: 'attendance', label: 'Attendance', format: 'percent' },
        { key: 'mark', label: 'Last exam', format: 'percent' },
        { key: 'homework', label: 'Homework', format: 'percent' },
        { key: 'balance', label: 'Owed', format: 'money' },
      ],
      members: atRisk.slice(0, COHORT_PREVIEW_SIZE).map((entry) => ({
        id: String(entry.student.id),
        name: entry.student.full_name,
        identifier: entry.student.admission_no,
        detail: `${entry.student.class_name}${entry.student.section_name ? ` — ${entry.student.section_name}` : ''}`,
        metrics: {
          risk: entry.risk,
          attendance: entry.attendance,
          mark: entry.mark === null ? null : round(entry.mark, 1),
          homework: entry.homework,
          balance: entry.balance,
        },
        tone: entry.risk! >= 60 ? 'danger' : 'warning',
        to: studentLink(entry.student.id),
      })),
      total: atRisk.length,
    },
    features: {
      schema_version: FEATURE_SCHEMA_VERSION,
      feature_names: [
        'attendance_percent',
        'exam_percent',
        'homework_percent',
        'fee_balance',
        'coverage',
        'risk_score',
      ],
      target: 'risk_score',
      rows: scored.map((entry) => ({
        id: String(entry.student.id),
        label: entry.student.full_name,
        features: {
          attendance_percent: entry.attendance ?? -1,
          exam_percent: entry.mark === null ? -1 : round(entry.mark, 2),
          homework_percent: entry.homework ?? -1,
          fee_balance: entry.balance,
          coverage: entry.coverage,
          risk_score: entry.risk!,
        },
      })),
    },
    intelligence: null,
    empty_reason: null,
  };
}

// --- analytics: attendance --------------------------------------------------

function analyseAttendancePatterns(params: URLSearchParams): Analysis {
  const now = new Date();
  const year = Number(params.get('year')) || now.getFullYear();
  const month = Number(params.get('month')) || now.getMonth() + 1;
  const classId = params.get('class_id') ? Number(params.get('class_id')) : null;

  const echo: Record<string, string> = {
    year: String(year),
    month: String(month),
    ...(classId ? { class_id: String(classId) } : {}),
  };

  const scope = classId ? classes.filter((entry) => entry.id === classId) : classes;
  const reports = scope
    .map((klass) => buildMonthlyReport('student', year, month, klass.id, null))
    .filter((report) => report.working_days > 0 && report.rows.length > 0);

  if (reports.length === 0) {
    return emptyAnalysis(
      'attendance-patterns',
      'attendance',
      'The shape of absence',
      echo,
      `Nothing has been marked in ${MONTH_LABELS[month - 1]} ${year}.`,
    );
  }

  const rows = reports.flatMap((report) => report.rows);
  const workingDays = reports[0].working_days;

  // Absence by weekday, which is the pattern a register hides and a school
  // acts on — a Monday problem and a Friday problem have different causes.
  const byWeekday = new Map<number, { absent: number; marked: number }>();

  for (let day = 1; day <= 31; day += 1) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (!date.startsWith(`${year}-`)) continue;

    const parsed = new Date(`${date}T00:00:00Z`);
    if (parsed.getUTCMonth() + 1 !== month) continue;
    if (isWeekend(date) || holidayFor(date, 'student')) continue;

    const weekday = parsed.getUTCDay();
    const bucket = byWeekday.get(weekday) ?? { absent: 0, marked: 0 };

    for (const row of rows) {
      const status = row.days[day];
      if (!status) continue;
      bucket.marked += 1;
      if (status === 'absent') bucket.absent += 1;
    }

    byWeekday.set(weekday, bucket);
  }

  const weekdayPoints = [1, 2, 3, 4, 5, 6]
    .filter((day) => byWeekday.has(day))
    .map((day) => ({
      label: WEEKDAY_LABELS[day as Weekday].slice(0, 3),
      value: percent(byWeekday.get(day)!.absent, byWeekday.get(day)!.marked),
    }));

  const chronic = rows
    .filter((row) => percent(row.absent_days, workingDays) >= CHRONIC_ABSENCE_PERCENT)
    .sort((left, right) => right.absent_days - left.absent_days);

  const insights: Insight[] = [];

  const worstDay = [...weekdayPoints].sort((left, right) => right.value - left.value)[0];
  const bestDay = [...weekdayPoints].sort((left, right) => left.value - right.value)[0];

  if (worstDay && bestDay && worstDay.label !== bestDay.label) {
    insights.push({
      key: 'weekday',
      headline: `${worstDay.label} loses the most children`,
      detail: `${worstDay.value}% absent on ${worstDay.label} against ${bestDay.value}% on ${bestDay.label} — a spread of ${round(worstDay.value - bestDay.value, 1)} points.`,
      tone: worstDay.value - bestDay.value > 5 ? 'warning' : 'neutral',
      evidence: `${rows.length} students across ${workingDays} working days`,
      magnitude: worstDay.value - bestDay.value,
    });
  }

  insights.push({
    key: 'chronic',
    headline:
      chronic.length === 0
        ? 'No chronic absence this month'
        : `${chronic.length} students missed a fifth of the month or more`,
    detail:
      chronic.length === 0
        ? `Nobody was absent for ${CHRONIC_ABSENCE_PERCENT}% or more of the ${workingDays} working days.`
        : `Chronic absence concentrates: these ${chronic.length} students account for ${percent(
            chronic.reduce((sum, row) => sum + row.absent_days, 0),
            rows.reduce((sum, row) => sum + row.absent_days, 0),
          )}% of every absence recorded this month.`,
    tone: chronic.length === 0 ? 'success' : 'danger',
    evidence: `${CHRONIC_ABSENCE_PERCENT}% of ${workingDays} working days is ${round((CHRONIC_ABSENCE_PERCENT / 100) * workingDays, 1)} days`,
    magnitude: chronic.length,
  });

  const percentages = rows.map((row) => row.attendance_percent);
  const spread = stdDev(percentages);

  if (spread !== null) {
    insights.push({
      key: 'spread',
      headline: `Attendance varies by ${round(spread, 1)} points either side of the average`,
      detail:
        spread > 15
          ? 'That is a wide spread — the school average is hiding two quite different populations.'
          : 'A tight spread: the average describes most students reasonably well.',
      tone: spread > 15 ? 'warning' : 'neutral',
      evidence: `Sample standard deviation over ${rows.length} students`,
      magnitude: spread,
    });
  }

  return {
    key: 'attendance-patterns',
    domain: 'attendance',
    title: `The shape of absence — ${MONTH_LABELS[month - 1]} ${year}`,
    subtitle: `${rows.length} students · ${workingDays} working days`,
    generated_at: analysisStamp(),
    params: echo,
    method: `Absence rate by weekday, and chronic absence at ${CHRONIC_ABSENCE_PERCENT}% of working days or worse.`,
    sample_size: rows.length,
    confidence: rows.length >= 30 ? 'high' : rows.length >= 12 ? 'moderate' : 'low',
    insights: insights.sort((left, right) => right.magnitude - left.magnitude),
    series: [
      {
        key: 'weekday',
        label: 'Absence rate by day of the week',
        chart: 'bar',
        format: 'percent',
        points: weekdayPoints,
      },
      {
        key: 'histogram',
        label: 'How attendance is distributed',
        chart: 'bar',
        format: 'number',
        points: bucketBy(
          rows,
          (row) => row.attendance_percent,
          [
            { label: 'Under 60%', upTo: 60 },
            { label: '60–75%', upTo: 75 },
            { label: '75–85%', upTo: 85 },
            { label: '85–95%', upTo: 95 },
            { label: '95%+', upTo: Number.POSITIVE_INFINITY },
          ],
        ).map((bucket) => ({ label: bucket.label, value: bucket.count })),
      },
    ],
    scatter: null,
    cohort: {
      key: 'chronic',
      title: 'Chronic absence',
      description: `Students who missed ${CHRONIC_ABSENCE_PERCENT}% or more of the month.`,
      columns: [
        { key: 'attendance', label: 'Attendance', format: 'percent' },
        { key: 'absent', label: 'Days absent', format: 'number' },
        { key: 'working', label: 'Of', format: 'number' },
      ],
      members: chronic.slice(0, COHORT_PREVIEW_SIZE).map((row) => ({
        id: String(row.person_id),
        name: row.person_name,
        identifier: row.identifier,
        detail: row.group_label,
        metrics: {
          attendance: row.attendance_percent,
          absent: row.absent_days,
          working: workingDays,
        },
        tone: row.attendance_percent < 60 ? 'danger' : 'warning',
        to: studentLink(row.person_id),
      })),
      total: chronic.length,
    },
    features: {
      schema_version: FEATURE_SCHEMA_VERSION,
      feature_names: ['attendance_percent', 'absent_days', 'late_days', 'leave_days', 'working_days'],
      target: 'attendance_percent',
      rows: rows.map((row) => ({
        id: String(row.person_id),
        label: row.person_name,
        features: {
          attendance_percent: row.attendance_percent,
          absent_days: row.absent_days,
          late_days: row.late_days,
          leave_days: row.leave_days,
          working_days: row.working_days,
        },
      })),
    },
    intelligence: null,
    empty_reason: null,
  };
}

// --- analytics: fees --------------------------------------------------------

function analyseCollectionHealth(params: URLSearchParams): Analysis {
  const classId = params.get('class_id') ? Number(params.get('class_id')) : null;
  const echo: Record<string, string> = classId ? { class_id: String(classId) } : {};

  const roster = students
    .filter((student) => student.status === 'active')
    .filter((student) => (classId ? student.class_id === classId : true));

  const accounts = roster
    .map((student) => ({ student, account: buildAccount(student) }))
    .filter((entry) => entry.account.total_payable > 0);

  if (accounts.length === 0) {
    return emptyAnalysis(
      'collection-health',
      'fees',
      'How arrears age',
      echo,
      'Nobody in scope has been billed anything.',
    );
  }

  const owing = accounts.filter((entry) => entry.account.balance > 0);

  // Ageing on the oldest unpaid instalment — the age of the debt, not of the
  // most recent bill, which is what a collections conversation turns on.
  const aged = owing.map((entry) => {
    const overdue = entry.account.dues.filter((due) => due.balance > 0);
    const oldest = Math.max(0, ...overdue.map((due) => due.days_overdue));

    return { ...entry, days: oldest };
  });

  const buckets = bucketBy(
    aged,
    (entry) => entry.days,
    AGEING_BUCKETS.map((bucket) => ({ label: bucket.label, upTo: bucket.upTo })),
  );

  const totalOutstanding = owing.reduce((sum, entry) => sum + minor(entry.account.balance), 0);
  const totalBilled = accounts.reduce((sum, entry) => sum + minor(entry.account.total_payable), 0);
  const hardCore = aged.filter((entry) => entry.days > 90);

  const insights: Insight[] = [];

  insights.push({
    key: 'rate',
    headline: `${percent(totalBilled - totalOutstanding, totalBilled)}% of what was billed has been collected`,
    detail: `${major(totalOutstanding)} outstanding across ${owing.length} of ${accounts.length} billed students.`,
    tone: totalOutstanding === 0 ? 'success' : 'info',
    evidence: `${accounts.length} students with a structure against them`,
    magnitude: percent(totalOutstanding, totalBilled),
  });

  if (hardCore.length > 0) {
    const value = hardCore.reduce((sum, entry) => sum + minor(entry.account.balance), 0);
    insights.push({
      key: 'hard-core',
      headline: `${major(value)} is more than ninety days old`,
      detail: `${hardCore.length} students, carrying ${percent(value, totalOutstanding)}% of everything outstanding. Debt this old rarely comes in on a reminder — it usually needs a conversation.`,
      tone: 'danger',
      evidence: 'Aged on the oldest unpaid instalment, not the most recent bill',
      magnitude: percent(value, totalOutstanding) + 20,
    });
  }

  // Concentration: is this a few families or a school-wide problem? The two
  // want completely different responses.
  const balances = owing
    .map((entry) => minor(entry.account.balance))
    .sort((left, right) => right - left);
  const topDecile = balances.slice(0, Math.max(1, Math.ceil(balances.length / 10)));
  const topShare = percent(
    topDecile.reduce((sum, value) => sum + value, 0),
    totalOutstanding,
  );

  insights.push({
    key: 'concentration',
    headline: `The largest ${topDecile.length} debts are ${topShare}% of the total`,
    detail:
      topShare > 50
        ? 'Concentrated in a handful of families — a few conversations would move most of this.'
        : 'Spread broadly across the school, which points at the payment schedule rather than at particular families.',
    tone: topShare > 50 ? 'warning' : 'neutral',
    evidence: `Top decile of ${owing.length} outstanding accounts`,
    magnitude: topShare,
  });

  return {
    key: 'collection-health',
    domain: 'fees',
    title: 'How arrears age',
    subtitle: `${owing.length} students owing ${major(totalOutstanding)}`,
    generated_at: analysisStamp(),
    params: echo,
    method: 'Ageing on the oldest unpaid instalment, with concentration measured over the top decile.',
    sample_size: accounts.length,
    confidence: accounts.length >= 30 ? 'high' : accounts.length >= 12 ? 'moderate' : 'low',
    insights: insights.sort((left, right) => right.magnitude - left.magnitude),
    series: [
      {
        key: 'ageing',
        label: 'Outstanding by age of debt',
        chart: 'bar',
        format: 'money',
        points: buckets.map((bucket) => ({
          label: bucket.label,
          value: major(
            bucket.items.reduce((sum, entry) => sum + minor(entry.account.balance), 0),
          ),
        })),
      },
      {
        key: 'ageing-count',
        label: 'Students by age of debt',
        chart: 'bar',
        format: 'number',
        points: buckets.map((bucket) => ({ label: bucket.label, value: bucket.count })),
      },
    ],
    scatter: null,
    cohort: {
      key: 'arrears',
      title: 'Oldest debts first',
      description: 'Where a collections conversation would start.',
      columns: [
        { key: 'days', label: 'Days old', format: 'number' },
        { key: 'balance', label: 'Outstanding', format: 'money' },
        { key: 'billed', label: 'Billed', format: 'money' },
        { key: 'paid', label: 'Paid', format: 'money' },
      ],
      members: [...aged]
        .sort((left, right) => right.days - left.days || right.account.balance - left.account.balance)
        .slice(0, COHORT_PREVIEW_SIZE)
        .map((entry) => ({
          id: String(entry.student.id),
          name: entry.student.full_name,
          identifier: entry.student.admission_no,
          detail: `${entry.student.class_name}${entry.student.section_name ? ` — ${entry.student.section_name}` : ''}`,
          metrics: {
            days: entry.days,
            balance: entry.account.balance,
            billed: entry.account.total_payable,
            paid: entry.account.total_paid,
          },
          tone: entry.days > 90 ? 'danger' : entry.days > 0 ? 'warning' : 'neutral',
          to: studentLink(entry.student.id),
        })),
      total: aged.length,
    },
    features: {
      schema_version: FEATURE_SCHEMA_VERSION,
      feature_names: ['billed', 'paid', 'balance', 'days_overdue', 'instalments_unpaid'],
      target: 'balance',
      rows: accounts.map((entry) => ({
        id: String(entry.student.id),
        label: entry.student.full_name,
        features: {
          billed: entry.account.total_payable,
          paid: entry.account.total_paid,
          balance: entry.account.balance,
          days_overdue: Math.max(
            0,
            ...entry.account.dues.filter((due) => due.balance > 0).map((due) => due.days_overdue),
            0,
          ),
          instalments_unpaid: entry.account.dues.filter((due) => due.balance > 0).length,
        },
      })),
    },
    intelligence: null,
    empty_reason: null,
  };
}

// --- analytics: cohorts -----------------------------------------------------

function analyseCohortComparison(params: URLSearchParams): Analysis {
  const now = new Date();
  const year = Number(params.get('year')) || now.getFullYear();
  const month = Number(params.get('month')) || now.getMonth() + 1;
  const echo = { year: String(year), month: String(month) };

  const latestExam = [...examList].sort((left, right) =>
    right.start_date.localeCompare(left.start_date),
  )[0];
  const marks = latestExam ? performanceByStudent(latestExam) : new Map<number, number>();

  const rows = classes
    .map((klass) => {
      const report = buildMonthlyReport('student', year, month, klass.id, null);
      if (report.working_days === 0 || report.rows.length === 0) return null;

      const roster = students.filter(
        (student) => student.status === 'active' && student.class_id === klass.id,
      );
      const classMarks = roster
        .map((student) => marks.get(student.id))
        .filter((value): value is number => value !== undefined);

      // One pass, one derivation per student. Two reduces each calling
      // `buildAccount` walked every instalment of every student twice for two
      // numbers out of the same object — the in-memory shape of an N+1.
      const accounts = roster.map(buildAccount);
      const billed = accounts.reduce((sum, account) => sum + minor(account.total_payable), 0);
      const owed = accounts.reduce((sum, account) => sum + minor(account.balance), 0);

      const attendance = percent(
        report.rows.reduce((sum, row) => sum + row.present_days + row.late_days, 0),
        report.rows.length * report.working_days,
      );

      return {
        klass,
        students: report.rows.length,
        attendance,
        marks: mean(classMarks),
        collection: billed === 0 ? null : percent(billed - owed, billed),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (rows.length < 2) {
    return emptyAnalysis(
      'cohort-comparison',
      'cohorts',
      'Class against class',
      echo,
      'Fewer than two classes have anything recorded this month — there is nothing to compare.',
    );
  }

  // z-scores put three measures on one scale, which is the only way "is 8B
  // unusual?" has an answer that spans attendance, marks and money.
  const attendanceValues = rows.map((row) => row.attendance);
  const markValues = rows.map((row) => row.marks).filter((value): value is number => value !== null);
  const collectionValues = rows
    .map((row) => row.collection)
    .filter((value): value is number => value !== null);

  const scored = rows.map((row) => ({
    ...row,
    attendanceZ: zScore(row.attendance, attendanceValues),
    marksZ: row.marks === null ? null : zScore(row.marks, markValues),
    collectionZ: row.collection === null ? null : zScore(row.collection, collectionValues),
  }));

  const insights: Insight[] = [];

  // An outlier on any one measure is worth naming; the same class on two is
  // worth acting on.
  const outliers = scored
    .map((row) => {
      const zs = [row.attendanceZ, row.marksZ, row.collectionZ].filter(
        (value): value is number => value !== null,
      );
      const worst = Math.min(...zs, 0);
      return { row, worst, below: zs.filter((value) => value <= -1).length };
    })
    .filter((entry) => entry.below > 0)
    .sort((left, right) => right.below - left.below || left.worst - right.worst);

  if (outliers.length === 0) {
    insights.push({
      key: 'none',
      headline: 'No class stands out from the others',
      detail: 'Every class is within one standard deviation of the school on all three measures.',
      tone: 'success',
      evidence: `${rows.length} classes compared`,
      magnitude: 1,
    });
  } else {
    for (const entry of outliers.slice(0, 3)) {
      insights.push({
        key: `outlier-${entry.row.klass.id}`,
        headline: `${entry.row.klass.name} is below the school on ${entry.below} of three measures`,
        detail: [
          entry.row.attendanceZ !== null && entry.row.attendanceZ <= -1
            ? `attendance ${entry.row.attendance}%`
            : null,
          entry.row.marksZ !== null && entry.row.marksZ <= -1
            ? `marks ${round(entry.row.marks!, 1)}%`
            : null,
          entry.row.collectionZ !== null && entry.row.collectionZ <= -1
            ? `collection ${entry.row.collection}%`
            : null,
        ]
          .filter(Boolean)
          .join(' · '),
        tone: entry.below >= 2 ? 'danger' : 'warning',
        evidence: `${entry.row.students} students · more than one standard deviation below the mean`,
        magnitude: entry.below * 10 + Math.abs(entry.worst),
      });
    }
  }

  return {
    key: 'cohort-comparison',
    domain: 'cohorts',
    title: `Class against class — ${MONTH_LABELS[month - 1]} ${year}`,
    subtitle: 'Attendance, marks and collection on one scale',
    generated_at: analysisStamp(),
    params: echo,
    method:
      'Standard scores (z) per measure across classes. A class more than one standard deviation below the mean is called out.',
    sample_size: rows.length,
    confidence: rows.length >= 12 ? 'moderate' : 'low',
    insights: insights.sort((left, right) => right.magnitude - left.magnitude),
    series: [
      {
        key: 'attendance',
        label: 'Attendance by class',
        chart: 'bar',
        format: 'percent',
        points: rows.map((row) => ({ label: row.klass.name, value: row.attendance })),
      },
      {
        key: 'collection',
        label: 'Collection by class',
        chart: 'bar',
        format: 'percent',
        points: rows
          .filter((row) => row.collection !== null)
          .map((row) => ({ label: row.klass.name, value: row.collection! })),
      },
    ],
    scatter: null,
    cohort: null,
    features: {
      schema_version: FEATURE_SCHEMA_VERSION,
      feature_names: [
        'students',
        'attendance_percent',
        'mean_exam_percent',
        'collection_percent',
        'attendance_z',
        'marks_z',
        'collection_z',
      ],
      target: null,
      rows: scored.map((row) => ({
        id: String(row.klass.id),
        label: row.klass.name,
        features: {
          students: row.students,
          attendance_percent: row.attendance,
          mean_exam_percent: row.marks === null ? -1 : round(row.marks, 2),
          collection_percent: row.collection ?? -1,
          attendance_z: row.attendanceZ ?? 0,
          marks_z: row.marksZ ?? 0,
          collection_z: row.collectionZ ?? 0,
        },
      })),
    },
    intelligence: null,
    empty_reason: null,
  };
}

// --- analytics: dispatch ----------------------------------------------------

const ANALYSIS_BUILDERS: Record<AnalysisKey, (params: URLSearchParams) => Analysis> = {
  'performance-drivers': analysePerformanceDrivers,
  'at-risk-students': analyseAtRiskStudents,
  'attendance-patterns': analyseAttendancePatterns,
  'collection-health': analyseCollectionHealth,
  'cohort-comparison': analyseCohortComparison,
};

const isAnalysisKey = (value: string): value is AnalysisKey => value in ANALYSIS_BUILDERS;

/**
 * The provider registry.
 *
 * Reported exactly the way the communication module reports a channel, and
 * for the same reason: "we could do this but nobody has set it up" is a
 * different message from "this build cannot". Nothing is bound here, so every
 * analysis returns `intelligence: null` and every figure on every screen is
 * the deterministic statistic named beside it.
 */
function intelligenceProviders(): IntelligenceProvider[] {
  return [
    {
      key: 'internal-baseline',
      name: 'Built-in statistics',
      description:
        'Correlation, regression, standard scores and the weighted risk model. Deterministic, and what every figure here currently comes from.',
      status: 'ready',
      detail: 'No configuration needed. This is not a model and makes no predictions.',
      capabilities: [],
      configured_in: null,
    },
    {
      key: 'llm-narrative',
      name: 'Narrative summariser',
      description:
        'Would turn an analysis into prose and suggest what to do next, from the same feature vector.',
      status: 'not_configured',
      detail: 'No provider credentials stored. Binding one fills the intelligence panel; no screen changes.',
      capabilities: ['summarise', 'explain', 'recommend'],
      configured_in: 'settings',
    },
    {
      key: 'forecast-model',
      name: 'Trajectory model',
      description:
        'Would project attendance and collection forward from the same columns this module already emits.',
      status: 'unavailable',
      detail: 'No forecasting integration is compiled into this build.',
      capabilities: ['forecast'],
      configured_in: null,
    },
  ];
}

/** A cohort as a flat file — the list somebody takes into a meeting. */
function cohortFileBody(analysis: Analysis, format: string): string {
  if (!analysis.cohort) return `${analysis.title}\n\nThis analysis produces no cohort.`;

  const { cohort } = analysis;
  const header = ['Name', 'Identifier', 'Detail', ...cohort.columns.map((column) => column.label)];

  const lines = cohort.members.map((member) =>
    [
      member.name,
      member.identifier,
      member.detail ?? '',
      ...cohort.columns.map((column) => String(member.metrics[column.key] ?? '')),
    ].join(','),
  );

  if (format === 'excel') return [header.join(','), ...lines].join('\n');

  return [
    analysis.title,
    analysis.subtitle ?? '',
    `Method: ${analysis.method}`,
    `Sample: ${analysis.sample_size} · confidence: ${analysis.confidence}`,
    '',
    ...analysis.insights.map((insight) => `• ${insight.headline} — ${insight.detail}`),
    '',
    header.join('  '),
    ...lines.map((line) => line.split(',').join('  ')),
  ].join('\n');
}

// --- notifications ----------------------------------------------------------

/**
 * Per-user notifications.
 *
 * Everything here is scoped to the signed-in user and there is no `user_id`
 * parameter on any endpoint — your notifications are yours, and an API that
 * accepted one would be an API somebody eventually passes somebody else's id
 * to. That is also why the module has no permission resource: you do not need
 * a right to read what you were sent.
 *
 * Deliveries are *recorded*, not derived. An email that bounced last Tuesday
 * has to keep saying so after the address is corrected, and "we tried and it
 * failed" is a different thing from "we never tried".
 */
interface StoredNotification {
  id: number;
  user_id: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  action_url: string | null;
  action_label: string | null;
  read_at: string | null;
  created_at: string;
  deliveries: NotificationDelivery[];
}

interface StoredPreferences {
  digest_only: boolean;
  /** `type` → the two opt-in channels. In-app is not a preference. */
  channels: Record<string, { email: boolean; sms: boolean }>;
}

let notificationList: StoredNotification[] = [];
let nextNotificationId = 1;
const preferencesByUser = new Map<number, StoredPreferences>();

const defaultPreferences = (): StoredPreferences => ({
  digest_only: false,
  channels: Object.fromEntries(
    preferenceCatalogue.map((entry) => [entry.type, { email: entry.email, sms: entry.sms }]),
  ),
});

const preferencesFor = (userId: number): StoredPreferences => {
  const existing = preferencesByUser.get(userId);
  if (existing) return existing;

  const created = defaultPreferences();
  preferencesByUser.set(userId, created);
  return created;
};

/**
 * Which copies of a notification went out, and what happened to each.
 *
 * Three things decide it, in order: whether the school has that channel at
 * all, whether this user asked for it, and whether the recipient actually has
 * an address to send to. They are different failures and the record keeps
 * them apart — `skipped` is nobody's fault, `failed` is somebody's.
 */
function notificationDeliveries(
  userId: number,
  type: NotificationType,
  priority: NotificationPriority,
  createdAt: string,
): NotificationDelivery[] {
  const preferences = preferencesFor(userId);
  const wanted = preferences.channels[type] ?? { email: false, sms: false };
  const health = channelHealth();
  const deliveries: NotificationDelivery[] = [];

  for (const channel of ['email', 'sms'] as const) {
    if (!wanted[channel]) continue;

    const status = health.find((entry) => entry.channel === channel);

    if (status?.status !== 'ready') {
      deliveries.push({
        channel,
        status: 'skipped',
        detail: status?.detail ?? `${channel} is not configured.`,
        sent_at: null,
      });
      continue;
    }

    // A daily digest holds everything back except what cannot wait.
    if (preferences.digest_only && priority !== 'urgent') {
      deliveries.push({
        channel,
        status: 'pending',
        detail: 'Held for the daily summary.',
        sent_at: null,
      });
      continue;
    }

    // One in seven fails, so the failed state is reachable without breaking
    // anything — a bad address is the ordinary case, not an exception.
    const failed = (userId + type.length) % 7 === 3 && channel === 'sms';

    deliveries.push({
      channel,
      status: failed ? 'failed' : 'sent',
      detail: failed ? 'The provider rejected the number.' : null,
      sent_at: failed ? null : createdAt,
    });
  }

  return deliveries;
}

const hydrateNotification = (stored: StoredNotification): AppNotification => ({
  id: stored.id,
  type: stored.type,
  priority: stored.priority,
  title: stored.title,
  body: stored.body,
  action_url: stored.action_url,
  action_label: stored.action_label,
  read_at: stored.read_at,
  created_at: stored.created_at,
  deliveries: stored.deliveries,
});

const notificationsOf = (userId: number) =>
  notificationList
    .filter((entry) => entry.user_id === userId)
    .sort((left, right) => right.created_at.localeCompare(left.created_at));

function unreadSummary(userId: number): UnreadSummary {
  const mine = notificationsOf(userId);
  const unread = mine.filter((entry) => entry.read_at === null);

  const byType: Partial<Record<NotificationType, number>> = {};
  for (const entry of unread) byType[entry.type] = (byType[entry.type] ?? 0) + 1;

  return {
    unread: unread.length,
    by_type: byType,
    urgent: unread.filter((entry) => entry.priority === 'urgent').length,
    // The newest few, so opening the bell needs no second request. Unread
    // first — the bell exists for what has not been seen.
    latest: [...mine]
      .sort((left, right) => {
        const leftUnread = left.read_at === null ? 0 : 1;
        const rightUnread = right.read_at === null ? 0 : 1;
        return leftUnread - rightUnread || right.created_at.localeCompare(left.created_at);
      })
      .slice(0, BELL_PREVIEW_SIZE)
      .map(hydrateNotification),
  };
}

/**
 * The preference screen's shape.
 *
 * Availability is read from the communication module's channel health, not
 * checked again here — SMTP credentials and the SMS provider live in
 * settings, and a second opinion about whether email works is a second thing
 * to go wrong.
 */
function hydratePreferences(userId: number): NotificationPreferences {
  const stored = preferencesFor(userId);
  const health = channelHealth();
  const ready = (channel: Channel) =>
    health.find((entry) => entry.channel === channel)?.status === 'ready';

  return {
    digest_only: stored.digest_only,
    items: preferenceCatalogue.map((entry) => ({
      type: entry.type,
      label: entry.label,
      description: entry.description,
      email: stored.channels[entry.type]?.email ?? false,
      sms: stored.channels[entry.type]?.sms ?? false,
      email_available: ready('email'),
      sms_available: ready('sms'),
    })),
  };
}

function listNotifications(userId: number, params: URLSearchParams) {
  const search = (params.get('search') ?? '').trim().toLowerCase();
  const type = params.get('type');
  const priority = params.get('priority');
  const state = params.get('state');

  const rows = notificationsOf(userId)
    .filter((entry) => {
      if (type && entry.type !== type) return false;
      if (priority && entry.priority !== priority) return false;
      if (state === 'unread' && entry.read_at !== null) return false;
      if (state === 'read' && entry.read_at === null) return false;
      if (search && !`${entry.title} ${entry.body}`.toLowerCase().includes(search)) return false;
      return true;
    })
    .map(hydrateNotification);

  /**
   * Newest first unless the caller asks otherwise.
   *
   * `sortRows` defaults to ascending, which is right for a register of people
   * and wrong for a feed — it puts the notification that matters on the last
   * page. `notificationsOf` has already ordered them, so an unsorted request
   * keeps that rather than being flipped.
   */
  const ordered = params.get('sort_by') ? sortRows(rows, params, 'created_at') : rows;

  return paginate(ordered, params, '/notifications');
}

// --- notifications: seeding -------------------------------------------------

/** Resolves a shape's link against the live stores, so nothing points nowhere. */
function notificationLink(link: NotificationShape['link'], userId: number): string | null {
  switch (link.kind) {
    case 'fees':
      return PATHS.feePayments;
    case 'dues':
      return PATHS.feeDues;
    case 'leave':
      return `${PATHS.leaveApplications}?status=pending`;
    case 'payroll':
      return PATHS.payrollRuns;
    case 'notices': {
      const notice = noticeList.find((entry) => entry.status === 'published');
      return notice ? toPath(PATHS.communicationNoticeDetail, { id: notice.id }) : null;
    }
    case 'homework': {
      const homework = homeworkList.find((entry) => entry.status === 'published');
      return homework ? toPath(PATHS.homeworkDetail, { id: homework.id }) : PATHS.homework;
    }
    case 'exam': {
      const exam = examList[0];
      return exam ? toPath(PATHS.examDetail, { id: exam.id }) : null;
    }
    case 'attendance':
      return PATHS.attendanceStudents;
    case 'library':
      return PATHS.libraryLoans;
    case 'transport':
      return PATHS.transportVehicles;
    case 'profile':
      return PATHS.profile;
    default:
      // A deliberate no-link shape. `userId` is unused here and that is fine —
      // some notifications are simply statements.
      void userId;
      return null;
  }
}

/** Which audiences a role belongs to, so a head gets both their sets. */
function notificationAudiences(roles: string[]): NotificationAudience[] {
  const audiences: NotificationAudience[] = ['everybody'];

  if (roles.some((role) => [ROLES.superAdmin, ROLES.schoolAdmin, ROLES.accountant, ROLES.receptionist, ROLES.librarian, ROLES.staff].includes(role as never))) {
    audiences.push('admin');
  }
  if (roles.some((role) => [ROLES.principal, ROLES.vicePrincipal].includes(role as never))) {
    audiences.push('principal', 'admin');
  }
  if (roles.includes(ROLES.teacher)) audiences.push('teacher');
  if (roles.includes(ROLES.student)) audiences.push('student');
  if (roles.includes(ROLES.parent)) audiences.push('parent');

  return [...new Set(audiences)];
}

function seedNotifications(): void {
  const now = Date.now();

  for (const account of accounts) {
    const audiences = notificationAudiences(account.user.roles);
    const shapes = notificationShapes.filter((shape) => audiences.includes(shape.audience));

    for (const shape of shapes) {
      const createdAt = new Date(now - shape.hoursAgo * 3_600_000).toISOString();
      const url = notificationLink(shape.link, account.user.id);

      notificationList.push({
        id: nextNotificationId++,
        user_id: account.user.id,
        type: shape.type,
        priority: shape.priority,
        title: shape.title,
        body: shape.body,
        action_url: url,
        // An action label without somewhere to go is a button to nowhere.
        action_label: url ? shape.action_label : null,
        read_at: shape.read
          ? new Date(now - (shape.hoursAgo - 1) * 3_600_000).toISOString()
          : null,
        created_at: createdAt,
        deliveries: notificationDeliveries(account.user.id, shape.type, shape.priority, createdAt),
      });
    }
  }
}

seedNotifications();

// --- dashboard --------------------------------------------------------------

/**
 * The landing screen, assembled per role.
 *
 * Like the reporting layer, it computes nothing of its own: attendance comes
 * from `buildSheet` and `buildMonthlyReport`, fee balances from
 * `buildAccount`, charts from the report builders themselves. What it adds is
 * *selection* — which four figures matter to a principal at nine in the
 * morning, and which of them are worth interrupting somebody about.
 *
 * Every card is permission-filtered, which is why the four office roles share
 * one `admin` view: an accountant's version of it is a finance dashboard and a
 * librarian's is a library one, without a separate view per job title.
 */

const dashboardCan = (permission: string): boolean =>
  currentUser !== null &&
  (currentUser.roles.includes(ROLES.superAdmin) || currentUser.permissions.includes(permission));

const dashboardStat = (
  key: string,
  icon: StatIcon,
  label: string,
  value: number,
  format: DashboardStat['format'],
  extra: Partial<Pick<DashboardStat, 'tone' | 'hint' | 'to'>> = {},
): DashboardStat => ({
  key,
  icon,
  label,
  value,
  format,
  tone: extra.tone,
  hint: extra.hint,
  to: extra.to ?? null,
});

const dashboardAlert = (
  key: string,
  tone: DashboardAlert['tone'],
  title: string,
  detail: string,
  to: string | null,
  actionLabel: string | null,
  urgency: number,
): DashboardAlert => ({ key, tone, title, detail, to, action_label: actionLabel, urgency });

const dashboardItem = (
  id: string,
  title: string,
  detail: string | null,
  meta: string | null,
  tone: DashboardListItem['tone'] = null,
  to: string | null = null,
): DashboardListItem => ({ id, title, detail, meta, tone, to });

/** A report's chart, lifted onto the dashboard rather than recalculated. */
function panelFrom(
  key: string,
  title: string,
  description: string | null,
  to: string | null,
  result: ReportResult,
): DashboardPanel | null {
  const series = result.series[0];
  if (!series || series.points.length === 0) return null;

  return { key, title, description, to, series };
}

const dashboardMoney = (amount: number) => formatCurrencyIsh(amount);

/** Terse rupees for a list's right-hand column. */
function formatCurrencyIsh(amount: number): string {
  if (Math.abs(amount) >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1_000) return `₹${Math.round(amount / 1_000)}k`;
  return `₹${Math.round(amount)}`;
}

/**
 * The student a student or parent account is about.
 *
 * A real backend has a foreign key here. The seeded sign-in accounts are not
 * on the roster, so the mock links them by position — deterministic, stable
 * across reloads, and documented in `src/mocks/README.md`. Replacing it means
 * reading the real relation; nothing on the frontend changes.
 */
function dashboardSubject(view: DashboardView): DashboardSubject | null {
  if (view !== 'student' && view !== 'parent') return null;

  const roster = students.filter((student) => student.status === 'active');
  const byEmail = roster.find((student) => student.email === currentUser?.email);
  const student = byEmail ?? roster.find((entry) => entry.guardians.length > 0) ?? roster[0];
  if (!student) return null;

  return {
    student_id: student.id,
    student_name: student.full_name,
    admission_no: student.admission_no,
    photo_url: student.photo_url,
    class_name: student.class_name,
    section_name: student.section_name,
    relation: view === 'parent' ? (student.gender === 'male' ? 'son' : 'daughter') : null,
  };
}

/** Likewise for a teacher account, so the teaching view has a timetable to show. */
function dashboardTeacher(): TeacherDetail | null {
  const roster = teachers.filter((teacher) => teacher.status === 'active');
  return roster.find((teacher) => teacher.email === currentUser?.email) ?? roster[0] ?? null;
}

/** Today as a timetable weekday, or null on the weekly off. */
function todayWeekday(): Weekday | null {
  const day = new Date(`${TODAY_DATE()}T00:00:00Z`).getUTCDay();
  return day === 0 ? null : (day as Weekday);
}

/** Attendance for one student this month, read from the attendance module. */
function studentAttendancePercent(student: StudentDetail): number | null {
  const now = new Date();
  const report = buildMonthlyReport(
    'student',
    now.getFullYear(),
    now.getMonth() + 1,
    student.class_id,
    null,
  );

  return report.rows.find((row) => row.person_id === student.id)?.attendance_percent ?? null;
}

// --- dashboard: the shared activity feed ------------------------------------

/**
 * What has happened lately, drawn from the records the modules already write.
 *
 * There is no activity table. One would be a second place for the truth to
 * live, and it would fall silent the first time somebody wrote to a module
 * without remembering to log it — which is exactly how audit trails rot.
 */
function dashboardActivities(scope: { studentId?: number; teacherId?: number } = {}): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const forStudent = scope.studentId;
  const forTeacher = scope.teacherId;

  /**
   * A feed about one person carries only what happened to them.
   *
   * Gated on the scope rather than on permissions, because the two answer
   * different questions: a teacher may read the student register and still
   * have no business seeing every admission in their own feed. Letting
   * `students.read` decide put the whole register there.
   */
  const isPersonal = forStudent !== undefined || forTeacher !== undefined;

  if (dashboardCan('fees.read')) {
    for (const payment of payments.filter((entry) => !entry.is_cancelled)) {
      if (forStudent && payment.student_id !== forStudent) continue;

      entries.push({
        id: `payment-${payment.id}`,
        kind: 'payment',
        title: `${dashboardMoney(payment.amount)} collected from ${payment.student_name}`,
        detail: `Receipt ${payment.receipt_no} · ${payment.class_name}`,
        at: payment.paid_at,
        to: toPath(PATHS.feeReceipt, { id: payment.id }),
        tone: 'success',
      });
    }
  }

  if (dashboardCan('leave.read')) {
    for (const application of leaveApplications) {
      if (forStudent && !(application.applicant_type === 'student' && application.applicant_id === forStudent)) {
        continue;
      }
      if (forTeacher && !(application.applicant_type === 'teacher' && application.applicant_id === forTeacher)) {
        continue;
      }

      const person = leaveApplicant(application.applicant_type, application.applicant_id);
      const decided = application.reviewed_at !== null;

      entries.push({
        id: `leave-${application.id}`,
        kind: 'leave',
        title: decided
          ? `Leave ${application.status} for ${person?.person_name ?? 'a member'}`
          : `${person?.person_name ?? 'Somebody'} applied for leave`,
        detail: `${application.from_date} to ${application.to_date}`,
        at: application.reviewed_at ?? application.applied_at,
        to: toPath(PATHS.leaveApplicationDetail, { id: application.id }),
        tone: application.status === 'rejected' ? 'danger' : decided ? 'success' : 'warning',
      });
    }
  }

  if (dashboardCan('notices.read')) {
    for (const notice of noticeList.filter((entry) => entry.published_at !== null)) {
      entries.push({
        id: `notice-${notice.id}`,
        kind: 'notice',
        title: notice.title,
        detail: `Published by ${notice.published_by ?? 'the office'}`,
        at: notice.published_at!,
        to: toPath(PATHS.communicationNoticeDetail, { id: notice.id }),
        tone: notice.priority === 'urgent' ? 'danger' : 'info',
      });
    }
  }

  if (dashboardCan('homework.read')) {
    for (const homework of homeworkList.filter((entry) => entry.status === 'published')) {
      if (forTeacher && homework.teacher_id !== forTeacher) continue;
      if (forStudent) {
        const student = students.find((entry) => entry.id === forStudent);
        if (!student || homework.class_id !== student.class_id) continue;
      }

      entries.push({
        id: `homework-${homework.id}`,
        kind: 'homework',
        title: `${homework.title} set for ${homework.class_name}`,
        detail: `${homework.subject_name} · due ${homework.due_date}`,
        at: `${homework.assigned_date}T09:00:00.000Z`,
        to: toPath(PATHS.homeworkDetail, { id: homework.id }),
        tone: homework.is_overdue ? 'warning' : null,
      });
    }
  }

  if (dashboardCan('students.read') && !isPersonal) {
    for (const student of students) {
      entries.push({
        id: `admission-${student.id}`,
        kind: 'admission',
        title: `${student.full_name} admitted to ${student.class_name}`,
        detail: student.admission_no,
        at: `${student.admission_date}T10:00:00.000Z`,
        to: toPath(PATHS.studentProfile, { id: student.id }),
        tone: 'info',
      });
    }
  }

  if (dashboardCan('payroll.read') && !isPersonal) {
    for (const run of runList.filter((entry) => entry.processed_at !== null)) {
      entries.push({
        id: `payroll-${run.id}`,
        kind: 'payroll',
        title: `Payroll for ${run.month} ${run.paid_at ? 'paid' : run.approved_at ? 'approved' : 'processed'}`,
        detail: `${(payslipsByRun.get(run.id) ?? []).length} payslips`,
        at: run.paid_at ?? run.approved_at ?? run.processed_at!,
        to: toPath(PATHS.payrollRunDetail, { id: run.id }),
        tone: run.paid_at ? 'success' : 'info',
      });
    }
  }

  if (dashboardCan('library.read')) {
    for (const loan of loanList.filter((entry) => entry.returned_on === null)) {
      if (forStudent && !(loan.member_type === 'student' && loan.member_id === forStudent)) continue;
      if (forTeacher && !(loan.member_type === 'teacher' && loan.member_id === forTeacher)) continue;

      const copy = copyList.find((entry) => entry.id === loan.copy_id);
      const book = copy ? bookList.find((entry) => entry.id === copy.book_id) : undefined;

      entries.push({
        id: `loan-${loan.id}`,
        kind: 'library',
        title: `${book?.title ?? 'A book'} issued`,
        detail: `Due back ${loan.due_on}`,
        at: `${loan.issued_on}T11:00:00.000Z`,
        to: book ? toPath(PATHS.libraryBookDetail, { id: book.id }) : null,
        tone: loan.due_on < TODAY_DATE() ? 'danger' : null,
      });
    }
  }

  return entries
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, ACTIVITY_FEED_SIZE);
}

// --- dashboard: the five views ----------------------------------------------

function adminDashboard(): Omit<DashboardData, 'view' | 'available_views' | 'generated_at' | 'greeting' | 'subject'> {
  const roster = students.filter((student) => student.status === 'active');
  const month = TODAY_DATE().slice(0, 7);
  const year = Number(TODAY_DATE().slice(0, 4));

  const stats: DashboardStat[] = [];
  const alerts: DashboardAlert[] = [];
  const panels: DashboardPanel[] = [];
  const lists: DashboardList[] = [];

  if (dashboardCan('students.read')) {
    stats.push(
      dashboardStat('students', 'students', 'Students on the roll', roster.length, 'number', {
        to: PATHS.students,
        hint: `${classes.length} classes`,
      }),
    );
  }

  if (dashboardCan('teachers.read')) {
    const active = teachers.filter((teacher) => teacher.status === 'active').length;
    stats.push(
      dashboardStat('teachers', 'teachers', 'Teaching staff', active, 'number', {
        to: PATHS.teachers,
        hint: `${staff.filter((member) => member.status === 'active').length} non-teaching`,
      }),
    );
  }

  if (dashboardCan('fees.read')) {
    const collected = payments
      .filter((payment) => !payment.is_cancelled && payment.paid_at.startsWith(month))
      .reduce((sum, payment) => sum + minor(payment.amount), 0);

    // Derived once and read twice — the outstanding total and the overdue
    // count previously walked every student's instalments separately.
    const accounts = roster.map(buildAccount);
    const outstanding = accounts.reduce((sum, account) => sum + minor(account.balance), 0);

    stats.push(
      dashboardStat('collected', 'money', 'Collected this month', major(collected), 'money', {
        to: PATHS.feePayments,
        tone: 'success',
      }),
      dashboardStat('outstanding', 'outstanding', 'Outstanding', major(outstanding), 'money', {
        to: PATHS.feeDues,
        tone: outstanding > 0 ? 'warning' : 'neutral',
      }),
    );

    const overdue = accounts.filter((account) =>
      account.dues.some((due) => due.status === 'overdue'),
    ).length;

    if (overdue > 0) {
      alerts.push(
        dashboardAlert(
          'fees-overdue',
          'warning',
          `${overdue} students are past a due date`,
          'Their instalments are accruing a late fine until they are settled.',
          PATHS.feeDues,
          'See the dues',
          overdue,
        ),
      );
    }

    const collection = panelFrom(
      'collection',
      'Collection this year',
      'Billed against collected, month by month',
      `${toPath(PATHS.reportFamily, { family: 'fees' })}?report=fee-collection`,
      reportFeeCollection(new URLSearchParams({ year: String(year) })),
    );
    if (collection) panels.push(collection);

    const recent = payments
      .filter((payment) => !payment.is_cancelled)
      .sort((left, right) => right.paid_at.localeCompare(left.paid_at))
      .slice(0, LIST_PREVIEW_SIZE);

    lists.push({
      key: 'recent-payments',
      title: 'Latest receipts',
      description: 'What has come in at the desk',
      to: PATHS.feePayments,
      empty: 'Nothing has been collected yet.',
      items: recent.map((payment) =>
        dashboardItem(
          `payment-${payment.id}`,
          payment.student_name,
          `${payment.class_name} · ${payment.receipt_no}`,
          dashboardMoney(payment.amount),
          'success',
          toPath(PATHS.feeReceipt, { id: payment.id }),
        ),
      ),
    });
  }

  if (dashboardCan('students.read')) {
    const strength = panelFrom(
      'strength',
      'Strength by class',
      'Boys and girls on the roll today',
      `${toPath(PATHS.reportFamily, { family: 'students' })}?report=student-strength`,
      reportStudentStrength(),
    );
    if (strength) panels.push(strength);
  }

  if (dashboardCan('leave.read')) {
    const summary = buildLeaveSummary();

    if (summary.overdue_decisions > 0) {
      alerts.push(
        dashboardAlert(
          'leave-overdue',
          'danger',
          `${summary.overdue_decisions} leave applications have already started`,
          'Nobody has decided, and the first day has passed.',
          `${PATHS.leaveApplications}?status=pending`,
          'Decide them',
          100 + summary.overdue_decisions,
        ),
      );
    }
  }

  if (dashboardCan('payroll.read')) {
    const awaiting = runList.filter((run) => run.processed_at !== null && run.approved_at === null);

    if (awaiting.length > 0) {
      alerts.push(
        dashboardAlert(
          'payroll-awaiting',
          'warning',
          `Payroll for ${awaiting.map((run) => run.month).join(', ')} is costed but unsigned`,
          'Nobody can be paid until it is approved.',
          PATHS.payrollRuns,
          'Open payroll',
          80,
        ),
      );
    }
  }

  if (dashboardCan('transport.read')) {
    // The transport module's own hydration decides compliance; asking it is
    // the only way this cannot disagree with the fleet screen.
    const grounded = vehicleList.filter(
      (vehicle) => hydrateVehicle(vehicle).compliance === 'expired',
    ).length;

    if (grounded > 0) {
      alerts.push(
        dashboardAlert(
          'transport-grounded',
          'danger',
          `${grounded} buses have a lapsed paper`,
          'A vehicle without valid papers should not be on the road.',
          PATHS.transportVehicles,
          'See the fleet',
          90 + grounded,
        ),
      );
    }
  }

  return {
    stats,
    alerts: alerts.sort((left, right) => right.urgency - left.urgency),
    panels,
    lists,
    activities: dashboardActivities(),
  };
}

function principalDashboard(): Omit<DashboardData, 'view' | 'available_views' | 'generated_at' | 'greeting' | 'subject'> {
  const today = TODAY_DATE();
  const year = Number(today.slice(0, 4));
  const sheet = buildSheet('student', today, null, null);

  const stats: DashboardStat[] = [];
  const alerts: DashboardAlert[] = [];
  const panels: DashboardPanel[] = [];
  const lists: DashboardList[] = [];

  const marked = sheet.summary.total - sheet.summary.unmarked;
  const attending = sheet.summary.present + sheet.summary.late;

  stats.push(
    dashboardStat(
      'attendance-today',
      'attendance',
      sheet.is_locked ? 'Attendance today' : 'Attendance so far today',
      marked === 0 ? 0 : Math.round((attending / marked) * 1000) / 10,
      'percent',
      {
        to: PATHS.attendanceStudents,
        tone:
          sheet.is_locked
            ? 'neutral'
            : marked === 0
              ? 'warning'
              : attending / marked < ATTENDANCE_CONCERN_PERCENT / 100
                ? 'danger'
                : 'success',
        hint: sheet.is_locked
          ? (sheet.lock_reason ?? 'Not a working day')
          : `${marked} of ${sheet.summary.total} marked`,
      },
    ),
    dashboardStat(
      'students',
      'students',
      'Students on the roll',
      students.filter((student) => student.status === 'active').length,
      'number',
      { to: PATHS.students },
    ),
  );

  const away = buildAwayToday(null);
  stats.push(
    dashboardStat('away', 'leave', 'Away on leave today', away.length, 'number', {
      to: `${toPath(PATHS.reportFamily, { family: 'attendance' })}`,
      tone: away.length > 0 ? 'info' : 'neutral',
      hint: `${away.filter((person) => person.applicant_type !== 'student').length} of them staff`,
    }),
  );

  const latestExam = [...examList].sort((left, right) =>
    right.start_date.localeCompare(left.start_date),
  )[0];

  if (latestExam) {
    const spread = reportExamGradeSpread(new URLSearchParams({ exam_id: String(latestExam.id) }));
    const passRate = spread.stats.find((stat) => stat.label === 'Pass rate');

    if (passRate) {
      stats.push(
        dashboardStat('pass-rate', 'exam', `Pass rate · ${latestExam.name}`, passRate.value, 'percent', {
          to: toPath(PATHS.examResults, { id: latestExam.id }),
          tone: passRate.value < 60 ? 'danger' : 'success',
        }),
      );
    }

    const gradePanel = panelFrom(
      'grades',
      `Grades · ${latestExam.name}`,
      'How the cohort came out',
      `${toPath(PATHS.reportFamily, { family: 'exams' })}?report=exam-grade-spread&exam_id=${latestExam.id}`,
      spread,
    );
    if (gradePanel) panels.push(gradePanel);
  }

  const trend = panelFrom(
    'attendance-trend',
    'Attendance this year',
    'Month by month across the school',
    `${toPath(PATHS.reportFamily, { family: 'attendance' })}?report=attendance-trend`,
    reportAttendanceTrend(new URLSearchParams({ year: String(year) })),
  );
  if (trend) panels.push(trend);

  const summary = buildLeaveSummary();
  if (summary.pending > 0) {
    alerts.push(
      dashboardAlert(
        'leave-pending',
        summary.overdue_decisions > 0 ? 'danger' : 'warning',
        `${summary.pending} leave applications await a decision`,
        summary.overdue_decisions > 0
          ? `${summary.overdue_decisions} of them have already begun.`
          : 'None of them has started yet, so there is still time.',
        `${PATHS.leaveApplications}?status=pending`,
        'Decide them',
        100 + summary.overdue_decisions,
      ),
    );
  }

  const awaitingPayroll = runList.filter(
    (run) => run.processed_at !== null && run.approved_at === null,
  );
  if (awaitingPayroll.length > 0 && dashboardCan('payroll.approve')) {
    alerts.push(
      dashboardAlert(
        'payroll-sign',
        'warning',
        `Payroll for ${awaitingPayroll.map((run) => run.month).join(', ')} needs your signature`,
        'Processing is done; nobody can be paid until it is approved.',
        PATHS.payrollRuns,
        'Review it',
        95,
      ),
    );
  }

  const pendingNotices = noticeList.filter((notice) => notice.status === 'pending_approval');
  if (pendingNotices.length > 0) {
    alerts.push(
      dashboardAlert(
        'notices-pending',
        'info',
        `${pendingNotices.length} notices are waiting to go on the board`,
        'A board anybody can post to unreviewed is a board nobody trusts.',
        PATHS.communicationNotices,
        'Review them',
        50,
      ),
    );
  }

  if (!sheet.is_locked && sheet.summary.unmarked > 0) {
    alerts.push(
      dashboardAlert(
        'attendance-unmarked',
        'warning',
        `${sheet.summary.unmarked} students are unmarked today`,
        'Absent and not-yet-marked are different things, and only one needs chasing.',
        PATHS.attendanceStudents,
        'Open the sheet',
        70,
      ),
    );
  }

  lists.push({
    key: 'away-today',
    title: 'Away today',
    description: 'On approved leave right now',
    to: `${toPath(PATHS.reportFamily, { family: 'attendance' })}`,
    empty: 'Everybody is in.',
    items: away
      .slice(0, LIST_PREVIEW_SIZE)
      .map((person) =>
        dashboardItem(
          `away-${person.application_id}`,
          person.applicant_name,
          `${person.leave_type_name}${person.applicant_detail ? ` · ${person.applicant_detail}` : ''}`,
          person.days_remaining === 1 ? 'back tomorrow' : `${person.days_remaining} days`,
          'info',
          toPath(PATHS.leaveApplicationDetail, { id: person.application_id }),
        ),
      ),
  });

  lists.push({
    key: 'notices',
    title: 'The board',
    description: 'What is up, and what is waiting',
    to: PATHS.communicationNotices,
    empty: 'Nothing on the board.',
    items: noticeList
      .filter((notice) => notice.status === 'published' || notice.status === 'pending_approval')
      .sort((left, right) => right.publish_at.localeCompare(left.publish_at))
      .slice(0, LIST_PREVIEW_SIZE)
      .map((notice) =>
        dashboardItem(
          `notice-${notice.id}`,
          notice.title,
          notice.category,
          notice.status === 'pending_approval' ? 'awaiting' : 'live',
          notice.status === 'pending_approval' ? 'warning' : 'success',
          toPath(PATHS.communicationNoticeDetail, { id: notice.id }),
        ),
      ),
  });

  return {
    stats,
    alerts: alerts.sort((left, right) => right.urgency - left.urgency),
    panels,
    lists,
    activities: dashboardActivities(),
  };
}

function teacherDashboard(): Omit<DashboardData, 'view' | 'available_views' | 'generated_at' | 'greeting' | 'subject'> {
  const teacher = dashboardTeacher();
  const today = TODAY_DATE();
  const weekday = todayWeekday();

  const stats: DashboardStat[] = [];
  const alerts: DashboardAlert[] = [];
  const panels: DashboardPanel[] = [];
  const lists: DashboardList[] = [];

  if (!teacher) {
    return { stats, alerts, panels, lists, activities: dashboardActivities() };
  }

  const mySlots = timetableSlots.filter((slot) => slot.teacher_id === teacher.id);
  const todaySlots = weekday === null ? [] : mySlots.filter((slot) => slot.day_of_week === weekday);
  const myHomework = homeworkList.filter((entry) => entry.teacher_id === teacher.id);
  const toMark = myHomework.reduce(
    (sum, entry) => sum + (entry.submitted_count - entry.graded_count),
    0,
  );

  stats.push(
    dashboardStat('periods-today', 'timetable', 'Periods today', todaySlots.length, 'number', {
      to: PATHS.timetableTeachers,
      hint: weekday === null ? 'Weekly off' : `${mySlots.length} a week`,
    }),
    dashboardStat(
      'classes',
      'students',
      'Classes taught',
      new Set(mySlots.map((slot) => slot.section_id)).size,
      'number',
      { to: PATHS.timetableTeachers, hint: `${teacher.subjects.length} subjects` },
    ),
    dashboardStat('to-mark', 'homework', 'Submissions to mark', toMark, 'number', {
      to: PATHS.homework,
      tone: toMark > 0 ? 'warning' : 'success',
    }),
  );

  const balance = buildLeaveBalance('teacher', teacher.id);
  if (balance) {
    stats.push(
      dashboardStat('leave-left', 'leave', 'Leave left', balance.total_available, 'number', {
        to: PATHS.leaveBalances,
        hint: `of ${balance.total_quota} days`,
        tone: balance.total_available <= 0 ? 'danger' : 'neutral',
      }),
    );
  }

  // The load a teacher actually feels is per day, not per week.
  const perDay = WEEKDAYS.map((day) => ({
    label: WEEKDAY_LABELS[day].slice(0, 3),
    value: mySlots.filter((slot) => slot.day_of_week === day).length,
  }));

  if (perDay.some((point) => point.value > 0)) {
    panels.push({
      key: 'my-week',
      title: 'Your week',
      description: 'Periods per day',
      to: PATHS.timetableTeachers,
      series: { key: 'week', label: 'Periods', chart: 'bar', format: 'number', points: perDay },
    });
  }

  // A class teacher is the one who owes the register. The assignment lives on
  // the teacher record, which is the single place the academics module keeps it.
  const myClass = teacher.class_assignments.find((entry) => entry.is_class_teacher);

  if (myClass) {
    const sheet = buildSheet('student', today, myClass.class_id, myClass.section_id);

    if (!sheet.is_locked && sheet.summary.unmarked > 0) {
      alerts.push(
        dashboardAlert(
          'my-attendance',
          'danger',
          `${myClass.class_name}${myClass.section_name ? ` — ${myClass.section_name}` : ''} is not marked`,
          `${sheet.summary.unmarked} of ${sheet.summary.total} students still have no mark today.`,
          PATHS.attendanceStudents,
          'Mark it',
          100,
        ),
      );
    }
  }

  const overdueMarking = myHomework.filter(
    (entry) => entry.is_overdue && entry.submitted_count > entry.graded_count,
  );
  if (overdueMarking.length > 0) {
    alerts.push(
      dashboardAlert(
        'homework-marking',
        'warning',
        `${overdueMarking.length} homework briefs are past due with work unmarked`,
        'Feedback a fortnight late is feedback nobody acts on.',
        PATHS.homework,
        'Open homework',
        60,
      ),
    );
  }

  lists.push({
    key: 'today-timetable',
    title: weekday === null ? 'Your Monday' : 'Today',
    description: weekday === null ? 'Sunday is the weekly off' : WEEKDAY_LABELS[weekday],
    to: PATHS.timetableTeachers,
    empty: weekday === null ? 'No lessons — it is the weekly off.' : 'No lessons today.',
    items: (weekday === null ? mySlots.filter((slot) => slot.day_of_week === 1) : todaySlots)
      .map(hydrateSlot)
      .filter((slot): slot is TimetableSlot => slot !== null)
      .sort((left, right) => left.start_time.localeCompare(right.start_time))
      .map((slot) =>
        dashboardItem(
          `slot-${slot.id}`,
          `${slot.subject_name} · ${slot.class_name} ${slot.section_name}`,
          slot.room_name ? `Room ${slot.room_name}` : 'No room assigned',
          slot.start_time,
          null,
          PATHS.timetableTeachers,
        ),
      ),
  });

  lists.push({
    key: 'my-homework',
    title: 'Your homework',
    description: 'What is out, and how much has come back',
    to: PATHS.homework,
    empty: 'You have not set any homework.',
    items: myHomework
      .filter((entry) => entry.status === 'published')
      .sort((left, right) => left.due_date.localeCompare(right.due_date))
      .slice(0, LIST_PREVIEW_SIZE)
      .map((entry) =>
        dashboardItem(
          `homework-${entry.id}`,
          entry.title,
          `${entry.class_name} · due ${entry.due_date}`,
          `${entry.submitted_count}/${entry.students_count}`,
          entry.is_overdue ? 'warning' : null,
          toPath(PATHS.homeworkDetail, { id: entry.id }),
        ),
      ),
  });

  return {
    stats,
    alerts: alerts.sort((left, right) => right.urgency - left.urgency),
    panels,
    lists,
    activities: dashboardActivities({ teacherId: teacher.id }),
  };
}

/**
 * The student and parent views.
 *
 * One builder, because they are one dashboard about one child seen from two
 * sides. What differs is the framing — a parent is shown what they can settle
 * and a student what they must hand in — not the figures underneath, which
 * would be two answers to "how is she doing".
 */
function studentDashboard(
  subject: DashboardSubject,
  asParent: boolean,
): Omit<DashboardData, 'view' | 'available_views' | 'generated_at' | 'greeting' | 'subject'> {
  const student = students.find((entry) => entry.id === subject.student_id);
  const today = TODAY_DATE();
  const weekday = todayWeekday();

  const stats: DashboardStat[] = [];
  const alerts: DashboardAlert[] = [];
  const panels: DashboardPanel[] = [];
  const lists: DashboardList[] = [];

  if (!student) {
    return { stats, alerts, panels, lists, activities: [] };
  }

  const attendance = studentAttendancePercent(student);
  const account = buildAccount(student);
  const homework = homeworkList.filter(
    (entry) => entry.status === 'published' && entry.class_id === student.class_id,
  );
  const pending = homework.filter((entry) => {
    const submission = submissionsByHomework.get(submissionKey(entry.id, student.id));
    return submission === undefined;
  });
  const loans = loanList.filter(
    (entry) => entry.member_type === 'student' && entry.member_id === student.id && entry.returned_on === null,
  );

  if (attendance !== null) {
    stats.push(
      dashboardStat('attendance', 'attendance', 'Attendance this month', attendance, 'percent', {
        tone: attendance < ATTENDANCE_CONCERN_PERCENT ? 'danger' : 'success',
        hint: asParent ? `${subject.student_name.split(' ')[0]}’s record` : undefined,
      }),
    );
  }

  stats.push(
    dashboardStat('balance', 'outstanding', asParent ? 'Fees to pay' : 'Fees outstanding', account.balance, 'money', {
      tone: account.balance > 0 ? 'warning' : 'success',
      hint: account.balance > 0 ? `of ${dashboardMoney(account.total_payable)} billed` : 'All settled',
    }),
    dashboardStat('homework', 'homework', asParent ? 'Homework not handed in' : 'Homework to hand in', pending.length, 'number', {
      to: PATHS.homework,
      tone: pending.length > 0 ? 'warning' : 'success',
    }),
    dashboardStat('loans', 'library', 'Books on loan', loans.length, 'number', {
      tone: loans.some((loan) => loan.due_on < today) ? 'danger' : 'neutral',
      hint: loans.some((loan) => loan.due_on < today) ? 'one is overdue' : undefined,
    }),
  );

  const overdueDues = account.dues.filter((due) => due.status === 'overdue');
  if (overdueDues.length > 0) {
    alerts.push(
      dashboardAlert(
        'fees-overdue',
        'danger',
        `${overdueDues.length} fee instalments are past their date`,
        `${dashboardMoney(overdueDues.reduce((sum, due) => sum + due.balance, 0))} outstanding, and a late fine is accruing.`,
        null,
        null,
        100,
      ),
    );
  }

  if (attendance !== null && attendance < ATTENDANCE_CONCERN_PERCENT) {
    alerts.push(
      dashboardAlert(
        'attendance-low',
        'warning',
        `Attendance is ${attendance}% this month`,
        asParent
          ? 'Below the level the school expects. Worth a word with the class teacher.'
          : 'Below what the school expects — it counts towards your examination eligibility.',
        null,
        null,
        90,
      ),
    );
  }

  const overdueLoans = loans.filter((loan) => loan.due_on < today);
  if (overdueLoans.length > 0) {
    alerts.push(
      dashboardAlert(
        'library-overdue',
        'warning',
        `${overdueLoans.length} library books are overdue`,
        'A fine accrues daily until they come back.',
        null,
        null,
        70,
      ),
    );
  }

  // Attendance month by month, for this student's class — the same builder the
  // attendance module's own report uses.
  const year = Number(today.slice(0, 4));
  const points: ReportPoint[] = [];

  for (const { month, label } of reportMonths(year)) {
    const report = buildMonthlyReport('student', year, month, student.class_id, null);
    const row = report.rows.find((entry) => entry.person_id === student.id);
    if (!row || report.working_days === 0) continue;
    points.push({ label, value: row.attendance_percent });
  }

  if (points.length > 0) {
    panels.push({
      key: 'attendance-trend',
      title: asParent ? `${subject.student_name.split(' ')[0]}’s attendance` : 'Your attendance',
      description: 'Month by month this year',
      to: null,
      series: { key: 'attendance', label: 'Attendance', chart: 'line', format: 'percent', points },
    });
  }

  const timetableRows = (
    weekday === null
      ? timetableSlots.filter((slot) => slot.day_of_week === 1)
      : timetableSlots.filter((slot) => slot.day_of_week === weekday)
  ).filter((slot) => slot.class_id === student.class_id && slot.section_id === student.section_id);

  lists.push({
    key: 'timetable',
    title: weekday === null ? 'Monday' : 'Today',
    description: weekday === null ? 'Sunday is the weekly off' : WEEKDAY_LABELS[weekday],
    to: PATHS.timetableClasses,
    empty: weekday === null ? 'No lessons — it is the weekly off.' : 'No lessons today.',
    items: timetableRows
      .map(hydrateSlot)
      .filter((slot): slot is TimetableSlot => slot !== null)
      .sort((left, right) => left.start_time.localeCompare(right.start_time))
      .map((slot) =>
        dashboardItem(
          `slot-${slot.id}`,
          slot.subject_name,
          `${slot.teacher_name}${slot.room_name ? ` · room ${slot.room_name}` : ''}`,
          slot.start_time,
        ),
      ),
  });

  lists.push({
    key: 'homework-due',
    title: asParent ? 'Homework set' : 'Homework due',
    description: 'What is outstanding, soonest first',
    to: PATHS.homework,
    empty: 'Nothing outstanding.',
    items: pending
      .sort((left, right) => left.due_date.localeCompare(right.due_date))
      .slice(0, LIST_PREVIEW_SIZE)
      .map((entry) =>
        dashboardItem(
          `homework-${entry.id}`,
          entry.title,
          `${entry.subject_name} · ${entry.teacher_name}`,
          entry.due_date,
          entry.is_overdue ? 'danger' : null,
          toPath(PATHS.homeworkDetail, { id: entry.id }),
        ),
      ),
  });

  return {
    stats,
    alerts: alerts.sort((left, right) => right.urgency - left.urgency),
    panels,
    lists,
    activities: dashboardActivities({ studentId: student.id }),
  };
}

/** Which dashboards this user could see. The first is their default. */
function dashboardViews(user: AuthUser): DashboardView[] {
  if (user.roles.includes(ROLES.superAdmin)) {
    return ['admin', 'principal', 'teacher', 'student', 'parent'];
  }

  const views = VIEW_FOR_ROLE.filter(([role]) => user.roles.includes(role)).map(([, view]) => view);
  return [...new Set(views.length > 0 ? views : ['admin' as DashboardView])];
}

function buildDashboard(requested: string | null): DashboardData {
  const user = currentUser!;
  const available = dashboardViews(user);

  // A requested view is a *preference* among the ones this user already
  // holds. Honouring an arbitrary one would be letting the client pick its
  // own audience.
  const view =
    requested && (available as string[]).includes(requested)
      ? (requested as DashboardView)
      : available[0];

  const subject = dashboardSubject(view);
  const first = user.name.split(' ')[0];

  const body =
    view === 'principal'
      ? principalDashboard()
      : view === 'teacher'
        ? teacherDashboard()
        : (view === 'student' || view === 'parent') && subject
          ? studentDashboard(subject, view === 'parent')
          : adminDashboard();

  return {
    view,
    available_views: available,
    generated_at: new Date().toISOString(),
    greeting: `${greetingFor(new Date())}, ${first}`,
    subject,
    ...body,
  };
}

const greetingFor = (now: Date) => {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// --- route table ------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type Handler = (req: ParsedRequest, config: InternalAxiosRequestConfig) => Promise<any> | any;
type Route = [method: string, pattern: RegExp, handler: Handler];

/**
 * `{owner}/{id}/documents` behaves identically for every owner, so the routes
 * are generated once and registered per owner — mirroring the shared
 * `createDocumentService` on the frontend.
 */
function documentRoutes(
  owner: string,
  store: Record<number, any[]>,
  syncCount: (ownerId: number) => void,
): Route[] {
  const ownerId = (path: string) => Number(new RegExp(`/${owner}/(\\d+)/`).exec(path)?.[1]);

  return [
    [
      'GET',
      new RegExp(`^/${owner}/(\\d+)/documents$`),
      (req, config) => ok(config, { data: store[ownerId(`${req.path}/`)] ?? [] }),
    ],
    [
      'POST',
      new RegExp(`^/${owner}/(\\d+)/documents$`),
      (req, config) => {
        const id = ownerId(`${req.path}/`);
        const file = req.formData?.get('file');

        const created = {
          id: nextDocumentId++,
          type: (req.formData?.get('type') as string) ?? 'other',
          title: (req.formData?.get('title') as string) ?? 'Untitled',
          file_name: file instanceof File ? file.name : 'upload',
          mime_type: file instanceof File ? file.type : 'application/octet-stream',
          size_bytes: file instanceof File ? file.size : 0,
          url: '#',
          uploaded_at: new Date().toISOString(),
        };

        store[id] = [...(store[id] ?? []), created];
        syncCount(id);

        return ok(config, { data: created }, 201);
      },
    ],
    [
      'DELETE',
      new RegExp(`^/${owner}/(\\d+)/documents/(\\d+)$`),
      (req, config) => {
        const [, rawOwner, documentId] =
          new RegExp(`/${owner}/(\\d+)/documents/(\\d+)$`).exec(req.path) ?? [];
        const id = Number(rawOwner);

        store[id] = (store[id] ?? []).filter((document) => document.id !== Number(documentId));
        syncCount(id);

        return ok(config, null, 204);
      },
    ],
    [
      'GET',
      new RegExp(`^/${owner}/(\\d+)/documents/(\\d+)/download$`),
      (req, config) => {
        const [, rawOwner, documentId] =
          new RegExp(`/${owner}/(\\d+)/documents/(\\d+)/download$`).exec(req.path) ?? [];
        const document = (store[Number(rawOwner)] ?? []).find(
          (entry) => entry.id === Number(documentId),
        );
        if (!document) return failure(config, 404, 'Document not found.');

        return fileResponse(config, `Contents of ${document.file_name}`, document.file_name);
      },
    ],
  ];
}

const ROUTES: Route[] = [
  // --- auth ---
  [
    'POST',
    /^\/auth\/login$/,
    (req, config) => {
      const email = String(req.body.email ?? '').toLowerCase();
      const match = accounts.find((entry) => entry.user.email === email);

      if (!match || req.body.password !== SHARED_PASSWORD) {
        return unprocessable(config, {
          email: ['These credentials do not match our records.'],
        });
      }

      currentUser = { ...match.user };
      return ok(config, { data: { user: currentUser, token: `mock-token-${match.user.id}` } });
    },
  ],
  // Demo sign-in: the same accounts, entered from the sign-in page with one
  // click and no password. A real server offers these only when told to.
  [
    'GET',
    /^\/auth\/demo-accounts$/,
    (_req, config) =>
      ok(config, {
        data: accounts.map(({ user }) => ({
          email: user.email,
          name: user.name,
          role: user.roles[0],
        })),
      }),
  ],
  [
    'POST',
    /^\/auth\/demo-login$/,
    (req, config) => {
      const email = String(req.body.email ?? '').toLowerCase();
      const match = accounts.find((entry) => entry.user.email === email);

      if (!match) {
        return unprocessable(config, { email: ['This demo account is not available.'] });
      }

      currentUser = { ...match.user };
      return ok(config, { data: { user: currentUser, token: `mock-token-${match.user.id}` } });
    },
  ],
  ['POST', /^\/auth\/logout$/, (_req, config) => ((currentUser = null), ok(config, null, 204))],
  ['POST', /^\/auth\/logout-all$/, (_req, config) => ((currentUser = null), ok(config, null, 204))],
  [
    'GET',
    /^\/auth\/me$/,
    (_req, config) =>
      currentUser
        ? ok(config, { data: currentUser })
        : failure(config, 401, 'Unauthenticated.'),
  ],
  [
    'POST',
    /^\/auth\/forgot-password$/,
    (_req, config) => ok(config, { message: 'Reset link sent.' }),
  ],
  [
    'POST',
    /^\/auth\/reset-password$/,
    (req, config) =>
      req.body.token
        ? ok(config, { message: 'Your password has been reset.' })
        : unprocessable(config, { token: ['This password reset token is invalid.'] }),
  ],
  [
    'PUT',
    /^\/auth\/password$/,
    (req, config) =>
      req.body.current_password === SHARED_PASSWORD
        ? ok(config, { message: 'Password changed. Other devices have been signed out.' })
        : unprocessable(config, { current_password: ['The provided password is incorrect.'] }),
  ],
  [
    'PUT',
    /^\/auth\/profile$/,
    (req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');
      currentUser = {
        ...currentUser,
        name: String(req.body.name ?? currentUser.name),
        email: String(req.body.email ?? currentUser.email),
        phone: (req.body.phone as string | null) ?? null,
      };
      return ok(config, { data: currentUser });
    },
  ],
  [
    'POST',
    /^\/auth\/profile\/avatar$/,
    (_req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');
      // A real backend returns a stored URL; a data URI is enough here.
      currentUser = { ...currentUser, avatar_url: null };
      return ok(config, { data: currentUser });
    },
  ],
  ['GET', /^\/auth\/sessions$/, (_req, config) => ok(config, { data: sessions })],
  [
    'DELETE',
    /^\/auth\/sessions\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/(\d+)$/.exec(req.path)?.[1]);
      sessions = sessions.filter((session) => session.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- school settings ---
  ['GET', /^\/settings$/, (_req, config) => ok(config, { data: settings })],
  [
    'PUT',
    /^\/settings\/profile$/,
    (req, config) =>
      ok(config, { data: touchSettings({ profile: asGroup<'profile'>(req.body) }) }),
  ],
  [
    'PUT',
    /^\/settings\/address$/,
    (req, config) =>
      ok(config, { data: touchSettings({ address: asGroup<'address'>(req.body) }) }),
  ],
  [
    'PUT',
    /^\/settings\/localization$/,
    (req, config) =>
      ok(config, { data: touchSettings({ localization: asGroup<'localization'>(req.body) }) }),
  ],
  [
    'PUT',
    /^\/settings\/email$/,
    (req, config) => {
      const { password, ...rest } = req.body as Record<string, unknown>;
      // A password only arrives when the user typed a new one; otherwise the
      // stored value is left untouched — same contract as the real API.
      if (typeof password === 'string' && password) secrets.smtpPassword = password;

      return ok(config, {
        data: touchSettings({
          email: {
            ...(rest as Omit<SchoolSettings['email'], 'has_password'>),
            has_password: Boolean(secrets.smtpPassword),
          },
        }),
      });
    },
  ],
  [
    'PUT',
    /^\/settings\/sms$/,
    (req, config) => {
      const { api_key: apiKey, ...rest } = req.body as Record<string, unknown>;
      if (typeof apiKey === 'string' && apiKey) secrets.smsApiKey = apiKey;

      return ok(config, {
        data: touchSettings({
          sms: {
            ...(rest as Omit<SchoolSettings['sms'], 'has_api_key'>),
            has_api_key: Boolean(secrets.smsApiKey),
          },
        }),
      });
    },
  ],
  [
    'POST',
    /^\/settings\/logo$/,
    (_req, config) =>
      // A real backend stores the file and returns its URL; an inline SVG
      // stands in so the preview actually changes.
      ok(config, {
        data: touchSettings({
          logo_url:
            'data:image/svg+xml;utf8,' +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="%234f46e5"/><text x="32" y="41" font-size="26" font-family="sans-serif" fill="white" text-anchor="middle">G</text></svg>',
            ),
        }),
      }),
  ],
  ['DELETE', /^\/settings\/logo$/, (_req, config) => ok(config, { data: touchSettings({ logo_url: null }) })],
  [
    'POST',
    /^\/settings\/email\/test$/,
    (req, config) =>
      settings.email.enabled && secrets.smtpPassword
        ? ok(config, { message: `Delivered to ${String(req.body.email)}.` })
        : failure(
            config,
            422,
            settings.email.enabled
              ? 'SMTP authentication failed: no password configured.'
              : 'Email sending is disabled for this school.',
          ),
  ],
  [
    'POST',
    /^\/settings\/sms\/test$/,
    (req, config) =>
      settings.sms.enabled && secrets.smsApiKey
        ? ok(config, { message: `Delivered to ${String(req.body.phone)}.` })
        : failure(
            config,
            422,
            settings.sms.enabled
              ? 'SMS provider rejected the request: no API key configured.'
              : 'SMS sending is disabled for this school.',
          ),
  ],

  // --- academic years ---
  ['GET', /^\/academic-years$/, (_req, config) => ok(config, { data: academicYears })],
  [
    'POST',
    /^\/academic-years$/,
    (req, config) => {
      const name = String(req.body.name ?? '').trim();
      if (academicYears.some((year) => year.name === name)) {
        return unprocessable(config, { name: ['A session with this name already exists.'] });
      }

      const makeCurrent = Boolean(req.body.is_current);
      const created: AcademicYear = {
        id: nextYearId++,
        name,
        start_date: String(req.body.start_date),
        end_date: String(req.body.end_date),
        is_current: makeCurrent,
        created_at: new Date().toISOString(),
      };

      // Only one session may be current.
      academicYears = [
        ...academicYears.map((year) => ({ ...year, is_current: makeCurrent ? false : year.is_current })),
        created,
      ];
      touchSettings({});

      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/academic-years\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/(\d+)$/.exec(req.path)?.[1]);
      const existing = academicYears.find((year) => year.id === id);
      if (!existing) return failure(config, 404, 'Session not found.');

      const name = String(req.body.name ?? '').trim();
      if (academicYears.some((year) => year.id !== id && year.name === name)) {
        return unprocessable(config, { name: ['A session with this name already exists.'] });
      }

      // The current session stays current; switching happens via /activate.
      const makeCurrent = existing.is_current || Boolean(req.body.is_current);
      const updated: AcademicYear = {
        ...existing,
        name,
        start_date: String(req.body.start_date),
        end_date: String(req.body.end_date),
        is_current: makeCurrent,
      };

      academicYears = academicYears.map((year) =>
        year.id === id ? updated : { ...year, is_current: makeCurrent ? false : year.is_current },
      );
      touchSettings({});

      return ok(config, { data: updated });
    },
  ],
  [
    'DELETE',
    /^\/academic-years\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/(\d+)$/.exec(req.path)?.[1]);
      const year = academicYears.find((entry) => entry.id === id);
      if (!year) return failure(config, 404, 'Session not found.');
      if (year.is_current) return failure(config, 403, 'The current session cannot be deleted.');

      academicYears = academicYears.filter((entry) => entry.id !== id);
      touchSettings({});
      return ok(config, null, 204);
    },
  ],
  [
    'POST',
    /^\/academic-years\/(\d+)\/activate$/,
    (req, config) => {
      const id = Number(/\/(\d+)\/activate$/.exec(req.path)?.[1]);
      const target = academicYears.find((year) => year.id === id);
      if (!target) return failure(config, 404, 'Session not found.');

      academicYears = academicYears.map((year) => ({ ...year, is_current: year.id === id }));
      touchSettings({});

      return ok(config, { data: { ...target, is_current: true } });
    },
  ],

  // --- homework ---
  ['GET', /^\/homework$/, (req, config) => ok(config, listHomework(req.params))],
  [
    'GET',
    /^\/homework\/(\d+)$/,
    (req, config) => {
      const homework = findHomework(req.path);
      return homework
        ? ok(config, { data: withHomeworkCounts(homework) })
        : failure(config, 404, 'Homework not found.');
    },
  ],
  [
    'POST',
    /^\/homework$/,
    (req, config) => {
      const created = buildHomeworkFromPayload(nextHomeworkId++, req.body);
      homeworkList = [created, ...homeworkList];
      return ok(config, { data: withHomeworkCounts(created) }, 201);
    },
  ],
  [
    'PUT',
    /^\/homework\/(\d+)$/,
    (req, config) => {
      const existing = findHomework(req.path);
      if (!existing) return failure(config, 404, 'Homework not found.');

      const updated: HomeworkDetail = {
        ...existing,
        ...buildHomeworkFromPayload(existing.id, req.body),
        // An edit must not silently unpublish, drop files or reassign author.
        status: existing.status,
        attachments: existing.attachments,
        teacher_id: existing.teacher_id,
        teacher_name: existing.teacher_name,
        created_at: existing.created_at,
      };

      homeworkList = homeworkList.map((entry) => (entry.id === existing.id ? updated : entry));
      return ok(config, { data: withHomeworkCounts(updated) });
    },
  ],
  [
    'DELETE',
    /^\/homework\/(\d+)$/,
    (req, config) => {
      const existing = findHomework(req.path);
      if (!existing) return failure(config, 404, 'Homework not found.');

      homeworkList = homeworkList.filter((entry) => entry.id !== existing.id);
      for (const student of homeworkRoster(existing)) {
        submissionsByHomework.delete(submissionKey(existing.id, student.id));
      }
      return ok(config, null, 204);
    },
  ],
  [
    'POST',
    /^\/homework\/(\d+)\/publish$/,
    (req, config) => {
      const existing = findHomework(req.path);
      if (!existing) return failure(config, 404, 'Homework not found.');

      if (existing.status !== 'draft') {
        return failure(config, 409, 'Only a draft can be published.');
      }
      // Publishing with nothing to do is almost always a half-finished draft.
      if (!existing.description.trim() && existing.attachments.length === 0) {
        return unprocessable(config, {
          description: ['Add a brief or an attachment before publishing.'],
        });
      }

      const published = { ...existing, status: 'published' as const, updated_at: new Date().toISOString() };
      homeworkList = homeworkList.map((entry) => (entry.id === existing.id ? published : entry));
      return ok(config, { data: withHomeworkCounts(published) });
    },
  ],
  [
    'POST',
    /^\/homework\/(\d+)\/close$/,
    (req, config) => {
      const existing = findHomework(req.path);
      if (!existing) return failure(config, 404, 'Homework not found.');

      if (existing.status !== 'published') {
        return failure(config, 409, 'Only published homework can be closed.');
      }

      const closed = { ...existing, status: 'closed' as const, updated_at: new Date().toISOString() };
      homeworkList = homeworkList.map((entry) => (entry.id === existing.id ? closed : entry));
      return ok(config, { data: withHomeworkCounts(closed) });
    },
  ],

  // --- homework attachments ---
  [
    'POST',
    /^\/homework\/(\d+)\/attachments$/,
    (req, config) => {
      const homework = findHomework(req.path);
      if (!homework) return failure(config, 404, 'Homework not found.');

      if (homework.status === 'closed') {
        return failure(config, 409, 'Closed homework cannot be changed.');
      }
      if (homework.attachments.length >= 10) {
        return unprocessable(config, { file: ['This homework already has 10 attachments.'] });
      }

      const file = req.formData?.get('file');
      const mime = file instanceof File ? file.type : 'application/octet-stream';
      const kind: HomeworkAttachment['kind'] = mime === 'application/pdf'
        ? 'pdf'
        : mime.startsWith('image/')
          ? 'image'
          : mime.startsWith('video/')
            ? 'video'
            : 'other';

      const created: HomeworkAttachment = {
        id: nextHomeworkAttachmentId++,
        kind,
        file_name: file instanceof File ? file.name : 'upload',
        mime_type: mime,
        size_bytes: file instanceof File ? file.size : 0,
        url: `/homework/files/${file instanceof File ? file.name : 'upload'}`,
        thumbnail_url:
          kind === 'image' || kind === 'video'
            ? `/homework/files/thumbs/${file instanceof File ? file.name : 'upload'}`
            : null,
        // A real backend probes the container for this.
        duration_seconds: kind === 'video' ? 180 : null,
        uploaded_at: new Date().toISOString(),
      };

      const updated = { ...homework, attachments: [...homework.attachments, created] };
      homeworkList = homeworkList.map((entry) => (entry.id === homework.id ? updated : entry));

      return ok(config, { data: created }, 201);
    },
  ],
  [
    'DELETE',
    /^\/homework\/(\d+)\/attachments\/(\d+)$/,
    (req, config) => {
      const homework = findHomework(req.path);
      if (!homework) return failure(config, 404, 'Homework not found.');

      const attachmentId = Number(/\/attachments\/(\d+)$/.exec(req.path)?.[1]);
      if (!homework.attachments.some((entry) => entry.id === attachmentId)) {
        return failure(config, 404, 'Attachment not found.');
      }

      const updated = {
        ...homework,
        attachments: homework.attachments.filter((entry) => entry.id !== attachmentId),
      };
      homeworkList = homeworkList.map((entry) => (entry.id === homework.id ? updated : entry));

      return ok(config, null, 204);
    },
  ],
  [
    'GET',
    /^\/homework\/(\d+)\/attachments\/(\d+)\/download$/,
    (req, config) => {
      const homework = findHomework(req.path);
      const attachmentId = Number(/\/attachments\/(\d+)\/download$/.exec(req.path)?.[1]);
      const attachment = homework?.attachments.find((entry) => entry.id === attachmentId);

      return attachment
        ? fileResponse(config, `Contents of ${attachment.file_name}`, attachment.file_name)
        : failure(config, 404, 'Attachment not found.');
    },
  ],

  // --- submissions ---
  [
    'GET',
    /^\/homework\/(\d+)\/submissions$/,
    (req, config) => {
      const homework = findHomework(req.path);
      if (!homework) return failure(config, 404, 'Homework not found.');

      // A draft has no submission rows — they are raised on publish.
      return ok(
        config,
        homework.status === 'draft'
          ? { data: [], summary: { total: 0, pending: 0, submitted: 0, late: 0, graded: 0, average_marks: null } }
          : buildSubmissions(homework),
      );
    },
  ],
  [
    'POST',
    /^\/homework\/(\d+)\/submissions$/,
    (req, config) => {
      const homework = findHomework(req.path);
      if (!homework) return failure(config, 404, 'Homework not found.');

      if (homework.status !== 'published') {
        return failure(config, 409, 'Submissions are only accepted while the homework is published.');
      }

      const studentId = Number(req.body.student_id);
      const student = homeworkRoster(homework).find((entry) => entry.id === studentId);
      if (!student) {
        return unprocessable(config, { student_id: ['That student is not in scope for this homework.'] });
      }

      const key = submissionKey(homework.id, studentId);
      const existing = submissionsByHomework.get(key);

      submissionsByHomework.set(key, {
        id: existing?.id ?? nextSubmissionId++,
        homework_id: homework.id,
        student_id: studentId,
        submitted_at: existing?.submitted_at ?? new Date().toISOString(),
        student_note: (req.body.student_note as string | null) ?? existing?.student_note ?? null,
        attachments: existing?.attachments ?? [],
        marks_obtained: existing?.marks_obtained ?? null,
        remarks: existing?.remarks ?? null,
        graded_at: existing?.graded_at ?? null,
        graded_by: existing?.graded_by ?? null,
      });

      return ok(config, { data: buildSubmission(homework, student) }, 201);
    },
  ],
  [
    'POST',
    /^\/homework\/(\d+)\/submissions\/(\d+)\/grade$/,
    (req, config) => {
      const homework = findHomework(req.path);
      if (!homework) return failure(config, 404, 'Homework not found.');

      const submissionId = Number(/\/submissions\/(\d+)\/grade$/.exec(req.path)?.[1]);
      const student = homeworkRoster(homework).find(
        (entry) => buildSubmission(homework, entry).id === submissionId,
      );
      if (!student) return failure(config, 404, 'Submission not found.');

      const key = submissionKey(homework.id, student.id);
      const stored = submissionsByHomework.get(key);

      // Nothing has been handed in, so there is nothing to mark.
      if (!stored?.submitted_at) {
        return failure(config, 409, 'This student has not handed anything in yet.');
      }

      const marks = Number(req.body.marks_obtained);
      if (!Number.isFinite(marks) || marks < 0) {
        return unprocessable(config, { marks_obtained: ['Enter the marks awarded.'] });
      }
      if (marks > homework.max_marks) {
        return unprocessable(config, {
          marks_obtained: [`This homework is out of ${homework.max_marks}.`],
        });
      }

      submissionsByHomework.set(key, {
        ...stored,
        marks_obtained: marks,
        remarks: (req.body.remarks as string | null) ?? null,
        graded_at: new Date().toISOString(),
        graded_by: currentUser?.name ?? 'System',
      });

      return ok(config, { data: buildSubmission(homework, student) });
    },
  ],
  [
    'DELETE',
    /^\/homework\/(\d+)\/submissions\/(\d+)\/grade$/,
    (req, config) => {
      const homework = findHomework(req.path);
      if (!homework) return failure(config, 404, 'Homework not found.');

      const submissionId = Number(/\/submissions\/(\d+)\/grade$/.exec(req.path)?.[1]);
      const student = homeworkRoster(homework).find(
        (entry) => buildSubmission(homework, entry).id === submissionId,
      );
      if (!student) return failure(config, 404, 'Submission not found.');

      const key = submissionKey(homework.id, student.id);
      const stored = submissionsByHomework.get(key);
      if (!stored) return failure(config, 404, 'Submission not found.');

      submissionsByHomework.set(key, {
        ...stored,
        marks_obtained: null,
        remarks: null,
        graded_at: null,
        graded_by: null,
      });

      return ok(config, { data: buildSubmission(homework, student) });
    },
  ],

  // --- communication: channels ---
  ['GET', /^\/communication\/channels$/, (_req, config) => ok(config, { data: channelHealth() })],
  [
    'GET',
    /^\/communication\/push\/devices$/,
    (req, config) => {
      const search = (req.params.get('search') ?? '').toLowerCase();

      let rows = [...pushDeviceList];
      if (search) {
        rows = rows.filter((device) => device.owner_name.toLowerCase().includes(search));
      }

      return ok(
        config,
        paginate(sortRows(rows, req.params, 'last_seen_at'), req.params, '/communication/push/devices'),
      );
    },
  ],
  [
    'POST',
    /^\/communication\/push\/devices\/purge$/,
    (_req, config) => {
      const before = pushDeviceList.length;
      pushDeviceList = pushDeviceList.filter((device) => !device.is_stale);

      return ok(config, { data: { removed: before - pushDeviceList.length } });
    },
  ],

  // --- communication: templates ---
  ['GET', /^\/communication\/templates$/, (req, config) => ok(config, listTemplates(req.params))],
  [
    'POST',
    /^\/communication\/templates$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim().toUpperCase();
      if (templateList.some((template) => template.code === code)) {
        return unprocessable(config, { code: ['That code is already in use.'] });
      }

      const channel = (req.body.channel as Channel) ?? 'sms';

      if (channel === 'email' && !String(req.body.subject ?? '').trim()) {
        return unprocessable(config, { subject: ['An email needs a subject line.'] });
      }

      const created: StoredTemplate = {
        id: nextTemplateId++,
        name: String(req.body.name ?? '').trim(),
        code,
        channel,
        category: (req.body.category as TemplateCategory) ?? 'general',
        subject: channel === 'email' ? ((req.body.subject as string | null) ?? null) : null,
        body: String(req.body.body ?? ''),
        // A new WhatsApp template goes to Meta before it can be used. Nothing
        // this school does can shortcut that, so it starts pending.
        approval: TEMPLATE_ONLY_CHANNELS.includes(channel) ? 'pending' : 'not_required',
        approval_note: TEMPLATE_ONLY_CHANNELS.includes(channel)
          ? 'Submitted for review.'
          : null,
        is_active: req.body.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      templateList = [...templateList, created];
      return ok(config, { data: hydrateTemplate(created) }, 201);
    },
  ],
  [
    'PUT',
    /^\/communication\/templates\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/templates\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findTemplate(id);
      if (!existing) return failure(config, 404, 'Template not found.');

      const code = String(req.body.code ?? existing.code).trim().toUpperCase();
      if (templateList.some((template) => template.code === code && template.id !== id)) {
        return unprocessable(config, { code: ['That code is already in use.'] });
      }

      // A template belongs to one channel for life: its body is written for
      // that channel's limits, and messages already sent reference it.
      if (req.body.channel && req.body.channel !== existing.channel) {
        return unprocessable(config, {
          channel: ['A template cannot move to another channel.'],
        });
      }

      if (existing.channel === 'email' && !String(req.body.subject ?? '').trim()) {
        return unprocessable(config, { subject: ['An email needs a subject line.'] });
      }

      const body = String(req.body.body ?? existing.body);
      // Editing an approved WhatsApp body sends it back for review — Meta
      // approve the text, not the record.
      const bodyChanged = body !== existing.body;

      Object.assign(existing, {
        name: String(req.body.name ?? existing.name).trim(),
        code,
        category: (req.body.category as TemplateCategory) ?? existing.category,
        subject: existing.channel === 'email' ? ((req.body.subject as string | null) ?? null) : null,
        body,
        approval:
          TEMPLATE_ONLY_CHANNELS.includes(existing.channel) && bodyChanged
            ? 'pending'
            : existing.approval,
        approval_note:
          TEMPLATE_ONLY_CHANNELS.includes(existing.channel) && bodyChanged
            ? 'Re-submitted after an edit.'
            : existing.approval_note,
        is_active: req.body.is_active !== false,
        updated_at: new Date().toISOString(),
      });

      return ok(config, { data: hydrateTemplate(existing) });
    },
  ],
  [
    'DELETE',
    /^\/communication\/templates\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/templates\/(\d+)$/.exec(req.path)?.[1]);
      if (!findTemplate(id)) return failure(config, 404, 'Template not found.');

      templateList = templateList.filter((template) => template.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- communication: audiences ---
  [
    'POST',
    /^\/communication\/audience\/preview$/,
    (req, config) => {
      const audience: StoredAudience = {
        type: (req.body.type as AudienceType) ?? 'all_guardians',
        class_id: (req.body.class_id as number | null) ?? null,
        section_id: (req.body.section_id as number | null) ?? null,
        recipient_ids: (req.body.recipient_ids as number[]) ?? [],
      };

      const reach = audienceReach(audience);

      return ok(config, {
        data: {
          total: reach.total,
          reachable: reach.reachable,
          unreachable: reach.unreachable,
          sample: reach.people.slice(0, 3).map((person) => person.name),
        },
      });
    },
  ],

  // --- communication: messages ---
  ['GET', /^\/communication\/messages$/, (req, config) => ok(config, listMessages(req.params))],
  [
    'GET',
    /^\/communication\/messages\/export$/,
    (req, config) => {
      const rows = listMessages(
        new URLSearchParams({ ...Object.fromEntries(req.params), per_page: '500' }),
      );
      const extension = req.params.get('format') === 'excel' ? 'xlsx' : 'pdf';
      return fileResponse(config, messageLogCsv(rows.data), `message-log.${extension}`);
    },
  ],
  [
    'POST',
    /^\/communication\/messages$/,
    (req, config) => {
      const channels = (req.body.channels as Channel[]) ?? [];
      if (channels.length === 0) {
        return unprocessable(config, { channels: ['Choose at least one channel.'] });
      }

      // A channel that cannot send is a channel that will fail silently for
      // every recipient — better a form error than nine hundred of those.
      const dead = channels.filter((channel) => !isChannelReady(channel));
      if (dead.length > 0) {
        return unprocessable(config, {
          channels: [
            `${dead.map((channel) => channel.toUpperCase()).join(' and ')} cannot send — check the channel settings.`,
          ],
        });
      }

      const templateId =
        req.body.template_id === null || req.body.template_id === undefined
          ? null
          : Number(req.body.template_id);

      // WhatsApp will not carry a freeform message, and will not carry an
      // unapproved template either.
      if (channels.some((channel) => TEMPLATE_ONLY_CHANNELS.includes(channel))) {
        if (templateId === null) {
          return unprocessable(config, {
            template_id: ['WhatsApp needs an approved template.'],
          });
        }

        const template = findTemplate(templateId);
        if (!template) return failure(config, 404, 'Template not found.');
        if (template.approval !== 'approved') {
          return unprocessable(config, {
            template_id: [`That template is ${template.approval.replace('_', ' ')}, not approved.`],
          });
        }
      }

      const audience: StoredAudience = {
        type: (req.body.audience as StoredAudience)?.type ?? 'all_guardians',
        class_id: (req.body.audience as StoredAudience)?.class_id ?? null,
        section_id: (req.body.audience as StoredAudience)?.section_id ?? null,
        recipient_ids: (req.body.audience as StoredAudience)?.recipient_ids ?? [],
      };

      const reach = audienceReach(audience);
      if (reach.total === 0) {
        return unprocessable(config, {
          audience: ['That audience is empty — nobody would be messaged.'],
        });
      }

      const scheduledAt = (req.body.scheduled_at as string | null) ?? null;
      if (scheduledAt !== null && new Date(scheduledAt) <= new Date()) {
        return unprocessable(config, {
          scheduled_at: ['A scheduled send has to be in the future.'],
        });
      }

      const created: StoredMessage = {
        id: nextMessageId++,
        subject: String(req.body.subject ?? '').trim(),
        body: String(req.body.body ?? ''),
        channels,
        template_id: templateId,
        audience,
        status: scheduledAt === null ? 'sent' : 'queued',
        scheduled_at: scheduledAt,
        sent_at: scheduledAt === null ? new Date().toISOString() : null,
        created_by: currentUser?.name ?? 'Office',
        deliveries: null,
        recipients_count: reach.total,
        notice_id: null,
        created_at: new Date().toISOString(),
      };

      if (created.status === 'sent') created.deliveries = buildDeliveries(created);

      messageList = [created, ...messageList];
      return ok(config, { data: hydrateMessage(created) }, 201);
    },
  ],
  [
    'GET',
    /^\/communication\/messages\/(\d+)$/,
    (req, config) => {
      const message = findMessage(Number(/\/messages\/(\d+)$/.exec(req.path)?.[1]));
      return message
        ? ok(config, { data: hydrateMessage(message) })
        : failure(config, 404, 'Message not found.');
    },
  ],
  [
    'POST',
    /^\/communication\/messages\/(\d+)\/cancel$/,
    (req, config) => {
      const message = findMessage(
        Number(/\/messages\/(\d+)\/cancel$/.exec(req.path)?.[1]),
      );
      if (!message) return failure(config, 404, 'Message not found.');

      // A message already gone cannot be recalled — pretending otherwise is
      // the one thing a log must never do.
      if (message.status !== 'queued' && message.status !== 'draft') {
        return failure(
          config,
          409,
          `This message is ${message.status} — it cannot be called back.`,
        );
      }

      message.status = 'cancelled';
      message.scheduled_at = null;

      return ok(config, { data: hydrateMessage(message) });
    },
  ],
  [
    'DELETE',
    /^\/communication\/messages\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/messages\/(\d+)$/.exec(req.path)?.[1]);
      const message = findMessage(id);
      if (!message) return failure(config, 404, 'Message not found.');

      if (message.status === 'sent' || message.status === 'partial') {
        return failure(config, 409, 'A sent message stays in the log.');
      }

      messageList = messageList.filter((entry) => entry.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- communication: notice board ---
  ['GET', /^\/communication\/notices$/, (req, config) => ok(config, listNotices(req.params))],
  [
    'POST',
    /^\/communication\/notices$/,
    (req, config) => {
      const publishAt = String(req.body.publish_at ?? TODAY_DATE());
      const expiresAt = (req.body.expires_at as string | null) ?? null;

      if (expiresAt !== null && expiresAt <= publishAt) {
        return unprocessable(config, {
          expires_at: ['It cannot expire before it goes up.'],
        });
      }

      const created: StoredNotice = {
        id: nextNoticeId++,
        title: String(req.body.title ?? '').trim(),
        body: String(req.body.body ?? ''),
        category: (req.body.category as TemplateCategory) ?? 'general',
        priority: (req.body.priority as NoticePriority) ?? 'normal',
        audience: {
          type: (req.body.audience as StoredAudience)?.type ?? 'all_guardians',
          class_id: (req.body.audience as StoredAudience)?.class_id ?? null,
          section_id: (req.body.audience as StoredAudience)?.section_id ?? null,
          recipient_ids: (req.body.audience as StoredAudience)?.recipient_ids ?? [],
        },
        // Everything starts as a draft — a board anybody can post to
        // unreviewed is a board nobody trusts.
        status: 'draft',
        is_pinned: req.body.is_pinned === true,
        publish_at: publishAt,
        expires_at: expiresAt,
        published_by: null,
        published_at: null,
        approved_by: null,
        created_by: currentUser?.name ?? 'Office',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      noticeList = [created, ...noticeList];
      return ok(config, { data: hydrateNotice(created) }, 201);
    },
  ],
  [
    'GET',
    /^\/communication\/notices\/(\d+)$/,
    (req, config) => {
      const notice = findNotice(Number(/\/notices\/(\d+)$/.exec(req.path)?.[1]));
      return notice
        ? ok(config, { data: hydrateNotice(notice) })
        : failure(config, 404, 'Notice not found.');
    },
  ],
  [
    'GET',
    /^\/communication\/notices\/(\d+)\/print$/,
    (req, config) => {
      const notice = findNotice(Number(/\/notices\/(\d+)\/print$/.exec(req.path)?.[1]));
      if (!notice) return failure(config, 404, 'Notice not found.');

      return fileResponse(config, noticeText(notice), `notice-${notice.id}.pdf`);
    },
  ],
  [
    'PUT',
    /^\/communication\/notices\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/notices\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findNotice(id);
      if (!existing) return failure(config, 404, 'Notice not found.');

      // A published notice is what people have read; editing it silently
      // would change what the board said after the fact.
      if (existing.status === 'published') {
        return failure(
          config,
          409,
          'Take it down before editing — people have already read it.',
        );
      }

      const publishAt = String(req.body.publish_at ?? existing.publish_at);
      const expiresAt = (req.body.expires_at as string | null) ?? null;

      if (expiresAt !== null && expiresAt <= publishAt) {
        return unprocessable(config, {
          expires_at: ['It cannot expire before it goes up.'],
        });
      }

      Object.assign(existing, {
        title: String(req.body.title ?? existing.title).trim(),
        body: String(req.body.body ?? existing.body),
        category: (req.body.category as TemplateCategory) ?? existing.category,
        priority: (req.body.priority as NoticePriority) ?? existing.priority,
        audience: {
          type: (req.body.audience as StoredAudience)?.type ?? existing.audience.type,
          class_id: (req.body.audience as StoredAudience)?.class_id ?? null,
          section_id: (req.body.audience as StoredAudience)?.section_id ?? null,
          recipient_ids: (req.body.audience as StoredAudience)?.recipient_ids ?? [],
        },
        publish_at: publishAt,
        expires_at: expiresAt,
        is_pinned: req.body.is_pinned === true,
        updated_at: new Date().toISOString(),
      });

      return ok(config, { data: hydrateNotice(existing) });
    },
  ],
  [
    'POST',
    /^\/communication\/notices\/(\d+)\/submit$/,
    (req, config) => {
      const notice = findNotice(Number(/\/notices\/(\d+)\/submit$/.exec(req.path)?.[1]));
      if (!notice) return failure(config, 404, 'Notice not found.');

      if (notice.status !== 'draft') {
        return failure(config, 409, `A ${notice.status} notice cannot be submitted.`);
      }

      notice.status = 'pending_approval';
      notice.updated_at = new Date().toISOString();

      return ok(config, { data: hydrateNotice(notice) });
    },
  ],
  [
    'POST',
    /^\/communication\/notices\/(\d+)\/publish$/,
    (req, config) => {
      const notice = findNotice(Number(/\/notices\/(\d+)\/publish$/.exec(req.path)?.[1]));
      if (!notice) return failure(config, 404, 'Notice not found.');

      if (notice.status !== 'pending_approval' && notice.status !== 'draft') {
        return failure(config, 409, `A ${notice.status} notice cannot be published.`);
      }

      notice.status = 'published';
      notice.published_at = new Date().toISOString();
      notice.published_by = currentUser?.name ?? 'Principal';
      notice.approved_by = currentUser?.name ?? 'Principal';
      notice.updated_at = new Date().toISOString();

      return ok(config, { data: hydrateNotice(notice) });
    },
  ],
  [
    'POST',
    /^\/communication\/notices\/(\d+)\/archive$/,
    (req, config) => {
      const notice = findNotice(Number(/\/notices\/(\d+)\/archive$/.exec(req.path)?.[1]));
      if (!notice) return failure(config, 404, 'Notice not found.');

      notice.status = 'archived';
      notice.updated_at = new Date().toISOString();

      return ok(config, { data: hydrateNotice(notice) });
    },
  ],
  [
    'POST',
    /^\/communication\/notices\/(\d+)\/announce$/,
    (req, config) => {
      const notice = findNotice(Number(/\/notices\/(\d+)\/announce$/.exec(req.path)?.[1]));
      if (!notice) return failure(config, 404, 'Notice not found.');

      // Announcing something nobody can read on the board would send people
      // to a notice that is not there.
      if (notice.status !== 'published') {
        return failure(config, 409, 'Publish the notice before announcing it.');
      }

      const channels = (req.body.channels as Channel[]) ?? [];
      if (channels.length === 0) {
        return unprocessable(config, { channels: ['Choose at least one channel.'] });
      }

      const dead = channels.filter((channel) => !isChannelReady(channel));
      if (dead.length > 0) {
        return unprocessable(config, {
          channels: [`${dead.map((c) => c.toUpperCase()).join(' and ')} cannot send.`],
        });
      }

      const templateId =
        req.body.template_id === null || req.body.template_id === undefined
          ? null
          : Number(req.body.template_id);

      if (channels.some((channel) => TEMPLATE_ONLY_CHANNELS.includes(channel))) {
        const template = templateId === null ? null : findTemplate(templateId);
        if (!template || template.approval !== 'approved') {
          return unprocessable(config, {
            template_id: ['WhatsApp needs an approved template.'],
          });
        }
      }

      const reach = audienceReach(notice.audience);

      const created: StoredMessage = {
        id: nextMessageId++,
        subject: notice.title,
        // The body comes from the notice, so the board and the broadcast
        // cannot say different things.
        body: notice.body,
        channels,
        template_id: templateId,
        audience: notice.audience,
        status: 'sent',
        scheduled_at: null,
        sent_at: new Date().toISOString(),
        created_by: currentUser?.name ?? 'Office',
        deliveries: null,
        recipients_count: reach.total,
        notice_id: notice.id,
        created_at: new Date().toISOString(),
      };

      created.deliveries = buildDeliveries(created);
      messageList = [created, ...messageList];

      return ok(config, { data: hydrateMessage(created) }, 201);
    },
  ],
  [
    'DELETE',
    /^\/communication\/notices\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/notices\/(\d+)$/.exec(req.path)?.[1]);
      const notice = findNotice(id);
      if (!notice) return failure(config, 404, 'Notice not found.');

      // Once it has been on the board it is a record of what was said.
      if (notice.status !== 'draft') {
        return failure(config, 409, `A ${notice.status} notice is archived, not deleted.`);
      }

      noticeList = noticeList.filter((entry) => entry.id !== id);
      return ok(config, null, 204);
    },
  ],
  [
    'GET',
    /^\/communication\/summary$/,
    (_req, config) => ok(config, { data: communicationSummary() }),
  ],

  // --- payroll: components ---
  ['GET', /^\/payroll\/components$/, (req, config) => ok(config, listComponents(req.params))],
  [
    'POST',
    /^\/payroll\/components$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim().toUpperCase();
      if (componentList.some((component) => component.code === code)) {
        return unprocessable(config, { code: ['That payslip code is already in use.'] });
      }

      const type = (req.body.type as ComponentType) ?? 'earning';
      const calculation = (req.body.calculation as CalculationMethod) ?? 'fixed';

      // An earning defined as a share of the gross would be a share of itself.
      if (type === 'earning' && calculation === 'percent_of_gross') {
        return unprocessable(config, {
          calculation: ['An allowance cannot be a percentage of the gross.'],
        });
      }

      const created: StoredComponent = {
        id: nextComponentId++,
        name: String(req.body.name ?? '').trim(),
        code,
        type,
        calculation,
        value: Number(req.body.value) || 0,
        // Statutory components are written by the module, never created here.
        is_statutory: false,
        is_taxable: type === 'earning' && req.body.is_taxable === true,
        affects_pf: type === 'earning' && req.body.affects_pf === true,
        is_active: req.body.is_active !== false,
        sort_order: Number(req.body.sort_order) || componentList.length + 1,
        created_at: new Date().toISOString(),
      };

      componentList = [...componentList, created];
      return ok(config, { data: withComponentCounts(created) }, 201);
    },
  ],
  [
    'PUT',
    /^\/payroll\/components\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/components\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findComponent(id);
      if (!existing) return failure(config, 404, 'Component not found.');

      const code = String(req.body.code ?? existing.code).trim().toUpperCase();
      if (componentList.some((component) => component.code === code && component.id !== id)) {
        return unprocessable(config, { code: ['That payslip code is already in use.'] });
      }

      const type = (req.body.type as ComponentType) ?? existing.type;
      const calculation = (req.body.calculation as CalculationMethod) ?? existing.calculation;

      if (type === 'earning' && calculation === 'percent_of_gross') {
        return unprocessable(config, {
          calculation: ['An allowance cannot be a percentage of the gross.'],
        });
      }

      const inUse = structureList.filter((structure) =>
        structure.lines.some((line) => line.component_id === id),
      ).length;

      // Turning an allowance into a deduction would silently halve somebody's
      // pay on every salary already using it.
      if (type !== existing.type && inUse > 0) {
        return unprocessable(config, {
          type: [`${inUse} salaries use this — an allowance cannot become a deduction.`],
        });
      }

      // A statutory rate is set by statute, not by this school.
      if (existing.is_statutory && Number(req.body.value) !== existing.value) {
        return unprocessable(config, {
          value: ['This is a statutory component — its rate cannot be changed.'],
        });
      }

      Object.assign(existing, {
        name: String(req.body.name ?? existing.name).trim(),
        code,
        type,
        calculation: existing.is_statutory ? existing.calculation : calculation,
        value: existing.is_statutory ? existing.value : Number(req.body.value) || 0,
        is_taxable: type === 'earning' && req.body.is_taxable === true,
        affects_pf: type === 'earning' && req.body.affects_pf === true,
        is_active: req.body.is_active !== false,
        sort_order: Number(req.body.sort_order) || existing.sort_order,
      });

      return ok(config, { data: withComponentCounts(existing) });
    },
  ],
  [
    'DELETE',
    /^\/payroll\/components\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/components\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findComponent(id);
      if (!existing) return failure(config, 404, 'Component not found.');

      if (existing.is_statutory) {
        return failure(config, 409, 'A statutory component cannot be deleted.');
      }

      const inUse = structureList.filter((structure) =>
        structure.lines.some((line) => line.component_id === id),
      ).length;
      if (inUse > 0) return failure(config, 409, `${inUse} salaries use this component.`);

      componentList = componentList.filter((component) => component.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- payroll: structures ---
  [
    'GET',
    /^\/payroll\/structures\/unassigned$/,
    (_req, config) => {
      const assigned = new Set(
        structureList.map((structure) => `${structure.employee_type}-${structure.employee_id}`),
      );

      return ok(config, {
        data: everyEmployee().filter(
          (employee) => !assigned.has(`${employee.employee_type}-${employee.employee_id}`),
        ),
      });
    },
  ],
  [
    'GET',
    /^\/payroll\/structures\/(teacher|staff)\/(\d+)$/,
    (req, config) => {
      const match = /\/structures\/(teacher|staff)\/(\d+)$/.exec(req.path);
      const type = match?.[1] as EmployeeType;
      const id = Number(match?.[2]);

      const structure = findStructure(type, id);
      if (!structure) return failure(config, 404, 'This employee has no salary on file.');

      const hydrated = hydrateStructure(structure);
      return hydrated ? ok(config, { data: hydrated }) : failure(config, 404, 'Employee not found.');
    },
  ],
  ['GET', /^\/payroll\/structures$/, (req, config) => ok(config, listStructures(req.params))],
  [
    'PUT',
    /^\/payroll\/structures$/,
    (req, config) => {
      const type = req.body.employee_type as EmployeeType;
      const employeeId = Number(req.body.employee_id);

      const employee = employeeRecord(type, employeeId);
      if (!employee) return failure(config, 404, 'Employee not found.');
      if (!employee.is_active) {
        return unprocessable(config, { employee_id: ['That employee is not in service.'] });
      }

      const basic = Number(req.body.basic) || 0;
      if (basic <= 0) {
        return unprocessable(config, { basic: ['A basic salary is required.'] });
      }

      const rawLines = (req.body.lines as { component_id: number; value: number }[]) ?? [];
      const errors: Record<string, string[]> = {};

      rawLines.forEach((line, index) => {
        const component = findComponent(Number(line.component_id));
        if (!component) {
          errors[`lines.${index}.component_id`] = ['That component does not exist.'];
          return;
        }
        if (!component.is_active) {
          errors[`lines.${index}.component_id`] = [`${component.name} has been retired.`];
          return;
        }
        if (component.calculation !== 'fixed' && Number(line.value) > 100) {
          errors[`lines.${index}.value`] = ['A percentage cannot exceed 100.'];
        }
      });

      if (Object.keys(errors).length > 0) return unprocessable(config, errors);

      const lines: StoredStructureLine[] = rawLines.map((line) => ({
        component_id: Number(line.component_id),
        value: Number(line.value) || 0,
      }));

      const draft: StoredStructure = {
        id: findStructure(type, employeeId)?.id ?? nextPayrollStructureId++,
        employee_type: type,
        employee_id: employeeId,
        basic,
        effective_from: String(req.body.effective_from ?? TODAY_DATE()),
        pf_on_full_wage: req.body.pf_on_full_wage === true,
        pf_excluded: req.body.pf_excluded === true,
        lines,
        is_active: req.body.is_active !== false,
        updated_at: new Date().toISOString(),
      };

      // Only somebody above the ceiling may be excluded from PF.
      const priced = priceStructure(draft);
      if (draft.pf_excluded && priced.pfWages <= PF_CEILING_MOCK) {
        return unprocessable(config, {
          pf_excluded: [
            `PF wages of ₹${priced.pfWages} are within the ceiling — contribution is compulsory.`,
          ],
        });
      }

      const existing = findStructure(type, employeeId);
      if (existing) {
        Object.assign(existing, draft);
      } else {
        structureList.push(draft);
      }

      return ok(config, { data: hydrateStructure(existing ?? draft) });
    },
  ],

  // --- payroll: runs ---
  ['GET', /^\/payroll\/runs$/, (req, config) => ok(config, listRuns(req.params))],
  [
    'POST',
    /^\/payroll\/runs$/,
    (req, config) => {
      const month = String(req.body.month ?? '');

      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return unprocessable(config, { month: ['Choose a month.'] });
      }
      if (month > TODAY_DATE().slice(0, 7)) {
        return unprocessable(config, { month: ['That month has not happened yet.'] });
      }
      // A month is run once — a second run would pay everybody twice.
      if (runList.some((run) => run.month === month)) {
        return failure(config, 409, `${month} has already been opened.`);
      }

      const created: StoredRun = {
        id: nextRunId++,
        month,
        status: 'draft',
        processed_at: null,
        processed_by: null,
        approved_at: null,
        approved_by: null,
        paid_at: null,
        paid_reference: null,
        notes: (req.body.notes as string | null) ?? null,
        created_at: new Date().toISOString(),
      };

      runList = [created, ...runList];
      payslipsByRun.set(created.id, []);

      return ok(config, { data: hydrateRunDetail(created) }, 201);
    },
  ],
  [
    'GET',
    /^\/payroll\/runs\/(\d+)$/,
    (req, config) => {
      const run = runList.find((entry) => entry.id === Number(/\/runs\/(\d+)$/.exec(req.path)?.[1]));
      return run
        ? ok(config, { data: hydrateRunDetail(run) })
        : failure(config, 404, 'Payroll not found.');
    },
  ],
  [
    'POST',
    /^\/payroll\/runs\/(\d+)\/process$/,
    (req, config) => {
      const run = runList.find(
        (entry) => entry.id === Number(/\/runs\/(\d+)\/process$/.exec(req.path)?.[1]),
      );
      if (!run) return failure(config, 404, 'Payroll not found.');

      if (!canTransition(run.status, 'processed')) {
        return failure(
          config,
          409,
          `A ${run.status} payroll cannot be processed — the figures are settled.`,
        );
      }

      const active = structureList.filter((structure) => structure.is_active);
      if (active.length === 0) {
        return unprocessable(config, {
          month: ['Nobody has a salary on file, so there is nothing to cost.'],
        });
      }

      payslipsByRun.set(
        run.id,
        active
          .map((structure) => buildPayslip(structure, run))
          .filter((slip): slip is Payslip => slip !== null),
      );

      run.status = 'processed';
      run.processed_at = new Date().toISOString();
      run.processed_by = currentUser?.name ?? 'Accounts';

      return ok(config, { data: hydrateRunDetail(run) });
    },
  ],
  [
    'POST',
    /^\/payroll\/runs\/(\d+)\/approve$/,
    (req, config) => {
      const run = runList.find(
        (entry) => entry.id === Number(/\/runs\/(\d+)\/approve$/.exec(req.path)?.[1]),
      );
      if (!run) return failure(config, 404, 'Payroll not found.');

      if (!canTransition(run.status, 'approved')) {
        return failure(
          config,
          409,
          run.status === 'draft'
            ? 'Process the payroll before approving it.'
            : `A ${run.status} payroll cannot be approved again.`,
        );
      }

      run.status = 'approved';
      run.approved_at = new Date().toISOString();
      run.approved_by = currentUser?.name ?? 'Principal';
      run.notes = (req.body.remarks as string | null) ?? run.notes;

      return ok(config, { data: hydrateRunDetail(run) });
    },
  ],
  [
    'POST',
    /^\/payroll\/runs\/(\d+)\/pay$/,
    (req, config) => {
      const run = runList.find(
        (entry) => entry.id === Number(/\/runs\/(\d+)\/pay$/.exec(req.path)?.[1]),
      );
      if (!run) return failure(config, 404, 'Payroll not found.');

      if (!canTransition(run.status, 'paid')) {
        return failure(
          config,
          409,
          run.status === 'paid'
            ? 'This payroll has already been paid.'
            : 'Approve the payroll before paying it.',
        );
      }

      const paidOn = String(req.body.paid_on ?? TODAY_DATE());
      if (paidOn > TODAY_DATE()) {
        return unprocessable(config, { paid_on: ['That date is in the future.'] });
      }

      run.status = 'paid';
      run.paid_at = paidOn;
      run.paid_reference = (req.body.reference as string | null) ?? null;

      return ok(config, { data: hydrateRunDetail(run) });
    },
  ],
  [
    'DELETE',
    /^\/payroll\/runs\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/runs\/(\d+)$/.exec(req.path)?.[1]);
      const run = runList.find((entry) => entry.id === id);
      if (!run) return failure(config, 404, 'Payroll not found.');

      // Once it is costed it is a record of what people were told they
      // would be paid.
      if (run.status !== 'draft') {
        return failure(config, 409, `A ${run.status} payroll cannot be deleted.`);
      }

      runList = runList.filter((entry) => entry.id !== id);
      payslipsByRun.delete(id);
      return ok(config, null, 204);
    },
  ],
  [
    'GET',
    /^\/payroll\/runs\/(\d+)\/export$/,
    (req, config) => {
      const run = runList.find(
        (entry) => entry.id === Number(/\/runs\/(\d+)\/export$/.exec(req.path)?.[1]),
      );
      if (!run) return failure(config, 404, 'Payroll not found.');

      const extension = req.params.get('format') === 'excel' ? 'xlsx' : 'pdf';
      return fileResponse(
        config,
        payrollCsv(payslipsByRun.get(run.id) ?? []),
        `payroll-${run.month}.${extension}`,
      );
    },
  ],
  [
    'GET',
    /^\/payroll\/runs\/(\d+)\/payslips$/,
    (req, config) => {
      const run = runList.find(
        (entry) => entry.id === Number(/\/runs\/(\d+)\/payslips$/.exec(req.path)?.[1]),
      );
      if (!run) return failure(config, 404, 'Payroll not found.');

      const body = (payslipsByRun.get(run.id) ?? [])
        .map(payslipText)
        .join('\n\n---\n\n');

      return fileResponse(config, body, `payslips-${run.month}.pdf`);
    },
  ],

  // --- payroll: payslips ---
  [
    'GET',
    /^\/payroll\/payslips\/(\d+)\/pdf$/,
    (req, config) => {
      const id = Number(/\/payslips\/(\d+)\/pdf$/.exec(req.path)?.[1]);
      const slip = allPayslips().find((entry) => entry.id === id);
      if (!slip) return failure(config, 404, 'Payslip not found.');

      return fileResponse(
        config,
        payslipText(slip),
        `payslip-${slip.employee_code}-${slip.month}.pdf`,
      );
    },
  ],
  [
    'GET',
    /^\/payroll\/payslips\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/payslips\/(\d+)$/.exec(req.path)?.[1]);
      const slip = allPayslips().find((entry) => entry.id === id);
      return slip ? ok(config, { data: slip }) : failure(config, 404, 'Payslip not found.');
    },
  ],

  // --- payroll: statutory ---
  [
    'GET',
    /^\/payroll\/statutory\/export$/,
    (req, config) => {
      const month = req.params.get('month') ?? TODAY_DATE().slice(0, 7);
      const scheme = req.params.get('scheme') === 'esi' ? 'esi' : 'pf';

      return fileResponse(config, registerCsv(month, scheme), `${scheme}-return-${month}.xlsx`);
    },
  ],
  [
    'GET',
    /^\/payroll\/statutory$/,
    (req, config) => {
      const month = req.params.get('month') ?? TODAY_DATE().slice(0, 7);
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return unprocessable(config, { month: ['Choose a month.'] });
      }

      return ok(config, { data: buildRegister(month) });
    },
  ],
  ['GET', /^\/payroll\/summary$/, (_req, config) => ok(config, { data: payrollSummary() })],

  // --- hostel: blocks ---
  [
    'GET',
    /^\/hostel\/hostels$/,
    (_req, config) => ok(config, { data: hostelList.map(hydrateHostel) }),
  ],
  [
    'POST',
    /^\/hostel\/hostels$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim().toUpperCase();
      if (hostelList.some((hostel) => hostel.code === code)) {
        return unprocessable(config, { code: ['That block code is already in use.'] });
      }

      const created: StoredHostel = {
        id: nextHostelId++,
        name: String(req.body.name ?? '').trim(),
        code,
        type: (req.body.type as Hostel['type']) ?? 'boys',
        address: (req.body.address as string | null) ?? null,
        warden_id: req.body.warden_id === null ? null : Number(req.body.warden_id),
        mess_charge: Number(req.body.mess_charge) || 0,
        is_active: req.body.is_active !== false,
        created_at: new Date().toISOString(),
      };

      hostelList = [...hostelList, created];
      return ok(config, { data: hydrateHostel(created) }, 201);
    },
  ],
  [
    'PUT',
    /^\/hostel\/hostels\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/hostels\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findHostel(id);
      if (!existing) return failure(config, 404, 'Hostel not found.');

      const code = String(req.body.code ?? existing.code).trim().toUpperCase();
      if (hostelList.some((hostel) => hostel.code === code && hostel.id !== id)) {
        return unprocessable(config, { code: ['That block code is already in use.'] });
      }

      const type = (req.body.type as Hostel['type']) ?? existing.type;

      // Flipping a block's gender would leave its residents in the wrong one.
      if (type !== existing.type) {
        const residents = roomsOfHostel(id)
          .flatMap((room) => bedsOfRoom(room.id))
          .filter((bed) => occupantOf(bed.id) !== undefined).length;

        if (residents > 0) {
          return unprocessable(config, {
            type: [`${residents} students are resident — vacate them before changing this.`],
          });
        }
      }

      Object.assign(existing, {
        name: String(req.body.name ?? existing.name).trim(),
        code,
        type,
        address: (req.body.address as string | null) ?? null,
        warden_id: req.body.warden_id === null ? null : Number(req.body.warden_id),
        mess_charge: Number(req.body.mess_charge) || 0,
        is_active: req.body.is_active !== false,
      });

      return ok(config, { data: hydrateHostel(existing) });
    },
  ],
  [
    'DELETE',
    /^\/hostel\/hostels\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/hostels\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findHostel(id);
      if (!existing) return failure(config, 404, 'Hostel not found.');

      const rooms = roomsOfHostel(id).length;
      if (rooms > 0) return failure(config, 409, `${rooms} rooms are in this block.`);

      hostelList = hostelList.filter((hostel) => hostel.id !== id);
      return ok(config, null, 204);
    },
  ],
  [
    'GET',
    /^\/hostel\/hostels\/(\d+)\/occupancy$/,
    (req, config) => {
      const hostel = findHostel(Number(/\/hostels\/(\d+)\/occupancy$/.exec(req.path)?.[1]));
      if (!hostel) return failure(config, 404, 'Hostel not found.');

      return fileResponse(
        config,
        occupancyText(hostel),
        `hostel-${hostel.code.toLowerCase()}-occupancy.pdf`,
      );
    },
  ],

  // --- hostel: rooms ---
  ['GET', /^\/hostel\/rooms$/, (req, config) => ok(config, listHostelRooms(req.params))],
  [
    'POST',
    /^\/hostel\/rooms$/,
    (req, config) => {
      const hostelId = Number(req.body.hostel_id);
      const hostel = findHostel(hostelId);
      if (!hostel) return unprocessable(config, { hostel_id: ['Choose a hostel.'] });

      const roomNo = String(req.body.room_no ?? '').trim().toUpperCase();
      if (
        hostelRoomList.some((room) => room.hostel_id === hostelId && room.room_no === roomNo)
      ) {
        return unprocessable(config, {
          room_no: [`${hostel.name} already has a room ${roomNo}.`],
        });
      }

      const created: StoredHostelRoom = {
        id: nextHostelRoomId++,
        hostel_id: hostelId,
        room_no: roomNo,
        floor: Number(req.body.floor) || 0,
        type: (req.body.type as RoomType) ?? 'double',
        monthly_rent: Number(req.body.monthly_rent) || 0,
        has_ac: req.body.has_ac === true,
        has_attached_bath: req.body.has_attached_bath !== false,
        status: (req.body.status as StoredHostelRoom['status']) ?? 'available',
        notes: (req.body.notes as string | null) ?? null,
        created_at: new Date().toISOString(),
      };

      hostelRoomList = [...hostelRoomList, created];
      return ok(config, { data: hydrateRoomDetail(created) }, 201);
    },
  ],
  [
    'GET',
    /^\/hostel\/rooms\/(\d+)$/,
    (req, config) => {
      const room = findHostelRoom(Number(/\/rooms\/(\d+)$/.exec(req.path)?.[1]));
      return room
        ? ok(config, { data: hydrateRoomDetail(room) })
        : failure(config, 404, 'Room not found.');
    },
  ],
  [
    'PUT',
    /^\/hostel\/rooms\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/rooms\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findHostelRoom(id);
      if (!existing) return failure(config, 404, 'Room not found.');

      const hostelId = Number(req.body.hostel_id) || existing.hostel_id;
      const roomNo = String(req.body.room_no ?? existing.room_no).trim().toUpperCase();

      if (
        hostelRoomList.some(
          (room) => room.hostel_id === hostelId && room.room_no === roomNo && room.id !== id,
        )
      ) {
        return unprocessable(config, { room_no: ['That room number is already used here.'] });
      }

      // Moving a furnished room to another block would move its residents
      // into a hostel of the wrong gender.
      if (hostelId !== existing.hostel_id && bedsOfRoom(id).length > 0) {
        return unprocessable(config, {
          hostel_id: ['A room with beds cannot be moved to another block.'],
        });
      }

      Object.assign(existing, {
        hostel_id: hostelId,
        room_no: roomNo,
        floor: Number(req.body.floor) || 0,
        type: (req.body.type as RoomType) ?? existing.type,
        monthly_rent: Number(req.body.monthly_rent) || 0,
        has_ac: req.body.has_ac === true,
        has_attached_bath: req.body.has_attached_bath !== false,
        status: (req.body.status as StoredHostelRoom['status']) ?? existing.status,
        notes: (req.body.notes as string | null) ?? null,
      });

      return ok(config, { data: hydrateRoomDetail(existing) });
    },
  ],
  [
    'DELETE',
    /^\/hostel\/rooms\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/rooms\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findHostelRoom(id);
      if (!existing) return failure(config, 404, 'Room not found.');

      const occupied = bedsOfRoom(id).filter((bed) => occupantOf(bed.id)).length;
      if (occupied > 0) {
        return failure(config, 409, `${occupied} beds in this room are occupied.`);
      }

      hostelRoomList = hostelRoomList.filter((room) => room.id !== id);
      bedList = bedList.filter((bed) => bed.room_id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- hostel: beds ---
  [
    'POST',
    /^\/hostel\/rooms\/(\d+)\/beds$/,
    (req, config) => {
      const roomId = Number(/\/rooms\/(\d+)\/beds$/.exec(req.path)?.[1]);
      const room = findHostelRoom(roomId);
      if (!room) return failure(config, 404, 'Room not found.');

      const quantity = Number(req.body.quantity) || 0;
      if (quantity < 1) return unprocessable(config, { quantity: ['Add at least one bed.'] });

      if (bedsOfRoom(roomId).length + quantity > MAX_BEDS_PER_ROOM_MOCK) {
        return unprocessable(config, {
          quantity: [`A room cannot hold more than ${MAX_BEDS_PER_ROOM_MOCK} beds.`],
        });
      }

      for (let index = 0; index < quantity; index += 1) {
        bedList.push({
          id: nextBedId++,
          room_id: roomId,
          bed_no: mintBedLabel(roomId),
          status: 'vacant',
          notes: (req.body.notes as string | null) ?? null,
        });
      }

      return ok(config, { data: hydrateRoomDetail(room) }, 201);
    },
  ],
  [
    'PUT',
    /^\/hostel\/rooms\/(\d+)\/beds\/(\d+)$/,
    (req, config) => {
      const roomId = Number(/\/rooms\/(\d+)\/beds/.exec(req.path)?.[1]);
      const bedId = Number(/\/beds\/(\d+)$/.exec(req.path)?.[1]);

      const room = findHostelRoom(roomId);
      const bed = findBed(bedId);
      if (!room || !bed) return failure(config, 404, 'Bed not found.');

      // The status of an occupied bed is the allocation's to change.
      if (occupantOf(bedId)) {
        return failure(config, 409, 'Somebody is in this bed — vacate it first.');
      }

      const bedNo = String(req.body.bed_no ?? bed.bed_no).trim().toUpperCase();
      if (bedsOfRoom(roomId).some((entry) => entry.bed_no === bedNo && entry.id !== bedId)) {
        return unprocessable(config, {
          bed_no: [`Room ${room.room_no} already has a bed ${bedNo}.`],
        });
      }

      Object.assign(bed, {
        bed_no: bedNo,
        status: (req.body.status as StoredBed['status']) ?? bed.status,
        notes: (req.body.notes as string | null) ?? null,
      });

      return ok(config, { data: hydrateRoomDetail(room) });
    },
  ],
  [
    'DELETE',
    /^\/hostel\/rooms\/(\d+)\/beds\/(\d+)$/,
    (req, config) => {
      const roomId = Number(/\/rooms\/(\d+)\/beds/.exec(req.path)?.[1]);
      const bedId = Number(/\/beds\/(\d+)$/.exec(req.path)?.[1]);

      const room = findHostelRoom(roomId);
      const bed = findBed(bedId);
      if (!room || !bed) return failure(config, 404, 'Bed not found.');

      if (occupantOf(bedId)) {
        return failure(config, 409, 'Somebody is in this bed — vacate it first.');
      }

      bedList = bedList.filter((entry) => entry.id !== bedId);
      return ok(config, { data: hydrateRoomDetail(room) });
    },
  ],
  [
    'GET',
    /^\/hostel\/vacancies$/,
    (req, config) => {
      const hostelId = Number(req.params.get('hostel_id'));
      if (!hostelId) return unprocessable(config, { hostel_id: ['Choose a hostel.'] });

      const rooms = roomsOfHostel(hostelId)
        .map(hydrateRoomDetail)
        // Only rooms that could actually take somebody tonight.
        .filter((room) => room.status === 'available' && room.available_beds > 0)
        .sort((left, right) => left.room_no.localeCompare(right.room_no));

      return ok(config, { data: rooms });
    },
  ],

  // --- hostel: allocations ---
  [
    'GET',
    /^\/hostel\/allocations$/,
    (req, config) => ok(config, listHostelAllocations(req.params)),
  ],
  [
    'GET',
    /^\/hostel\/allocations\/export$/,
    (req, config) => {
      const rows = listHostelAllocations(
        new URLSearchParams({ ...Object.fromEntries(req.params), per_page: '1000' }),
      );
      const extension = req.params.get('format') === 'excel' ? 'xlsx' : 'pdf';
      return fileResponse(config, residentsCsv(rows.data), `hostel-residents.${extension}`);
    },
  ],
  [
    'POST',
    /^\/hostel\/allocations$/,
    (req, config) => {
      const studentId = Number(req.body.student_id);
      const bedId = Number(req.body.bed_id);
      const roomId = Number(req.body.room_id);

      const bed = findBed(bedId);
      if (!bed) return failure(config, 404, 'Bed not found.');
      if (bed.room_id !== roomId) {
        return unprocessable(config, { bed_id: ['That bed is not in the chosen room.'] });
      }

      const error = allocationError(studentId, bedId);
      if (error) {
        // A clash with somebody else's bed is a conflict; everything else is
        // a malformed request against a particular field.
        return error.startsWith('Somebody is already')
          ? failure(config, 409, error)
          : unprocessable(config, { student_id: [error] });
      }

      const created: StoredAllocation = {
        id: nextHostelAllocationId++,
        student_id: studentId,
        bed_id: bedId,
        mess_plan: (req.body.mess_plan as MessPlan) ?? 'full',
        allocated_on: String(req.body.allocated_on ?? TODAY_DATE()),
        vacated_on: null,
        reason: null,
      };

      hostelAllocations.push(created);
      return ok(config, { data: hydrateAllocation(created) }, 201);
    },
  ],
  [
    'POST',
    /^\/hostel\/allocations\/(\d+)\/vacate$/,
    (req, config) => {
      const id = Number(/\/allocations\/(\d+)\/vacate$/.exec(req.path)?.[1]);
      const existing = hostelAllocations.find((entry) => entry.id === id);
      if (!existing) return failure(config, 404, 'Allocation not found.');
      if (existing.vacated_on !== null) return failure(config, 409, 'This stay is already closed.');

      const vacatedOn = String(req.body.vacated_on ?? TODAY_DATE());
      if (vacatedOn < existing.allocated_on) {
        return unprocessable(config, {
          vacated_on: ['They cannot leave before they arrived.'],
        });
      }
      if (vacatedOn > TODAY_DATE()) {
        return unprocessable(config, { vacated_on: ['That date is in the future.'] });
      }

      existing.vacated_on = vacatedOn;
      existing.reason = (req.body.reason as string | null) ?? null;

      return ok(config, { data: hydrateAllocation(existing) });
    },
  ],
  [
    'POST',
    /^\/hostel\/allocations\/(\d+)\/transfer$/,
    (req, config) => {
      const id = Number(/\/allocations\/(\d+)\/transfer$/.exec(req.path)?.[1]);
      const existing = hostelAllocations.find((entry) => entry.id === id);
      if (!existing) return failure(config, 404, 'Allocation not found.');
      if (existing.vacated_on !== null) return failure(config, 409, 'This stay is closed.');

      const bedId = Number(req.body.bed_id);
      if (bedId === existing.bed_id) {
        return ok(config, { data: hydrateAllocation(existing) });
      }

      // The same rules as a fresh allocation, minus "already boarding" — they
      // are, and that is the point of a transfer.
      const bed = findBed(bedId);
      if (!bed) return failure(config, 404, 'Bed not found.');
      if (occupantOf(bedId)) return failure(config, 409, 'Somebody is already in that bed.');
      if (bed.status !== 'vacant') return unprocessable(config, { bed_id: [`That bed is ${bed.status}.`] });

      const room = findHostelRoom(bed.room_id);
      const hostel = room ? findHostel(room.hostel_id) : undefined;
      const student = students.find((entry) => entry.id === existing.student_id);

      if (!room || !hostel || !student) return failure(config, 404, 'Bed not found.');
      if (room.status !== 'available') {
        return unprocessable(config, { bed_id: [`Room ${room.room_no} is ${room.status}.`] });
      }
      if (student.gender !== GENDER_FOR_HOSTEL[hostel.type]) {
        return unprocessable(config, {
          bed_id: [`${hostel.name} is a ${hostel.type === 'boys' ? "boys'" : "girls'"} block.`],
        });
      }

      existing.bed_id = bedId;
      return ok(config, { data: hydrateAllocation(existing) });
    },
  ],

  // --- hostel: charges ---
  [
    'GET',
    /^\/hostel\/charges\/summary$/,
    (req, config) => {
      const hostelId = req.params.get('hostel_id')
        ? Number(req.params.get('hostel_id'))
        : undefined;
      return ok(config, { data: buildChargeSummary(hostelId) });
    },
  ],
  [
    'POST',
    /^\/hostel\/charges\/raise$/,
    (req, config) => {
      const hostelId = Number(req.body.hostel_id);
      const month = String(req.body.month ?? '');

      const hostel = findHostel(hostelId);
      if (!hostel) return failure(config, 404, 'Hostel not found.');

      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return unprocessable(config, { month: ['Choose a month.'] });
      }
      if (month > TODAY_DATE().slice(0, 7)) {
        return unprocessable(config, { month: ['That month has not happened yet.'] });
      }

      // Raising the same month twice would charge every resident twice.
      if (raisedMonths.has(`${hostelId}|${month}`)) {
        return failure(config, 409, `${month} has already been raised for ${hostel.name}.`);
      }

      const residents = currentResidents().filter((allocation) => {
        const bed = findBed(allocation.bed_id);
        const room = bed ? findHostelRoom(bed.room_id) : undefined;
        return room?.hostel_id === hostelId;
      });

      if (residents.length === 0) {
        return unprocessable(config, {
          hostel_id: ['Nobody is resident in this block, so there is nothing to raise.'],
        });
      }

      raisedMonths.set(`${hostelId}|${month}`, residents.length);
      for (const allocation of residents) {
        const key = `${hostelId}|__count__${allocation.id}`;
        raisedMonths.set(key, (raisedMonths.get(key) ?? 0) + 1);
      }

      return ok(config, { data: buildChargeSummary(hostelId) });
    },
  ],
  [
    'GET',
    /^\/hostel\/charges$/,
    (req, config) => {
      const hostelId = req.params.get('hostel_id')
        ? Number(req.params.get('hostel_id'))
        : undefined;

      let rows = buildCharges(hostelId);

      const search = (req.params.get('search') ?? '').toLowerCase();
      if (search) {
        rows = rows.filter(
          (charge) =>
            charge.student_name.toLowerCase().includes(search) ||
            charge.admission_no.toLowerCase().includes(search),
        );
      }

      return ok(config, paginate(sortRows(rows, req.params, 'student_name'), req.params, '/hostel/charges'));
    },
  ],

  // --- hostel: roll call ---
  [
    'GET',
    /^\/hostel\/roll-call$/,
    (req, config) => {
      const hostelId = Number(req.params.get('hostel_id'));
      const date = req.params.get('date') ?? TODAY_DATE();
      if (!hostelId) return unprocessable(config, { hostel_id: ['Choose a block.'] });

      const rollCall = buildRollCall(hostelId, date);
      return rollCall ? ok(config, { data: rollCall }) : failure(config, 404, 'Hostel not found.');
    },
  ],
  [
    'POST',
    /^\/hostel\/roll-call$/,
    (req, config) => {
      const hostelId = Number(req.body.hostel_id);
      const date = String(req.body.date ?? '');

      const hostel = findHostel(hostelId);
      if (!hostel) return failure(config, 404, 'Hostel not found.');

      if (date > TODAY_DATE()) {
        return unprocessable(config, { date: ['That night has not happened yet.'] });
      }

      const existing = buildRollCall(hostelId, date);
      if (existing?.is_locked) {
        return failure(config, 409, existing.lock_reason ?? 'This register is closed.');
      }

      const rows = (req.body.entries as Record<string, unknown>[] | undefined) ?? [];
      const residentIds = new Set(residentsOn(hostelId, date).map((entry) => entry.id));
      const errors: Record<string, string[]> = {};

      rows.forEach((row, index) => {
        const allocationId = Number(row.allocation_id);
        const status = String(row.status ?? '');
        const remarks = String(row.remarks ?? '').trim();

        if (!residentIds.has(allocationId)) {
          errors[`entries.${index}.allocation_id`] = [
            'That student was not resident here on this night.',
          ];
          return;
        }
        // Anything but present needs a word about it — the entry somebody is
        // asked about a week later is exactly the one left blank.
        if (status !== 'present' && remarks === '') {
          errors[`entries.${index}.remarks`] = ['Say why.'];
        }
      });

      if (Object.keys(errors).length > 0) return unprocessable(config, errors);

      for (const row of rows) {
        const allocationId = Number(row.allocation_id);
        rollCallMarks.set(rollCallKey(allocationId, date), {
          allocation_id: allocationId,
          date,
          status: row.status as RollCallStatus,
          remarks: (row.remarks as string | null) || null,
          marked_at: new Date().toISOString(),
          marked_by: currentUser?.name ?? 'Warden',
        });
      }

      return ok(config, { data: buildRollCall(hostelId, date) });
    },
  ],
  ['GET', /^\/hostel\/summary$/, (_req, config) => ok(config, { data: hostelSummary() })],

  // --- analytics ---
  // `providers` first, so it is never read as an analysis key.
  [
    'GET',
    /^\/analytics\/providers$/,
    (_req, config) => ok(config, { data: intelligenceProviders() }),
  ],
  [
    'GET',
    /^\/analytics\/([a-z-]+)\/features$/,
    (req, config) => {
      const key = /^\/analytics\/([a-z-]+)\/features$/.exec(req.path)?.[1] ?? '';
      if (!isAnalysisKey(key)) return failure(config, 404, `No analysis called "${key}".`);

      return ok(config, { data: ANALYSIS_BUILDERS[key](req.params).features });
    },
  ],
  [
    'GET',
    /^\/analytics\/([a-z-]+)\/export$/,
    (req, config) => {
      const key = /^\/analytics\/([a-z-]+)\/export$/.exec(req.path)?.[1] ?? '';
      if (!isAnalysisKey(key)) return failure(config, 404, `No analysis called "${key}".`);

      const format = req.params.get('format') === 'excel' ? 'excel' : 'pdf';
      const analysis = ANALYSIS_BUILDERS[key](req.params);

      if (!analysis.cohort || analysis.cohort.members.length === 0) {
        return failure(
          config,
          422,
          analysis.empty_reason ?? 'This analysis has no cohort to export.',
        );
      }

      return fileResponse(
        config,
        cohortFileBody(analysis, format),
        `${key}.${format === 'excel' ? 'xlsx' : 'pdf'}`,
      );
    },
  ],
  [
    'GET',
    /^\/analytics\/([a-z-]+)$/,
    (req, config) => {
      const key = /^\/analytics\/([a-z-]+)$/.exec(req.path)?.[1] ?? '';
      if (!isAnalysisKey(key)) return failure(config, 404, `No analysis called "${key}".`);

      return ok(config, { data: ANALYSIS_BUILDERS[key](req.params) });
    },
  ],

  // --- notifications ---
  // Every one is scoped to the signed-in user; none takes a user id.
  // `unread`, `preferences`, `read-all` and `clear-read` are declared before
  // the `{id}` routes, though `\d+` already keeps them apart.
  [
    'GET',
    /^\/notifications\/unread$/,
    (_req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');
      return ok(config, { data: unreadSummary(currentUser.id) });
    },
  ],
  [
    'GET',
    /^\/notifications\/preferences$/,
    (_req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');
      return ok(config, { data: hydratePreferences(currentUser.id) });
    },
  ],
  [
    'PUT',
    /^\/notifications\/preferences$/,
    (req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');

      const current = preferencesFor(currentUser.id);
      const items = (req.body.items as { type: string; email: boolean; sms: boolean }[]) ?? [];

      for (const item of items) {
        // A type this deployment does not notify about is not a preference —
        // storing it would let a client invent notification kinds.
        if (!(item.type in current.channels)) continue;
        current.channels[item.type] = { email: item.email === true, sms: item.sms === true };
      }

      current.digest_only = req.body.digest_only === true;
      preferencesByUser.set(currentUser.id, current);

      return ok(config, { data: hydratePreferences(currentUser.id) });
    },
  ],
  [
    'POST',
    /^\/notifications\/read-all$/,
    (req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');

      const type = req.body.type as NotificationType | undefined;
      const at = new Date().toISOString();

      for (const entry of notificationList) {
        if (entry.user_id !== currentUser.id) continue;
        if (type && entry.type !== type) continue;
        if (entry.read_at === null) entry.read_at = at;
      }

      return ok(config, { data: unreadSummary(currentUser.id) });
    },
  ],
  [
    'POST',
    /^\/notifications\/clear-read$/,
    (_req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');

      const before = notificationList.length;
      // Only what has been seen. Sweeping up an unread notification would be
      // deleting something the user has not been told.
      notificationList = notificationList.filter(
        (entry) => !(entry.user_id === currentUser!.id && entry.read_at !== null),
      );

      return ok(config, { data: { deleted: before - notificationList.length } });
    },
  ],
  [
    'GET',
    /^\/notifications$/,
    (req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');
      return ok(config, listNotifications(currentUser.id, req.params));
    },
  ],
  [
    'POST',
    /^\/notifications\/(\d+)\/(read|unread)$/,
    (req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');

      const [, rawId, action] = /^\/notifications\/(\d+)\/(read|unread)$/.exec(req.path) ?? [];
      const notification = notificationList.find((entry) => entry.id === Number(rawId));

      // Somebody else's notification is not found, not forbidden — a 403
      // would confirm that the id exists.
      if (!notification || notification.user_id !== currentUser.id) {
        return failure(config, 404, 'Notification not found.');
      }

      notification.read_at = action === 'read' ? new Date().toISOString() : null;
      return ok(config, { data: unreadSummary(currentUser.id) });
    },
  ],
  [
    'DELETE',
    /^\/notifications\/(\d+)$/,
    (req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');

      const id = Number(/^\/notifications\/(\d+)$/.exec(req.path)?.[1]);
      const notification = notificationList.find((entry) => entry.id === id);

      if (!notification || notification.user_id !== currentUser.id) {
        return failure(config, 404, 'Notification not found.');
      }

      notificationList = notificationList.filter((entry) => entry.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- dashboard ---
  [
    'GET',
    /^\/dashboard$/,
    (req, config) => {
      if (!currentUser) return failure(config, 401, 'Unauthenticated.');
      return ok(config, { data: buildDashboard(req.params.get('view')) });
    },
  ],

  // --- reports ---
  // `overview` and `{key}/export` are declared before `{key}` so neither is
  // ever read as a report key.
  [
    'GET',
    /^\/reports\/overview$/,
    (_req, config) => ok(config, { data: buildReportsOverview() }),
  ],
  [
    'GET',
    /^\/reports\/([a-z-]+)\/export$/,
    (req, config) => {
      const key = /^\/reports\/([a-z-]+)\/export$/.exec(req.path)?.[1] ?? '';
      if (!isReportKey(key)) return failure(config, 404, `No report called "${key}".`);

      const format = req.params.get('format') === 'excel' ? 'excel' : 'pdf';
      const result = REPORT_BUILDERS[key](req.params);

      if (result.rows.length === 0) {
        return failure(config, 422, result.empty_reason ?? 'This report has nothing to export.');
      }

      return fileResponse(
        config,
        reportFileBody(result, format),
        `${key}.${format === 'excel' ? 'xlsx' : 'pdf'}`,
      );
    },
  ],
  [
    'GET',
    /^\/reports\/([a-z-]+)$/,
    (req, config) => {
      const key = /^\/reports\/([a-z-]+)$/.exec(req.path)?.[1] ?? '';
      if (!isReportKey(key)) return failure(config, 404, `No report called "${key}".`);

      return ok(config, { data: REPORT_BUILDERS[key](req.params) });
    },
  ],

  // --- leave: types ---
  [
    'GET',
    /^\/leave\/types$/,
    (req, config) => {
      const search = (req.params.get('search') ?? '').trim().toLowerCase();

      const rows = leaveTypes
        .filter(
          (type) =>
            !search ||
            type.name.toLowerCase().includes(search) ||
            type.code.toLowerCase().includes(search),
        )
        .map(hydrateLeaveType);

      if (req.params.get('per_page') === 'all') return ok(config, { data: rows });

      return ok(config, paginate(sortRows(rows, req.params, 'name'), req.params, '/leave/types'));
    },
  ],
  [
    'POST',
    /^\/leave\/types$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim().toUpperCase();
      if (leaveTypes.some((type) => type.code === code)) {
        return unprocessable(config, { code: ['That code is already in use.'] });
      }

      const appliesTo = (req.body.applies_to as LeaveApplicantType[]) ?? [];
      if (appliesTo.length === 0) {
        return unprocessable(config, { applies_to: ['Choose who may apply for it.'] });
      }

      const created: StoredLeaveType = {
        id: nextLeaveTypeId++,
        name: String(req.body.name ?? '').trim(),
        code,
        applies_to: appliesTo,
        annual_quota: req.body.annual_quota === null ? null : Number(req.body.annual_quota),
        is_paid: req.body.is_paid !== false,
        requires_document: req.body.requires_document === true,
        allows_backdated: req.body.allows_backdated === true,
        max_consecutive_days:
          req.body.max_consecutive_days === null ? null : Number(req.body.max_consecutive_days),
        is_active: req.body.is_active !== false,
        created_at: new Date().toISOString(),
      };

      leaveTypes = [...leaveTypes, created];
      return ok(config, { data: hydrateLeaveType(created) }, 201);
    },
  ],
  [
    'PUT',
    /^\/leave\/types\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/types\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findLeaveType(id);
      if (!existing) return failure(config, 404, 'Leave type not found.');

      const code = String(req.body.code ?? existing.code).trim().toUpperCase();
      if (leaveTypes.some((type) => type.code === code && type.id !== id)) {
        return unprocessable(config, { code: ['That code is already in use.'] });
      }

      const appliesTo = (req.body.applies_to as LeaveApplicantType[]) ?? existing.applies_to;
      if (appliesTo.length === 0) {
        return unprocessable(config, { applies_to: ['Choose who may apply for it.'] });
      }

      Object.assign(existing, {
        name: String(req.body.name ?? existing.name).trim(),
        code,
        applies_to: appliesTo,
        annual_quota: req.body.annual_quota === null ? null : Number(req.body.annual_quota),
        is_paid: req.body.is_paid !== false,
        requires_document: req.body.requires_document === true,
        allows_backdated: req.body.allows_backdated === true,
        max_consecutive_days:
          req.body.max_consecutive_days === null ? null : Number(req.body.max_consecutive_days),
        is_active: req.body.is_active !== false,
      });

      return ok(config, { data: hydrateLeaveType(existing) });
    },
  ],
  [
    'DELETE',
    /^\/leave\/types\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/types\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findLeaveType(id);
      if (!existing) return failure(config, 404, 'Leave type not found.');

      const used = leaveApplications.filter((entry) => entry.leave_type_id === id).length;
      if (used > 0) {
        return failure(
          config,
          409,
          `${used} applications use this type. Turn it off instead of deleting it.`,
        );
      }

      leaveTypes = leaveTypes.filter((type) => type.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- leave: applications ---
  // `preview` and `export` are declared before the `:id` route, though the
  // pattern's `\d+` already keeps them apart.
  [
    'GET',
    /^\/leave\/applications\/preview$/,
    (req, config) => {
      const from = String(req.params.get('from_date') ?? TODAY_DATE());
      const to = String(req.params.get('to_date') ?? from);
      const type = (req.params.get('applicant_type') as LeaveApplicantType) ?? 'student';
      const portion = (req.params.get('day_portion') as DayPortion) ?? 'full';

      return ok(config, { data: leaveDaysFor(from, to, portion, type) });
    },
  ],
  [
    'GET',
    /^\/leave\/applications\/export$/,
    (req, config) => {
      const rows = listLeaveApplications(
        new URLSearchParams({ ...Object.fromEntries(req.params), per_page: '1000' }),
      ).data;

      return fileResponse(
        config,
        leaveRegisterText(rows),
        `leave-register.${req.params.get('format') === 'excel' ? 'xlsx' : 'pdf'}`,
      );
    },
  ],
  ['GET', /^\/leave\/applications$/, (req, config) => ok(config, listLeaveApplications(req.params))],
  [
    'GET',
    /^\/leave\/applications\/(\d+)$/,
    (req, config) => {
      const application = findLeaveApplication(
        Number(/\/applications\/(\d+)$/.exec(req.path)?.[1]),
      );
      if (!application) return failure(config, 404, 'Application not found.');

      return ok(config, { data: hydrateLeaveApplication(application) });
    },
  ],
  [
    'POST',
    /^\/leave\/applications$/,
    (req, config) => {
      const applicantType = req.body.applicant_type as LeaveApplicantType;
      const applicantId = Number(req.body.applicant_id);
      const from = String(req.body.from_date ?? '');
      const to = String(req.body.to_date ?? from);
      const portion = (req.body.day_portion as DayPortion) ?? 'full';

      const person = leaveApplicant(applicantType, applicantId);
      if (!person) return unprocessable(config, { applicant_id: ['Choose who this is for.'] });

      const leaveType = findLeaveType(Number(req.body.leave_type_id));
      if (!leaveType || !leaveType.is_active) {
        return unprocessable(config, { leave_type_id: ['Choose a leave type.'] });
      }

      if (!leaveType.applies_to.includes(applicantType)) {
        return unprocessable(config, {
          leave_type_id: [`${leaveType.name} does not apply to this kind of applicant.`],
        });
      }

      if (to < from) {
        return unprocessable(config, { to_date: ['It cannot end before it starts.'] });
      }

      if (portion !== 'full' && from !== to) {
        return unprocessable(config, { day_portion: ['A half day applies to a single date.'] });
      }

      const { days } = leaveDaysFor(from, to, portion, applicantType);
      if (days === 0) {
        return unprocessable(config, {
          from_date: ['Every day of that range is a holiday or a weekend.'],
        });
      }

      const today = TODAY_DATE();

      if (from < today && !leaveType.allows_backdated) {
        return unprocessable(config, {
          from_date: [`${leaveType.name} has to be applied for in advance.`],
        });
      }

      if (daysBetween(from, today) > MAX_BACKDATED_DAYS) {
        return unprocessable(config, {
          from_date: [`Leave cannot be backdated more than ${MAX_BACKDATED_DAYS} days.`],
        });
      }

      if (leaveType.max_consecutive_days !== null && days > leaveType.max_consecutive_days) {
        return unprocessable(config, {
          to_date: [`${leaveType.name} is capped at ${leaveType.max_consecutive_days} consecutive days.`],
        });
      }

      const clash = overlappingLeave(applicantType, applicantId, from, to);
      if (clash) {
        return failure(
          config,
          409,
          `${person.person_name} already has leave from ${clash.from_date} to ${clash.to_date}.`,
        );
      }

      // Pending days count against the balance, so ten affordable-looking
      // requests cannot add up to an unaffordable one.
      const entitlement = leaveEntitlements(applicantType, applicantId).find(
        (entry) => entry.leave_type_id === leaveType.id,
      );

      if (entitlement?.available !== null && entitlement !== undefined && days > entitlement.available) {
        return unprocessable(config, {
          leave_type_id: [
            `Only ${entitlement.available} days of ${leaveType.name} remain and this asks for ${days}.`,
          ],
        });
      }

      const created: StoredLeaveApplication = {
        id: nextLeaveApplicationId++,
        applicant_type: applicantType,
        applicant_id: applicantId,
        leave_type_id: leaveType.id,
        from_date: from,
        to_date: to,
        day_portion: portion,
        reason: String(req.body.reason ?? '').trim(),
        document_name: (req.body.document_name as string | null) ?? null,
        status: 'pending',
        applied_at: new Date().toISOString(),
        applied_by: currentUser?.name ?? null,
        reviewed_at: null,
        reviewed_by: null,
        review_note: null,
      };

      leaveApplications = [...leaveApplications, created];
      return ok(config, { data: hydrateLeaveApplication(created) }, 201);
    },
  ],
  [
    'POST',
    /^\/leave\/applications\/(\d+)\/review$/,
    (req, config) => {
      const id = Number(/\/applications\/(\d+)\/review$/.exec(req.path)?.[1]);
      const application = findLeaveApplication(id);
      if (!application) return failure(config, 404, 'Application not found.');

      const decision = req.body.decision as LeaveStatus;
      if (decision !== 'approved' && decision !== 'rejected') {
        return unprocessable(config, { decision: ['Approve or reject?'] });
      }

      if (!canLeaveTransition(application.status, decision)) {
        return failure(
          config,
          409,
          `This application is ${application.status} and cannot be decided again.`,
        );
      }

      const note = ((req.body.note as string | null) ?? '').trim();
      if (decision === 'rejected' && note === '') {
        return unprocessable(config, { note: ['Say why it is being refused.'] });
      }

      // Nobody grants their own leave, however senior they are.
      const applicantEmail = leaveApplicantEmail(
        application.applicant_type,
        application.applicant_id,
      );
      if (currentUser && applicantEmail && currentUser.email === applicantEmail) {
        return failure(config, 403, 'You cannot decide your own leave application.');
      }

      Object.assign(application, {
        status: decision,
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser?.name ?? 'Office',
        review_note: note || null,
      });

      return ok(config, { data: hydrateLeaveApplication(application) });
    },
  ],
  [
    'POST',
    /^\/leave\/applications\/(\d+)\/withdraw$/,
    (req, config) => {
      const id = Number(/\/applications\/(\d+)\/withdraw$/.exec(req.path)?.[1]);
      const application = findLeaveApplication(id);
      if (!application) return failure(config, 404, 'Application not found.');

      if (!canLeaveTransition(application.status, 'withdrawn')) {
        return failure(
          config,
          409,
          `An application that is ${application.status} cannot be withdrawn.`,
        );
      }

      Object.assign(application, { status: 'withdrawn' });
      return ok(config, { data: hydrateLeaveApplication(application) });
    },
  ],
  [
    'POST',
    /^\/leave\/applications\/(\d+)\/cancel$/,
    (req, config) => {
      const id = Number(/\/applications\/(\d+)\/cancel$/.exec(req.path)?.[1]);
      const application = findLeaveApplication(id);
      if (!application) return failure(config, 404, 'Application not found.');

      if (!canLeaveTransition(application.status, 'cancelled')) {
        return failure(
          config,
          409,
          `Only approved leave can be cancelled; this one is ${application.status}.`,
        );
      }

      // Once the first day has passed the person was either there or not, and
      // a record saying otherwise is a record that lies.
      if (application.from_date <= TODAY_DATE()) {
        return failure(config, 409, 'This leave has already begun and cannot be cancelled.');
      }

      const reason = String(req.body.reason ?? '').trim();
      if (reason === '') {
        return unprocessable(config, { reason: ['Say why the approval is being undone.'] });
      }

      Object.assign(application, {
        status: 'cancelled',
        reviewed_at: new Date().toISOString(),
        reviewed_by: currentUser?.name ?? 'Office',
        review_note: reason,
      });

      return ok(config, { data: hydrateLeaveApplication(application) });
    },
  ],
  [
    'DELETE',
    /^\/leave\/applications\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/applications\/(\d+)$/.exec(req.path)?.[1]);
      const application = findLeaveApplication(id);
      if (!application) return failure(config, 404, 'Application not found.');

      // Approved leave that has been taken is the record of an absence.
      if (application.status === 'approved' && application.from_date <= TODAY_DATE()) {
        return failure(
          config,
          409,
          'This leave has been taken. Its record cannot be deleted.',
        );
      }

      leaveApplications = leaveApplications.filter((entry) => entry.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- leave: balances ---
  ['GET', /^\/leave\/balances$/, (req, config) => ok(config, listLeaveBalances(req.params))],
  [
    'GET',
    /^\/leave\/balances\/(student|teacher|staff)\/(\d+)$/,
    (req, config) => {
      const [, type, id] = /\/balances\/(student|teacher|staff)\/(\d+)$/.exec(req.path) ?? [];
      const balance = buildLeaveBalance(type as LeaveApplicantType, Number(id));
      if (!balance) return failure(config, 404, 'That person is not on the roster.');

      return ok(config, { data: balance });
    },
  ],

  // --- leave: reports ---
  [
    'GET',
    /^\/leave\/reports\/usage\/export$/,
    (req, config) => {
      const report = buildLeaveReport(
        String(req.params.get('from') ?? TODAY_DATE()),
        String(req.params.get('to') ?? TODAY_DATE()),
        (req.params.get('applicant_type') as LeaveApplicantType | null) ?? null,
      );

      return fileResponse(
        config,
        leaveUsageText(report),
        `leave-usage.${req.params.get('format') === 'excel' ? 'xlsx' : 'pdf'}`,
      );
    },
  ],
  [
    'GET',
    /^\/leave\/reports\/usage$/,
    (req, config) =>
      ok(config, {
        data: buildLeaveReport(
          String(req.params.get('from') ?? TODAY_DATE()),
          String(req.params.get('to') ?? TODAY_DATE()),
          (req.params.get('applicant_type') as LeaveApplicantType | null) ?? null,
        ),
      }),
  ],
  [
    'GET',
    /^\/leave\/reports\/away$/,
    (req, config) =>
      ok(config, {
        data: buildAwayToday((req.params.get('applicant_type') as LeaveApplicantType | null) ?? null),
      }),
  ],
  ['GET', /^\/leave\/summary$/, (_req, config) => ok(config, { data: buildLeaveSummary() })],

  // --- transport: vehicles ---
  ['GET', /^\/transport\/vehicles$/, (req, config) => ok(config, listVehicles(req.params))],
  [
    'GET',
    /^\/transport\/vehicles\/export$/,
    (req, config) => {
      const rows = listVehicles(
        new URLSearchParams({ ...Object.fromEntries(req.params), per_page: '500' }),
      );
      const extension = req.params.get('format') === 'excel' ? 'xlsx' : 'pdf';
      return fileResponse(config, fleetCsv(rows.data), `transport-fleet.${extension}`);
    },
  ],
  [
    'POST',
    /^\/transport\/vehicles$/,
    (req, config) => {
      const registration = String(req.body.registration_no ?? '').toUpperCase();
      if (vehicleList.some((vehicle) => vehicle.registration_no === registration)) {
        return unprocessable(config, {
          registration_no: ['That registration is already on the fleet.'],
        });
      }

      const driverError = driverAssignmentError(
        req.body.driver_id === null ? null : Number(req.body.driver_id),
        null,
      );
      if (driverError) return unprocessable(config, { driver_id: [driverError] });

      const created: StoredVehicle = {
        id: nextVehicleId++,
        registration_no: registration,
        name: String(req.body.name ?? '').trim(),
        make: (req.body.make as string | null) ?? null,
        model: (req.body.model as string | null) ?? null,
        manufacture_year: (req.body.manufacture_year as number | null) ?? null,
        capacity: Number(req.body.capacity) || 0,
        fuel_type: (req.body.fuel_type as Vehicle['fuel_type']) ?? 'diesel',
        status: (req.body.status as Vehicle['status']) ?? 'active',
        driver_id: req.body.driver_id === null ? null : Number(req.body.driver_id),
        attendant_id: req.body.attendant_id === null ? null : Number(req.body.attendant_id),
        expiries: {
          insurance: (req.body.insurance_expiry as string | null) ?? null,
          fitness: (req.body.fitness_expiry as string | null) ?? null,
          permit: (req.body.permit_expiry as string | null) ?? null,
          pollution: (req.body.pollution_expiry as string | null) ?? null,
        },
        odometer_km: (req.body.odometer_km as number | null) ?? null,
        notes: (req.body.notes as string | null) ?? null,
        created_at: new Date().toISOString(),
      };

      vehicleList = [created, ...vehicleList];
      return ok(config, { data: hydrateVehicle(created) }, 201);
    },
  ],
  [
    'GET',
    /^\/transport\/vehicles\/(\d+)$/,
    (req, config) => {
      const vehicle = findVehicle(Number(/\/vehicles\/(\d+)$/.exec(req.path)?.[1]));
      return vehicle
        ? ok(config, { data: hydrateVehicle(vehicle) })
        : failure(config, 404, 'Bus not found.');
    },
  ],
  [
    'PUT',
    /^\/transport\/vehicles\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/vehicles\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findVehicle(id);
      if (!existing) return failure(config, 404, 'Bus not found.');

      const registration = String(req.body.registration_no ?? existing.registration_no).toUpperCase();
      if (vehicleList.some((vehicle) => vehicle.registration_no === registration && vehicle.id !== id)) {
        return unprocessable(config, {
          registration_no: ['That registration is already on the fleet.'],
        });
      }

      const driverId = req.body.driver_id === null ? null : Number(req.body.driver_id);
      const driverError = driverAssignmentError(driverId, id);
      if (driverError) return unprocessable(config, { driver_id: [driverError] });

      const capacity = Number(req.body.capacity) || existing.capacity;
      const route = routeOfVehicle(id);
      if (route) {
        const carrying = routeStudentCount(route.id);
        if (capacity < carrying) {
          return unprocessable(config, {
            capacity: [`${carrying} students are on ${route.name} — this bus would not seat them.`],
          });
        }
      }

      Object.assign(existing, {
        registration_no: registration,
        name: String(req.body.name ?? existing.name).trim(),
        make: (req.body.make as string | null) ?? null,
        model: (req.body.model as string | null) ?? null,
        manufacture_year: (req.body.manufacture_year as number | null) ?? null,
        capacity,
        fuel_type: (req.body.fuel_type as Vehicle['fuel_type']) ?? existing.fuel_type,
        status: (req.body.status as Vehicle['status']) ?? existing.status,
        driver_id: driverId,
        attendant_id: req.body.attendant_id === null ? null : Number(req.body.attendant_id),
        expiries: {
          insurance: (req.body.insurance_expiry as string | null) ?? null,
          fitness: (req.body.fitness_expiry as string | null) ?? null,
          permit: (req.body.permit_expiry as string | null) ?? null,
          pollution: (req.body.pollution_expiry as string | null) ?? null,
        },
        odometer_km: (req.body.odometer_km as number | null) ?? null,
        notes: (req.body.notes as string | null) ?? null,
      });

      return ok(config, { data: hydrateVehicle(existing) });
    },
  ],
  [
    'DELETE',
    /^\/transport\/vehicles\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/vehicles\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findVehicle(id);
      if (!existing) return failure(config, 404, 'Bus not found.');

      const route = routeOfVehicle(id);
      if (route) {
        return failure(config, 409, `This bus is running ${route.name}. Take it off first.`);
      }

      vehicleList = vehicleList.filter((vehicle) => vehicle.id !== id);
      // A tracker on a scrapped bus goes back in the drawer, not to nowhere.
      for (const device of gpsDeviceList) {
        if (device.vehicle_id === id) device.vehicle_id = null;
      }

      return ok(config, null, 204);
    },
  ],

  // --- transport: drivers, read from the staff roster ---
  ['GET', /^\/transport\/drivers$/, (_req, config) => ok(config, { data: buildDrivers() })],

  // --- transport: routes ---
  ['GET', /^\/transport\/routes$/, (req, config) => ok(config, listRoutes(req.params))],
  [
    'POST',
    /^\/transport\/routes$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim().toUpperCase();
      if (routeList.some((route) => route.code === code)) {
        return unprocessable(config, { code: ['That route code is already in use.'] });
      }

      const vehicleId = req.body.vehicle_id === null ? null : Number(req.body.vehicle_id);
      const vehicleError = vehicleAssignmentError(vehicleId, null);
      if (vehicleError) return unprocessable(config, { vehicle_id: [vehicleError] });

      const created: StoredRoute = {
        id: nextRouteId++,
        name: String(req.body.name ?? '').trim(),
        code,
        description: (req.body.description as string | null) ?? null,
        vehicle_id: vehicleId,
        distance_km: (req.body.distance_km as number | null) ?? null,
        is_active: req.body.is_active !== false,
        created_at: new Date().toISOString(),
      };

      routeList = [created, ...routeList];
      return ok(config, { data: hydrateRouteDetail(created) }, 201);
    },
  ],
  [
    'GET',
    /^\/transport\/routes\/(\d+)$/,
    (req, config) => {
      const route = findRoute(Number(/\/routes\/(\d+)$/.exec(req.path)?.[1]));
      return route
        ? ok(config, { data: hydrateRouteDetail(route) })
        : failure(config, 404, 'Route not found.');
    },
  ],
  [
    'GET',
    /^\/transport\/routes\/(\d+)\/sheet$/,
    (req, config) => {
      const route = findRoute(Number(/\/routes\/(\d+)\/sheet$/.exec(req.path)?.[1]));
      if (!route) return failure(config, 404, 'Route not found.');

      return fileResponse(config, routeSheetText(route), `route-${route.code.toLowerCase()}.pdf`);
    },
  ],
  [
    'PUT',
    /^\/transport\/routes\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/routes\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findRoute(id);
      if (!existing) return failure(config, 404, 'Route not found.');

      const code = String(req.body.code ?? existing.code).trim().toUpperCase();
      if (routeList.some((route) => route.code === code && route.id !== id)) {
        return unprocessable(config, { code: ['That route code is already in use.'] });
      }

      const vehicleId = req.body.vehicle_id === null ? null : Number(req.body.vehicle_id);
      const vehicleError = vehicleAssignmentError(vehicleId, id);
      if (vehicleError) return unprocessable(config, { vehicle_id: [vehicleError] });

      // A smaller bus cannot take a route that already carries more than it seats.
      if (vehicleId !== null) {
        const vehicle = findVehicle(vehicleId);
        const carrying = routeStudentCount(id);
        if (vehicle && carrying > vehicle.capacity) {
          return unprocessable(config, {
            vehicle_id: [
              `${carrying} students are on this route and ${vehicle.name} seats ${vehicle.capacity}.`,
            ],
          });
        }
      }

      Object.assign(existing, {
        name: String(req.body.name ?? existing.name).trim(),
        code,
        description: (req.body.description as string | null) ?? null,
        vehicle_id: vehicleId,
        distance_km: (req.body.distance_km as number | null) ?? null,
        is_active: req.body.is_active !== false,
      });

      return ok(config, { data: hydrateRouteDetail(existing) });
    },
  ],
  [
    'DELETE',
    /^\/transport\/routes\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/routes\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findRoute(id);
      if (!existing) return failure(config, 404, 'Route not found.');

      const carrying = routeStudentCount(id);
      if (carrying > 0) {
        return failure(config, 409, `${carrying} students are on this route.`);
      }

      routeList = routeList.filter((route) => route.id !== id);
      stopList = stopList.filter((stop) => stop.route_id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- transport: stops ---
  [
    'POST',
    /^\/transport\/routes\/(\d+)\/stops$/,
    (req, config) => {
      const routeId = Number(/\/routes\/(\d+)\/stops$/.exec(req.path)?.[1]);
      const route = findRoute(routeId);
      if (!route) return failure(config, 404, 'Route not found.');

      const pickup = String(req.body.pickup_time ?? '');
      const drop = String(req.body.drop_time ?? '');
      if ((toMinutes(drop) ?? 0) <= (toMinutes(pickup) ?? 0)) {
        return unprocessable(config, {
          drop_time: ['The drop is later in the day than the pickup.'],
        });
      }

      const sequence = Number(req.body.sequence) || stopsOfRoute(routeId).length + 1;
      const orderError = timeOrderError(routeId, sequence, pickup);
      if (orderError) return unprocessable(config, { pickup_time: [orderError] });

      // Everything at or after this position shifts down to make room.
      for (const stop of stopsOfRoute(routeId)) {
        if (stop.sequence >= sequence) stop.sequence += 1;
      }

      stopList.push({
        id: nextStopId++,
        route_id: routeId,
        name: String(req.body.name ?? '').trim(),
        sequence,
        landmark: (req.body.landmark as string | null) ?? null,
        latitude: (req.body.latitude as number | null) ?? null,
        longitude: (req.body.longitude as number | null) ?? null,
        pickup_time: pickup,
        drop_time: drop,
        fare: Number(req.body.fare) || 0,
      });

      resequence(routeId);
      return ok(config, { data: hydrateRouteDetail(route) }, 201);
    },
  ],
  [
    'PUT',
    /^\/transport\/routes\/(\d+)\/stops\/(\d+)$/,
    (req, config) => {
      const routeId = Number(/\/routes\/(\d+)\/stops/.exec(req.path)?.[1]);
      const stopId = Number(/\/stops\/(\d+)$/.exec(req.path)?.[1]);

      const route = findRoute(routeId);
      const stop = findStop(stopId);
      if (!route || !stop) return failure(config, 404, 'Stop not found.');

      const pickup = String(req.body.pickup_time ?? stop.pickup_time);
      const drop = String(req.body.drop_time ?? stop.drop_time);
      if ((toMinutes(drop) ?? 0) <= (toMinutes(pickup) ?? 0)) {
        return unprocessable(config, {
          drop_time: ['The drop is later in the day than the pickup.'],
        });
      }

      const sequence = Number(req.body.sequence) || stop.sequence;
      const orderError = timeOrderError(routeId, sequence, pickup, stopId);
      if (orderError) return unprocessable(config, { pickup_time: [orderError] });

      Object.assign(stop, {
        name: String(req.body.name ?? stop.name).trim(),
        sequence,
        landmark: (req.body.landmark as string | null) ?? null,
        latitude: (req.body.latitude as number | null) ?? null,
        longitude: (req.body.longitude as number | null) ?? null,
        pickup_time: pickup,
        drop_time: drop,
        fare: Number(req.body.fare) || 0,
      });

      resequence(routeId);
      return ok(config, { data: hydrateRouteDetail(route) });
    },
  ],
  [
    'PUT',
    /^\/transport\/routes\/(\d+)\/stops\/(\d+)\/sequence$/,
    (req, config) => {
      const routeId = Number(/\/routes\/(\d+)\/stops/.exec(req.path)?.[1]);
      const stopId = Number(/\/stops\/(\d+)\/sequence$/.exec(req.path)?.[1]);

      const route = findRoute(routeId);
      const stop = findStop(stopId);
      if (!route || !stop) return failure(config, 404, 'Stop not found.');

      const stops = stopsOfRoute(routeId);
      const target = Math.min(Math.max(1, Number(req.body.sequence) || stop.sequence), stops.length);
      if (target === stop.sequence) return ok(config, { data: hydrateRouteDetail(route) });

      /**
       * Moving a stop swaps its times with the one it displaces.
       *
       * The times belong to the position on the run, not to the place — the
       * third stop is picked up third whichever stop that now is. Carrying
       * the times along with the stop would leave the run out of order the
       * moment anything moved.
       */
      const other = stops.find((entry) => entry.sequence === target);
      if (other) {
        const carried = { pickup: stop.pickup_time, drop: stop.drop_time };
        stop.pickup_time = other.pickup_time;
        stop.drop_time = other.drop_time;
        other.pickup_time = carried.pickup;
        other.drop_time = carried.drop;
        other.sequence = stop.sequence;
      }
      stop.sequence = target;

      resequence(routeId);
      return ok(config, { data: hydrateRouteDetail(route) });
    },
  ],
  [
    'DELETE',
    /^\/transport\/routes\/(\d+)\/stops\/(\d+)$/,
    (req, config) => {
      const routeId = Number(/\/routes\/(\d+)\/stops/.exec(req.path)?.[1]);
      const stopId = Number(/\/stops\/(\d+)$/.exec(req.path)?.[1]);

      const route = findRoute(routeId);
      const stop = findStop(stopId);
      if (!route || !stop) return failure(config, 404, 'Stop not found.');

      const boarding = stopStudentCount(stopId);
      if (boarding > 0) {
        return failure(config, 409, `${boarding} students board at this stop.`);
      }

      stopList = stopList.filter((entry) => entry.id !== stopId);
      resequence(routeId);
      return ok(config, { data: hydrateRouteDetail(route) });
    },
  ],

  // --- transport: student assignments ---
  ['GET', /^\/transport\/assignments$/, (req, config) => ok(config, listTransportAssignments(req.params))],
  [
    'POST',
    /^\/transport\/assignments$/,
    (req, config) => {
      const studentId = Number(req.body.student_id);
      const routeId = Number(req.body.route_id);
      const stopId = Number(req.body.stop_id);

      const student = students.find((entry) => entry.id === studentId);
      const route = findRoute(routeId);
      const stop = findStop(stopId);

      if (!student) return failure(config, 404, 'Student not found.');
      if (!route) return failure(config, 404, 'Route not found.');
      if (!stop || stop.route_id !== routeId) {
        return unprocessable(config, { stop_id: ['That stop is not on this route.'] });
      }

      if (!route.is_active) {
        return unprocessable(config, { route_id: ['This route is suspended.'] });
      }

      // Nobody rides twice, and a second seat is a second charge.
      const already = activeTransportAssignments().find((entry) => entry.student_id === studentId);
      if (already) {
        const other = findRoute(already.route_id);
        return failure(
          config,
          409,
          `${student.full_name} is already on ${other?.name ?? 'another route'}.`,
        );
      }

      const vehicle = route.vehicle_id === null ? null : findVehicle(route.vehicle_id);
      if (!vehicle) {
        return unprocessable(config, {
          route_id: ['This route has no bus, so it has no seats to assign.'],
        });
      }

      if (routeStudentCount(routeId) >= vehicle.capacity) {
        return unprocessable(config, {
          route_id: [`${vehicle.name} is full — all ${vehicle.capacity} seats are taken.`],
        });
      }

      const created: StoredAssignment = {
        id: nextTransportAssignmentId++,
        student_id: studentId,
        route_id: routeId,
        stop_id: stopId,
        trip: (req.body.trip as TripType) ?? 'both',
        start_date: String(req.body.start_date ?? TODAY_DATE()),
        end_date: null,
      };

      transportAssignments.push(created);
      return ok(config, { data: hydrateTransportAssignment(created) }, 201);
    },
  ],
  [
    'DELETE',
    /^\/transport\/assignments\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/assignments\/(\d+)$/.exec(req.path)?.[1]);
      const existing = transportAssignments.find((entry) => entry.id === id);
      if (!existing) return failure(config, 404, 'Assignment not found.');

      transportAssignments = transportAssignments.filter((entry) => entry.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- transport: GPS ---
  [
    'GET',
    /^\/transport\/gps\/devices$/,
    (_req, config) => ok(config, { data: gpsDeviceList.map(hydrateGpsDevice) }),
  ],
  [
    'POST',
    /^\/transport\/gps\/devices$/,
    (req, config) => {
      const imei = String(req.body.imei ?? '').trim();
      if (gpsDeviceList.some((device) => device.imei === imei)) {
        return unprocessable(config, { imei: ['That IMEI is already registered.'] });
      }

      const vehicleId = req.body.vehicle_id === null ? null : Number(req.body.vehicle_id);
      const fittedError = trackerFitError(vehicleId, null);
      if (fittedError) return unprocessable(config, { vehicle_id: [fittedError] });

      const created: StoredGpsDevice = {
        id: nextGpsDeviceId++,
        imei,
        sim_number: (req.body.sim_number as string | null) ?? null,
        provider: String(req.body.provider ?? '').trim(),
        vehicle_id: vehicleId,
        installed_on: String(req.body.installed_on ?? TODAY_DATE()),
        // A new device has not reported yet, which is honest rather than online.
        last_ping_minutes_ago: null,
      };

      gpsDeviceList = [created, ...gpsDeviceList];
      return ok(config, { data: hydrateGpsDevice(created) }, 201);
    },
  ],
  [
    'PUT',
    /^\/transport\/gps\/devices\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/devices\/(\d+)$/.exec(req.path)?.[1]);
      const existing = gpsDeviceList.find((device) => device.id === id);
      if (!existing) return failure(config, 404, 'Tracker not found.');

      const imei = String(req.body.imei ?? existing.imei).trim();
      if (gpsDeviceList.some((device) => device.imei === imei && device.id !== id)) {
        return unprocessable(config, { imei: ['That IMEI is already registered.'] });
      }

      const vehicleId = req.body.vehicle_id === null ? null : Number(req.body.vehicle_id);
      const fittedError = trackerFitError(vehicleId, id);
      if (fittedError) return unprocessable(config, { vehicle_id: [fittedError] });

      Object.assign(existing, {
        imei,
        sim_number: (req.body.sim_number as string | null) ?? null,
        provider: String(req.body.provider ?? existing.provider).trim(),
        vehicle_id: vehicleId,
        installed_on: String(req.body.installed_on ?? existing.installed_on),
      });

      return ok(config, { data: hydrateGpsDevice(existing) });
    },
  ],
  [
    'DELETE',
    /^\/transport\/gps\/devices\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/devices\/(\d+)$/.exec(req.path)?.[1]);
      if (!gpsDeviceList.some((device) => device.id === id)) {
        return failure(config, 404, 'Tracker not found.');
      }

      gpsDeviceList = gpsDeviceList.filter((device) => device.id !== id);
      return ok(config, null, 204);
    },
  ],
  ['GET', /^\/transport\/tracking$/, (_req, config) => ok(config, { data: buildPositions() })],
  ['GET', /^\/transport\/summary$/, (_req, config) => ok(config, { data: transportSummary() })],

  // --- library: categories ---
  ['GET', /^\/library\/categories$/, (req, config) => ok(config, listCategories(req.params))],
  [
    'POST',
    /^\/library\/categories$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim().toUpperCase();
      if (categoryList.some((category) => category.code === code)) {
        return unprocessable(config, { code: ['That code is already in use.'] });
      }

      const created: BookCategory = {
        id: nextCategoryId++,
        name: String(req.body.name ?? '').trim(),
        code,
        description: (req.body.description as string | null) ?? null,
        is_active: req.body.is_active !== false,
        books_count: 0,
        created_at: new Date().toISOString(),
      };

      categoryList = [created, ...categoryList];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/library\/categories\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/categories\/(\d+)$/.exec(req.path)?.[1]);
      const existing = categoryList.find((category) => category.id === id);
      if (!existing) return failure(config, 404, 'Category not found.');

      const code = String(req.body.code ?? existing.code).trim().toUpperCase();
      if (categoryList.some((category) => category.code === code && category.id !== id)) {
        return unprocessable(config, { code: ['That code is already in use.'] });
      }

      const updated: BookCategory = {
        ...existing,
        name: String(req.body.name ?? existing.name).trim(),
        code,
        description: (req.body.description as string | null) ?? null,
        is_active: req.body.is_active !== false,
      };

      categoryList = categoryList.map((category) => (category.id === id ? updated : category));
      return ok(config, { data: withCategoryCounts(updated) });
    },
  ],
  [
    'DELETE',
    /^\/library\/categories\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/categories\/(\d+)$/.exec(req.path)?.[1]);
      const existing = categoryList.find((category) => category.id === id);
      if (!existing) return failure(config, 404, 'Category not found.');

      const filed = bookList.filter((book) => book.category_id === id).length;
      if (filed > 0) {
        return failure(config, 409, `${filed} titles are filed under this category.`);
      }

      categoryList = categoryList.filter((category) => category.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- library: books ---
  ['GET', /^\/library\/books$/, (req, config) => ok(config, listBooks(req.params))],
  [
    'GET',
    /^\/library\/books\/export$/,
    (req, config) => {
      const rows = listBooks(new URLSearchParams({ ...Object.fromEntries(req.params), per_page: '1000' }));
      const extension = req.params.get('format') === 'excel' ? 'xlsx' : 'pdf';
      return fileResponse(config, catalogueCsv(rows.data), `library-catalogue.${extension}`);
    },
  ],
  [
    'POST',
    /^\/library\/books$/,
    (req, config) => {
      const category = categoryList.find((entry) => entry.id === Number(req.body.category_id));
      if (!category) return unprocessable(config, { category_id: ['Choose a category.'] });

      const isbn = (req.body.isbn as string | null) ?? null;
      if (isbn && bookList.some((book) => book.isbn === isbn)) {
        return unprocessable(config, { isbn: ['A book with that ISBN is already catalogued.'] });
      }

      const created: Book = {
        id: nextBookId++,
        title: String(req.body.title ?? '').trim(),
        subtitle: (req.body.subtitle as string | null) ?? null,
        author: String(req.body.author ?? '').trim(),
        isbn,
        category_id: category.id,
        category_name: category.name,
        publisher: (req.body.publisher as string | null) ?? null,
        edition: (req.body.edition as string | null) ?? null,
        publication_year: (req.body.publication_year as number | null) ?? null,
        language: String(req.body.language ?? 'English'),
        pages: (req.body.pages as number | null) ?? null,
        price: Number(req.body.price) || 0,
        shelf_no: (req.body.shelf_no as string | null) ?? null,
        description: (req.body.description as string | null) ?? null,
        total_copies: 0,
        available_copies: 0,
        issued_copies: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      bookList = [created, ...bookList];
      return ok(config, { data: withBookDetail(created) }, 201);
    },
  ],
  [
    'GET',
    /^\/library\/books\/(\d+)$/,
    (req, config) => {
      const book = findBook(Number(/\/books\/(\d+)$/.exec(req.path)?.[1]));
      return book ? ok(config, { data: withBookDetail(book) }) : failure(config, 404, 'Book not found.');
    },
  ],
  [
    'PUT',
    /^\/library\/books\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/books\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findBook(id);
      if (!existing) return failure(config, 404, 'Book not found.');

      const category = categoryList.find((entry) => entry.id === Number(req.body.category_id));
      if (!category) return unprocessable(config, { category_id: ['Choose a category.'] });

      const isbn = (req.body.isbn as string | null) ?? null;
      if (isbn && bookList.some((book) => book.isbn === isbn && book.id !== id)) {
        return unprocessable(config, { isbn: ['A book with that ISBN is already catalogued.'] });
      }

      const updated: Book = {
        ...existing,
        title: String(req.body.title ?? existing.title).trim(),
        subtitle: (req.body.subtitle as string | null) ?? null,
        author: String(req.body.author ?? existing.author).trim(),
        isbn,
        category_id: category.id,
        category_name: category.name,
        publisher: (req.body.publisher as string | null) ?? null,
        edition: (req.body.edition as string | null) ?? null,
        publication_year: (req.body.publication_year as number | null) ?? null,
        language: String(req.body.language ?? existing.language),
        pages: (req.body.pages as number | null) ?? null,
        price: Number(req.body.price) || 0,
        shelf_no: (req.body.shelf_no as string | null) ?? null,
        description: (req.body.description as string | null) ?? null,
        updated_at: new Date().toISOString(),
      };

      bookList = bookList.map((book) => (book.id === id ? updated : book));
      return ok(config, { data: withBookDetail(updated) });
    },
  ],
  [
    'DELETE',
    /^\/library\/books\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/books\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findBook(id);
      if (!existing) return failure(config, 404, 'Book not found.');

      const out = copyList.filter((copy) => copy.book_id === id && copy.status === 'issued').length;
      if (out > 0) {
        return failure(config, 409, `${out} copies are still out on loan.`);
      }

      const copyIds = new Set(copyList.filter((copy) => copy.book_id === id).map((copy) => copy.id));
      bookList = bookList.filter((book) => book.id !== id);
      copyList = copyList.filter((copy) => copy.book_id !== id);
      // Loan history goes with the copies — there is nothing left to point at.
      loanList = loanList.filter((loan) => !copyIds.has(loan.copy_id));

      return ok(config, null, 204);
    },
  ],

  // --- library: copies ---
  [
    'GET',
    /^\/library\/copies\/lookup$/,
    (req, config) => {
      const accessionNo = (req.params.get('accession_no') ?? '').toUpperCase();
      const copy = copyList.find((entry) => entry.accession_no === accessionNo);
      if (!copy) return failure(config, 404, `No copy has the accession number ${accessionNo}.`);

      const book = findBook(copy.book_id);
      if (!book) return failure(config, 404, 'Book not found.');

      const loan = openLoanFor(copy.id);

      return ok(config, {
        data: {
          copy: hydrateCopy(copy),
          book: withBookCounts(book),
          loan: loan ? hydrateLoan(loan) : null,
        },
      });
    },
  ],
  [
    'POST',
    /^\/library\/books\/(\d+)\/copies$/,
    (req, config) => {
      const bookId = Number(/\/books\/(\d+)\/copies$/.exec(req.path)?.[1]);
      const book = findBook(bookId);
      if (!book) return failure(config, 404, 'Book not found.');

      const quantity = Number(req.body.quantity) || 0;
      if (quantity < 1) {
        return unprocessable(config, { quantity: ['Add at least one copy.'] });
      }

      for (let index = 0; index < quantity; index += 1) {
        copyList.push({
          id: nextCopyId++,
          book_id: bookId,
          accession_no: mintAccessionNo(book),
          status: 'available',
          condition: (req.body.condition as CopyCondition) ?? 'new',
          acquired_on: String(req.body.acquired_on ?? TODAY()),
          price: Number(req.body.price) || book.price,
          shelf_no: (req.body.shelf_no as string | null) ?? book.shelf_no,
          remarks: (req.body.remarks as string | null) ?? null,
        });
      }

      return ok(config, { data: withBookDetail(book) }, 201);
    },
  ],
  [
    'PUT',
    /^\/library\/books\/(\d+)\/copies\/(\d+)$/,
    (req, config) => {
      const bookId = Number(/\/books\/(\d+)\/copies/.exec(req.path)?.[1]);
      const copyId = Number(/\/copies\/(\d+)$/.exec(req.path)?.[1]);

      const book = findBook(bookId);
      const copy = findCopy(copyId);
      if (!book || !copy) return failure(config, 404, 'Copy not found.');

      const accessionNo = String(req.body.accession_no ?? copy.accession_no).toUpperCase();
      if (copyList.some((entry) => entry.accession_no === accessionNo && entry.id !== copyId)) {
        return unprocessable(config, {
          accession_no: ['That accession number belongs to another copy.'],
        });
      }

      const nextStatus = (req.body.status as BookCopy['status']) ?? copy.status;

      // The status of a copy on loan is the loan's to change, not a form's.
      if (copy.status === 'issued' && nextStatus !== 'issued') {
        return failure(config, 409, 'This copy is out on loan — take the return first.');
      }

      Object.assign(copy, {
        accession_no: accessionNo,
        status: nextStatus,
        condition: (req.body.condition as CopyCondition) ?? copy.condition,
        acquired_on: String(req.body.acquired_on ?? copy.acquired_on),
        price: Number(req.body.price) || copy.price,
        shelf_no: (req.body.shelf_no as string | null) ?? null,
        remarks: (req.body.remarks as string | null) ?? null,
      });

      return ok(config, { data: withBookDetail(book) });
    },
  ],
  [
    'DELETE',
    /^\/library\/books\/(\d+)\/copies\/(\d+)$/,
    (req, config) => {
      const bookId = Number(/\/books\/(\d+)\/copies/.exec(req.path)?.[1]);
      const copyId = Number(/\/copies\/(\d+)$/.exec(req.path)?.[1]);

      const book = findBook(bookId);
      const copy = findCopy(copyId);
      if (!book || !copy) return failure(config, 404, 'Copy not found.');

      if (copy.status === 'issued') {
        return failure(config, 409, 'This copy is out on loan.');
      }

      // The accession number is retired with it and never reused, so the loan
      // history stays readable.
      copyList = copyList.filter((entry) => entry.id !== copyId);
      return ok(config, { data: withBookDetail(book) });
    },
  ],
  [
    'GET',
    /^\/library\/books\/(\d+)\/labels$/,
    (req, config) => {
      const bookId = Number(/\/books\/(\d+)\/labels$/.exec(req.path)?.[1]);
      const book = findBook(bookId);
      if (!book) return failure(config, 404, 'Book not found.');

      const requested = (req.params.get('copy_ids') ?? '')
        .split(',')
        .map(Number)
        .filter(Boolean);

      const copies = copyList.filter(
        (copy) => copy.book_id === bookId && (requested.length === 0 || requested.includes(copy.id)),
      );

      return fileResponse(config, labelsText(book, copies), `barcode-labels-book-${bookId}.pdf`);
    },
  ],

  // --- library: members ---
  [
    'GET',
    /^\/library\/members$/,
    (req, config) => {
      const search = (req.params.get('search') ?? '').trim();
      if (search.length < 2) return ok(config, { data: [] });

      const type = req.params.get('type') as MemberType | null;
      return ok(config, { data: searchMembers(search, type) });
    },
  ],
  [
    'GET',
    /^\/library\/members\/(student|teacher)\/(\d+)$/,
    (req, config) => {
      const match = /\/members\/(student|teacher)\/(\d+)$/.exec(req.path);
      const type = match?.[1] as MemberType;
      const id = Number(match?.[2]);

      const member = buildMember(type, id);
      if (!member) return failure(config, 404, 'Member not found.');

      const loans = loanList
        .filter((loan) => loan.member_type === type && loan.member_id === id)
        .map(hydrateLoan)
        .filter((loan): loan is Loan => loan !== null)
        .sort((left, right) => right.issued_on.localeCompare(left.issued_on));

      return ok(config, { data: { member, loans } });
    },
  ],

  // --- library: circulation ---
  ['GET', /^\/library\/loans$/, (req, config) => ok(config, listLoans(req.params))],
  [
    'GET',
    /^\/library\/loans\/export$/,
    (req, config) => {
      const rows = listLoans(
        new URLSearchParams({ ...Object.fromEntries(req.params), per_page: '1000' }),
      );
      const extension = req.params.get('format') === 'excel' ? 'xlsx' : 'pdf';
      return fileResponse(config, loansCsv(rows.data), `library-loans.${extension}`);
    },
  ],
  [
    'POST',
    /^\/library\/loans$/,
    (req, config) => {
      const copy = findCopy(Number(req.body.copy_id));
      if (!copy) return failure(config, 404, 'Copy not found.');

      if (copy.status !== 'available') {
        const holder = openLoanFor(copy.id);
        const hydrated = holder ? hydrateLoan(holder) : null;
        return failure(
          config,
          409,
          hydrated
            ? `${hydrated.member_name} already has this copy, due back on ${hydrated.due_on}.`
            : 'This copy is not available to lend.',
        );
      }

      const memberType = req.body.member_type as MemberType;
      const memberId = Number(req.body.member_id);
      const member = buildMember(memberType, memberId);
      if (!member) return failure(config, 404, 'Member not found.');

      // The lending policy is enforced here, not on the screen — a client that
      // could disagree with it is a client that will.
      if (!member.can_borrow) {
        return unprocessable(config, { member_id: [member.blocked_reason ?? 'Cannot borrow.'] });
      }

      const dueOn = String(req.body.due_on ?? '');
      if (dueOn <= TODAY()) {
        return unprocessable(config, { due_on: ['The due date has to be in the future.'] });
      }

      const created: StoredLoan = {
        id: nextLoanId++,
        copy_id: copy.id,
        member_type: memberType,
        member_id: memberId,
        issued_on: TODAY(),
        due_on: dueOn,
        returned_on: null,
        is_lost: false,
        renewals: 0,
        frozen_fine: null,
        fine_paid: 0,
        fine_waived: 0,
        issued_by: currentUser?.name ?? 'Library desk',
        received_by: null,
        remarks: (req.body.remarks as string | null) ?? null,
      };

      loanList.push(created);
      copy.status = 'issued';

      return ok(config, { data: hydrateLoan(created) }, 201);
    },
  ],
  [
    'POST',
    /^\/library\/loans\/(\d+)\/return$/,
    (req, config) => {
      const loan = findLoan(Number(/\/loans\/(\d+)\/return$/.exec(req.path)?.[1]));
      if (!loan) return failure(config, 404, 'Loan not found.');
      if (loan.returned_on !== null) return failure(config, 409, 'This loan is already closed.');

      const copy = findCopy(loan.copy_id);
      const book = copy ? findBook(copy.book_id) : undefined;
      if (!copy || !book) return failure(config, 404, 'Copy not found.');

      const condition = String(req.body.condition ?? 'good');
      const isLost = condition === 'lost';

      if (isLost && !String(req.body.remarks ?? '').trim()) {
        return unprocessable(config, { remarks: ['Say what happened to it.'] });
      }

      loan.returned_on = TODAY();
      loan.is_lost = isLost;
      loan.received_by = currentUser?.name ?? 'Library desk';
      loan.remarks = (req.body.remarks as string | null) ?? loan.remarks;

      // Freeze the fine at this moment. A lost book is charged its price; an
      // overdue one is charged what it had accrued by today, and never more.
      loan.frozen_fine = isLost
        ? book.price
        : libraryFineFor(Math.max(0, daysBetween(loan.due_on, loan.returned_on)), book.price);

      if (req.body.collect_fine === true) {
        loan.fine_paid = loan.frozen_fine;
      }

      copy.status = isLost ? 'lost' : condition === 'poor' ? 'damaged' : 'available';
      if (!isLost && condition !== 'poor') {
        copy.condition = condition as CopyCondition;
      }

      return ok(config, { data: hydrateLoan(loan) });
    },
  ],
  [
    'POST',
    /^\/library\/loans\/(\d+)\/renew$/,
    (req, config) => {
      const loan = findLoan(Number(/\/loans\/(\d+)\/renew$/.exec(req.path)?.[1]));
      if (!loan) return failure(config, 404, 'Loan not found.');
      if (loan.returned_on !== null) return failure(config, 409, 'This loan is already closed.');

      if (loan.renewals >= MAX_RENEWALS) {
        return failure(config, 409, `This loan has already been renewed ${MAX_RENEWALS} times.`);
      }
      // An overdue book comes back before it goes out again — otherwise a
      // renewal is a way to make a fine disappear.
      if (overdueDays(loan) > 0) {
        return failure(config, 409, 'An overdue book cannot be renewed. Take the return first.');
      }

      loan.renewals += 1;
      loan.due_on = shiftDate(loan.due_on, RENEWAL_DAYS);
      loan.remarks = (req.body.remarks as string | null) ?? loan.remarks;

      return ok(config, { data: hydrateLoan(loan) });
    },
  ],

  // --- library: fines ---
  [
    'POST',
    /^\/library\/loans\/(\d+)\/fine\/pay$/,
    (req, config) => {
      const loan = findLoan(Number(/\/loans\/(\d+)\/fine\/pay$/.exec(req.path)?.[1]));
      if (!loan) return failure(config, 404, 'Loan not found.');

      const due = fineDueFor(loan);
      if (due <= 0) return failure(config, 409, 'Nothing is outstanding on this loan.');

      const amount = Number(req.body.amount) || 0;
      if (amount <= 0) {
        return unprocessable(config, { amount: ['Enter an amount greater than zero.'] });
      }
      if (toMinor(amount) > toMinor(due)) {
        return unprocessable(config, { amount: [`Only ₹${due} is outstanding.`] });
      }

      loan.fine_paid = fromMinor(toMinor(loan.fine_paid) + toMinor(amount));
      return ok(config, { data: hydrateLoan(loan) });
    },
  ],
  [
    'POST',
    /^\/library\/loans\/(\d+)\/fine\/waive$/,
    (req, config) => {
      const loan = findLoan(Number(/\/loans\/(\d+)\/fine\/waive$/.exec(req.path)?.[1]));
      if (!loan) return failure(config, 404, 'Loan not found.');

      const due = fineDueFor(loan);
      if (due <= 0) return failure(config, 409, 'Nothing is outstanding on this loan.');

      const reason = String(req.body.reason ?? '').trim();
      if (reason.length < 5) {
        return unprocessable(config, { reason: ['Say why the fine is being waived.'] });
      }

      loan.fine_waived = fromMinor(toMinor(loan.fine_waived) + toMinor(due));
      loan.remarks = `Fine waived by ${currentUser?.name ?? 'the library'}: ${reason}`;

      return ok(config, { data: hydrateLoan(loan) });
    },
  ],
  ['GET', /^\/library\/summary$/, (_req, config) => ok(config, { data: librarySummary() })],

  // --- timetable: periods ---
  [
    'GET',
    /^\/timetable\/periods$/,
    (_req, config) => ok(config, { data: periodList.map(withPeriodCounts) }),
  ],
  [
    'POST',
    /^\/timetable\/periods$/,
    (req, config) => {
      const shift = String(req.body.shift ?? 'morning') as Shift;
      const start = String(req.body.start_time ?? '');
      const end = String(req.body.end_time ?? '');

      const minutes = durationBetween(start, end);
      if (minutes === null || minutes <= 0) {
        return unprocessable(config, { end_time: ['The end time must come after the start.'] });
      }

      // Two periods on one shift cannot overlap — a section would be in both.
      const clash = periodsOfShift(shift).find((period) =>
        overlaps({ start, end }, { start: period.start_time, end: period.end_time }),
      );
      if (clash) {
        return failure(
          config,
          409,
          `This overlaps ${clash.name} (${clash.start_time}–${clash.end_time}).`,
        );
      }

      const created: Period = {
        id: nextPeriodId++,
        name: String(req.body.name ?? '').trim(),
        sort_order: Number(req.body.sort_order) || periodsOfShift(shift).length + 1,
        shift,
        start_time: start,
        end_time: end,
        duration_minutes: minutes,
        is_break: req.body.is_break === true,
        slots_count: 0,
        created_at: new Date().toISOString(),
      };

      periodList = [...periodList, created];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/timetable\/periods\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/periods\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findPeriod(id);
      if (!existing) return failure(config, 404, 'Period not found.');

      const shift = String(req.body.shift ?? existing.shift) as Shift;
      const start = String(req.body.start_time ?? existing.start_time);
      const end = String(req.body.end_time ?? existing.end_time);

      const minutes = durationBetween(start, end);
      if (minutes === null || minutes <= 0) {
        return unprocessable(config, { end_time: ['The end time must come after the start.'] });
      }

      const clash = periodsOfShift(shift)
        .filter((period) => period.id !== id)
        .find((period) =>
          overlaps({ start, end }, { start: period.start_time, end: period.end_time }),
        );
      if (clash) {
        return failure(
          config,
          409,
          `This overlaps ${clash.name} (${clash.start_time}–${clash.end_time}).`,
        );
      }

      const inUse = timetableSlots.filter((slot) => slot.period_id === id).length;

      // Turning a taught period into a break would strand its lessons.
      if (req.body.is_break === true && !existing.is_break && inUse > 0) {
        return unprocessable(config, {
          is_break: [`${inUse} lessons are scheduled in this period. Clear them first.`],
        });
      }

      const updated: Period = {
        ...existing,
        name: String(req.body.name ?? existing.name).trim(),
        shift,
        sort_order: Number(req.body.sort_order) || existing.sort_order,
        start_time: start,
        end_time: end,
        duration_minutes: minutes,
        is_break: req.body.is_break === true,
      };

      periodList = periodList.map((period) => (period.id === id ? updated : period));
      return ok(config, { data: withPeriodCounts(updated) });
    },
  ],
  [
    'DELETE',
    /^\/timetable\/periods\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/periods\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findPeriod(id);
      if (!existing) return failure(config, 404, 'Period not found.');

      const inUse = timetableSlots.filter((slot) => slot.period_id === id).length;
      if (inUse > 0) {
        return failure(config, 409, `${inUse} lessons are scheduled in this period.`);
      }

      periodList = periodList.filter((period) => period.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- timetable: rooms ---
  ['GET', /^\/timetable\/rooms$/, (req, config) => ok(config, listRooms(req.params))],
  [
    'POST',
    /^\/timetable\/rooms$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim().toUpperCase();
      if (roomList.some((room) => room.code === code)) {
        return unprocessable(config, { code: ['That room code is already in use.'] });
      }

      const created: Room = {
        id: nextRoomId++,
        name: String(req.body.name ?? '').trim(),
        code,
        type: (req.body.type as Room['type']) ?? 'classroom',
        building: (req.body.building as string | null) ?? null,
        floor: req.body.floor === null ? null : Number(req.body.floor),
        capacity: Number(req.body.capacity) || 0,
        is_active: req.body.is_active !== false,
        allocated_periods: 0,
        utilisation_percent: 0,
        created_at: new Date().toISOString(),
      };

      roomList = [created, ...roomList];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'GET',
    /^\/timetable\/rooms\/(\d+)$/,
    (req, config) => {
      const room = findRoom(Number(/\/rooms\/(\d+)$/.exec(req.path)?.[1]));
      return room ? ok(config, { data: withRoomCounts(room) }) : failure(config, 404, 'Room not found.');
    },
  ],
  [
    'GET',
    /^\/timetable\/rooms\/(\d+)\/grid$/,
    (req, config) => {
      const grid = buildRoomGrid(Number(/\/rooms\/(\d+)\/grid$/.exec(req.path)?.[1]));
      return grid ? ok(config, { data: grid }) : failure(config, 404, 'Room not found.');
    },
  ],
  [
    'PUT',
    /^\/timetable\/rooms\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/rooms\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findRoom(id);
      if (!existing) return failure(config, 404, 'Room not found.');

      const code = String(req.body.code ?? existing.code).trim().toUpperCase();
      if (roomList.some((room) => room.code === code && room.id !== id)) {
        return unprocessable(config, { code: ['That room code is already in use.'] });
      }

      const updated: Room = {
        ...existing,
        name: String(req.body.name ?? existing.name).trim(),
        code,
        type: (req.body.type as Room['type']) ?? existing.type,
        building: (req.body.building as string | null) ?? null,
        floor: req.body.floor === null || req.body.floor === undefined ? null : Number(req.body.floor),
        capacity: Number(req.body.capacity) || existing.capacity,
        is_active: req.body.is_active !== false,
      };

      roomList = roomList.map((room) => (room.id === id ? updated : room));
      return ok(config, { data: withRoomCounts(updated) });
    },
  ],
  [
    'DELETE',
    /^\/timetable\/rooms\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/rooms\/(\d+)$/.exec(req.path)?.[1]);
      const existing = findRoom(id);
      if (!existing) return failure(config, 404, 'Room not found.');

      const allocated = timetableSlots.filter((slot) => slot.room_id === id).length;
      if (allocated > 0) {
        return failure(
          config,
          409,
          `${allocated} periods a week are allocated to this room. Clear them, or mark it unavailable.`,
        );
      }

      roomList = roomList.filter((room) => room.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- timetable: the three views ---
  [
    'GET',
    /^\/timetable\/section$/,
    (req, config) => {
      const classId = Number(req.params.get('class_id'));
      const sectionId = Number(req.params.get('section_id'));
      if (!classId || !sectionId) {
        return unprocessable(config, { section_id: ['Choose a class and section.'] });
      }

      const grid = buildSectionGrid(classId, sectionId);
      return grid ? ok(config, { data: grid }) : failure(config, 404, 'Section not found.');
    },
  ],
  [
    'GET',
    /^\/timetable\/workload$/,
    (_req, config) => ok(config, { data: buildWorkload() }),
  ],
  [
    'GET',
    /^\/timetable\/availability$/,
    (req, config) => {
      const day = Number(req.params.get('day_of_week')) as Weekday;
      const periodId = Number(req.params.get('period_id'));
      if (!periodId) return unprocessable(config, { period_id: ['Choose a period.'] });

      const subjectId = req.params.get('subject_id') ? Number(req.params.get('subject_id')) : null;
      const excludeSlotId = req.params.get('exclude_slot_id')
        ? Number(req.params.get('exclude_slot_id'))
        : null;

      return ok(config, { data: buildAvailability(day, periodId, subjectId, excludeSlotId) });
    },
  ],
  [
    'GET',
    /^\/timetable\/export$/,
    (req, config) => {
      const scope = (req.params.get('scope') ?? 'section') as TimetableScope;
      const id = Number(req.params.get('id'));

      const grid =
        scope === 'teacher'
          ? buildTeacherGrid(id)
          : scope === 'room'
            ? buildRoomGrid(id)
            : (() => {
                const match = everySection().find((entry) => entry.section.id === id);
                return match ? buildSectionGrid(match.schoolClass.id, match.section.id) : null;
              })();

      if (!grid) return failure(config, 404, 'Nothing to export.');

      return fileResponse(config, timetableText(grid), `timetable-${scope}-${id}.pdf`);
    },
  ],
  [
    'GET',
    /^\/timetable\/teachers\/(\d+)$/,
    (req, config) => {
      const grid = buildTeacherGrid(Number(/\/teachers\/(\d+)$/.exec(req.path)?.[1]));
      return grid ? ok(config, { data: grid }) : failure(config, 404, 'Teacher not found.');
    },
  ],

  // --- timetable: writes ---
  [
    'PUT',
    /^\/timetable\/slots$/,
    (req, config) => {
      const classId = Number(req.body.class_id);
      const sectionId = Number(req.body.section_id);
      const day = Number(req.body.day_of_week) as Weekday;
      const periodId = Number(req.body.period_id);
      const subjectId = Number(req.body.subject_id);
      const teacherId = Number(req.body.teacher_id);
      const roomId = req.body.room_id === null || req.body.room_id === undefined
        ? null
        : Number(req.body.room_id);

      const schoolClass = classes.find((entry) => entry.id === classId);
      const section = schoolClass?.sections.find((entry) => entry.id === sectionId);
      if (!section) return failure(config, 404, 'Section not found.');

      const period = findPeriod(periodId);
      if (!period) return failure(config, 404, 'Period not found.');

      if (period.is_break) {
        return unprocessable(config, {
          period_id: [`${period.name} is a break — no lesson can be scheduled in it.`],
        });
      }
      if (period.shift !== section.shift) {
        return unprocessable(config, {
          period_id: [`${period.name} is on the ${period.shift} shift; this section is not.`],
        });
      }
      if (!WEEKDAYS.includes(day)) {
        return unprocessable(config, { day_of_week: ['That is not a working day.'] });
      }

      const subject = subjects.find((entry) => entry.id === subjectId);
      if (!subject) return failure(config, 404, 'Subject not found.');

      const teacher = teachers.find((entry) => entry.id === teacherId);
      if (!teacher) return failure(config, 404, 'Teacher not found.');

      // A teacher who is not on the subject's pivot cannot take it.
      if (!teachesSubject(teacher, subjectId)) {
        return unprocessable(config, {
          teacher_id: [`${teacher.full_name} is not assigned to ${subject.name}.`],
        });
      }

      // The cell is identified by section, day and period — saving it again
      // replaces what is there rather than adding a second lesson to it.
      const existing = timetableSlots.find(
        (slot) =>
          slot.section_id === sectionId &&
          slot.day_of_week === day &&
          slot.period_id === periodId,
      );

      const others = timetableSlots.filter(
        (slot) =>
          slot.day_of_week === day && slot.period_id === periodId && slot.id !== existing?.id,
      );

      const teacherClash = others.find((slot) => slot.teacher_id === teacherId);
      if (teacherClash) {
        return failure(
          config,
          409,
          `${teacher.full_name} is already taking ${busyLabel(teacherClash)} in this period.`,
        );
      }

      if (roomId !== null) {
        const room = findRoom(roomId);
        if (!room) return failure(config, 404, 'Room not found.');

        const roomClash = others.find((slot) => slot.room_id === roomId);
        if (roomClash) {
          return failure(
            config,
            409,
            `${room.name} is already holding ${busyLabel(roomClash)} in this period.`,
          );
        }
      }

      // A teacher's day has a ceiling, and it is a rule schools enforce.
      const sameDay = timetableSlots.filter(
        (slot) =>
          slot.teacher_id === teacherId && slot.day_of_week === day && slot.id !== existing?.id,
      ).length;

      if (sameDay >= MAX_PERIODS_PER_DAY) {
        return unprocessable(config, {
          teacher_id: [
            `${teacher.full_name} already has ${sameDay} periods on ${WEEKDAY_LABELS[day]} — the limit is ${MAX_PERIODS_PER_DAY}.`,
          ],
        });
      }

      if (existing) {
        timetableSlots = timetableSlots.map((slot) =>
          slot.id === existing.id
            ? { ...slot, subject_id: subjectId, teacher_id: teacherId, room_id: roomId }
            : slot,
        );
      } else {
        timetableSlots = [
          ...timetableSlots,
          {
            id: nextSlotId++,
            class_id: classId,
            section_id: sectionId,
            day_of_week: day,
            period_id: periodId,
            subject_id: subjectId,
            teacher_id: teacherId,
            room_id: roomId,
          },
        ];
      }

      return ok(config, { data: buildSectionGrid(classId, sectionId) }, existing ? 200 : 201);
    },
  ],
  [
    'DELETE',
    /^\/timetable\/slots\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/slots\/(\d+)$/.exec(req.path)?.[1]);
      const existing = timetableSlots.find((slot) => slot.id === id);
      if (!existing) return failure(config, 404, 'Lesson not found.');

      timetableSlots = timetableSlots.filter((slot) => slot.id !== id);

      // The section grid is what the caller is looking at, so it is what
      // comes back — a 204 would force a refetch of the thing just changed.
      return ok(config, { data: buildSectionGrid(existing.class_id, existing.section_id) });
    },
  ],

  // --- examinations ---
  ['GET', /^\/exams$/, (req, config) => ok(config, listExams(req.params))],
  [
    'POST',
    /^\/exams$/,
    (req, config) => {
      const created = buildExamFromPayload(nextExamId++, req.body);

      if (created.end_date < created.start_date) {
        return unprocessable(config, { end_date: ['The exam cannot end before it starts.'] });
      }

      examList = [created, ...examList];
      return ok(config, { data: withExamCounts(created) }, 201);
    },
  ],
  [
    'GET',
    /^\/exams\/(\d+)$/,
    (req, config) => {
      const exam = findExam(req.path);
      return exam ? ok(config, { data: withExamCounts(exam) }) : failure(config, 404, 'Exam not found.');
    },
  ],
  [
    'PUT',
    /^\/exams\/(\d+)$/,
    (req, config) => {
      const existing = findExam(req.path);
      if (!existing) return failure(config, 404, 'Exam not found.');

      const patch = buildExamFromPayload(existing.id, req.body);
      if (patch.end_date < patch.start_date) {
        return unprocessable(config, { end_date: ['The exam cannot end before it starts.'] });
      }

      // Narrowing the window would orphan papers that already have marks.
      const outside = existing.papers.filter(
        (paper) => paper.exam_date < patch.start_date || paper.exam_date > patch.end_date,
      );
      if (outside.length > 0) {
        return unprocessable(config, {
          start_date: [
            `${outside.length} paper${outside.length === 1 ? '' : 's'} fall outside the new dates.`,
          ],
        });
      }

      return ok(
        config,
        {
          data: saveExam({
            ...existing,
            ...patch,
            // An edit must not publish the schedule or drop it.
            status: existing.status,
            papers: existing.papers,
            created_at: existing.created_at,
            updated_at: new Date().toISOString(),
          }),
        },
      );
    },
  ],
  [
    'DELETE',
    /^\/exams\/(\d+)$/,
    (req, config) => {
      const existing = findExam(req.path);
      if (!existing) return failure(config, 404, 'Exam not found.');

      if (existing.status === 'published') {
        return failure(config, 409, 'Published results cannot be deleted.');
      }

      examList = examList.filter((entry) => entry.id !== existing.id);
      for (const paper of existing.papers) {
        for (const student of paperRoster(paper)) {
          examMarks.delete(examMarkKey(paper.id, student.id));
        }
      }
      return ok(config, null, 204);
    },
  ],
  [
    'POST',
    /^\/exams\/(\d+)\/publish-schedule$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      if (exam.status !== 'draft') return failure(config, 409, 'The schedule is already published.');
      if (exam.papers.length === 0) {
        return unprocessable(config, { papers: ['Add at least one paper before publishing.'] });
      }

      return ok(config, {
        data: saveExam({ ...exam, status: 'scheduled', updated_at: new Date().toISOString() }),
      });
    },
  ],
  [
    'GET',
    /^\/exams\/(\d+)\/classes$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const ids = [...new Set(exam.papers.map((paper) => paper.class_id))];
      return ok(config, {
        data: ids
          .map((id) => ({ id, name: classes.find((entry) => entry.id === id)?.name ?? 'Class' }))
          .sort((left, right) => left.name.localeCompare(right.name)),
      });
    },
  ],
  [
    'GET',
    /^\/exams\/(\d+)\/schedule\/export$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const body = withExamCounts(exam)
        .papers.map((paper) =>
          [
            paper.exam_date,
            paper.start_time,
            paper.class_name + (paper.section_name ? ` — ${paper.section_name}` : ''),
            paper.subject_name,
            paper.room ?? '',
            `${paper.max_marks} marks`,
          ].join('  '),
        )
        .join('\n');

      return fileResponse(config, `${exam.name}\n\n${body}`, `timetable-${exam.id}.pdf`);
    },
  ],

  // --- exam papers ---
  [
    'POST',
    /^\/exams\/(\d+)\/papers$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const candidate = buildPaperFromPayload(nextPaperId, exam.id, req.body);

      if (candidate.pass_marks > candidate.max_marks) {
        return unprocessable(config, { pass_marks: ['Pass marks cannot exceed the maximum.'] });
      }
      if (candidate.exam_date < exam.start_date || candidate.exam_date > exam.end_date) {
        return unprocessable(config, {
          exam_date: [`The paper must fall between ${exam.start_date} and ${exam.end_date}.`],
        });
      }

      const clash = findClash(exam, candidate);
      if (clash) {
        return failure(
          config,
          409,
          `${clash.class_name} already sits ${clash.subject_name} at ${clash.start_time} that day.`,
        );
      }

      nextPaperId += 1;
      saveExam({ ...exam, papers: [...exam.papers, candidate] });
      return ok(config, { data: withPaperCounts(candidate) }, 201);
    },
  ],
  [
    'PUT',
    /^\/exams\/(\d+)\/papers\/(\d+)$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const existing = findPaper(exam, req.path);
      if (!existing) return failure(config, 404, 'Paper not found.');

      const candidate = { ...buildPaperFromPayload(existing.id, exam.id, req.body) };

      if (candidate.pass_marks > candidate.max_marks) {
        return unprocessable(config, { pass_marks: ['Pass marks cannot exceed the maximum.'] });
      }
      if (candidate.exam_date < exam.start_date || candidate.exam_date > exam.end_date) {
        return unprocessable(config, {
          exam_date: [`The paper must fall between ${exam.start_date} and ${exam.end_date}.`],
        });
      }

      // Lowering the maximum below a mark already awarded would invalidate it.
      const entered = paperRoster(existing)
        .map((student) => markOf(existing.id, student.id)?.marks_obtained)
        .filter((marks): marks is number => typeof marks === 'number');

      if (entered.length > 0 && Math.max(...entered) > candidate.max_marks) {
        return unprocessable(config, {
          max_marks: [`A mark of ${Math.max(...entered)} has already been awarded on this paper.`],
        });
      }

      const clash = findClash(exam, candidate, existing.id);
      if (clash) {
        return failure(
          config,
          409,
          `${clash.class_name} already sits ${clash.subject_name} at ${clash.start_time} that day.`,
        );
      }

      saveExam({
        ...exam,
        papers: exam.papers.map((paper) => (paper.id === existing.id ? candidate : paper)),
      });
      return ok(config, { data: withPaperCounts(candidate) });
    },
  ],
  [
    'DELETE',
    /^\/exams\/(\d+)\/papers\/(\d+)$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const existing = findPaper(exam, req.path);
      if (!existing) return failure(config, 404, 'Paper not found.');

      if (withPaperCounts(existing).marks_entered > 0) {
        return failure(config, 409, 'Marks have been entered for this paper.');
      }

      saveExam({ ...exam, papers: exam.papers.filter((paper) => paper.id !== existing.id) });
      return ok(config, null, 204);
    },
  ],

  // --- marks ---
  [
    'GET',
    /^\/exams\/(\d+)\/papers\/(\d+)\/marks$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const paper = findPaper(exam, req.path);
      return paper
        ? ok(config, buildPaperMarks(paper))
        : failure(config, 404, 'Paper not found.');
    },
  ],
  [
    'POST',
    /^\/exams\/(\d+)\/papers\/(\d+)\/marks$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const paper = findPaper(exam, req.path);
      if (!paper) return failure(config, 404, 'Paper not found.');

      const rows = (req.body.marks as Record<string, unknown>[] | undefined) ?? [];
      const rosterIds = new Set(paperRoster(paper).map((student) => student.id));
      const errors: Record<string, string[]> = {};

      rows.forEach((row, index) => {
        const marks = row.marks_obtained === null ? null : Number(row.marks_obtained);
        const isAbsent = row.is_absent === true;

        if (!rosterIds.has(Number(row.student_id))) {
          errors[`marks.${index}.student_id`] = ['This student does not sit this paper.'];
          return;
        }
        if (marks !== null && isAbsent) {
          errors[`marks.${index}.marks_obtained`] = ['An absent student cannot have marks.'];
          return;
        }
        if (marks !== null && (Number.isNaN(marks) || marks < 0)) {
          errors[`marks.${index}.marks_obtained`] = ['Enter a mark of zero or more.'];
          return;
        }
        if (marks !== null && marks > paper.max_marks) {
          errors[`marks.${index}.marks_obtained`] = [
            `This paper is out of ${paper.max_marks}.`,
          ];
        }
      });

      if (Object.keys(errors).length > 0) return unprocessable(config, errors);

      for (const row of rows) {
        const studentId = Number(row.student_id);
        const isAbsent = row.is_absent === true;
        const marks = isAbsent || row.marks_obtained === null ? null : Number(row.marks_obtained);

        if (marks === null && !isAbsent) {
          // Clearing a mark removes the record, rather than storing a zero.
          examMarks.delete(examMarkKey(paper.id, studentId));
          continue;
        }

        examMarks.set(examMarkKey(paper.id, studentId), {
          marks_obtained: marks,
          is_absent: isAbsent,
          remarks: (row.remarks as string | null) ?? null,
        });
      }

      // An exam being marked has been sat.
      if (exam.status === 'scheduled' || exam.status === 'ongoing') {
        saveExam({ ...exam, status: 'completed', updated_at: new Date().toISOString() });
      }

      return ok(config, buildPaperMarks(paper));
    },
  ],

  // --- results ---
  [
    'GET',
    /^\/exams\/(\d+)\/results$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const classId = Number(req.params.get('class_id'));
      if (!classId) return unprocessable(config, { class_id: ['Choose a class.'] });

      const sectionId = req.params.get('section_id')
        ? Number(req.params.get('section_id'))
        : null;

      return ok(config, { data: buildResults(exam, classId, sectionId) });
    },
  ],
  [
    'POST',
    /^\/exams\/(\d+)\/results\/publish$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const classId = Number(req.body.class_id);
      const sectionId = req.body.section_id === null ? null : Number(req.body.section_id);
      if (!classId) return unprocessable(config, { class_id: ['Choose a class.'] });

      if (publishedResults.has(resultKey(exam.id, classId, sectionId))) {
        return failure(config, 409, 'These results have already been published.');
      }

      // Nothing marked means nothing to publish — an empty card helps nobody.
      const papers = exam.papers.filter((paper) => paper.class_id === classId);
      if (papers.every((paper) => withPaperCounts(paper).marks_entered === 0)) {
        return unprocessable(config, {
          class_id: ['No marks have been entered for this class yet.'],
        });
      }

      freezeRanks(exam, classId, sectionId, (req.body.remarks as string | null) ?? null);
      saveExam({ ...exam, status: 'published', updated_at: new Date().toISOString() });

      return ok(config, { data: buildResults(exam, classId, sectionId) });
    },
  ],
  [
    'GET',
    /^\/exams\/(\d+)\/results\/export$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const classId = Number(req.params.get('class_id'));
      if (!classId) return unprocessable(config, { class_id: ['Choose a class.'] });

      const sectionId = req.params.get('section_id')
        ? Number(req.params.get('section_id'))
        : null;

      const results = buildResults(exam, classId, sectionId);
      const extension = req.params.get('format') === 'excel' ? 'xlsx' : 'pdf';

      return fileResponse(
        config,
        resultsCsv(results),
        `results-exam-${exam.id}-class-${classId}.${extension}`,
      );
    },
  ],

  // --- report cards ---
  [
    'GET',
    /^\/exams\/(\d+)\/report-cards\/bulk$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const classId = Number(req.params.get('class_id'));
      if (!classId) return unprocessable(config, { class_id: ['Choose a class.'] });

      const sectionId = req.params.get('section_id')
        ? Number(req.params.get('section_id'))
        : null;

      const body = paperRoster({ class_id: classId, section_id: sectionId })
        .map((student) => reportCardText(buildReportCard(exam, student)))
        .join('\n\n---\n\n');

      return fileResponse(config, body, `report-cards-class-${classId}.pdf`);
    },
  ],
  [
    'GET',
    /^\/exams\/(\d+)\/report-cards\/(\d+)\/pdf$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const studentId = Number(/\/report-cards\/(\d+)\/pdf$/.exec(req.path)?.[1]);
      const student = students.find((entry) => entry.id === studentId);
      if (!student) return failure(config, 404, 'Student not found.');

      const card = buildReportCard(exam, student);
      return fileResponse(config, reportCardText(card), `report-card-${student.admission_no}.pdf`);
    },
  ],
  [
    'GET',
    /^\/exams\/(\d+)\/report-cards\/(\d+)$/,
    (req, config) => {
      const exam = findExam(req.path);
      if (!exam) return failure(config, 404, 'Exam not found.');

      const studentId = Number(/\/report-cards\/(\d+)$/.exec(req.path)?.[1]);
      const student = students.find((entry) => entry.id === studentId);
      if (!student) return failure(config, 404, 'Student not found.');

      if (!exam.papers.some((paper) => paper.class_id === student.class_id)) {
        return failure(config, 404, 'This student did not sit this exam.');
      }

      return ok(config, { data: buildReportCard(exam, student) });
    },
  ],

  // --- assignments ---
  ['GET', /^\/assignments$/, (req, config) => ok(config, listAssignments(req.params))],
  [
    'GET',
    /^\/assignments\/(\d+)$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      return assignment
        ? ok(config, { data: withAssignmentCounts(assignment) })
        : failure(config, 404, 'Assignment not found.');
    },
  ],
  [
    'POST',
    /^\/assignments$/,
    (req, config) => {
      const created = buildAssignmentFromPayload(nextAssignmentId++, req.body);
      assignmentList = [created, ...assignmentList];
      return ok(config, { data: withAssignmentCounts(created) }, 201);
    },
  ],
  [
    'PUT',
    /^\/assignments\/(\d+)$/,
    (req, config) => {
      const existing = findAssignment(req.path);
      if (!existing) return failure(config, 404, 'Assignment not found.');

      const updated: AssignmentDetail = {
        ...existing,
        ...buildAssignmentFromPayload(existing.id, req.body),
        // An edit must not silently publish, drop files, release marks or
        // reassign the author.
        status: existing.status,
        attachments: existing.attachments,
        teacher_id: existing.teacher_id,
        teacher_name: existing.teacher_name,
        marks_published_at: existing.marks_published_at,
        created_at: existing.created_at,
      };

      assignmentList = assignmentList.map((entry) =>
        entry.id === existing.id ? updated : entry,
      );
      return ok(config, { data: withAssignmentCounts(updated) });
    },
  ],
  [
    'DELETE',
    /^\/assignments\/(\d+)$/,
    (req, config) => {
      const existing = findAssignment(req.path);
      if (!existing) return failure(config, 404, 'Assignment not found.');

      assignmentList = assignmentList.filter((entry) => entry.id !== existing.id);
      for (const student of assignmentRoster(existing)) {
        assignmentSubmissions.delete(assignmentSubmissionKey(existing.id, student.id));
      }
      return ok(config, null, 204);
    },
  ],
  [
    'POST',
    /^\/assignments\/(\d+)\/publish$/,
    (req, config) => {
      const existing = findAssignment(req.path);
      if (!existing) return failure(config, 404, 'Assignment not found.');

      if (existing.status !== 'draft') {
        return failure(config, 409, 'Only a draft can be published.');
      }
      // Publishing with nothing to do is almost always a half-finished draft.
      if (!existing.instructions.trim() && existing.attachments.length === 0) {
        return unprocessable(config, {
          instructions: ['Add instructions or an attachment before publishing.'],
        });
      }
      // A rubric that cannot award the full marks caps the whole class.
      const allocated = existing.rubric.reduce((total, row) => total + row.max_marks, 0);
      if (existing.rubric.length > 0 && Math.abs(allocated - existing.max_marks) > 0.001) {
        return unprocessable(config, {
          rubric: [`The criteria add up to ${allocated}, not ${existing.max_marks}.`],
        });
      }

      const published = {
        ...existing,
        status: 'published' as const,
        updated_at: new Date().toISOString(),
      };
      assignmentList = assignmentList.map((entry) =>
        entry.id === existing.id ? published : entry,
      );
      return ok(config, { data: withAssignmentCounts(published) });
    },
  ],
  [
    'POST',
    /^\/assignments\/(\d+)\/close$/,
    (req, config) => {
      const existing = findAssignment(req.path);
      if (!existing) return failure(config, 404, 'Assignment not found.');

      if (existing.status !== 'published') {
        return failure(config, 409, 'Only a published assignment can be closed.');
      }

      const closed = {
        ...existing,
        status: 'closed' as const,
        updated_at: new Date().toISOString(),
      };
      assignmentList = assignmentList.map((entry) => (entry.id === existing.id ? closed : entry));
      return ok(config, { data: withAssignmentCounts(closed) });
    },
  ],

  // --- assignment attachments ---
  [
    'POST',
    /^\/assignments\/(\d+)\/attachments$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      if (assignment.status === 'closed') {
        return failure(config, 409, 'A closed assignment cannot be changed.');
      }
      if (assignment.attachments.length >= 10) {
        return unprocessable(config, { file: ['This assignment already has 10 attachments.'] });
      }

      const created = attachmentFromUpload(req.formData?.get('file'), '/assignments/files');
      const updated = { ...assignment, attachments: [...assignment.attachments, created] };
      assignmentList = assignmentList.map((entry) =>
        entry.id === assignment.id ? updated : entry,
      );

      return ok(config, { data: created }, 201);
    },
  ],
  [
    'DELETE',
    /^\/assignments\/(\d+)\/attachments\/(\d+)$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      const attachmentId = Number(/\/attachments\/(\d+)$/.exec(req.path)?.[1]);
      if (!assignment.attachments.some((entry) => entry.id === attachmentId)) {
        return failure(config, 404, 'Attachment not found.');
      }

      const updated = {
        ...assignment,
        attachments: assignment.attachments.filter((entry) => entry.id !== attachmentId),
      };
      assignmentList = assignmentList.map((entry) =>
        entry.id === assignment.id ? updated : entry,
      );

      return ok(config, null, 204);
    },
  ],
  [
    'GET',
    /^\/assignments\/(\d+)\/attachments\/(\d+)\/download$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      const attachmentId = Number(/\/attachments\/(\d+)\/download$/.exec(req.path)?.[1]);
      const attachment = assignment?.attachments.find((entry) => entry.id === attachmentId);

      return attachment
        ? fileResponse(config, `Contents of ${attachment.file_name}`, attachment.file_name)
        : failure(config, 404, 'Attachment not found.');
    },
  ],

  // --- assignment submissions ---
  [
    'GET',
    /^\/assignments\/(\d+)\/submissions$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      // A draft has no submission rows — they are raised on publish.
      return ok(
        config,
        assignment.status === 'draft' ? emptySubmissions() : buildAssignmentSubmissions(assignment),
      );
    },
  ],
  [
    'POST',
    /^\/assignments\/(\d+)\/submissions$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      if (assignment.status !== 'published') {
        return failure(
          config,
          409,
          'Submissions are only accepted while the assignment is published.',
        );
      }

      const studentId = Number(req.body.student_id);
      const student = assignmentRoster(assignment).find((entry) => entry.id === studentId);
      if (!student) {
        return unprocessable(config, {
          student_id: ['That student is not in scope for this assignment.'],
        });
      }

      const key = assignmentSubmissionKey(assignment.id, studentId);
      const existing = assignmentSubmissions.get(key);
      const wasReturned = Boolean(existing?.evaluation?.returned_at);

      if (!assignment.allows_late_submission && assignment.due_date < todayIso() && !existing) {
        return failure(config, 409, 'This assignment does not accept work after the due date.');
      }

      assignmentSubmissions.set(key, {
        id: existing?.id ?? nextAssignmentSubmissionId++,
        assignment_id: assignment.id,
        student_id: studentId,
        submitted_at: wasReturned
          ? new Date().toISOString()
          : (existing?.submitted_at ?? new Date().toISOString()),
        // A resubmission after a return is a new attempt, and the old verdict
        // no longer describes what was handed in.
        attempt: wasReturned ? (existing?.attempt ?? 1) + 1 : (existing?.attempt ?? 1),
        student_note: (req.body.student_note as string | null) ?? existing?.student_note ?? null,
        attachments: existing?.attachments ?? [],
        evaluation: wasReturned ? null : (existing?.evaluation ?? null),
      });

      return ok(config, { data: buildAssignmentSubmission(assignment, student) }, 201);
    },
  ],
  [
    'POST',
    /^\/assignments\/(\d+)\/submissions\/(\d+)\/attachments$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      const submissionId = Number(/\/submissions\/(\d+)\/attachments$/.exec(req.path)?.[1]);
      const student = assignmentRoster(assignment).find(
        (entry) => buildAssignmentSubmission(assignment, entry).id === submissionId,
      );
      if (!student) return failure(config, 404, 'Submission not found.');

      const key = assignmentSubmissionKey(assignment.id, student.id);
      const stored = assignmentSubmissions.get(key);
      if (!stored?.submitted_at) {
        return failure(config, 409, 'This student has not handed anything in yet.');
      }
      if (stored.attachments.length >= 5) {
        return unprocessable(config, { file: ['A submission may carry at most 5 files.'] });
      }

      const created = attachmentFromUpload(req.formData?.get('file'), '/assignments/submissions');
      assignmentSubmissions.set(key, {
        ...stored,
        attachments: [...stored.attachments, created],
      });

      return ok(config, { data: created }, 201);
    },
  ],
  [
    'GET',
    /^\/assignments\/(\d+)\/submissions\/(\d+)\/attachments\/(\d+)\/download$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      const attachmentId = Number(/\/attachments\/(\d+)\/download$/.exec(req.path)?.[1]);
      const submissionId = Number(/\/submissions\/(\d+)\//.exec(req.path)?.[1]);

      const student = assignment
        ? assignmentRoster(assignment).find(
            (entry) => buildAssignmentSubmission(assignment, entry).id === submissionId,
          )
        : undefined;

      const attachment = student
        ? assignmentSubmissions
            .get(assignmentSubmissionKey(assignment!.id, student.id))
            ?.attachments.find((entry) => entry.id === attachmentId)
        : undefined;

      return attachment
        ? fileResponse(config, `Contents of ${attachment.file_name}`, attachment.file_name)
        : failure(config, 404, 'Attachment not found.');
    },
  ],

  // --- evaluation ---
  [
    'POST',
    /^\/assignments\/(\d+)\/submissions\/(\d+)\/evaluation$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      const submissionId = Number(/\/submissions\/(\d+)\/evaluation$/.exec(req.path)?.[1]);
      const student = assignmentRoster(assignment).find(
        (entry) => buildAssignmentSubmission(assignment, entry).id === submissionId,
      );
      if (!student) return failure(config, 404, 'Submission not found.');

      const key = assignmentSubmissionKey(assignment.id, student.id);
      const stored = assignmentSubmissions.get(key);

      // Nothing has been handed in, so there is nothing to evaluate.
      if (!stored?.submitted_at) {
        return failure(config, 409, 'This student has not handed anything in yet.');
      }

      const scores = (req.body.criteria_scores as
        | { criterion_id: number; marks_awarded: number; comment: string | null }[]
        | undefined) ?? [];

      const criteria = criteriaOf(assignment);
      for (const [index, score] of scores.entries()) {
        const criterion = criteria.find((entry) => entry.id === score.criterion_id);
        const ceiling = criterion?.max_marks ?? assignment.max_marks;
        const marks = Number(score.marks_awarded);

        if (!Number.isFinite(marks) || marks < 0) {
          return unprocessable(config, {
            [`criteria_scores.${index}.marks_awarded`]: ['Enter the marks awarded.'],
          });
        }
        if (marks > ceiling) {
          return unprocessable(config, {
            [`criteria_scores.${index}.marks_awarded`]: [
              criterion ? `${criterion.name} is out of ${ceiling}.` : `This is out of ${ceiling}.`,
            ],
          });
        }
      }

      const daysLate =
        stored.submitted_at.slice(0, 10) > assignment.due_date
          ? daysBetween(assignment.due_date, stored.submitted_at.slice(0, 10))
          : 0;

      assignmentSubmissions.set(key, {
        ...stored,
        evaluation: computeEvaluation(
          assignment,
          scores,
          daysLate,
          Boolean(req.body.waive_late_penalty),
          (req.body.feedback as string | null) ?? null,
        ),
      });

      return ok(config, { data: buildAssignmentSubmission(assignment, student) });
    },
  ],
  [
    'DELETE',
    /^\/assignments\/(\d+)\/submissions\/(\d+)\/evaluation$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      const submissionId = Number(/\/submissions\/(\d+)\/evaluation$/.exec(req.path)?.[1]);
      const student = assignmentRoster(assignment).find(
        (entry) => buildAssignmentSubmission(assignment, entry).id === submissionId,
      );
      if (!student) return failure(config, 404, 'Submission not found.');

      const key = assignmentSubmissionKey(assignment.id, student.id);
      const stored = assignmentSubmissions.get(key);
      if (!stored) return failure(config, 404, 'Submission not found.');

      assignmentSubmissions.set(key, { ...stored, evaluation: null });

      return ok(config, { data: buildAssignmentSubmission(assignment, student) });
    },
  ],
  [
    'POST',
    /^\/assignments\/(\d+)\/submissions\/(\d+)\/return$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      const submissionId = Number(/\/submissions\/(\d+)\/return$/.exec(req.path)?.[1]);
      const student = assignmentRoster(assignment).find(
        (entry) => buildAssignmentSubmission(assignment, entry).id === submissionId,
      );
      if (!student) return failure(config, 404, 'Submission not found.');

      const feedback = String(req.body.feedback ?? '').trim();
      if (feedback.length < 10) {
        return unprocessable(config, { feedback: ['Tell the student what to change.'] });
      }

      const key = assignmentSubmissionKey(assignment.id, student.id);
      const stored = assignmentSubmissions.get(key);
      if (!stored?.submitted_at) {
        return failure(config, 409, 'This student has not handed anything in yet.');
      }

      // Returned work carries the feedback but no marks — the verdict is
      // "do it again", not a score.
      assignmentSubmissions.set(key, {
        ...stored,
        evaluation: {
          criteria_scores: [],
          raw_marks: 0,
          late_penalty: 0,
          final_marks: 0,
          percentage: 0,
          grade: '—',
          feedback,
          evaluated_by: currentUser?.name ?? 'System',
          evaluated_at: new Date().toISOString(),
          returned_at: new Date().toISOString(),
        },
      });

      return ok(config, { data: buildAssignmentSubmission(assignment, student) });
    },
  ],

  // --- marks ---
  [
    'POST',
    /^\/assignments\/(\d+)\/marks\/publish$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      const { summary } = buildAssignmentSubmissions(assignment);
      if (summary.evaluated === 0) {
        return failure(config, 409, 'Nothing has been evaluated, so there is nothing to publish.');
      }

      const published = {
        ...assignment,
        marks_published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      assignmentList = assignmentList.map((entry) =>
        entry.id === assignment.id ? published : entry,
      );

      return ok(config, { data: withAssignmentCounts(published) });
    },
  ],
  [
    'GET',
    /^\/assignments\/(\d+)\/marks\/export$/,
    (req, config) => {
      const assignment = findAssignment(req.path);
      if (!assignment) return failure(config, 404, 'Assignment not found.');

      return fileResponse(
        config,
        marksCsv(assignment),
        `marks-${assignment.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`,
      );
    },
  ],

  // --- fee catalogue ---
  [
    'GET',
    /^\/fees\/types$/,
    (req, config) => {
      const search = (req.params.get('search') ?? '').trim().toLowerCase();
      const category = req.params.get('category');
      const status = req.params.get('status');

      const rows = feeTypes.map(withTypeUsage).filter((type) => {
        if (search && ![type.name, type.code].join(' ').toLowerCase().includes(search)) return false;
        if (category && type.category !== category) return false;
        if (status === 'active' && !type.is_active) return false;
        if (status === 'inactive' && type.is_active) return false;
        return true;
      });

      if (req.params.get('per_page') === 'all') return ok(config, { data: rows });
      return ok(config, paginate(sortRows(rows, req.params, 'name'), req.params, '/fees/types'));
    },
  ],
  [
    'POST',
    /^\/fees\/types$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim();
      if (feeTypes.some((type) => type.code.toLowerCase() === code.toLowerCase())) {
        return unprocessable(config, { code: ['A fee type with this code already exists.'] });
      }

      const created = {
        ...(req.body as unknown as FeeType),
        id: nextFeeTypeId++,
        structures_count: 0,
        created_at: new Date().toISOString(),
      };
      feeTypes = [...feeTypes, created];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/fees\/types\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/types\/(\d+)$/.exec(req.path)?.[1]);
      const existing = feeTypes.find((type) => type.id === id);
      if (!existing) return failure(config, 404, 'Fee type not found.');

      const code = String(req.body.code ?? '').trim();
      if (feeTypes.some((t) => t.id !== id && t.code.toLowerCase() === code.toLowerCase())) {
        return unprocessable(config, { code: ['A fee type with this code already exists.'] });
      }

      const updated = { ...existing, ...(req.body as unknown as FeeType), id };
      feeTypes = feeTypes.map((type) => (type.id === id ? updated : type));
      return ok(config, { data: withTypeUsage(updated) });
    },
  ],
  [
    'DELETE',
    /^\/fees\/types\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/types\/(\d+)$/.exec(req.path)?.[1]);
      const existing = feeTypes.find((type) => type.id === id);
      if (!existing) return failure(config, 404, 'Fee type not found.');

      const usage = withTypeUsage(existing).structures_count;
      if (usage > 0) {
        return failure(config, 409, `${existing.name} is used by ${usage} fee structure${usage === 1 ? '' : 's'}.`);
      }

      feeTypes = feeTypes.filter((type) => type.id !== id);
      return ok(config, null, 204);
    },
  ],

  [
    'GET',
    /^\/fees\/discounts$/,
    (req, config) => {
      const search = (req.params.get('search') ?? '').trim().toLowerCase();
      const status = req.params.get('status');

      const rows = discounts.map(withDiscountUsage).filter((discount) => {
        if (search && ![discount.name, discount.code].join(' ').toLowerCase().includes(search)) return false;
        if (status === 'active' && !discount.is_active) return false;
        if (status === 'inactive' && discount.is_active) return false;
        return true;
      });

      if (req.params.get('per_page') === 'all') return ok(config, { data: rows });
      return ok(config, paginate(sortRows(rows, req.params, 'name'), req.params, '/fees/discounts'));
    },
  ],
  [
    'POST',
    /^\/fees\/discounts$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim();
      if (discounts.some((d) => d.code.toLowerCase() === code.toLowerCase())) {
        return unprocessable(config, { code: ['A discount with this code already exists.'] });
      }

      const created = {
        ...(req.body as unknown as Discount),
        id: nextDiscountId++,
        usages_count: 0,
        created_at: new Date().toISOString(),
      };
      discounts = [...discounts, created];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/fees\/discounts\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/discounts\/(\d+)$/.exec(req.path)?.[1]);
      const existing = discounts.find((discount) => discount.id === id);
      if (!existing) return failure(config, 404, 'Discount not found.');

      const updated = { ...existing, ...(req.body as unknown as Discount), id };
      discounts = discounts.map((discount) => (discount.id === id ? updated : discount));
      return ok(config, { data: withDiscountUsage(updated) });
    },
  ],
  [
    'DELETE',
    /^\/fees\/discounts\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/discounts\/(\d+)$/.exec(req.path)?.[1]);
      const existing = discounts.find((discount) => discount.id === id);
      if (!existing) return failure(config, 404, 'Discount not found.');

      const usage = withDiscountUsage(existing).usages_count;
      if (usage > 0) {
        return failure(config, 409, `${existing.name} has been applied to ${usage} payment${usage === 1 ? '' : 's'}.`);
      }

      discounts = discounts.filter((discount) => discount.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- fee structures ---
  [
    'GET',
    /^\/fees\/structures$/,
    (req, config) => {
      const search = (req.params.get('search') ?? '').trim().toLowerCase();
      const rows = feeStructures
        .map(withStructureCounts)
        .filter((structure) => (search ? structure.name.toLowerCase().includes(search) : true))
        .map(toStructureSummary);

      return ok(config, paginate(sortRows(rows, req.params, 'name'), req.params, '/fees/structures'));
    },
  ],
  [
    'GET',
    /^\/fees\/structures\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/structures\/(\d+)$/.exec(req.path)?.[1]);
      const structure = feeStructures.find((entry) => entry.id === id);
      return structure
        ? ok(config, { data: withStructureCounts(structure) })
        : failure(config, 404, 'Fee structure not found.');
    },
  ],
  [
    'POST',
    /^\/fees\/structures$/,
    (req, config) => {
      const classId = Number(req.body.class_id);
      const sectionId = (req.body.section_id as number | null) ?? null;

      // Two active structures for the same class would make a student's bill
      // ambiguous.
      if (
        feeStructures.some(
          (entry) =>
            entry.is_active &&
            Boolean(req.body.is_active) &&
            entry.class_id === classId &&
            entry.section_id === sectionId,
        )
      ) {
        return unprocessable(config, {
          class_id: ['An active structure already exists for this class and section.'],
        });
      }

      const created = buildStructureFromPayload(nextStructureId++, req.body);
      feeStructures = [...feeStructures, created];
      return ok(config, { data: withStructureCounts(created) }, 201);
    },
  ],
  [
    'PUT',
    /^\/fees\/structures\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/structures\/(\d+)$/.exec(req.path)?.[1]);
      const existing = feeStructures.find((entry) => entry.id === id);
      if (!existing) return failure(config, 404, 'Fee structure not found.');

      const updated = {
        ...buildStructureFromPayload(id, req.body),
        created_at: existing.created_at,
      };
      feeStructures = feeStructures.map((entry) => (entry.id === id ? updated : entry));
      return ok(config, { data: withStructureCounts(updated) });
    },
  ],
  [
    'DELETE',
    /^\/fees\/structures\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/structures\/(\d+)$/.exec(req.path)?.[1]);
      const existing = feeStructures.find((entry) => entry.id === id);
      if (!existing) return failure(config, 404, 'Fee structure not found.');

      const billed = structureStudentCount(id);
      if (billed > 0) {
        return failure(config, 409, `${existing.name} is billed to ${billed} student${billed === 1 ? '' : 's'}.`);
      }

      feeStructures = feeStructures.filter((entry) => entry.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- collection ---
  [
    'GET',
    /^\/fees\/students\/(\d+)\/account$/,
    (req, config) => {
      const id = Number(/\/students\/(\d+)\/account$/.exec(req.path)?.[1]);
      const student = students.find((entry) => entry.id === id);
      return student
        ? ok(config, { data: buildAccount(student) })
        : failure(config, 404, 'Student not found.');
    },
  ],
  [
    'POST',
    /^\/fees\/payments$/,
    (req, config) => {
      const studentId = Number(req.body.student_id);
      const student = students.find((entry) => entry.id === studentId);
      if (!student) return failure(config, 404, 'Student not found.');

      const account = buildAccount(student);
      const amount = Number(req.body.amount);

      if (!(amount > 0)) {
        return unprocessable(config, { amount: ['Enter an amount greater than zero.'] });
      }

      const discountId = (req.body.discount_id as number | null) ?? null;
      const discount = discounts.find((entry) => entry.id === discountId) ?? null;
      const discountAmount = discount
        ? discount.value_type === 'percentage'
          ? major(Math.round((minor(account.balance) * discount.value) / 100))
          : Math.min(discount.value, account.balance)
        : 0;

      const extraFine = Number(req.body.fine_amount) || 0;
      const netDue = major(minor(account.balance) - minor(discountAmount) + minor(extraFine));

      // Taking more than is owed would leave an unallocatable remainder.
      if (minor(amount) > minor(netDue)) {
        return unprocessable(config, {
          amount: [`This exceeds the outstanding balance of ${netDue}.`],
        });
      }

      // Oldest first — the same rule the UI previews.
      const outstanding = account.dues
        .filter((due) => due.balance > 0)
        .sort((a, b) => a.due_date.localeCompare(b.due_date));

      // The discount is credited first: it reduces what is owed, so the
      // payment that follows settles the *net* figure.
      let remainingDiscount = minor(discountAmount);
      const discountAllocations: { due_id: number; amount: number }[] = [];

      for (const due of outstanding) {
        if (remainingDiscount <= 0) break;
        const credited = Math.min(remainingDiscount, minor(due.balance));
        const key = dueKey(studentId, due.id);
        discountByDue.set(key, major(minor(discountByDue.get(key) ?? 0) + credited));

        discountAllocations.push({ due_id: due.id, amount: major(credited) });
        remainingDiscount -= credited;
      }

      let remaining = minor(amount);
      const allocations = [];

      for (const due of outstanding) {
        if (remaining <= 0) break;

        const key = dueKey(studentId, due.id);
        // Recompute the balance — the discount just reduced it.
        const credited = minor(discountAllocations.find((entry) => entry.due_id === due.id)?.amount ?? 0);
        const owed = minor(due.balance) - credited;
        if (owed <= 0) continue;

        const applied = Math.min(remaining, owed);
        paidByDue.set(key, major(minor(paidByDue.get(key) ?? 0) + applied));

        allocations.push({
          due_id: due.id,
          installment_name: due.installment_name,
          amount: major(applied),
        });
        remaining -= applied;
      }

      const created: Payment = {
        id: nextPaymentId++,
        receipt_no: `RCT-${new Date().getFullYear()}-${String(nextReceiptSeq++).padStart(5, '0')}`,
        student_id: studentId,
        student_name: student.full_name,
        admission_no: student.admission_no,
        class_name: student.class_name,
        section_name: student.section_name,
        paid_at: String(req.body.paid_at ?? todayIso()),
        amount,
        discount_amount: discountAmount,
        fine_amount: extraFine,
        mode: req.body.mode as Payment['mode'],
        reference: (req.body.reference as string | null) ?? null,
        remarks: [(req.body.remarks as string | null) ?? '', discount ? `[${discount.code}]` : '']
          .filter(Boolean)
          .join(' ')
          .trim() || null,
        collected_by: currentUser?.name ?? 'System',
        is_cancelled: false,
        cancelled_reason: null,
        allocations,
      };

      discountAllocationsByPayment.set(created.id, discountAllocations);
      payments = [created, ...payments];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'GET',
    /^\/fees\/payments$/,
    (req, config) => {
      const search = (req.params.get('search') ?? '').trim().toLowerCase();
      const mode = req.params.get('mode');
      const status = req.params.get('status');

      const rows = payments.filter((payment) => {
        if (
          search &&
          ![payment.receipt_no, payment.student_name, payment.admission_no, payment.reference ?? '']
            .join(' ')
            .toLowerCase()
            .includes(search)
        ) {
          return false;
        }
        if (mode && payment.mode !== mode) return false;
        if (status === 'valid' && payment.is_cancelled) return false;
        if (status === 'cancelled' && !payment.is_cancelled) return false;
        return true;
      });

      return ok(config, paginate(sortRows(rows, req.params, 'paid_at'), req.params, '/fees/payments'));
    },
  ],
  [
    'GET',
    /^\/fees\/payments\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/payments\/(\d+)$/.exec(req.path)?.[1]);
      const payment = payments.find((entry) => entry.id === id);
      return payment ? ok(config, { data: payment }) : failure(config, 404, 'Receipt not found.');
    },
  ],
  [
    'POST',
    /^\/fees\/payments\/(\d+)\/cancel$/,
    (req, config) => {
      const id = Number(/\/payments\/(\d+)\/cancel$/.exec(req.path)?.[1]);
      const payment = payments.find((entry) => entry.id === id);
      if (!payment) return failure(config, 404, 'Receipt not found.');

      if (payment.is_cancelled) {
        return failure(config, 409, `Receipt ${payment.receipt_no} is already cancelled.`);
      }

      // Reverse the payment *and* the concession it carried — the discount
      // was granted as part of this transaction, so it goes with it.
      for (const allocation of payment.allocations) {
        const key = dueKey(payment.student_id, allocation.due_id);
        paidByDue.set(key, major(minor(paidByDue.get(key) ?? 0) - minor(allocation.amount)));
      }

      for (const credit of discountAllocationsByPayment.get(id) ?? []) {
        const key = dueKey(payment.student_id, credit.due_id);
        discountByDue.set(key, major(minor(discountByDue.get(key) ?? 0) - minor(credit.amount)));
      }
      discountAllocationsByPayment.delete(id);

      const cancelled: Payment = {
        ...payment,
        is_cancelled: true,
        cancelled_reason: String(req.body.reason ?? '').trim(),
      };

      payments = payments.map((entry) => (entry.id === id ? cancelled : entry));
      return ok(config, { data: cancelled });
    },
  ],
  [
    'GET',
    /^\/fees\/payments\/(\d+)\/receipt$/,
    (req, config) => {
      const id = Number(/\/payments\/(\d+)\/receipt$/.exec(req.path)?.[1]);
      const payment = payments.find((entry) => entry.id === id);
      if (!payment) return failure(config, 404, 'Receipt not found.');

      return fileResponse(
        config,
        `Receipt ${payment.receipt_no} — ${payment.student_name} — ${payment.amount}`,
        `receipt-${payment.receipt_no}.pdf`,
      );
    },
  ],

  // --- due report ---
  ['GET', /^\/fees\/reports\/dues$/, (req, config) => ok(config, buildDueReport(req.params))],
  [
    'GET',
    /^\/fees\/reports\/dues\/export$/,
    (req, config) => {
      const report = buildDueReport(new URLSearchParams({ ...Object.fromEntries(req.params), per_page: '1000' }));
      const format = req.params.get('format');
      const extension = format === 'excel' ? 'xlsx' : 'pdf';

      const body = [
        'Admission No,Student,Class,Guardian,Phone,Payable,Paid,Outstanding,Days overdue',
        ...report.data.map((row) =>
          [row.admission_no, row.student_name, row.class_name, row.guardian_name ?? '', row.guardian_phone ?? '', row.total_payable, row.total_paid, row.balance, row.days_overdue].join(','),
        ),
      ].join('\n');

      return fileResponse(config, body, `fee-dues.${extension}`);
    },
  ],

  // --- attendance ---
  [
    'GET',
    /^\/attendance\/sheet$/,
    (req, config) =>
      ok(config, {
        data: buildSheet(
          (req.params.get('type') as AttendanceType) ?? 'student',
          req.params.get('date') ?? todayIso(),
          req.params.get('class_id') ? Number(req.params.get('class_id')) : null,
          req.params.get('section_id') ? Number(req.params.get('section_id')) : null,
        ),
      }),
  ],
  [
    'POST',
    /^\/attendance\/sheet$/,
    (req, config) => {
      const type = req.body.type as AttendanceType;
      const date = String(req.body.date);
      const classId = (req.body.class_id as number | null) ?? null;
      const sectionId = (req.body.section_id as number | null) ?? null;

      const sheet = buildSheet(type, date, classId, sectionId);
      if (sheet.is_locked) {
        return failure(config, 422, sheet.lock_reason ?? 'This sheet is read-only.');
      }

      const entries = (req.body.entries as { person_id: number; status: AttendanceStatus; remarks: string | null }[]) ?? [];

      for (const entry of entries) {
        // An approved leave cannot be overwritten from the sheet.
        if (leaveFor(type, date, entry.person_id)) continue;

        attendanceMarks.set(markKey(type, date, entry.person_id), {
          status: entry.status,
          source: 'manual',
          remarks: entry.remarks ?? null,
        });
      }

      return ok(config, { data: buildSheet(type, date, classId, sectionId) });
    },
  ],
  [
    'GET',
    /^\/attendance\/reports\/monthly$/,
    (req, config) =>
      ok(config, {
        data: buildMonthlyReport(
          (req.params.get('type') as AttendanceType) ?? 'student',
          Number(req.params.get('year')) || new Date().getFullYear(),
          Number(req.params.get('month')) || new Date().getMonth() + 1,
          req.params.get('class_id') ? Number(req.params.get('class_id')) : null,
          req.params.get('section_id') ? Number(req.params.get('section_id')) : null,
        ),
      }),
  ],
  [
    'GET',
    /^\/attendance\/reports\/monthly\/export$/,
    (req, config) => {
      const type = (req.params.get('type') as AttendanceType) ?? 'student';
      const year = Number(req.params.get('year')) || new Date().getFullYear();
      const month = Number(req.params.get('month')) || new Date().getMonth() + 1;
      const format = req.params.get('format');
      const extension = format === 'excel' ? 'xlsx' : 'pdf';

      const report = buildMonthlyReport(type, year, month, null, null);
      const body = [
        'Name,ID,Present,Absent,Leave,Late,Working days,Attendance %',
        ...report.rows.map((row) =>
          [row.person_name, row.identifier, row.present_days, row.absent_days, row.leave_days, row.late_days, row.working_days, row.attendance_percent].join(','),
        ),
      ].join('\n');

      return fileResponse(config, body, `attendance-${type}-${year}-${String(month).padStart(2, '0')}.${extension}`);
    },
  ],

  // --- holidays ---
  ['GET', /^\/holidays$/, (req, config) => ok(config, listHolidays(req.params))],
  [
    'POST',
    /^\/holidays$/,
    (req, config) => {
      const name = String(req.body.name ?? '').trim();
      const start = String(req.body.start_date);
      const end = String(req.body.end_date);

      // Two holidays covering the same day for the same audience is a
      // duplicate, not two holidays.
      const scope = req.body.scope as Holiday['scope'];
      const overlap = holidays.find(
        (holiday) =>
          start <= holiday.end_date &&
          end >= holiday.start_date &&
          (holiday.scope === 'all' || scope === 'all' || holiday.scope === scope),
      );

      if (overlap) {
        return unprocessable(config, {
          start_date: [`These dates overlap "${overlap.name}".`],
        });
      }

      const created: Holiday = {
        id: nextHolidayId++,
        name,
        start_date: start,
        end_date: end,
        type: req.body.type as Holiday['type'],
        scope,
        description: (req.body.description as string | null) ?? null,
        days_count: holidayDays(start, end),
        created_at: new Date().toISOString(),
      };

      holidays = [...holidays, created];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/holidays\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/holidays\/(\d+)$/.exec(req.path)?.[1]);
      const existing = holidays.find((holiday) => holiday.id === id);
      if (!existing) return failure(config, 404, 'Holiday not found.');

      const start = String(req.body.start_date);
      const end = String(req.body.end_date);
      const scope = req.body.scope as Holiday['scope'];

      const overlap = holidays.find(
        (holiday) =>
          holiday.id !== id &&
          start <= holiday.end_date &&
          end >= holiday.start_date &&
          (holiday.scope === 'all' || scope === 'all' || holiday.scope === scope),
      );

      if (overlap) {
        return unprocessable(config, {
          start_date: [`These dates overlap "${overlap.name}".`],
        });
      }

      const updated: Holiday = {
        ...existing,
        name: String(req.body.name ?? '').trim(),
        start_date: start,
        end_date: end,
        type: req.body.type as Holiday['type'],
        scope,
        description: (req.body.description as string | null) ?? null,
        days_count: holidayDays(start, end),
      };

      holidays = holidays.map((holiday) => (holiday.id === id ? updated : holiday));
      return ok(config, { data: updated });
    },
  ],
  [
    'DELETE',
    /^\/holidays\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/holidays\/(\d+)$/.exec(req.path)?.[1]);
      if (!holidays.some((holiday) => holiday.id === id)) {
        return failure(config, 404, 'Holiday not found.');
      }

      holidays = holidays.filter((holiday) => holiday.id !== id);
      return ok(config, null, 204);
    },
  ],

  // --- capture devices ---
  ['GET', /^\/attendance\/devices$/, (_req, config) => ok(config, { data: devices })],
  [
    'POST',
    /^\/attendance\/devices\/(\d+)\/sync$/,
    (req, config) => {
      const id = Number(/\/devices\/(\d+)\/sync$/.exec(req.path)?.[1]);
      const device = devices.find((entry) => entry.id === id);
      if (!device) return failure(config, 404, 'Device not found.');

      if (device.status === 'offline') {
        return failure(config, 409, `${device.name} is offline and cannot be reached.`);
      }

      // A sync writes real marks, so today's sheet changes afterwards.
      const date = todayIso();
      const roster = rosterFor(device.id === 2 ? 'teacher' : 'student', null, null).slice(0, 5);

      for (const person of roster) {
        if (leaveFor('student', date, person.person_id)) continue;
        attendanceMarks.set(markKey(device.id === 2 ? 'teacher' : 'student', date, person.person_id), {
          status: 'present',
          source: 'biometric',
          remarks: null,
        });
      }

      const synced: BiometricDevice = {
        ...device,
        status: 'online',
        last_sync_at: new Date().toISOString(),
        last_sync_count: roster.length,
        error_message: null,
      };

      devices = devices.map((entry) => (entry.id === id ? synced : entry));
      return ok(config, { data: synced });
    },
  ],
  [
    'GET',
    /^\/attendance\/qr-sessions$/,
    (_req, config) =>
      ok(config, { data: qrSessions.filter((session) => session.expires_at > new Date().toISOString()) }),
  ],
  [
    'POST',
    /^\/attendance\/qr-sessions$/,
    (req, config) => {
      const type = req.body.type as AttendanceType;
      const classId = (req.body.class_id as number | null) ?? null;
      const sectionId = (req.body.section_id as number | null) ?? null;
      const minutes = Number(req.body.valid_for_minutes) || 10;

      const token = `qr-${nextQrSessionId}-${type}`;
      const created: QrSession = {
        id: nextQrSessionId++,
        type,
        class_id: classId,
        section_id: sectionId,
        date: todayIso(),
        token,
        check_in_url: `https://school.example/checkin/${token}`,
        expires_at: new Date(Date.now() + minutes * 60_000).toISOString(),
        is_active: true,
        checked_in_count: 0,
        expected_count: rosterFor(type, classId, sectionId).length,
      };

      qrSessions = [...qrSessions, created];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'DELETE',
    /^\/attendance\/qr-sessions\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/qr-sessions\/(\d+)$/.exec(req.path)?.[1]);
      if (!qrSessions.some((session) => session.id === id)) {
        return failure(config, 404, 'Check-in session not found.');
      }

      qrSessions = qrSessions.filter((session) => session.id !== id);
      return ok(config, null, 204);
    },
  ],
  [
    'GET',
    /^\/attendance\/qr-sessions\/(\d+)\/image$/,
    (req, config) => {
      const id = Number(/\/qr-sessions\/(\d+)\/image$/.exec(req.path)?.[1]);
      const session = qrSessions.find((entry) => entry.id === id);
      if (!session) return failure(config, 404, 'Check-in session not found.');

      // A real backend renders a signed PNG; the placeholder is enough to
      // prove the URL is wired up.
      return fileResponse(config, `QR image for ${session.token}`, `${session.token}.png`);
    },
  ],

  // --- classes & sections ---
  [
    'GET',
    /^\/academics\/classes$/,
    (req, config) =>
      // `per_page=all` is the lookup form other modules read for their selects;
      // anything else is this module's paginated table.
      req.params.get('per_page') === 'all'
        ? ok(config, { data: classes })
        : ok(config, listClasses(req.params)),
  ],
  [
    'GET',
    /^\/academics\/classes\/(\d+)$/,
    (req, config) => {
      const schoolClass = findClass(req.path);
      return schoolClass ? ok(config, { data: schoolClass }) : failure(config, 404, 'Class not found.');
    },
  ],
  [
    'POST',
    /^\/academics\/classes$/,
    (req, config) => {
      const name = String(req.body.name ?? '').trim();
      if (classes.some((entry) => entry.name.toLowerCase() === name.toLowerCase())) {
        return unprocessable(config, { name: ['A class with this name already exists.'] });
      }

      const created: SchoolClass = {
        id: nextClassId++,
        name,
        level: Number(req.body.level),
        is_active: Boolean(req.body.is_active),
        sections: [],
        sections_count: 0,
        students_count: 0,
        total_capacity: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      classes = [...classes, created];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/academics\/classes\/(\d+)$/,
    (req, config) => {
      const existing = findClass(req.path);
      if (!existing) return failure(config, 404, 'Class not found.');

      const name = String(req.body.name ?? '').trim();
      if (
        classes.some(
          (entry) => entry.id !== existing.id && entry.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        return unprocessable(config, { name: ['A class with this name already exists.'] });
      }

      return ok(config, {
        data: saveClass({
          ...existing,
          name,
          level: Number(req.body.level),
          is_active: Boolean(req.body.is_active),
        }),
      });
    },
  ],
  [
    'DELETE',
    /^\/academics\/classes\/(\d+)$/,
    (req, config) => {
      const existing = findClass(req.path);
      if (!existing) return failure(config, 404, 'Class not found.');

      // Deleting a class with enrolled students would orphan their records.
      if (existing.students_count > 0) {
        return failure(
          config,
          409,
          `${existing.name} still has ${existing.students_count} enrolled students.`,
        );
      }

      classes = classes.filter((entry) => entry.id !== existing.id);
      return ok(config, null, 204);
    },
  ],
  [
    'POST',
    /^\/academics\/classes\/(\d+)\/sections$/,
    (req, config) => {
      const schoolClass = findClass(req.path);
      if (!schoolClass) return failure(config, 404, 'Class not found.');

      const name = String(req.body.name ?? '').trim();
      if (schoolClass.sections.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
        return unprocessable(config, {
          name: ['This class already has a section with that name.'],
        });
      }

      const created: Section = {
        id: nextSectionId++,
        class_id: schoolClass.id,
        name,
        shift: req.body.shift as Section['shift'],
        capacity: Number(req.body.capacity),
        room: (req.body.room as string | null) ?? null,
        is_active: Boolean(req.body.is_active),
        students_count: 0,
        created_at: new Date().toISOString(),
      };

      saveClass({ ...schoolClass, sections: [...schoolClass.sections, created] });
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/academics\/classes\/(\d+)\/sections\/(\d+)$/,
    (req, config) => {
      const schoolClass = findClass(req.path);
      if (!schoolClass) return failure(config, 404, 'Class not found.');

      const sectionId = Number(/\/sections\/(\d+)$/.exec(req.path)?.[1]);
      const existing = schoolClass.sections.find((s) => s.id === sectionId);
      if (!existing) return failure(config, 404, 'Section not found.');

      const name = String(req.body.name ?? '').trim();
      if (
        schoolClass.sections.some(
          (s) => s.id !== sectionId && s.name.toLowerCase() === name.toLowerCase(),
        )
      ) {
        return unprocessable(config, {
          name: ['This class already has a section with that name.'],
        });
      }

      const capacity = Number(req.body.capacity);
      // The seats are already taken — capacity cannot drop below enrolment.
      if (capacity < existing.students_count) {
        return unprocessable(config, {
          capacity: [`${existing.students_count} students are already enrolled.`],
        });
      }

      const updated: Section = {
        ...existing,
        name,
        shift: req.body.shift as Section['shift'],
        capacity,
        room: (req.body.room as string | null) ?? null,
        is_active: Boolean(req.body.is_active),
      };

      saveClass({
        ...schoolClass,
        sections: schoolClass.sections.map((s) => (s.id === sectionId ? updated : s)),
      });

      return ok(config, { data: updated });
    },
  ],
  [
    'DELETE',
    /^\/academics\/classes\/(\d+)\/sections\/(\d+)$/,
    (req, config) => {
      const schoolClass = findClass(req.path);
      if (!schoolClass) return failure(config, 404, 'Class not found.');

      const sectionId = Number(/\/sections\/(\d+)$/.exec(req.path)?.[1]);
      const existing = schoolClass.sections.find((s) => s.id === sectionId);
      if (!existing) return failure(config, 404, 'Section not found.');

      if (existing.students_count > 0) {
        return failure(
          config,
          409,
          `Section ${existing.name} still has ${existing.students_count} enrolled students.`,
        );
      }

      saveClass({
        ...schoolClass,
        sections: schoolClass.sections.filter((s) => s.id !== sectionId),
      });

      return ok(config, null, 204);
    },
  ],

  // --- students ---
  ['GET', /^\/students$/, (req, config) => ok(config, listStudents(req.params))],
  [
    'GET',
    /^\/students\/export$/,
    (req, config) => {
      const format = req.params.get('format');
      const rows = filterStudents(req.params);
      const extension = format === 'excel' ? 'xlsx' : 'pdf';

      // A real backend streams a generated workbook or PDF. Producing valid
      // binaries here would add no signal, so this is a CSV/text stand-in that
      // still exercises the blob path, the Content-Disposition parsing and the
      // filename handling end to end.
      const body =
        format === 'excel'
          ? [
              'Admission No,Name,Class,Section,Status,Guardian,Phone',
              ...rows.map((s) =>
                [s.admission_no, s.full_name, s.class_name, s.section_name ?? '', s.status, s.primary_guardian_name ?? '', s.primary_guardian_phone ?? ''].join(','),
              ),
            ].join('\n')
          : `Student list (${rows.length} records)\n\n${rows.map((s) => `${s.admission_no}  ${s.full_name}  ${s.class_name}`).join('\n')}`;

      return fileResponse(config, body, `students-export.${extension}`);
    },
  ],
  [
    'GET',
    /^\/students\/(\d+)$/,
    (req, config) => {
      const student = findStudent(req.path);
      return student ? ok(config, { data: student }) : failure(config, 404, 'Student not found.');
    },
  ],
  [
    'POST',
    /^\/students$/,
    (req, config) => {
      const admissionNo = String(req.body.admission_no ?? '');
      if (students.some((student) => student.admission_no === admissionNo)) {
        return unprocessable(config, {
          admission_no: ['This admission number is already in use.'],
        });
      }

      const created = buildStudentFromPayload(nextStudentId++, req.body);
      students = [created, ...students];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/students\/(\d+)$/,
    (req, config) => {
      const existing = findStudent(req.path);
      if (!existing) return failure(config, 404, 'Student not found.');

      const admissionNo = String(req.body.admission_no ?? '');
      if (students.some((s) => s.id !== existing.id && s.admission_no === admissionNo)) {
        return unprocessable(config, {
          admission_no: ['This admission number is already in use.'],
        });
      }

      const updated = { ...buildStudentFromPayload(existing.id, req.body), documents_count: existing.documents_count };
      students = students.map((student) => (student.id === existing.id ? updated : student));
      return ok(config, { data: updated });
    },
  ],
  [
    'DELETE',
    /^\/students\/(\d+)$/,
    (req, config) => {
      const existing = findStudent(req.path);
      if (!existing) return failure(config, 404, 'Student not found.');

      students = students.filter((student) => student.id !== existing.id);
      delete documentsByStudent[existing.id];
      return ok(config, null, 204);
    },
  ],
  [
    'POST',
    /^\/students\/(\d+)\/photo$/,
    (req, config) => {
      const student = findStudent(req.path);
      if (!student) return failure(config, 404, 'Student not found.');

      const updated = { ...student, photo_url: null };
      students = students.map((s) => (s.id === student.id ? updated : s));
      return ok(config, { data: updated });
    },
  ],
  [
    'GET',
    /^\/students\/(\d+)\/id-card$/,
    (req, config) => {
      const student = findStudent(req.path);
      if (!student) return failure(config, 404, 'Student not found.');

      return fileResponse(
        config,
        `ID card for ${student.full_name} (${student.admission_no})`,
        `id-card-${student.admission_no}.pdf`,
      );
    },
  ],

  // --- subjects ---
  [
    'GET',
    /^\/academics\/subjects$/,
    (req, config) =>
      // `per_page=all` is the lookup form the teacher form reads; anything
      // else is this module's paginated table.
      req.params.get('per_page') === 'all'
        ? ok(config, { data: subjects.map(withSubjectAggregates) })
        : ok(config, listSubjects(req.params)),
  ],
  [
    'GET',
    /^\/academics\/subjects\/(\d+)$/,
    (req, config) => {
      const subject = findSubject(req.path);
      return subject
        ? ok(config, { data: withTeachers(subject) })
        : failure(config, 404, 'Subject not found.');
    },
  ],
  [
    'POST',
    /^\/academics\/subjects$/,
    (req, config) => {
      const code = String(req.body.code ?? '').trim();
      if (subjects.some((entry) => entry.code.toLowerCase() === code.toLowerCase())) {
        return unprocessable(config, { code: ['A subject with this code already exists.'] });
      }

      const created = buildSubjectFromPayload(nextSubjectId++, req.body);
      subjects = [...subjects, created];
      return ok(config, { data: withTeachers(created) }, 201);
    },
  ],
  [
    'PUT',
    /^\/academics\/subjects\/(\d+)$/,
    (req, config) => {
      const existing = findSubject(req.path);
      if (!existing) return failure(config, 404, 'Subject not found.');

      const code = String(req.body.code ?? '').trim();
      if (
        subjects.some(
          (entry) => entry.id !== existing.id && entry.code.toLowerCase() === code.toLowerCase(),
        )
      ) {
        return unprocessable(config, { code: ['A subject with this code already exists.'] });
      }

      const updated = {
        ...buildSubjectFromPayload(existing.id, req.body),
        created_at: existing.created_at,
      };
      subjects = subjects.map((entry) => (entry.id === existing.id ? updated : entry));

      return ok(config, { data: withTeachers(updated) });
    },
  ],
  [
    'DELETE',
    /^\/academics\/subjects\/(\d+)$/,
    (req, config) => {
      const existing = findSubject(req.path);
      if (!existing) return failure(config, 404, 'Subject not found.');

      // Deleting an assigned subject would strip it from teacher records.
      const assigned = teachersForSubject(existing.id).length;
      if (assigned > 0) {
        return failure(
          config,
          409,
          `${existing.name} is still assigned to ${assigned} teacher${assigned === 1 ? '' : 's'}.`,
        );
      }

      subjects = subjects.filter((entry) => entry.id !== existing.id);
      return ok(config, null, 204);
    },
  ],
  [
    'PUT',
    /^\/academics\/subjects\/(\d+)\/teachers$/,
    (req, config) => {
      const subject = findSubject(req.path);
      if (!subject) return failure(config, 404, 'Subject not found.');

      const ids = (req.body.teacher_ids as number[]) ?? [];
      const ref = { id: subject.id, name: subject.name, code: subject.code };

      // Writing the teacher side keeps the single source of truth intact —
      // the subject's teacher list is derived from it.
      teachers = teachers.map((teacher) => {
        const shouldHave = ids.includes(teacher.id);
        const alreadyHas = teacher.subjects.some((entry) => entry.id === subject.id);

        if (shouldHave === alreadyHas) return teacher;

        const nextSubjects = shouldHave
          ? [...teacher.subjects, ref]
          : teacher.subjects.filter((entry) => entry.id !== subject.id);

        return { ...teacher, subjects: nextSubjects, subjects_count: nextSubjects.length };
      });

      return ok(config, { data: withTeachers(subject) });
    },
  ],

  // --- teachers ---
  ['GET', /^\/teachers$/, (req, config) => ok(config, listTeachers(req.params))],
  [
    'GET',
    /^\/teachers\/export$/,
    (req, config) => {
      const format = req.params.get('format');
      const rows = filterTeachers(req.params);
      const extension = format === 'excel' ? 'xlsx' : 'pdf';

      const body =
        format === 'excel'
          ? [
              'Employee ID,Name,Designation,Department,Subjects,Status',
              ...rows.map((t) =>
                [t.employee_id, t.full_name, t.designation, t.department ?? '', t.subjects.map((s) => s.code).join(' '), t.status].join(','),
              ),
            ].join('\n')
          : `Teacher list (${rows.length} records)\n\n${rows.map((t) => `${t.employee_id}  ${t.full_name}  ${t.designation}`).join('\n')}`;

      return fileResponse(config, body, `teachers-export.${extension}`);
    },
  ],
  [
    'GET',
    /^\/teachers\/(\d+)$/,
    (req, config) => {
      const teacher = findTeacher(req.path);
      return teacher ? ok(config, { data: teacher }) : failure(config, 404, 'Teacher not found.');
    },
  ],
  [
    'POST',
    /^\/teachers$/,
    (req, config) => {
      const employeeId = String(req.body.employee_id ?? '');
      if (teachers.some((teacher) => teacher.employee_id === employeeId)) {
        return unprocessable(config, { employee_id: ['This employee ID is already in use.'] });
      }
      if (teachers.some((teacher) => teacher.email === String(req.body.email ?? ''))) {
        return unprocessable(config, { email: ['This email address is already in use.'] });
      }

      const created = buildTeacherFromPayload(nextTeacherId++, req.body);
      teachers = [created, ...teachers];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/teachers\/(\d+)$/,
    (req, config) => {
      const existing = findTeacher(req.path);
      if (!existing) return failure(config, 404, 'Teacher not found.');

      const employeeId = String(req.body.employee_id ?? '');
      if (teachers.some((t) => t.id !== existing.id && t.employee_id === employeeId)) {
        return unprocessable(config, { employee_id: ['This employee ID is already in use.'] });
      }

      const updated = {
        ...buildTeacherFromPayload(existing.id, req.body),
        documents_count: existing.documents_count,
      };
      teachers = teachers.map((teacher) => (teacher.id === existing.id ? updated : teacher));
      return ok(config, { data: updated });
    },
  ],
  [
    'DELETE',
    /^\/teachers\/(\d+)$/,
    (req, config) => {
      const existing = findTeacher(req.path);
      if (!existing) return failure(config, 404, 'Teacher not found.');

      teachers = teachers.filter((teacher) => teacher.id !== existing.id);
      delete documentsByTeacher[existing.id];
      return ok(config, null, 204);
    },
  ],
  [
    'POST',
    /^\/teachers\/(\d+)\/photo$/,
    (req, config) => {
      const teacher = findTeacher(req.path);
      if (!teacher) return failure(config, 404, 'Teacher not found.');

      const updated = { ...teacher, photo_url: null };
      teachers = teachers.map((t) => (t.id === teacher.id ? updated : t));
      return ok(config, { data: updated });
    },
  ],

  // --- staff ---
  ['GET', /^\/staff$/, (req, config) => ok(config, listStaff(req.params))],
  [
    'GET',
    /^\/staff\/(\d+)$/,
    (req, config) => {
      const member = findStaff(req.path);
      return member ? ok(config, { data: member }) : failure(config, 404, 'Staff member not found.');
    },
  ],
  [
    'POST',
    /^\/staff$/,
    (req, config) => {
      const employeeId = String(req.body.employee_id ?? '');
      if (staff.some((member) => member.employee_id === employeeId)) {
        return unprocessable(config, { employee_id: ['This employee ID is already in use.'] });
      }
      if (staff.some((member) => member.email === String(req.body.email ?? ''))) {
        return unprocessable(config, { email: ['This email address is already in use.'] });
      }

      const created = buildStaffFromPayload(nextStaffId++, req.body);
      staff = [created, ...staff];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'PUT',
    /^\/staff\/(\d+)$/,
    (req, config) => {
      const existing = findStaff(req.path);
      if (!existing) return failure(config, 404, 'Staff member not found.');

      const employeeId = String(req.body.employee_id ?? '');
      if (staff.some((m) => m.id !== existing.id && m.employee_id === employeeId)) {
        return unprocessable(config, { employee_id: ['This employee ID is already in use.'] });
      }

      const updated = {
        ...buildStaffFromPayload(existing.id, req.body),
        documents_count: existing.documents_count,
      };
      staff = staff.map((member) => (member.id === existing.id ? updated : member));
      return ok(config, { data: updated });
    },
  ],
  [
    'DELETE',
    /^\/staff\/(\d+)$/,
    (req, config) => {
      const existing = findStaff(req.path);
      if (!existing) return failure(config, 404, 'Staff member not found.');

      staff = staff.filter((member) => member.id !== existing.id);
      delete documentsByStaff[existing.id];
      return ok(config, null, 204);
    },
  ],
  [
    'POST',
    /^\/staff\/(\d+)\/photo$/,
    (req, config) => {
      const member = findStaff(req.path);
      if (!member) return failure(config, 404, 'Staff member not found.');

      const updated = { ...member, photo_url: null };
      staff = staff.map((m) => (m.id === member.id ? updated : m));
      return ok(config, { data: updated });
    },
  ],

  // --- documents (shared shape, registered per owner) ---
  ...documentRoutes('students', documentsByStudent, syncDocumentCount),
  ...documentRoutes('teachers', documentsByTeacher, syncTeacherDocumentCount),
  ...documentRoutes('staff', documentsByStaff, syncStaffDocumentCount),

  // --- permissions ---
  [
    'GET',
    /^\/permissions$/,
    (req, config) => {
      const withRoles = req.params.get('with_roles') === '1';
      if (!withRoles) return ok(config, { data: permissions });

      return ok(config, {
        data: permissions.map((permission) => ({
          ...permission,
          roles: roles
            .filter((role) => role.permissions.includes(permission.name))
            .map((role) => role.name),
        })),
      });
    },
  ],

  // --- roles ---
  ['GET', /^\/roles$/, (req, config) => ok(config, listRoles(req.params))],
  [
    'POST',
    /^\/roles$/,
    (req, config) => {
      const payload = req.body as unknown as RolePayload;
      const name = String(payload.name ?? '').toLowerCase();

      if (roles.some((role) => role.name === name)) {
        return unprocessable(config, { name: ['The name has already been taken.'] });
      }

      const created: RoleDetail = {
        id: nextRoleId++,
        name,
        guard_name: 'web',
        is_system: false,
        users_count: 0,
        permissions_count: payload.permissions.length,
        permissions: payload.permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      roles = [...roles, created];
      return ok(config, { data: created }, 201);
    },
  ],
  [
    'GET',
    /^\/roles\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/(\d+)$/.exec(req.path)?.[1]);
      const role = roles.find((entry) => entry.id === id);
      return role ? ok(config, { data: role }) : failure(config, 404, 'Role not found.');
    },
  ],
  [
    'PUT',
    /^\/roles\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/(\d+)$/.exec(req.path)?.[1]);
      const existing = roles.find((entry) => entry.id === id);
      if (!existing) return failure(config, 404, 'Role not found.');

      const payload = req.body as unknown as RolePayload;
      const name = existing.is_system ? existing.name : String(payload.name ?? '').toLowerCase();

      if (roles.some((role) => role.id !== id && role.name === name)) {
        return unprocessable(config, { name: ['The name has already been taken.'] });
      }

      const updated: RoleDetail = {
        ...existing,
        name,
        permissions: payload.permissions,
        permissions_count: payload.permissions.length,
        updated_at: new Date().toISOString(),
      };

      roles = roles.map((role) => (role.id === id ? updated : role));

      // Editing your own role changes what you may do — mirror that, exactly
      // as the real API would on the next `/auth/me`.
      if (currentUser?.roles.includes(name)) {
        currentUser = { ...currentUser, permissions: payload.permissions };
      }

      return ok(config, { data: updated });
    },
  ],
  [
    'DELETE',
    /^\/roles\/(\d+)$/,
    (req, config) => {
      const id = Number(/\/(\d+)$/.exec(req.path)?.[1]);
      const role = roles.find((entry) => entry.id === id);
      if (!role) return failure(config, 404, 'Role not found.');
      if (role.is_system) return failure(config, 403, 'System roles cannot be deleted.');

      roles = roles.filter((entry) => entry.id !== id);
      return ok(config, null, 204);
    },
  ],
];
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- installation -----------------------------------------------------------

export function installDevApi(): void {
  http.defaults.adapter = async (config) => {
    const req = parse(config as InternalAxiosRequestConfig);
    const route = ROUTES.find(([method, pattern]) => method === req.method && pattern.test(req.path));

    await latency();

    if (!route) {
      return failure(
        config as InternalAxiosRequestConfig,
        501,
        `[dev mock] ${req.method} ${req.path} is not mocked. Add it in src/mocks/devApi.ts.`,
      );
    }

    return route[2](req, config as InternalAxiosRequestConfig);
  };

  console.info(
    `%c[dev mock]%c API is mocked in-memory. Sign in with any listed account · password: ${SHARED_PASSWORD}`,
    'color:#fff;background:#4f46e5;padding:2px 6px;border-radius:3px',
    'color:inherit',
  );
}
