import {
  Award,
  Backpack,
  Banknote,
  BedDouble,
  Bell,
  BookOpen,
  BookOpenCheck,
  Bus,
  Calculator,
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  ChartColumnBig,
  ChartScatter,
  ClipboardList,
  ConciergeBell,
  Database,
  FileDown,
  FileSpreadsheet,
  GraduationCap,
  HardHat,
  HeartHandshake,
  LayoutDashboard,
  LayoutGrid,
  Library,
  Mail,
  Medal,
  MessageSquare,
  Monitor,
  Presentation,
  School,
  Server,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import { ROLES } from '@/types/auth';

/**
 * Everything the landing page says.
 *
 * Kept in one place, apart from the layout, because it is a description of
 * the product and has to stay true to it: when a module gains or loses
 * something, this is the file to correct. Nothing here is aspirational — what
 * is not built or not connected is listed under `ROADMAP`, not above it.
 */

export const NAV_LINKS = [
  { id: 'modules', label: 'Modules' },
  { id: 'roles', label: 'Who it is for' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'highlights', label: 'Why us' },
  { id: 'contact', label: 'Book a demo' },
] as const;

export interface Stat {
  value: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: '20+', label: 'modules in one app' },
  { value: '11', label: 'ready-made roles' },
  { value: '1 min', label: 'to set up a school' },
  { value: '24×7', label: 'from any device' },
];

export interface ModuleSummary {
  name: string;
  summary: string;
  icon: LucideIcon;
}

/** In sidebar order, so the page reads the way the application does. */
export const MODULES: ModuleSummary[] = [
  {
    name: 'Dashboard',
    summary: 'A different home screen for each kind of user, built from the live figures.',
    icon: LayoutDashboard,
  },
  {
    name: 'Students',
    summary:
      'Admission, guardians, medical notes, previous schooling, documents and printable ID cards.',
    icon: GraduationCap,
  },
  {
    name: 'Teachers',
    summary: 'Profiles with qualifications, experience and the classes and subjects each one takes.',
    icon: Users,
  },
  {
    name: 'Staff',
    summary: 'Records and documents for everyone who works at the school without teaching.',
    icon: HardHat,
  },
  {
    name: 'Fees',
    summary:
      'Fee types, class-wise structures and discounts; collection with receipts, payment history and a dues report.',
    icon: Wallet,
  },
  {
    name: 'Payroll',
    summary:
      'Salary components and structures, monthly runs that are processed, approved and paid, and payslips.',
    icon: Banknote,
  },
  {
    name: 'Classes & sections',
    summary: 'Every class and the sections within it, with seats counted against capacity.',
    icon: LayoutGrid,
  },
  {
    name: 'Subjects',
    summary: 'The subjects each class studies, and the teachers who take them.',
    icon: BookOpen,
  },
  {
    name: 'Timetable',
    summary: 'Class and teacher timetables, room allocation and the periods of the school day.',
    icon: CalendarClock,
  },
  {
    name: 'Attendance',
    summary:
      'Daily registers for students, teachers and staff, monthly reports and the holiday calendar.',
    icon: CalendarCheck,
  },
  {
    name: 'Leave',
    summary: 'Leave types and balances, applications with an approval step, and usage reports.',
    icon: CalendarOff,
  },
  {
    name: 'Homework',
    summary: 'Set and publish homework, collect submissions and grade them.',
    icon: BookOpenCheck,
  },
  {
    name: 'Assignments',
    summary: 'Assignments with attachments, submissions, evaluation and a separate release of marks.',
    icon: ClipboardList,
  },
  {
    name: 'Examinations',
    summary: 'Exams with schedules and papers, marks entry, results and report cards.',
    icon: FileSpreadsheet,
  },
  {
    name: 'Library',
    summary: 'Catalogue and copies, issue and return desks, loans, renewals and fines.',
    icon: Library,
  },
  {
    name: 'Transport',
    summary: 'Vehicles, routes with their stops, drivers and the students assigned to each route.',
    icon: Bus,
  },
  {
    name: 'Hostel',
    summary: 'Blocks and rooms, allocations and transfers, hostel charges and the nightly roll call.',
    icon: BedDouble,
  },
  {
    name: 'Messages & notices',
    summary:
      'Notices that are drafted, approved and published, and messages to a chosen audience, with templates.',
    icon: MessageSquare,
  },
  {
    name: 'Notifications',
    summary:
      'An inbox raised by real events, with per-person preferences, email copies and a daily digest.',
    icon: Bell,
  },
  {
    name: 'Reports',
    summary: 'Twelve reports across six families, each exported to CSV, Excel or PDF.',
    icon: ChartColumnBig,
  },
  {
    name: 'Analytics',
    summary: 'Trends and comparisons worked out from the same figures the daily screens use.',
    icon: ChartScatter,
  },
  {
    name: 'Users',
    summary: 'Sign-in accounts for the people who use the system: their roles, status and passwords.',
    icon: UserCog,
  },
  {
    name: 'Roles & permissions',
    summary: 'Eleven built-in roles, roles of your own, and the matrix that says who may do what.',
    icon: ShieldCheck,
  },
  {
    name: 'School settings',
    summary: 'School profile and logo, academic years, locale and currency, and the email set-up.',
    icon: Settings,
  },
];

