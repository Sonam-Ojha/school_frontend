import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';

import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { CLASS_PERMISSIONS, SUBJECT_PERMISSIONS } from '@/features/academics/constants';
import { ASSIGNMENT_PERMISSIONS } from '@/features/assignments/constants';
import { EXAM_PERMISSIONS } from '@/features/exams/constants';
import { LIBRARY_PERMISSIONS } from '@/features/library/constants';
import { HOSTEL_PERMISSIONS } from '@/features/hostel/constants';
import { LEAVE_PERMISSIONS } from '@/features/leave/constants';
import { ANALYTICS_PERMISSIONS } from '@/features/analytics/constants';
import { REPORT_PERMISSIONS } from '@/features/reports/constants';
import { COMMUNICATION_PERMISSIONS } from '@/features/communication/constants';
import { PAYROLL_PERMISSIONS } from '@/features/payroll/constants';
import { TRANSPORT_PERMISSIONS } from '@/features/transport/constants';
import { TIMETABLE_PERMISSIONS } from '@/features/timetable/constants';
import { ATTENDANCE_PERMISSIONS } from '@/features/attendance/constants';
import { EXPENSE_PERMISSIONS } from '@/features/expenses/constants';
import { FEE_PERMISSIONS } from '@/features/fees/constants';
import { HOMEWORK_PERMISSIONS } from '@/features/homework/constants';
import { PERMISSION_PERMISSIONS, ROLE_PERMISSIONS } from '@/features/roles/constants';
import { USER_PERMISSIONS } from '@/features/users/constants';
import { SETTINGS_PERMISSIONS } from '@/features/settings/constants';
import { STAFF_PERMISSIONS } from '@/features/staff/constants';
import { STUDENT_PERMISSIONS } from '@/features/students/constants';
import { TEACHER_PERMISSIONS } from '@/features/teachers/constants';

import { PATHS } from './paths';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { StaffTabRedirect } from './StaffTabRedirect';
import { StudentTabRedirect } from './StudentTabRedirect';
import { TeacherTabRedirect } from './TeacherTabRedirect';

/**
 * Route table.
 *
 * Pages are code-split per route so a module's bundle only loads when it is
 * first visited. Feature modules add their routes to `protectedRoutes` and
 * their sidebar entry in `navigation.ts` — nothing else needs changing.
 *
 * Three kinds of route: the landing page at `/`, open to everybody; guest
 * routes (sign-in, password reset), which a signed-in user is sent away from;
 * and everything else, which needs a session.
 */

const guestRoutes: RouteObject[] = [
  {
    path: PATHS.login,
    lazy: async () => ({ Component: (await import('@/features/auth/pages/LoginPage')).default }),
  },
  {
    path: PATHS.forgotPassword,
    lazy: async () => ({
      Component: (await import('@/features/auth/pages/ForgotPasswordPage')).default,
    }),
  },
  {
    path: PATHS.resetPassword,
    lazy: async () => ({
      Component: (await import('@/features/auth/pages/ResetPasswordPage')).default,
    }),
  },
];

