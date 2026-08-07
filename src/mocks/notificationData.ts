import type { NotificationPriority, NotificationType } from '@/features/notifications/types';

/**
 * Notification seed for the development mock.
 *
 * Shapes rather than records. A notification is *raised by* something — a fee
 * falling due, a leave decision, a payroll run — so the mock generates them
 * against the live stores and the live rosters rather than hard-coding a body
 * that would drift the moment a seed moved.
 *
 * Deliberately uneven: read and unread, all three priorities, some with an
 * action and some without, and deliveries in all four states — so the bell,
 * the badge, the filters and the delivery column are all reachable on a fresh
 * clone without touching anything.
 */

/** Who a shape is raised for, expressed as the audience rather than an id. */
export type NotificationAudience =
  | 'admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'everybody';

export interface NotificationShape {
  key: string;
  audience: NotificationAudience;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  /**
   * Which record to point at. The generator resolves it against the live
   * stores and drops the shape if there is nothing to link to — a
   * notification whose "open" leads nowhere is worse than no notification.
   */
  link:
    | { kind: 'none' }
    | { kind: 'fees' }
    | { kind: 'dues' }
    | { kind: 'leave' }
    | { kind: 'payroll' }
    | { kind: 'notices' }
    | { kind: 'homework' }
    | { kind: 'exam' }
    | { kind: 'attendance' }
    | { kind: 'library' }
    | { kind: 'transport' }
    | { kind: 'profile' };
  action_label: string | null;
  /** Hours before now. Spread so the feed has a shape and "just now" is reachable. */
  hoursAgo: number;
  /** Left unread on purpose where the badge needs something to count. */
  read?: boolean;
}

export const notificationShapes: NotificationShape[] = [
  // --- everybody -----------------------------------------------------------
  {
    key: 'welcome',
    audience: 'everybody',
    type: 'account',
    priority: 'normal',
    title: 'Welcome to the school portal',
    body: 'Your account is ready. Set a photo and check your contact details when you have a moment.',
    link: { kind: 'profile' },
    action_label: 'Open your profile',
    hoursAgo: 720,
    read: true,
  },
  {
    key: 'notice-published',
    audience: 'everybody',
    type: 'notice',
    priority: 'important',
    title: 'A new notice is on the board',
    body: 'The office has published something that applies to you.',
    link: { kind: 'notices' },
    action_label: 'Read it',
    hoursAgo: 20,
  },
  {
    key: 'maintenance',
    audience: 'everybody',
    type: 'system',
    priority: 'normal',
    title: 'Planned maintenance on Sunday',
    body: 'The portal will be unavailable between 2am and 4am while the servers are updated.',
    link: { kind: 'none' },
    action_label: null,
    hoursAgo: 50,
    read: true,
  },

  // --- office --------------------------------------------------------------
  {
    key: 'payroll-awaiting',
    audience: 'admin',
    type: 'payroll',
    priority: 'important',
    title: 'A payroll run is costed and unsigned',
    body: 'Nobody can be paid until somebody with the approval right signs it off.',
    link: { kind: 'payroll' },
    action_label: 'Open payroll',
    hoursAgo: 30,
  },
  {
    key: 'fees-overdue',
    audience: 'admin',
    type: 'fee',
    priority: 'important',
    title: 'Fee instalments have passed their due date',
    body: 'Late fines are accruing on them until they are settled.',
    link: { kind: 'dues' },
    action_label: 'See the dues',
    hoursAgo: 4,
  },
  {
    key: 'transport-papers',
    audience: 'admin',
    type: 'transport',
    priority: 'urgent',
    title: 'A bus is running on a lapsed paper',
    body: 'A vehicle without valid insurance or fitness should not be carrying children.',
    link: { kind: 'transport' },
    action_label: 'Check the fleet',
    hoursAgo: 1,
  },

  // --- principal -----------------------------------------------------------
  {
    key: 'leave-awaiting',
    audience: 'principal',
    type: 'leave',
    priority: 'urgent',
    title: 'Leave applications are waiting on you',
    body: 'Some have already begun, which means somebody is away without a decision on record.',
    link: { kind: 'leave' },
    action_label: 'Decide them',
    hoursAgo: 2,
  },
  {
    key: 'attendance-unmarked',
    audience: 'principal',
    type: 'attendance',
    priority: 'normal',
    title: 'Today’s register is not complete',
    body: 'Some students still have no mark against them for today.',
    link: { kind: 'attendance' },
    action_label: 'Open the sheet',
    hoursAgo: 6,
  },
  {
    key: 'results-published',
    audience: 'principal',
    type: 'exam',
    priority: 'normal',
    title: 'Examination results have been published',
    body: 'Ranks are frozen; report cards can be printed.',
    link: { kind: 'exam' },
    action_label: 'See the results',
    hoursAgo: 96,
    read: true,
  },

  // --- teacher -------------------------------------------------------------
  {
    key: 'leave-decided',
    audience: 'teacher',
    type: 'leave',
    priority: 'important',
    title: 'Your leave application has been decided',
    body: 'The decision and any note from the office are on the application.',
    link: { kind: 'leave' },
    action_label: 'Open it',
    hoursAgo: 26,
  },
  {
    key: 'homework-submissions',
    audience: 'teacher',
    type: 'homework',
    priority: 'normal',
    title: 'Submissions are waiting to be marked',
    body: 'Feedback a fortnight late is feedback nobody acts on.',
    link: { kind: 'homework' },
    action_label: 'Open homework',
    hoursAgo: 8,
  },
  {
    key: 'library-due-teacher',
    audience: 'teacher',
    type: 'library',
    priority: 'normal',
    title: 'A library book is due back',
    body: 'A fine starts accruing once it passes its return date.',
    link: { kind: 'library' },
    action_label: 'See the catalogue',
    hoursAgo: 40,
    read: true,
  },

  // --- student -------------------------------------------------------------
  {
    key: 'homework-due',
    audience: 'student',
    type: 'homework',
    priority: 'important',
    title: 'Homework is due soon',
    body: 'Something you have not handed in yet is coming up.',
    link: { kind: 'homework' },
    action_label: 'See what is due',
    hoursAgo: 3,
  },
  {
    key: 'attendance-low',
    audience: 'student',
    type: 'attendance',
    priority: 'important',
    title: 'Your attendance is below what the school expects',
    body: 'It counts towards examination eligibility, so it is worth catching up.',
    link: { kind: 'none' },
    action_label: null,
    hoursAgo: 72,
  },
  {
    key: 'marks-out',
    audience: 'student',
    type: 'exam',
    priority: 'normal',
    title: 'Your results are out',
    body: 'Your report card is ready to look at.',
    link: { kind: 'exam' },
    action_label: 'Open your results',
    hoursAgo: 100,
    read: true,
  },

  // --- parent --------------------------------------------------------------
  {
    key: 'fee-due-parent',
    audience: 'parent',
    type: 'fee',
    priority: 'urgent',
    title: 'A fee instalment is overdue',
    body: 'A late fine accrues daily until it is settled at the school office.',
    link: { kind: 'fees' },
    action_label: 'See what is owed',
    hoursAgo: 5,
  },
  {
    key: 'attendance-parent',
    audience: 'parent',
    type: 'attendance',
    priority: 'important',
    title: 'Your child was marked absent',
    body: 'If this is wrong, the class teacher can correct the register.',
    link: { kind: 'none' },
    action_label: null,
    hoursAgo: 28,
  },
  {
    key: 'homework-parent',
    audience: 'parent',
    type: 'homework',
    priority: 'normal',
    title: 'Homework has been set',
    body: 'Due dates and what has been handed in are on the homework screen.',
    link: { kind: 'homework' },
    action_label: 'See it',
    hoursAgo: 60,
    read: true,
  },
];

