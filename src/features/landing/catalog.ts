import {
  Activity,
  BadgeIndianRupee,
  Banknote,
  BarChart3,
  BedDouble,
  Bell,
  BookOpenCheck,
  BookOpenText,
  Building2,
  Bus,
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  ChartScatter,
  ClipboardList,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  HandCoins,
  HardHat,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  Library,
  Lock,
  Megaphone,
  MessageSquare,
  Palette,
  Presentation,
  Printer,
  Receipt,
  Settings,
  ShieldCheck,
  Smartphone,
  TrendingDown,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/**
 * Every feature the platform has, grouped as a school thinks of them. The
 * website's Features page is built from this list and the home page links
 * into it, so it has to stay true to the application: a feature goes here
 * when it works, and what is still being built goes under `ROADMAP`.
 */

export interface FeatureModule {
  name: string;
  icon: LucideIcon;
  summary: string;
  points: string[];
}

export interface FeatureGroup {
  /** The anchor the home page and the sub-navigation jump to. */
  id: string;
  title: string;
  short: string;
  lead: string;
  icon: LucideIcon;
  modules: FeatureModule[];
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: 'administration',
    title: 'School administration',
    short: 'Administration',
    lead: 'Set the school up once — sessions, classes, subjects, people and settings — and it is ready for every office to work in.',
    icon: Settings,
    modules: [
      {
        name: 'School Admin panel',
        icon: Settings,
        summary: 'Complete control of your school, from its letterhead to who may sign in.',
        points: [
          'School profile, address and logo — printed on receipts, report cards and ID cards',
          'Academic years run April to March, with the current session marked',
          'Regional settings: time zone, ₹ currency and Indian number formatting',
          'Email and SMS settings for messages from your own accounts',
          'Sign-in accounts for every staff member, parent and student — several roles per person',
          'Each person chooses which notifications reach them, and how',
        ],
      },
      {
        name: 'Classes, sections & subjects',
        icon: LayoutGrid,
        summary: 'The structure everything else hangs on.',
        points: [
          'Classes from Nursery to Class 12, each with sections, shift and seat capacity',
          'Seats taken against capacity, section by section',
          'Subjects with theory and practical marks, pass marks and credits',
          'The teachers who take each subject in each class',
        ],
      },
      {
        name: 'Subscription & help',
        icon: CreditCard,
        summary: 'Your plan, invoices and support desk, inside the application.',
        points: [
          'Your plan, the modules it includes and usage against its limits',
          'GST tax invoices to download, and online payment',
          'Change plan any time — an upgrade credits the days already paid for',
          'Help & support tickets, answered by our team inside the app',
        ],
      },
    ],
  },
  {
    id: 'people',
    title: 'Students, teachers & staff',
    short: 'People',
    lead: 'One record for every person in the school, used by every module — the student admitted at the front desk is the one the teacher marks present and the accountant bills.',
    icon: Users,
    modules: [
      {
        name: 'Students & admissions',
        icon: GraduationCap,
        summary: 'From the admission form to the ID card.',
        points: [
          'Admission form in steps: student, parents and guardians, medical details, previous school',
          'A profile with every detail in tabs, and documents uploaded against it',
          'Printable student ID cards',
          'Search by name, admission number or a parent’s phone; filter by class, section and status',
          'Export any list to Excel, PDF or CSV',
        ],
      },
      {
        name: 'Teachers',
        icon: Presentation,
        summary: 'Profiles a principal can rely on.',
        points: [
          'Qualifications and experience, with certificates uploaded',
          'The subjects and classes each teacher takes, and class teacher assignments',
          'Bank, PAN, UAN and ESI details kept for payroll — visible only to those who need them',
          'Export to Excel, PDF or CSV',
        ],
      },
      {
        name: 'Non-teaching staff',
        icon: HardHat,
        summary: 'Everyone else who keeps the school running.',
        points: [
          'Office, transport, hostel and support staff in one register',
          'Shifts, and driving-licence expiry for drivers',
          'Documents and statutory details for payroll',
        ],
      },
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance & leave',
    short: 'Attendance',
    lead: 'The daily register in seconds, and leave that the register already knows about.',
    icon: CalendarCheck,
    modules: [
      {
        name: 'Attendance',
        icon: CalendarCheck,
        summary: 'Students, teachers and staff, marked the way schools actually do it.',
        points: [
          'Daily register for each class and section — everyone present, then the exceptions',
          'Teacher and staff attendance',
          'QR code check-in, and biometric attendance devices',
          'Approved leave shows on the register by itself',
          'Holiday calendar for the school',
          'Monthly attendance reports, class-wise and as a trend',
        ],
      },
      {
        name: 'Leave',
        icon: CalendarOff,
        summary: 'Applications, approvals and balances in one register.',
        points: [
          'Leave types — casual, sick, earned and your own — with yearly entitlements',
          'Leave for students, teachers and staff in one place',
          'Approval by the principal or vice principal; balances count leave still pending',
          'Parents apply for their child’s leave from their own login',
          'Usage reports by person and by type',
        ],
      },
    ],
  },
  {
    id: 'academics',
    title: 'Academics',
    short: 'Academics',
    lead: 'The week planned, the work set and the submissions marked — without a register or a WhatsApp group.',
    icon: BookOpenCheck,
    modules: [
      {
        name: 'Timetable',
        icon: CalendarClock,
        summary: 'Build the week once; read it three ways.',
        points: [
          'The periods of the school day, and a register of rooms and labs',
          'Each section’s week, each teacher’s week and each room’s bookings',
          'Clash detection for teachers and rooms, and limits on a teacher’s daily load',
          'Print a timetable for any class, teacher or room',
        ],
      },
      {
        name: 'Homework',
        icon: BookOpenCheck,
        summary: 'Set it, collect it, mark it.',
        points: [
          'Homework with PDF, image or video attachments',
          'Published to the class; students hand in their work online',
          'Remarks and marks for every submission',
        ],
      },
      {
        name: 'Assignments',
        icon: ClipboardList,
        summary: 'Assessed work with a proper marking scheme.',
        points: [
          'Rubrics with criteria and grade bands',
          'More than one attempt, and penalties for late work',
          'Evaluation criterion by criterion',
          'Marks released to students only when the teacher is ready; export to CSV',
        ],
      },
    ],
  },
  {
    id: 'examinations',
    title: 'Examinations & results',
    short: 'Exams',
    lead: 'From the date sheet to the report card, with the results worked out for you.',
    icon: FileSpreadsheet,
    modules: [
      {
        name: 'Exams & marks',
        icon: FileSpreadsheet,
        summary: 'Unit tests, half-yearly and annual exams.',
        points: [
          'Exams with a paper for each class and subject, and clash detection in the date sheet',
          'Marks entry paper by paper — theory and practical',
          'Percentages, grades and ranks worked out from the marks',
        ],
      },
      {
        name: 'Results & report cards',
        icon: Printer,
        summary: 'Published when you say so.',
        points: [
          'Results published to parents and students together',
          'Printable report cards',
          'Result analysis: how each class and subject performed, and the spread of grades',
        ],
      },
    ],
  },
  {
    id: 'fees',
    title: 'Fees & accounts office',
    short: 'Fees & accounts',
    lead: 'Everything the accountant does at the office desk — fee collection, receipts, the day book, cash handover and expenses — in one place.',
    icon: Wallet,
    modules: [
      {
        name: 'Fee setup',
        icon: BadgeIndianRupee,
        summary: 'Your fee structure, exactly as the school charges it.',
        points: [
          'Fee heads — tuition, transport, hostel, examination, laboratory, activity and your own',
          'Class-wise fee structures with instalments and due dates, monthly or quarterly',
          'Concessions and scholarships, as a percentage or a fixed amount',
          'Late fee rules: per day, after a grace period, up to a ceiling',
        ],
      },
      {
        name: 'Office fee counter',
        icon: Wallet,
        summary: 'A parent comes to the window; the receipt is in their hand a minute later.',
        points: [
          'Find the student by name, admission number, father’s name or phone — straight from the keyboard',
          'Tick what is being paid: this quarter’s fee, or only the books charge',
          'One-off charges at the desk: books, uniform, ID card, TC fee',
          'Cash, cheque or DD, UPI, card and bank transfer — with cheque number, bank and date',
          'Part payments, concessions and extra fines at the counter; change worked out for cash',
        ],
      },
      {
        name: 'Fee receipts',
        icon: Receipt,
        summary: 'Proper receipts, printed on the spot.',
        points: [
          'The school’s letterhead, the student with father’s name and roll number',
          'What was paid towards, the amount in words (lakh and crore) and the balance still due',
          'Two copies on one A4 sheet — the parent’s and the school’s',
          'PDF, reprint at any time, or send it to the parent on WhatsApp',
          'A receipt is cancelled only with a reason, and stays on record',
        ],
      },
      {
        name: 'Day book & cash handover',
        icon: BookOpenText,
        summary: 'Close the counter at the end of the day, and know it tallies.',
        points: [
          'Every receipt of the day, by payment mode and by cashier',
          'The day’s expenses, and the cash that should be in the drawer',
          'Count the notes (₹500 to ₹10) and coins; the difference is recorded',
          'Printed with signature lines for the handover; Excel and PDF export',
        ],
      },
      {
        name: 'Expenses',
        icon: HandCoins,
        summary: 'Every rupee the school pays out, on a voucher.',
        points: [
          'Payment vouchers with their own numbers, filed under heads of account',
          'Entered by the accountant, approved by the principal',
          'Printable voucher with signature lines; cancellation only with a reason',
          'Totals by head for any period; Excel and PDF export',
        ],
      },
      {
        name: 'Dues & defaulters',
        icon: TrendingDown,
        summary: 'Who owes what, and for how long.',
        points: [
          'Outstanding dues for every student, with days overdue',
          'Filter by class and section, export to Excel or PDF',
          'A reminder to the parent on WhatsApp in one tap',
        ],
      },
    ],
  },
  {
    id: 'payroll',
    title: 'HR & payroll',
    short: 'Payroll',
    lead: 'Salaries built, checked and approved by different people — as they should be.',
    icon: Banknote,
    modules: [
      {
        name: 'Salary setup',
        icon: Banknote,
        summary: 'Components and structures for every employee.',
        points: [
          'Allowances and deductions, as amounts or as a share of basic pay',
          'A salary structure for each teacher and staff member',
          'Bank details kept privately for each employee',
        ],
      },
      {
        name: 'Monthly payroll',
        icon: ClipboardList,
        summary: 'Draft, process, approve, pay.',
        points: [
          'A monthly run worked out for everyone in one go',
          'Built by the accountant, approved by the principal',
          'Printable payslips',
          'PF and ESI with their statutory returns',
        ],
      },
    ],
  },
  {
    id: 'campus',
    title: 'Library, transport & hostel',
    short: 'Campus',
    lead: 'The parts of the school that run on registers — now on the same records as everything else.',
    icon: Bus,
    modules: [
      {
        name: 'Library',
        icon: Library,
        summary: 'Catalogue to fines.',
        points: [
          'Catalogue of titles and their copies, by category',
          'Barcode labels for every copy, printed in sheets',
          'Issue and return desk for students and staff, with renewals',
          'Overdue fines, and waivers by the librarian',
        ],
      },
      {
        name: 'Transport',
        icon: Bus,
        summary: 'Buses, routes and who rides where.',
        points: [
          'Vehicles with insurance, fitness, permit and pollution expiry dates',
          'Routes with their stops in order',
          'Drivers and attendants from the staff register',
          'Students assigned to a route and stop, with fares',
          'Live bus location with GPS devices',
        ],
      },
      {
        name: 'Hostel',
        icon: BedDouble,
        summary: 'Rooms, beds and the nightly roll call.',
        points: [
          'Hostels, rooms and beds',
          'Bed allocation with gender and capacity rules; transfers and vacating',
          'Monthly rent and mess charged to the student’s fee account',
          'The evening roll call',
        ],
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    short: 'Communication',
    lead: 'Notices on the board, messages to the right parents, and an inbox for everyone.',
    icon: MessageSquare,
    modules: [
      {
        name: 'Notices & circulars',
        icon: Megaphone,
        summary: 'Approved before anyone sees them.',
        points: [
          'Drafted by the office, approved by the principal, then published',
          'For the whole school, chosen classes, parents or staff',
          'Printable notices',
        ],
      },
      {
        name: 'Messages',
        icon: MessageSquare,
        summary: 'One message, every channel.',
        points: [
          'Email, SMS, WhatsApp and push from one place (SMS and WhatsApp through your provider’s account)',
          'Templates with placeholders such as the student’s name and the amount due',
          'SMS length and cost shown before sending',
          'A delivery record for every family',
        ],
      },
      {
        name: 'Notifications',
        icon: Bell,
        summary: 'The bell at the top of every screen.',
        points: [
          'Leave decisions, published results, notices, payroll and account updates',
          'Email copies, and a daily digest for those who prefer one',
          'Each person decides what reaches them',
        ],
      },
    ],
  },
  {
    id: 'portals',
    title: 'Portals & dashboards',
    short: 'Portals',
    lead: 'Everyone gets a home screen of their own, on any phone or computer — no app to install.',
    icon: Smartphone,
    modules: [
      {
        name: 'Parent & student portal',
        icon: Smartphone,
        summary: 'Their own child, nobody else’s.',
        points: [
          'Attendance, homework and assignments, timetable and exam schedule',
          'Results and report cards as soon as they are published',
          'Fee dues and every receipt',
          'Notices, and leave requests from the parent',
          'Works in any phone browser',
        ],
      },
      {
        name: 'Teacher portal',
        icon: Presentation,
        summary: 'The working day of a teacher.',
        points: [
          'Today’s timetable at a glance',
          'Mark attendance, set homework and assignments, enter marks',
          'Notices, and their own leave applications',
        ],
      },
      {
        name: 'Role dashboards',
        icon: LayoutDashboard,
        summary: 'The right numbers for each person.',
        points: [
          'A different home screen for the School Admin, principal, teacher, accountant, parent and student',
          'Live figures: students, fees collected, attendance today, leave to decide',
          'A feed of recent activity across the school',
        ],
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports & analytics',
    short: 'Reports',
    lead: 'What happened, and what it means — worked out from the same records the school runs on.',
    icon: BarChart3,
    modules: [
      {
        name: 'Reports',
        icon: BarChart3,
        summary: 'Twelve reports, ready when you are.',
        points: [
          'Student strength and admissions',
          'Attendance by class, and the attendance trend',
          'Fee collection and fee defaulters',
          'Teacher departments and workload',
          'Payroll cost and statutory (PF / ESI)',
          'Exam performance and grade spread',
          'Charts, and export to Excel, PDF or CSV',
        ],
      },
      {
        name: 'Analytics',
        icon: ChartScatter,
        summary: 'Questions a principal actually asks.',
        points: [
          'What moves results — attendance, homework and more',
          'Students at risk, before the exam',
          'Attendance patterns by day and class',
          'How healthy fee collection is, and how arrears age',
          'Classes and batches compared side by side',
        ],
      },
    ],
  },
  {
    id: 'security',
    title: 'Roles, permissions & security',
    short: 'Security',
    lead: 'The right access for every person, decided by the School Admin and enforced on our servers — not just hidden on screen.',
    icon: ShieldCheck,
    modules: [
      {
        name: 'Roles & permissions',
        icon: KeyRound,
        summary: 'Sixteen ready-made roles, and your own.',
        points: [
          'School Admin, Principal, Vice Principal, Coordinators, Class and Subject Teachers, Accountant, HR, Front Office, Librarian, Transport, Warden, Support Staff, Parent and Student',
          'A permission matrix: View, Create, Edit, Delete, Approve, Export and Print',
          'Limit a person to their classes, sections or subjects — a class teacher to their own class',
          'Hide sensitive details from a role: phone numbers, ID numbers, medical notes, family income, salaries',
          'Extra rights for one person, several roles per person',
          'Every permission change written to an audit log',
        ],
      },
      {
        name: 'Security & privacy',
        icon: Lock,
        summary: 'Your data is yours, and kept apart.',
        points: [
          'Every school’s data in its own database tables',
          'Every request checked against the person’s permissions on the server',
          'Passwords and sign-in tokens stored encrypted; lock-out after repeated wrong passwords',
          'See every signed-in device and sign any of them out',
          'Parents and students see only their own children’s records',
          'Activity logs and database backups',
        ],
      },
    ],
  },
  {
    id: 'platform',
    title: 'For school groups & partners',
    short: 'Multi-school',
    lead: 'Run many schools — a trust’s branches, or your own white-label platform — from one console.',
    icon: Building2,
    modules: [
      {
        name: 'Multi-school console',
        icon: Building2,
        summary: 'Every school, one view.',
        points: [
          'Open a new school in minutes, each at its own address, sub-domain or custom domain',
          'Plans with the modules and limits you choose; free trials',
          'Suspend, reactivate, or step in as a school’s administrator to help',
          'Platform team roles: Super Admin, Support, Billing and Sales',
        ],
      },
      {
        name: 'Billing & GST',
        icon: Receipt,
        summary: 'Invoices that a chartered accountant accepts.',
        points: [
          'GST tax invoices — CGST and SGST or IGST, financial-year numbering, SAC code, amount in words',
          'Automatic renewal invoices and payment reminders',
          'Payments recorded by bank transfer, UPI or cheque, or taken online through Razorpay',
          'Revenue reports, renewals, outstanding dues and audit logs',
        ],
      },
      {
        name: 'White-label & support',
        icon: Palette,
        summary: 'Your brand on every screen.',
        points: [
          'Your name, logo and colours on the website, the console and every school’s sign-in page',
          'A support desk with tickets from every school',
          'Website enquiries collected for your sales team',
        ],
      },
    ],
  },
];

/** On the way, and said so plainly. */
export const ROADMAP: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Android & iOS apps for parents, students and teachers', icon: Smartphone },
  { label: 'Online fee payment by parents', icon: CreditCard },
  { label: 'OTP sign-in', icon: KeyRound },
  { label: 'Online admission form and enquiries', icon: GraduationCap },
  { label: 'Transfer and bonafide certificates', icon: Printer },
  { label: 'Import from Excel', icon: FileSpreadsheet },
  { label: 'Automatic absence alerts to parents', icon: Bell },
  { label: 'Visitor management and gate pass', icon: Activity },
];

/** How many modules the catalogue describes, for the home page's figures. */
export const MODULE_COUNT = FEATURE_GROUPS.reduce((total, group) => total + group.modules.length, 0);