const protectedRoutes: RouteObject[] = [
  // One route, five views — the dashboard resolves which from the signed-in
  // user's roles, so there is no URL a user can reach and not be allowed to see.
  {
    path: PATHS.dashboard,
    lazy: async () => ({
      Component: (await import('@/features/dashboard/pages/DashboardPage')).default,
    }),
  },
  {
    path: PATHS.profile,
    lazy: async () => ({ Component: (await import('@/features/auth/pages/ProfilePage')).default }),
  },
  // Notifications sit beside the profile rather than behind a permission:
  // your own notifications are yours, and no right gates reading what you
  // were sent. `preferences` is declared first so it is never read as a list
  // filter.
  {
    path: PATHS.notificationPreferences,
    lazy: async () => ({
      Component: (await import('@/features/notifications/pages/PreferencesPage')).default,
    }),
  },
  {
    path: PATHS.notifications,
    lazy: async () => ({
      Component: (await import('@/features/notifications/pages/NotificationsPage')).default,
    }),
  },
  {
    path: PATHS.forbidden,
    lazy: async () => ({ Component: (await import('@/pages/ForbiddenPage')).default }),
  },
  // Where a scanned attendance code lands. No permission: anybody on a roster
  // may check themselves in, and the server decides whether this code is theirs.
  {
    path: PATHS.checkIn,
    lazy: async () => ({
      Component: (await import('@/features/attendance/pages/CheckInPage')).default,
    }),
  },
  // Students
  {
    element: <ProtectedRoute permissions={[STUDENT_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.students,
        lazy: async () => ({
          Component: (await import('@/features/students/pages/StudentListPage')).default,
        }),
      },
      {
        path: PATHS.studentAdmission,
        lazy: async () => ({
          Component: (await import('@/features/students/pages/StudentAdmissionPage')).default,
        }),
      },
      {
        path: PATHS.studentEdit,
        lazy: async () => ({
          Component: (await import('@/features/students/pages/StudentEditPage')).default,
        }),
      },
      {
        path: PATHS.studentIdCard,
        lazy: async () => ({
          Component: (await import('@/features/students/pages/StudentIdCardPage')).default,
        }),
      },
      // Profile shell with one route per tab. Declared after the static
      // sibling paths so `/students/admission` is never read as an id.
      {
        path: PATHS.studentProfile,
        lazy: async () => ({
          Component: (await import('@/features/students/pages/StudentProfileLayout'))
            .StudentProfileLayout,
        }),
        children: [
          { index: true, element: <StudentTabRedirect /> },
          {
            path: PATHS.studentOverview,
            lazy: async () => ({
              Component: (await import('@/features/students/pages/StudentProfileTabs')).OverviewTab,
            }),
          },
          {
            path: PATHS.studentGuardians,
            lazy: async () => ({
              Component: (await import('@/features/students/pages/StudentProfileTabs')).GuardiansTab,
            }),
          },
          {
            path: PATHS.studentMedical,
            lazy: async () => ({
              Component: (await import('@/features/students/pages/StudentProfileTabs')).MedicalTab,
            }),
          },
          {
            path: PATHS.studentPreviousSchool,
            lazy: async () => ({
              Component: (await import('@/features/students/pages/StudentProfileTabs'))
                .PreviousSchoolTab,
            }),
          },
          {
            path: PATHS.studentDocuments,
            lazy: async () => ({
              Component: (await import('@/features/students/pages/StudentProfileTabs')).DocumentsTab,
            }),
          },
        ],
      },
    ],
  },
  // Teachers
  {
    element: <ProtectedRoute permissions={[TEACHER_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.teachers,
        lazy: async () => ({
          Component: (await import('@/features/teachers/pages/TeacherListPage')).default,
        }),
      },
      {
        path: PATHS.teacherCreate,
        lazy: async () => ({
          Component: (await import('@/features/teachers/pages/TeacherCreatePage')).default,
        }),
      },
      {
        path: PATHS.teacherEdit,
        lazy: async () => ({
          Component: (await import('@/features/teachers/pages/TeacherEditPage')).default,
        }),
      },
      // Declared after the static sibling paths so `/teachers/new` is never
      // read as an id.
      {
        path: PATHS.teacherProfile,
        lazy: async () => ({
          Component: (await import('@/features/teachers/pages/TeacherProfileLayout'))
            .TeacherProfileLayout,
        }),
        children: [
          { index: true, element: <TeacherTabRedirect /> },
          {
            path: PATHS.teacherOverview,
            lazy: async () => ({
              Component: (await import('@/features/teachers/pages/TeacherProfileTabs')).OverviewTab,
            }),
          },
          {
            path: PATHS.teacherQualifications,
            lazy: async () => ({
              Component: (await import('@/features/teachers/pages/TeacherProfileTabs'))
                .QualificationsTab,
            }),
          },
          {
            path: PATHS.teacherExperience,
            lazy: async () => ({
              Component: (await import('@/features/teachers/pages/TeacherProfileTabs'))
                .ExperienceTab,
            }),
          },
          {
            path: PATHS.teacherAssignments,
            lazy: async () => ({
              Component: (await import('@/features/teachers/pages/TeacherProfileTabs'))
                .AssignmentsTab,
            }),
          },
          {
            path: PATHS.teacherDocuments,
            lazy: async () => ({
              Component: (await import('@/features/teachers/pages/TeacherProfileTabs')).DocumentsTab,
            }),
          },
        ],
      },
    ],
  },
  // Staff (non-teaching)
  {
    element: <ProtectedRoute permissions={[STAFF_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.staff,
        lazy: async () => ({
          Component: (await import('@/features/staff/pages/StaffListPage')).default,
        }),
      },
      {
        path: PATHS.staffCreate,
        lazy: async () => ({
          Component: (await import('@/features/staff/pages/StaffCreatePage')).default,
        }),
      },
      {
        path: PATHS.staffEdit,
        lazy: async () => ({
          Component: (await import('@/features/staff/pages/StaffEditPage')).default,
        }),
      },
      // Declared after the static sibling paths so `/staff/new` is never read
      // as an id.
      {
        path: PATHS.staffProfile,
        lazy: async () => ({
          Component: (await import('@/features/staff/pages/StaffProfileLayout')).StaffProfileLayout,
        }),
        children: [
          { index: true, element: <StaffTabRedirect /> },
          {
            path: PATHS.staffOverview,
            lazy: async () => ({
              Component: (await import('@/features/staff/pages/StaffProfileTabs')).OverviewTab,
            }),
          },
          {
            path: PATHS.staffDocuments,
            lazy: async () => ({
              Component: (await import('@/features/staff/pages/StaffProfileTabs')).DocumentsTab,
            }),
          },
        ],
      },
    ],
  },
  // Homework
  {
    element: <ProtectedRoute permissions={[HOMEWORK_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.homework,
        lazy: async () => ({
          Component: (await import('@/features/homework/pages/HomeworkListPage')).default,
        }),
      },
      {
        path: PATHS.homeworkCreate,
        lazy: async () => ({
          Component: (await import('@/features/homework/pages/HomeworkFormPages'))
            .HomeworkCreatePage,
        }),
      },
      {
        path: PATHS.homeworkEdit,
        lazy: async () => ({
          Component: (await import('@/features/homework/pages/HomeworkFormPages')).HomeworkEditPage,
        }),
      },
      // Declared after the static siblings so `/homework/new` is never an id.
      {
        path: PATHS.homeworkDetail,
        lazy: async () => ({
          Component: (await import('@/features/homework/pages/HomeworkDetailPage')).default,
        }),
      },
    ],
  },
  // Examinations
  {
    element: <ProtectedRoute permissions={[EXAM_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.exams,
        lazy: async () => ({
          Component: (await import('@/features/exams/pages/ExamListPage')).default,
        }),
      },
      {
        path: PATHS.examCreate,
        lazy: async () => ({
          Component: (await import('@/features/exams/pages/ExamFormPages')).ExamCreatePage,
        }),
      },
      {
        path: PATHS.examEdit,
        lazy: async () => ({
          Component: (await import('@/features/exams/pages/ExamFormPages')).ExamEditPage,
        }),
      },
      {
        path: PATHS.examMarks,
        lazy: async () => ({
          Component: (await import('@/features/exams/pages/MarksEntryPage')).default,
        }),
      },
      {
        path: PATHS.examResults,
        lazy: async () => ({
          Component: (await import('@/features/exams/pages/ExamResultsPage')).default,
        }),
      },
      {
        path: PATHS.examReportCard,
        lazy: async () => ({
          Component: (await import('@/features/exams/pages/ReportCardPage')).default,
        }),
      },
      // Declared after the static siblings so `/exams/new` is never an id.
      {
        path: PATHS.examDetail,
        lazy: async () => ({
          Component: (await import('@/features/exams/pages/ExamDetailPage')).default,
        }),
      },
    ],
  },
  // Assignments
  {
    element: <ProtectedRoute permissions={[ASSIGNMENT_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.assignments,
        lazy: async () => ({
          Component: (await import('@/features/assignments/pages/AssignmentListPage')).default,
        }),
      },
      {
        path: PATHS.assignmentCreate,
        lazy: async () => ({
          Component: (await import('@/features/assignments/pages/AssignmentFormPages'))
            .AssignmentCreatePage,
        }),
      },
      {
        path: PATHS.assignmentEdit,
        lazy: async () => ({
          Component: (await import('@/features/assignments/pages/AssignmentFormPages'))
            .AssignmentEditPage,
        }),
      },
      // Declared after the static siblings so `/assignments/new` is never an id.
      {
        path: PATHS.assignmentDetail,
        lazy: async () => ({
          Component: (await import('@/features/assignments/pages/AssignmentDetailPage')).default,
        }),
      },
    ],
  },
  // Fees — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[FEE_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.fees,
        lazy: async () => ({
          Component: (await import('@/features/fees/pages/FeesLayout')).FeesLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.feeCollection} replace /> },
          {
            path: PATHS.feeCollection,
            lazy: async () => ({
              Component: (await import('@/features/fees/pages/FeeCollectionPage')).default,
            }),
          },
          {
            path: PATHS.feePayments,
            lazy: async () => ({
              Component: (await import('@/features/fees/pages/PaymentPages')).PaymentHistoryPage,
            }),
          },
          {
            path: PATHS.feeDues,
            lazy: async () => ({
              Component: (await import('@/features/fees/pages/PaymentPages')).DueReportPage,
            }),
          },
          {
            path: PATHS.feeDayBook,
            lazy: async () => ({
              Component: (await import('@/features/fees/pages/DayBookPage')).default,
            }),
          },
          {
            path: PATHS.feeTypes,
            lazy: async () => ({
              Component: (await import('@/features/fees/pages/CataloguePages')).FeeTypesPage,
            }),
          },
          {
            path: PATHS.feeDiscounts,
            lazy: async () => ({
              Component: (await import('@/features/fees/pages/CataloguePages')).DiscountsPage,
            }),
          },
          {
            path: PATHS.feeStructures,
            lazy: async () => ({
              Component: (await import('@/features/fees/pages/FeeStructurePages'))
                .FeeStructuresPage,
            }),
          },
        ],
      },
      // Full-width screens that sit outside the tab shell.
      {
        path: PATHS.feeReceipt,
        lazy: async () => ({
          Component: (await import('@/features/fees/pages/PaymentPages')).ReceiptPage,
        }),
      },
      {
        path: PATHS.feeStructureCreate,
        lazy: async () => ({
          Component: (await import('@/features/fees/pages/FeeStructurePages'))
            .FeeStructureCreatePage,
        }),
      },
      {
        path: PATHS.feeStructureEdit,
        lazy: async () => ({
          Component: (await import('@/features/fees/pages/FeeStructurePages'))
            .FeeStructureEditPage,
        }),
      },
    ],
  },
  // Expenses — what the school pays out.
  {
    element: <ProtectedRoute permissions={[EXPENSE_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.expenses,
        lazy: async () => ({
          Component: (await import('@/features/expenses/pages/ExpensesPage')).default,
        }),
      },
    ],
  },
  // Attendance — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[ATTENDANCE_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.attendance,
        lazy: async () => ({
          Component: (await import('@/features/attendance/pages/AttendanceLayout'))
            .AttendanceLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.attendanceStudents} replace /> },
          {
            path: PATHS.attendanceStudents,
            lazy: async () => ({
              Component: (await import('@/features/attendance/pages/DailyAttendancePage'))
                .StudentAttendancePage,
            }),
          },
          {
            path: PATHS.attendanceTeachers,
            lazy: async () => ({
              Component: (await import('@/features/attendance/pages/DailyAttendancePage'))
                .TeacherAttendancePage,
            }),
          },
          {
            path: PATHS.attendanceStaff,
            lazy: async () => ({
              Component: (await import('@/features/attendance/pages/DailyAttendancePage'))
                .StaffAttendancePage,
            }),
          },
          {
            path: PATHS.attendanceReports,
            lazy: async () => ({
              Component: (await import('@/features/attendance/pages/MonthlyReportPage')).default,
            }),
          },
          {
            path: PATHS.attendanceHolidays,
            lazy: async () => ({
              Component: (await import('@/features/attendance/pages/HolidayCalendarPage')).default,
            }),
          },
          {
            path: PATHS.attendanceDevices,
            lazy: async () => ({
              Component: (await import('@/features/attendance/pages/AttendanceDevicesPage'))
                .default,
            }),
          },
        ],
      },
    ],
  },
  // Communication — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[COMMUNICATION_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.communication,
        lazy: async () => ({
          Component: (await import('@/features/communication/pages/CommunicationLayout'))
            .CommunicationLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.communicationMessages} replace /> },
          {
            path: PATHS.communicationMessages,
            lazy: async () => ({
              Component: (await import('@/features/communication/pages/MessagesPage')).default,
            }),
          },
          {
            path: PATHS.communicationNotices,
            lazy: async () => ({
              Component: (await import('@/features/communication/pages/NoticesPage')).default,
            }),
          },
          {
            path: PATHS.communicationTemplates,
            lazy: async () => ({
              Component: (await import('@/features/communication/pages/TemplatesPage')).default,
            }),
          },
          {
            path: PATHS.communicationChannels,
            lazy: async () => ({
              Component: (await import('@/features/communication/pages/ChannelsPage')).default,
            }),
          },
          // Declared after the static siblings so none can be read as an id.
          {
            path: PATHS.communicationMessageDetail,
            lazy: async () => ({
              Component: (await import('@/features/communication/pages/MessageDetailPage'))
                .default,
            }),
          },
          {
            path: PATHS.communicationNoticeDetail,
            lazy: async () => ({
              Component: (await import('@/features/communication/pages/NoticeDetailPage'))
                .default,
            }),
          },
        ],
      },
    ],
  },
  // Payroll — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[PAYROLL_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.payroll,
        lazy: async () => ({
          Component: (await import('@/features/payroll/pages/PayrollLayout')).PayrollLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.payrollRuns} replace /> },
          {
            path: PATHS.payrollRuns,
            lazy: async () => ({
              Component: (await import('@/features/payroll/pages/RunsPage')).default,
            }),
          },
          {
            path: PATHS.payrollStructures,
            lazy: async () => ({
              Component: (await import('@/features/payroll/pages/StructuresPage')).default,
            }),
          },
          {
            path: PATHS.payrollStatutory,
            lazy: async () => ({
              Component: (await import('@/features/payroll/pages/StatutoryPage')).default,
            }),
          },
          {
            path: PATHS.payrollComponents,
            lazy: async () => ({
              Component: (await import('@/features/payroll/pages/ComponentsPage')).default,
            }),
          },
          {
            path: PATHS.payrollPayslip,
            lazy: async () => ({
              Component: (await import('@/features/payroll/pages/PayslipPage')).default,
            }),
          },
          // Declared after the static siblings so none can be read as an id.
          {
            path: PATHS.payrollRunDetail,
            lazy: async () => ({
              Component: (await import('@/features/payroll/pages/RunDetailPage')).default,
            }),
          },
        ],
      },
    ],
  },
  // Analytics — one nested layout; the domain is a route parameter.
  {
    element: <ProtectedRoute permissions={[ANALYTICS_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.analytics,
        lazy: async () => ({
          Component: (await import('@/features/analytics/pages/AnalyticsLayout')).AnalyticsLayout,
        }),
        children: [
          { index: true, element: <Navigate to="/analytics/performance" replace /> },
          {
            path: PATHS.analyticsDomain,
            lazy: async () => ({
              Component: (await import('@/features/analytics/pages/AnalyticsDomainPage')).default,
            }),
          },
        ],
      },
    ],
  },
  // Reports — one nested layout; the family is a route parameter, so the six
  // families share a single page rather than six near-identical copies.
  {
    element: <ProtectedRoute permissions={[REPORT_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.reports,
        lazy: async () => ({
          Component: (await import('@/features/reports/pages/ReportsLayout')).ReportsLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.reportsOverview} replace /> },
          {
            path: PATHS.reportsOverview,
            lazy: async () => ({
              Component: (await import('@/features/reports/pages/ReportsOverviewPage')).default,
            }),
          },
          // Declared after `overview` so that static sibling wins the match.
          {
            path: PATHS.reportFamily,
            lazy: async () => ({
              Component: (await import('@/features/reports/pages/ReportFamilyPage')).default,
            }),
          },
        ],
      },
    ],
  },
  // Leave — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[LEAVE_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.leave,
        lazy: async () => ({
          Component: (await import('@/features/leave/pages/LeaveLayout')).LeaveLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.leaveApplications} replace /> },
          {
            path: PATHS.leaveApplications,
            lazy: async () => ({
              Component: (await import('@/features/leave/pages/ApplicationsPage')).default,
            }),
          },
          {
            path: PATHS.leaveBalances,
            lazy: async () => ({
              Component: (await import('@/features/leave/pages/BalancesPage')).default,
            }),
          },
          {
            path: PATHS.leaveReports,
            lazy: async () => ({
              Component: (await import('@/features/leave/pages/ReportsPage')).default,
            }),
          },
          {
            path: PATHS.leaveTypes,
            lazy: async () => ({
              Component: (await import('@/features/leave/pages/LeaveTypesPage')).default,
            }),
          },
          // Declared after the static siblings so none can be read as an id.
          {
            path: PATHS.leaveApplicationDetail,
            lazy: async () => ({
              Component: (await import('@/features/leave/pages/ApplicationDetailPage')).default,
            }),
          },
        ],
      },
    ],
  },
  // Hostel — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[HOSTEL_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.hostel,
        lazy: async () => ({
          Component: (await import('@/features/hostel/pages/HostelLayout')).HostelLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.hostelRooms} replace /> },
          {
            path: PATHS.hostelRooms,
            lazy: async () => ({
              Component: (await import('@/features/hostel/pages/RoomsPage')).default,
            }),
          },
          {
            path: PATHS.hostelAllocations,
            lazy: async () => ({
              Component: (await import('@/features/hostel/pages/AllocationsPage')).default,
            }),
          },
          {
            path: PATHS.hostelFees,
            lazy: async () => ({
              Component: (await import('@/features/hostel/pages/FeesPage')).default,
            }),
          },
          {
            path: PATHS.hostelRollCall,
            lazy: async () => ({
              Component: (await import('@/features/hostel/pages/RollCallPage')).default,
            }),
          },
          {
            path: PATHS.hostelBlocks,
            lazy: async () => ({
              Component: (await import('@/features/hostel/pages/BlocksPage')).default,
            }),
          },
          // Declared after the static siblings so none can be read as an id.
          {
            path: PATHS.hostelRoomDetail,
            lazy: async () => ({
              Component: (await import('@/features/hostel/pages/RoomDetailPage')).default,
            }),
          },
        ],
      },
    ],
  },
  // Transport — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[TRANSPORT_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.transport,
        lazy: async () => ({
          Component: (await import('@/features/transport/pages/TransportLayout')).TransportLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.transportVehicles} replace /> },
          {
            path: PATHS.transportVehicles,
            lazy: async () => ({
              Component: (await import('@/features/transport/pages/VehiclesPage')).default,
            }),
          },
          {
            path: PATHS.transportRoutes,
            lazy: async () => ({
              Component: (await import('@/features/transport/pages/RoutesPage')).default,
            }),
          },
          {
            path: PATHS.transportDrivers,
            lazy: async () => ({
              Component: (await import('@/features/transport/pages/DriversPage')).default,
            }),
          },
          {
            path: PATHS.transportTracking,
            lazy: async () => ({
              Component: (await import('@/features/transport/pages/TrackingPage')).default,
            }),
          },
          // Declared after the static siblings so neither can be read as an id.
          {
            path: PATHS.transportVehicleDetail,
            lazy: async () => ({
              Component: (await import('@/features/transport/pages/VehicleDetailPage')).default,
            }),
          },
          {
            path: PATHS.transportRouteDetail,
            lazy: async () => ({
              Component: (await import('@/features/transport/pages/RouteDetailPage')).default,
            }),
          },
        ],
      },
    ],
  },
  // Library — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[LIBRARY_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.library,
        lazy: async () => ({
          Component: (await import('@/features/library/pages/LibraryLayout')).LibraryLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.libraryCatalogue} replace /> },
          {
            path: PATHS.libraryCatalogue,
            lazy: async () => ({
              Component: (await import('@/features/library/pages/BookCataloguePage')).default,
            }),
          },
          {
            path: PATHS.libraryIssue,
            lazy: async () => ({
              Component: (await import('@/features/library/pages/IssueDeskPage')).default,
            }),
          },
          {
            path: PATHS.libraryReturn,
            lazy: async () => ({
              Component: (await import('@/features/library/pages/ReturnDeskPage')).default,
            }),
          },
          {
            path: PATHS.libraryLoans,
            lazy: async () => ({
              Component: (await import('@/features/library/pages/LoansPage')).default,
            }),
          },
          {
            path: PATHS.libraryFines,
            lazy: async () => ({
              Component: (await import('@/features/library/pages/FinesPage')).default,
            }),
          },
          {
            path: PATHS.libraryCategories,
            lazy: async () => ({
              Component: (await import('@/features/library/pages/CategoriesPage')).default,
            }),
          },
          // Declared last so `/library/catalogue/new` could never be an id.
          {
            path: PATHS.libraryBookDetail,
            lazy: async () => ({
              Component: (await import('@/features/library/pages/BookDetailPage')).default,
            }),
          },
        ],
      },
    ],
  },
  // Timetable — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[TIMETABLE_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.timetable,
        lazy: async () => ({
          Component: (await import('@/features/timetable/pages/TimetableLayout')).TimetableLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.timetableClasses} replace /> },
          {
            path: PATHS.timetableClasses,
            lazy: async () => ({
              Component: (await import('@/features/timetable/pages/ClassTimetablePage')).default,
            }),
          },
          {
            path: PATHS.timetableTeachers,
            lazy: async () => ({
              Component: (await import('@/features/timetable/pages/TeacherTimetablePage')).default,
            }),
          },
          {
            path: PATHS.timetableRooms,
            lazy: async () => ({
              Component: (await import('@/features/timetable/pages/RoomAllocationPage')).default,
            }),
          },
          {
            path: PATHS.timetablePeriods,
            lazy: async () => ({
              Component: (await import('@/features/timetable/pages/PeriodManagementPage')).default,
            }),
          },
        ],
      },
    ],
  },
  // Academics
  {
    element: <ProtectedRoute permissions={[CLASS_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.classes,
        lazy: async () => ({
          Component: (await import('@/features/academics/pages/ClassListPage')).default,
        }),
      },
      {
        path: PATHS.classDetail,
        lazy: async () => ({
          Component: (await import('@/features/academics/pages/ClassDetailPage')).default,
        }),
      },
    ],
  },
  {
    element: <ProtectedRoute permissions={[SUBJECT_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.subjects,
        lazy: async () => ({
          Component: (await import('@/features/academics/pages/SubjectListPage')).default,
        }),
      },
    ],
  },
  // Access control — guarded by permission, not just by being signed in.
  {
    element: <ProtectedRoute permissions={[USER_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.users,
        lazy: async () => ({
          Component: (await import('@/features/users/pages/UserListPage')).default,
        }),
      },
    ],
  },
  {
    element: <ProtectedRoute permissions={[ROLE_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.roles,
        lazy: async () => ({
          Component: (await import('@/features/roles/pages/RoleListPage')).default,
        }),
      },
      {
        path: PATHS.roleCreate,
        lazy: async () => ({
          Component: (await import('@/features/roles/pages/RoleCreatePage')).default,
        }),
      },
      {
        path: PATHS.roleEdit,
        lazy: async () => ({
          Component: (await import('@/features/roles/pages/RoleEditPage')).default,
        }),
      },
    ],
  },
  {
    element: <ProtectedRoute permissions={[PERMISSION_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.permissions,
        lazy: async () => ({
          Component: (await import('@/features/roles/pages/PermissionListPage')).default,
        }),
      },
    ],
  },
  {
    element: <ProtectedRoute permissions={[ROLE_PERMISSIONS.read, USER_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.accessLog,
        lazy: async () => ({
          Component: (await import('@/features/users/pages/AccessLogPage')).default,
        }),
      },
    ],
  },
  // The school's own account with the platform: plan, invoices, support.
  {
    element: <ProtectedRoute permissions={[SETTINGS_PERMISSIONS.update]} />,
    children: [
      {
        path: PATHS.subscription,
        lazy: async () => ({
          Component: (await import('@/features/saas/pages/SubscriptionPage')).default,
        }),
      },
      {
        path: PATHS.support,
        lazy: async () => ({
          Component: (await import('@/features/saas/pages/SupportPage')).default,
        }),
      },
      {
        path: PATHS.supportTicket,
        lazy: async () => ({
          Component: (await import('@/features/saas/pages/TicketPage')).default,
        }),
      },
    ],
  },
  // School settings — one nested layout, one route per tab.
  {
    element: <ProtectedRoute permissions={[SETTINGS_PERMISSIONS.read]} />,
    children: [
      {
        path: PATHS.settings,
        lazy: async () => ({
          Component: (await import('@/features/settings/pages/SettingsLayout')).SettingsLayout,
        }),
        children: [
          { index: true, element: <Navigate to={PATHS.settingsProfile} replace /> },
          {
            path: PATHS.settingsProfile,
            lazy: async () => ({
              Component: (await import('@/features/settings/pages/SettingsTabPages')).ProfileTab,
            }),
          },
          {
            path: PATHS.settingsAddress,
            lazy: async () => ({
              Component: (await import('@/features/settings/pages/SettingsTabPages')).AddressTab,
            }),
          },
          {
            path: PATHS.settingsSessions,
            lazy: async () => ({
              Component: (await import('@/features/settings/pages/SettingsTabPages')).SessionsTab,
            }),
          },
          {
            path: PATHS.settingsLocalization,
            lazy: async () => ({
              Component: (await import('@/features/settings/pages/SettingsTabPages'))
                .LocalizationTab,
            }),
          },
          {
            path: PATHS.settingsEmail,
            lazy: async () => ({
              Component: (await import('@/features/settings/pages/SettingsTabPages')).EmailTab,
            }),
          },
          {
            path: PATHS.settingsSms,
            lazy: async () => ({
              Component: (await import('@/features/settings/pages/SettingsTabPages')).SmsTab,
            }),
          },
        ],
      },
    ],
  },
  // Catch-all sits inside the app shell so a mistyped URL keeps the navigation.
  {
    path: '*',
    lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).default }),
  },
];

/**
 * One school's application, served under its code: `/greenwood/students`.
 *
 * Every path in `PATHS` is relative to that base, so links inside the app
 * never mention the school — the router adds it. The school's own home,
 * `/greenwood`, opens the dashboard, or the sign-in page for a visitor.
 */
export function createSchoolRouter(code: string) {
  return createBrowserRouter(
    [
      {
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            element: <PublicRoute />,
            children: [{ element: <AuthLayout />, children: guestRoutes }],
          },
          {
            element: <ProtectedRoute />,
            children: [
              { path: PATHS.root, element: <Navigate to={PATHS.dashboard} replace /> },
              { element: <AppLayout />, children: protectedRoutes },
            ],
          },
        ],
      },
    ],
    { basename: `/${code}` },
  );
}