/**
 * Which kinds a user may opt into over email and SMS, and how each is
 * described on the preferences screen.
 *
 * Held here rather than on the frontend because the *set* of things a school
 * notifies about is a property of the deployment, not of the browser.
 */
export const preferenceCatalogue: {
  type: NotificationType;
  label: string;
  description: string;
  /** Defaults. Money and absence are worth a text; homework is not. */
  email: boolean;
  sms: boolean;
}[] = [
  {
    type: 'fee',
    label: 'Fees',
    description: 'Instalments falling due, receipts, and anything overdue.',
    email: true,
    sms: true,
  },
  {
    type: 'attendance',
    label: 'Attendance',
    description: 'Absence on the day, and a warning when it drops too low.',
    email: true,
    sms: true,
  },
  {
    type: 'leave',
    label: 'Leave',
    description: 'Applications you filed, and decisions on them.',
    email: true,
    sms: false,
  },
  {
    type: 'exam',
    label: 'Examinations',
    description: 'Timetables published and results released.',
    email: true,
    sms: false,
  },
  {
    type: 'homework',
    label: 'Homework',
    description: 'What has been set, and what is due.',
    email: false,
    sms: false,
  },
  {
    type: 'assignment',
    label: 'Assignments',
    description: 'Coursework set, submitted and marked.',
    email: false,
    sms: false,
  },
  {
    type: 'library',
    label: 'Library',
    description: 'Books due back, and fines on them.',
    email: false,
    sms: false,
  },
  {
    type: 'transport',
    label: 'Transport',
    description: 'Route changes and anything that grounds a bus.',
    email: true,
    sms: true,
  },
  {
    type: 'payroll',
    label: 'Payroll',
    description: 'Payslips released, and runs waiting on you.',
    email: true,
    sms: false,
  },
  {
    type: 'notice',
    label: 'Notices',
    description: 'Anything published to the board that applies to you.',
    email: true,
    sms: false,
  },
  {
    type: 'account',
    label: 'Your account',
    description: 'Sign-ins from a new device, and password changes.',
    email: true,
    sms: false,
  },
  {
    type: 'system',
    label: 'System',
    description: 'Planned maintenance and anything else about the portal itself.',
    email: false,
    sms: false,
  },
];