export interface RoleSummary {
  /** Role slug; the page shows its label. */
  role: string;
  summary: string;
  icon: LucideIcon;
}

/** What each built-in role is for, in the words of its permission set. */
export const ROLE_SUMMARIES: RoleSummary[] = [
  {
    role: ROLES.superAdmin,
    summary: 'Everything, including users, roles and permissions.',
    icon: ShieldCheck,
  },
  {
    role: ROLES.schoolAdmin,
    summary: 'Runs the whole school: all the modules and settings, short of the permission list itself.',
    icon: School,
  },
  {
    role: ROLES.principal,
    summary: 'Academics, exams and attendance; decides leave, releases broadcasts, signs off payroll.',
    icon: Award,
  },
  {
    role: ROLES.vicePrincipal,
    summary: 'Students, attendance and the timetable day to day; decides leave and drafts messages.',
    icon: Medal,
  },
  {
    role: ROLES.teacher,
    summary: 'Marks attendance, sets up exams and enters marks, files leave, reads the timetable.',
    icon: Presentation,
  },
  {
    role: ROLES.accountant,
    summary: 'Fees from end to end; builds the payroll but cannot approve it.',
    icon: Calculator,
  },
  {
    role: ROLES.receptionist,
    summary: 'Admits and updates students, drafts notices and messages, files leave requests.',
    icon: ConciergeBell,
  },
  {
    role: ROLES.librarian,
    summary: 'Runs the library, including the right to waive a fine.',
    icon: Library,
  },
  {
    role: ROLES.staff,
    summary: 'Reads notices, attendance and reports; applies for leave.',
    icon: HardHat,
  },
  {
    role: ROLES.parent,
    summary: 'Read-only: attendance, fees, exams, timetable, transport and hostel. Can request leave.',
    icon: HeartHandshake,
  },
  {
    role: ROLES.student,
    summary: 'Read-only: attendance, exams, notices, library and timetable.',
    icon: Backpack,
  },
];

export interface Highlight {
  title: string;
  body: string;
  icon: LucideIcon;
}

export const HIGHLIGHTS: Highlight[] = [
  {
    title: 'Every school in its own vault',
    body: 'Each school gets its own private database tables, sign-ins and files. No other school can ever see your records.',
    icon: ShieldCheck,
  },
  {
    title: 'The right screen for each person',
    body: 'Eleven ready-made roles, plus your own. Parents and students see only their own child’s attendance, fees and results.',
    icon: Users,
  },
  {
    title: 'Saved before it says “done”',
    body: 'Every change is written to the database in one transaction before the screen confirms it. Nothing is half-saved.',
    icon: Database,
  },
  {
    title: 'Fast on any connection',
    body: 'Pages answer in milliseconds, on a school office computer or a parent’s phone on mobile data.',
    icon: Zap,
  },
  {
    title: 'Real documents',
    body: 'Fee receipts, report cards, ID cards, payslips and every report as proper PDF, Excel and CSV files.',
    icon: FileDown,
  },
  {
    title: 'Parents hear from you',
    body: 'Notices and messages by email, SMS and WhatsApp through your own accounts, with delivery recorded for each family.',
    icon: Mail,
  },
];

export interface FlowStep {
  title: string;
  body: string;
  icon: LucideIcon;
}

/** How a click becomes a saved row. */
export const FLOW: FlowStep[] = [
  {
    title: 'React app',
    body: 'A single-page app, split into a chunk per route. Forms are validated with Zod before anything is sent.',
    icon: Monitor,
  },
  {
    title: 'Node.js API',
    body: 'Express checks the sign-in token, then the permission, then applies the school’s rules to data held in memory.',
    icon: Server,
  },
  {
    title: 'MySQL',
    body: '63 tables hold the durable copy, with companion SQL views so the data can be reported on with ordinary queries.',
    icon: Database,
  },
];

export interface StackGroup {
  title: string;
  items: string[];
}

export const STACK: StackGroup[] = [
  {
    title: 'Frontend',
    items: [
      'React 19',
      'TypeScript',
      'Vite',
      'Tailwind CSS 4',
      'TanStack Query',
      'React Router 7',
      'React Hook Form',
      'Zod',
      'Zustand',
    ],
  },
  {
    title: 'Backend',
    items: ['Node.js', 'Express', 'TypeScript', 'bcrypt', 'Nodemailer', 'PDFKit', 'ExcelJS', 'QR codes'],
  },
  {
    title: 'Data',
    items: ['MySQL / MariaDB', 'One JSON document per row', 'Transactional saves', 'Readable SQL views'],
  },
];

/** Not built, or not connected to anything yet. Listed so nobody has to find out. */
export const ROADMAP: string[] = [
  'SMS and WhatsApp gateway',
  'Push notifications',
  'Biometric attendance devices',
  'Live bus GPS',
  'QR check-in scanning',
  'Per-child scoping for parent and student accounts',
];
