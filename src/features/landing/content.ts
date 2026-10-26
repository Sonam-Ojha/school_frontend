import {
  Award,
  Backpack,
  Banknote,

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
  HandCoins,
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
  { id: 'features', label: 'Features', href: '/features' },
  { id: 'roles', label: 'Who it\'s for', href: '/#roles' },
  { id: 'pricing', label: 'Pricing', href: '/pricing' },
  { id: 'about', label: 'About', href: '/about' },
] as const;

export interface Stat {
  value: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: '20+', label: 'modules in one app' },
  { value: '16', label: 'ready-made roles' },
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
      'Class-wise structures, instalments and concessions; an office fee counter with printed receipts, a day book with the cash handover, and a dues report.',
    icon: Wallet,
  },
  {
    name: 'Expenses',
    summary: 'A voucher for every bill the school pays, filed by head of account, approved by the principal and counted in the day book.',
    icon: HandCoins,
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
  // {
  //   name: 'Hostel',
  //   summary: 'Blocks and rooms, allocations and transfers, hostel charges and the nightly roll call.',
  //   icon: BedDouble,
  // },
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
    summary:
      'Sixteen built-in roles and your own: a View / Create / Edit / Delete / Approve / Export matrix, class-wise scope, hidden fields, personal overrides and an access log.',
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

/** What each of the sixteen built-in roles is responsible for, in the words of its permission set. */
export const ROLE_SUMMARIES: RoleSummary[] = [
  {
    role: ROLES.superAdmin,
    summary: 'Full control of the school, and decides which role can see and do what.',
    icon: ShieldCheck,
  },
  {
    role: ROLES.principal,
    summary: 'Academics, exams and attendance; grants leave, releases broadcasts, signs off payroll and expenses.',
    icon: Award,
  },
  {
    role: ROLES.vicePrincipal,
    summary: 'Students, attendance and the timetable day to day; decides leave and drafts messages.',
    icon: Medal,
  },
  {
    role: ROLES.academicCoordinator,
    summary: 'The academic plan: classes, subjects, timetable, homework and assignments.',
    icon: School,
  },
  {
    role: ROLES.examCoordinator,
    summary: 'Exams end to end: date sheets, marks entry, report cards and publishing results.',
    icon: FileSpreadsheet,
  },
  {
    role: ROLES.classTeacher,
    summary: `Their own class: the register, students' details, homework, report cards and parents.`,
    icon: Users,
  },
  {
    role: ROLES.teacher,
    summary: 'Their subjects: attendance for their periods, homework, assignments and marks.',
    icon: Presentation,
  },
  {
    role: ROLES.accountant,
    summary: 'Runs the fee counter — receipts, the day book and the cash handover — and the expense book; builds the payroll but cannot approve it.',
    icon: Calculator,
  },
  {
    role: ROLES.hrManager,
    summary: 'Staff records and documents, staff attendance and leave, and the monthly payroll.',
    icon: UserCog,
  },
  {
    role: ROLES.receptionist,
    summary: `Admissions and the front desk: new students, ID cards, notices and parents' calls.`,
    icon: ConciergeBell,
  },
  {
    role: ROLES.librarian,
    summary: 'Runs the library, including the right to waive a fine.',
    icon: Library,
  },
  {
    role: ROLES.transportManager,
    summary: 'The fleet: vehicles, routes and stops, drivers, and which student rides where.',
    icon: Bus,
  },
  // {
  //   role: ROLES.hostelWarden,
  //   summary: "Boarding: rooms and beds, allocations, the nightly roll call and boarders leave.",
  //   icon: BedDouble,
  // },
  {
    role: ROLES.staff,
    summary: 'Reads notices and applies for their own leave.',
    icon: HardHat,
  },
  {
    role: ROLES.parent,
    summary: 'Their own children only: attendance, fees, results, homework, transport. Can request leave.',
    icon: HeartHandshake,
  },
  {
    role: ROLES.student,
    summary: 'Their own records: attendance, results, homework, timetable and library.',
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
    body: `Sixteen ready-made roles, plus your own. A class teacher sees their own class; parents and students see only their own child's attendance, fees and results.`,
    icon: Users,
  },
  {
    title: 'Saved before it says “done”',
    body: 'Every change is written to the database in one transaction before the screen confirms it. Nothing is half-saved.',
    icon: Database,
  },
  {
    title: 'Fast on any connection',
    body: `Pages answer in milliseconds, on a school office computer or a parent's phone on mobile data.`,
    icon: Zap,
  },
  {
    title: 'Real documents',
    body: 'Fee receipts, report cards, ID cards, payslips and every report as proper PDF, Excel and CSV files.',
    icon: FileDown,
  },
  {
    title: 'Parents hear from you',
    body: 'Notices and messages by email, SMS and (on Growth and Enterprise) WhatsApp through your own accounts, with delivery recorded for each family.',
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
    body: 'Express checks the sign-in token, then the permission, then applies the schools rules to data held in memory.',
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
