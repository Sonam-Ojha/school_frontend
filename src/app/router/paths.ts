/**
 * Every route path in one place. Import from here instead of writing string
 * literals so a URL change is a single edit.
 */
export const PATHS = {
  root: '/',

  // Guest
  login: '/login',
  forgotPassword: '/forgot-password',
  /** Pattern — build with `toPath(PATHS.resetPassword, { token })`. */
  resetPassword: '/reset-password/:token',

  // Authenticated
  dashboard: '/dashboard',
  profile: '/profile',
  /** Ask about students, attendance, fees and results, typed or spoken. Staff only; a plan module. */
  assistant: '/assistant',

  // Notifications — personal, so no permission gates them.
  notifications: '/notifications',
  notificationPreferences: '/notifications/preferences',

  // Students — patterns are built with `toPath(..., { id })`.
  students: '/students',
  studentAdmission: '/students/admission',
  studentProfile: '/students/:id',
  studentOverview: '/students/:id/overview',
  studentGuardians: '/students/:id/guardians',
  studentMedical: '/students/:id/medical',
  studentPreviousSchool: '/students/:id/previous-school',
  studentDocuments: '/students/:id/documents',
  studentEdit: '/students/:id/edit',
  studentIdCard: '/students/:id/id-card',

  // Teachers
  teachers: '/teachers',
  teacherCreate: '/teachers/new',
  teacherProfile: '/teachers/:id',
  teacherOverview: '/teachers/:id/overview',
  teacherQualifications: '/teachers/:id/qualifications',
  teacherExperience: '/teachers/:id/experience',
  teacherAssignments: '/teachers/:id/assignments',
  teacherDocuments: '/teachers/:id/documents',
  teacherEdit: '/teachers/:id/edit',

  // Examinations
  exams: '/exams',
  examCreate: '/exams/new',
  examDetail: '/exams/:id',
  examEdit: '/exams/:id/edit',
  examMarks: '/exams/:id/papers/:paperId/marks',
  examResults: '/exams/:id/results',
  examReportCard: '/exams/:id/report-cards/:studentId',

  // Assignments
  assignments: '/assignments',
  assignmentCreate: '/assignments/new',
  assignmentDetail: '/assignments/:id',
  assignmentEdit: '/assignments/:id/edit',

  // Homework
  homework: '/homework',
  homeworkCreate: '/homework/new',
  homeworkDetail: '/homework/:id',
  homeworkEdit: '/homework/:id/edit',

  // Fees
  fees: '/fees',
  feeCollection: '/fees/collect',
  feePayments: '/fees/payments',
  feeReceipt: '/fees/payments/:id',
  feeDues: '/fees/dues',
  /** One day at the counter: receipts, money by mode, expenses and the cash handed over. */
  feeDayBook: '/fees/day-book',
  feeStructures: '/fees/structures',
  feeStructureCreate: '/fees/structures/new',
  feeStructureEdit: '/fees/structures/:id',
  feeTypes: '/fees/types',
  feeDiscounts: '/fees/discounts',

  // Attendance
  attendance: '/attendance',
  attendanceStudents: '/attendance/students',
  attendanceTeachers: '/attendance/teachers',
  attendanceStaff: '/attendance/staff',
  attendanceReports: '/attendance/reports',
  attendanceHolidays: '/attendance/holidays',
  attendanceDevices: '/attendance/devices',
  /** Where a scanned check-in code lands. Build with `toPath(PATHS.checkIn, { token })`. */
  checkIn: '/check-in/:token',

  // Analytics — one route per domain. Beside reports, not inside it: one
  // says what happened, the other what it means.
  analytics: '/analytics',
  /** Pattern — build with `toPath(PATHS.analyticsDomain, { domain })`. */
  analyticsDomain: '/analytics/:domain',

  // Reports — one route per family, plus the cross-module overview.
  reports: '/reports',
  reportsOverview: '/reports/overview',
  /** Pattern — build with `toPath(PATHS.reportFamily, { family })`. */
  reportFamily: '/reports/:family',

  // Leave
  leave: '/leave',
  leaveApplications: '/leave/applications',
  leaveApplicationDetail: '/leave/applications/:id',
  leaveBalances: '/leave/balances',
  leaveReports: '/leave/reports',
  leaveTypes: '/leave/types',

  // Communication
  communication: '/communication',
  communicationMessages: '/communication/messages',
  communicationMessageDetail: '/communication/messages/:id',
  communicationNotices: '/communication/notices',
  communicationNoticeDetail: '/communication/notices/:id',
  communicationTemplates: '/communication/templates',
  communicationChannels: '/communication/channels',

  // Expenses — what the school pays out, recorded by the accountant, approved by the principal.
  expenses: '/expenses',

  // Payroll
  payroll: '/payroll',
  payrollRuns: '/payroll/runs',
  payrollRunDetail: '/payroll/runs/:id',
  payrollPayslip: '/payroll/payslips/:id',
  payrollStructures: '/payroll/salaries',
  payrollStatutory: '/payroll/statutory',
  payrollComponents: '/payroll/components',

  // Hostel
  hostel: '/hostel',
  hostelRooms: '/hostel/rooms',
  hostelRoomDetail: '/hostel/rooms/:id',
  hostelAllocations: '/hostel/residents',
  hostelFees: '/hostel/fees',
  hostelRollCall: '/hostel/roll-call',
  hostelBlocks: '/hostel/blocks',

  // Transport
  transport: '/transport',
  transportVehicles: '/transport/vehicles',
  transportVehicleDetail: '/transport/vehicles/:id',
  transportRoutes: '/transport/routes',
  transportRouteDetail: '/transport/routes/:id',
  transportDrivers: '/transport/drivers',
  transportTracking: '/transport/tracking',

  // Library
  library: '/library',
  libraryCatalogue: '/library/catalogue',
  libraryBookDetail: '/library/catalogue/:id',
  libraryIssue: '/library/issue',
  libraryReturn: '/library/return',
  libraryLoans: '/library/loans',
  libraryFines: '/library/fines',
  libraryCategories: '/library/categories',

  // Timetable
  timetable: '/timetable',
  timetableClasses: '/timetable/classes',
  timetableTeachers: '/timetable/teachers',
  timetableRooms: '/timetable/rooms',
  timetablePeriods: '/timetable/periods',

  // Academics
  classes: '/academics/classes',
  classDetail: '/academics/classes/:id',
  subjects: '/academics/subjects',

  // Staff (non-teaching)
  staff: '/staff',
  staffCreate: '/staff/new',
  staffProfile: '/staff/:id',
  staffOverview: '/staff/:id/overview',
  staffDocuments: '/staff/:id/documents',
  staffEdit: '/staff/:id/edit',

  // Access control
  roles: '/roles',
  roleCreate: '/roles/create',
  /** Pattern — build with `toPath(PATHS.roleEdit, { id })`. */
  roleEdit: '/roles/:id/edit',
  permissions: '/permissions',
  users: '/users',
  /** Who changed which role, permission or account, and when. */
  accessLog: '/access-log',

  // School settings — tabs are real routes so each is linkable.
  settings: '/settings',
  settingsProfile: '/settings/profile',
  settingsAddress: '/settings/address',
  settingsSessions: '/settings/sessions',
  settingsLocalization: '/settings/regional',
  settingsEmail: '/settings/email',
  settingsSms: '/settings/sms',

  // The school's own account with the platform — for the School Admin.
  subscription: '/subscription',
  support: '/support',
  /** Pattern — build with `toPath(PATHS.supportTicket, { id })`. */
  supportTicket: '/support/:id',

  forbidden: '/403',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];

/** Build a detail URL: `toPath('/students/:id', { id: 12 })`. */
export function toPath(pattern: string, params: Record<string, string | number>): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, String(value)),
    pattern,
  );
}
