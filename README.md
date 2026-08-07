# School ERP — Frontend

React 19 + Vite + TypeScript + Tailwind CSS 4, talking to a Laravel 11 / Sanctum API.

## Getting started

```bash
npm install
cp .env.example .env     # then set VITE_API_BASE_URL
npm run dev
```

| Script              | Purpose                            |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Dev server on http://localhost:5173 |
| `npm run build`     | Typecheck + production build        |
| `npm run preview`   | Serve the production build          |
| `npm run typecheck` | Types only                          |
| `npm run lint`      | ESLint (`lint:fix` to autofix)      |
| `npm run format`    | Prettier                            |

## Folder structure

```
src/
├── app/                    Application composition — no business logic
│   ├── App.tsx
│   ├── providers/          AppProviders, SessionProvider
│   └── router/             Route table, guards, paths, sidebar navigation
├── components/
│   ├── ui/                 Presentational primitives (Button, Modal, Badge…)
│   ├── form/               React Hook Form–bound fields
│   ├── table/              DataTable, Pagination, TableToolbar
│   ├── layout/             AppLayout, AuthLayout, Sidebar, Topbar, PageHeader
│   ├── attachments/        Attachment record, upload rules, thumbnail & preview
│   └── feedback/           ErrorBoundary, Toaster, FullPageLoader
├── config/                 env (Zod-validated), constants
├── features/               One folder per business module — see features/README.md
├── hooks/                  Cross-cutting hooks (useTableQueryState, useDebounce…)
├── lib/                    axios, queryClient, queryKeys, apiError, formatters
├── pages/                  Shell pages that belong to no module (404, 403, dashboard)
├── store/                  Zustand stores (auth, ui, toast)
├── styles/                 Tailwind entry + design tokens
└── types/                  Shared API/domain types
```

## Architecture

**Data flow.** Component → TanStack Query hook → feature service → `http` (axios) → Laravel.
Nothing calls `axios` directly and no component reshapes an API payload.

**Errors.** Every failure is normalised to `ApiError` by the axios interceptor. Query and
mutation caches toast unexpected failures centrally; 422s are routed onto form fields by
`applyServerErrors`. Components only handle the states specific to their screen.

**Auth.** `useAuthStore` holds session state and performs no I/O, which lets the axios
interceptor read it without a circular import. A 401 clears the session, and
`ProtectedRoute` reacts by redirecting. Role and permission checks mirror Spatie, including
the `super-admin` bypass. Client-side checks are advisory — the API stays authoritative.

**Tables.** `useTableQueryState` keeps pagination, search, sorting and filters in the URL, so
a filtered view is shareable and survives refresh and back-navigation. `DataTable` consumes
that state directly.

**Env.** `src/config/env.ts` parses `import.meta.env` through Zod at boot, so a
misconfigured deploy fails immediately instead of surfacing as a confusing 404.

## Modules

| Module | Routes | Notes |
| ------ | ------ | ----- |
| `features/dashboard` | `/dashboard` | The landing screen, shaped by who is looking: admin, principal, teacher, student and parent views over one route, with permission-filtered cards, charts, lists and a recent-activity feed |
| `features/notifications` | `/notifications`, `/notifications/preferences` | The per-user inbox behind the top-bar bell: unread count, full history with filters, per-kind email and SMS opt-in, and a record of how every copy went out |
| `features/auth` | `/login`, `/forgot-password`, `/reset-password/:token`, `/profile` | Sanctum sign-in, password reset/change, profile, signed-in devices |
| `features/roles` | `/roles`, `/roles/create`, `/roles/:id/edit`, `/permissions` | Spatie roles CRUD, resource × action permission matrix |
| `features/settings` | `/settings/{profile,address,sessions,regional,email,sms}` | School profile, logo, academic sessions, timezone/currency, SMTP, SMS |
| `features/students` | `/students`, `/students/admission`, `/students/:id/*` | Admission wizard, profile tabs, guardians, medical, documents, ID card, exports |
| `features/teachers` | `/teachers`, `/teachers/new`, `/teachers/:id/*` | Profile, qualifications, experience, subjects & classes, documents, exports |
| `features/staff` | `/staff`, `/staff/new`, `/staff/:id/*` | Non-teaching staff CRUD, shift & licence tracking, documents |
| `features/homework` | `/homework`, `/homework/new`, `/homework/:id` | Briefs with PDF/image/video attachments, submissions, remarks and marks |
| `features/assignments` | `/assignments`, `/assignments/new`, `/assignments/:id` | Assessed coursework: rubric marking scheme, submissions with attempts, per-criterion evaluation, late penalties, grade bands, marks publication and CSV export |
| `features/communication` | `/communication/{messages,notices,templates,channels}`, `/communication/messages/:id`, `/communication/notices/:id` | SMS, email, WhatsApp and push through one send, message templates with placeholders and live SMS segment costing, the notice board with an approval step, and announcements raised from a notice |
| `features/payroll` | `/payroll/{runs,salaries,statutory,components}`, `/payroll/runs/:id`, `/payroll/payslips/:id` | Allowance and deduction catalogue, per-employee salary structures, monthly runs with draft → processed → approved → paid, statutory PF and ESI with their returns, and printable payslips |
| `features/hostel` | `/hostel/{rooms,residents,fees,roll-call,blocks}`, `/hostel/rooms/:id` | Blocks, rooms and the beds inside them, bed allocation with gender and capacity rules, monthly rent and mess raised onto the fee ledger, and the evening roll call |
| `features/transport` | `/transport/{vehicles,routes,drivers,tracking}`, `/transport/vehicles/:id`, `/transport/routes/:id` | Fleet register with statutory-paper expiry, routes and ordered stops, student assignments and fares, the driver roster read from staff, and a GPS-ready live view |
| `features/library` | `/library/{catalogue,issue,return,loans,fines,categories}`, `/library/catalogue/:id` | Catalogue of titles and their physical copies, Code 39 barcodes and label sheets, an issue and a return desk, loans, renewals and overdue fines |
| `features/timetable` | `/timetable/{classes,teachers,rooms,periods}` | The period grid, the room register, and one slot table read three ways: a section's week, a teacher's week and a room's allocation — with teacher, room and workload clash detection |
| `features/exams` | `/exams`, `/exams/new`, `/exams/:id`, `/exams/:id/papers/:paperId/marks`, `/exams/:id/results`, `/exams/:id/report-cards/:studentId` | Exam schedule with clash detection, batched marks entry, results derived from the marks, grades, ranked publication and printable report cards |
| `features/fees` | `/fees/{collect,payments,dues,structures,types,discounts}` | Fee catalogue, structures with instalments, collection, receipts, discounts, fines, due reports |
| `features/attendance` | `/attendance/{students,teachers,staff,reports,holidays,devices}` | Daily marking for all three populations, monthly reports, holiday calendar, QR & biometric capture |
| `features/leave` | `/leave/{applications,balances,reports,types}`, `/leave/applications/:id` | Student, teacher and staff leave in one register, the approval workflow, entitlement balances that count pending days, and usage reports — approved leave is what locks an attendance row |
| `features/analytics` | `/analytics/:domain` | Correlation, segmentation and risk over the same data reports aggregates: what moves results, who is at risk, how arrears age, which classes are outliers — plus the AI-ready feature contract |
| `features/reports` | `/reports/overview`, `/reports/:family` | Twelve cross-module reports over attendance, fees, students, teachers, payroll and exams in one envelope, with SVG charts and PDF/Excel export — it owns no data, every figure is read from the module that does |
| `features/academics` | `/academics/classes`, `/academics/classes/:id`, `/academics/subjects` | Class & section CRUD with shift and capacity, subject CRUD with marks scheme and teacher assignment, plus the shared lookups |

### Notifications

The bell in the top bar, the inbox behind it, and what a user wants copied to email or SMS.

- **Deliberately not the communication module, and the line between them is the whole design.**
  Communication is a *person composing an outbound broadcast* — "send this SMS to Class 8
  parents" — with an audience, a template and an approval step. A notification is the *system
  telling one person* that something happened to them: their leave was approved, a fee fell due,
  their homework was marked. Nobody writes one; they are raised by the module that caused them.
  That is why this module has read/unread state, a bell and a per-user inbox, and communication
  has an audience picker and a segment counter. Merging them would give one screen that does
  neither job.
- **What *is* shared is delivery.** An email notification goes out over the same SMTP settings a
  bulk email does, so this module **reads** the communication module's channel readiness rather
  than checking SMTP and the SMS provider again. A second opinion about whether email works is a
  second thing to go wrong.
- **No permission resource, on purpose.** Your notifications are yours; you do not need a right
  to read what you were sent. Every endpoint is implicitly scoped to the signed-in user and none
  takes a `user_id` — an API that accepted one is an API somebody eventually passes somebody
  else's id to. Somebody else's notification is a **404, not a 403**: a 403 would confirm the id
  exists.
- **In-app has no switch.** A record of what the school told you is not a preference, and a user
  who muted "fee due" and then missed one would be right to say nobody told them. Email and SMS
  are opt-in per kind, which is the only place a preference belongs. The in-app column is
  rendered as a checked, disabled box rather than omitted — "always on" is worth saying, and a
  blank cell reads as "off".
- **Deliveries are recorded, not derived.** An email that bounced last Tuesday has to keep saying
  so after the address is corrected. Three things decide the outcome, in order: whether the
  school has the channel at all, whether this user asked for it, and whether it actually went —
  so `skipped` (nobody's fault) stays distinct from `failed` (somebody's), and both from a
  channel never tried.
- **`read_at` is the read flag.** There is no separate boolean, so the timestamp and the state
  cannot disagree, and "when did I see this" is answerable.
- **The badge turns red only for urgent unread items.** A bell that is always red is a bell
  nobody looks at. Past 99 it reads "99+" — an exact count stops being information.
- **The bell polls rather than subscribes.** A websocket for a number that changes a few times an
  hour is a connection to authenticate, keep alive and reconnect for very little. The endpoint is
  tiny by design — a count, a breakdown and the newest few — so opening the bell needs no second
  request, and a dropped poll raises no toast about something already being retried.
- **A feed defaults to newest first.** The shared list helper defaults to *ascending*, which is
  right for a register of people and wrong here — it puts the notification that matters on the
  last page. There is a test that calls the endpoint with no sort parameters, which is how that
  was caught.
- **Clearing read notifications never touches an unread one.**

Required backend endpoints:

```
GET    /notifications ?page&per_page&search&sort_by&sort_dir&type&priority&state
GET    /notifications/unread                  → count, breakdown, newest few
POST   /notifications/{id}/read  ·  /unread   → the recomputed summary
POST   /notifications/read-all   { type? }    → the recomputed summary
POST   /notifications/clear-read              → { deleted }
DELETE /notifications/{id}
GET/PUT /notifications/preferences
```

Every write returns the **recomputed unread summary**, so the badge changes the instant something
is read rather than waiting for the next poll. Signed out is a 401 on every one of them.

### Dashboard

Five views — admin, principal, teacher, student and parent — over one route, composed from
cards, charts, lists and a recent-activity feed.

- **It owns no data and computes none of it.** Attendance comes from the attendance module's
  sheet and monthly report, fee balances from the fees module's account builder, charts from the
  report builders themselves. What the dashboard adds is *selection*: which four figures matter
  to a principal at nine in the morning, and which of them are worth interrupting somebody about.
  The suite asserts the agreement — the strength chart on the admin dashboard is compared point
  for point against the report it came from.
- **One route, not five.** A user only ever holds one of these views, so five URLs would be four
  `403`s waiting to be linked to. The **server** picks the view from the signed-in user's roles;
  asking the client which dashboard it would like is asking it to authorise itself. A requested
  view is a *preference* among the ones that user already holds and is quietly ignored otherwise
  — a stale bookmark is not an attack.
- **The four office roles share the admin view, and that is not a shortcut.** Every card is
  permission-filtered, so an accountant's admin dashboard is a finance dashboard and a
  librarian's is a library one. A separate view per job title would be five more places to add a
  card to.
- **Scope is not the same as permission.** A teacher may read the student register and still have
  no business seeing every admission in their personal feed. The feed gates school-wide entries
  on whether it is *about one person*, separately from what that person may read — letting
  `students.read` decide put the whole register on a teacher's dashboard, and there is a test
  that would fail if it crept back.
- **There is no activity table.** The feed is assembled from the records the modules already
  write — a payment, an admission, a leave decision, a published notice, an issued book. A
  separate log would be a second place for the truth to live, and it would fall silent the first
  time somebody wrote to a module without remembering to log it, which is exactly how audit
  trails rot.
- **Nothing on it is a dead end.** Every figure links to the screen that can act on it, and every
  alert carries the action — a number you cannot act on belongs in a report, and an alert you
  cannot act on is a worry rather than a task. Alerts sort by urgency *across* modules, because
  whoever opens the dashboard wants the worst thing first and whether it came from payroll or
  transport is not what makes it worst.
- **The student and parent views are one builder.** They are one dashboard about one child seen
  from two sides; what differs is the framing — a parent is shown what they can settle, a student
  what they must hand in — not the figures underneath, which would otherwise be two answers to
  "how is she doing".
- **Statistics and charts reuse the reports module's own shapes.** `ReportStat`, `ReportSeries`,
  `formatValue` and `ReportChart` are shared outright, so a rupee is written the same way on both
  screens. What a dashboard card adds is an icon and somewhere to go.

Required backend endpoints:

```
GET /dashboard ?view=admin|principal|teacher|student|parent    → the view for this user
```

`view` is advisory. The response carries `available_views`, and the switch is only offered where
somebody genuinely holds more than one — a head who also teaches. A signed-out request is a 401,
never a default dashboard.

### Auth

- **Remember me** decides *where* the session is stored: checked → `localStorage`
  (survives a browser restart), unchecked → `sessionStorage` (dies with the tab). The store
  writes to one and clears the other, so a session can never linger in both.
- **Session management** lives in `SessionProvider`: `GET /auth/me` revalidation on boot, the
  401 expiry notice, and cross-tab sign-out sync. The profile page adds per-device revoke and
  "sign out everywhere".
- **Role-based landing** — `features/auth/roleRoutes.ts` maps roles to a post-login home
  route. Add an entry there as each module ships; unmatched roles fall back to the dashboard.
- `VITE_AUTH_MODE=token` (default) sends a Sanctum bearer token; `cookie` switches to SPA
  cookie sessions with CSRF and requires same-site domains. `authService` handles both.

Required backend endpoints:

```
POST   /auth/login              { email, password, remember, device_name } → { data: { user, token } }
POST   /auth/logout                                                        → 204
POST   /auth/logout-all                                                    → 204
GET    /auth/me                                                            → { data: user }
POST   /auth/forgot-password    { email }                                  → { message }
POST   /auth/reset-password     { token, email, password, password_confirmation } → { message }
PUT    /auth/password           { current_password, password, password_confirmation } → { message }
PUT    /auth/profile            { name, email, phone }                     → { data: user }
POST   /auth/profile/avatar     multipart: avatar                          → { data: user }
GET    /auth/sessions                                                      → { data: token[] }
DELETE /auth/sessions/{id}                                                 → 204
```

The user resource must include `roles` and `permissions` as string arrays (Spatie), plus
`phone`, `avatar_url` and `email_verified_at`.

### Roles & permissions

- **Permission naming is `resource.action`** (`students.create`, `academics.classes.approve`).
  The matrix splits on the *last* dot, so namespaced resources stay intact. The seven canonical
  actions are create, read, update, delete, export, print, approve; any extra action the
  backend seeds appears as an additional column automatically.
- **A cell only renders where the permission exists.** The grid can never grant something the
  backend has not seeded — missing combinations show an em dash, not a disabled checkbox.
- **`super-admin` is not editable.** Spatie's `Gate::before` grants it everything, so its edit
  screen explains that rather than showing a decorative all-checked matrix. Other system roles
  keep their name locked but their permissions editable.
- **Role writes refresh the session** (`queryKeys.auth.session()`), because changing a role can
  change what the signed-in user may do — without it the sidebar and `Can` guards would keep
  using the permission set captured at sign-in.
- Permissions are seeded, never created through the UI; `/permissions` is a read-only reference.

Required backend endpoints:

```
GET    /roles                   ?page&per_page&search&sort_by&sort_dir → paginated
GET    /roles?per_page=all                                             → { data: role[] }
GET    /roles/{id}                                → { data: role & { permissions: string[] } }
POST   /roles                   { name, permissions[] }                → { data: role }
PUT    /roles/{id}              { name, permissions[] }                → { data: role }
DELETE /roles/{id}                                                     → 204
GET    /permissions             ?per_page=all&with_roles=1             → { data: permission[] }
```

The role resource needs `is_system`, `users_count` and `permissions_count`. The API must
reject renaming or deleting system roles — the UI hides those actions, but that is advisory.

Roles seeded: `super-admin`, `school-admin`, `principal`, `vice-principal`, `teacher`,
`accountant`, `receptionist`, `librarian`, `staff`, `parent`, `student` (see `types/auth.ts`).

### School settings

- **Secrets never travel to the client.** The settings resource reports `has_password` and
  `has_api_key` instead of the values. A write only carries `password` / `api_key` when the
  user typed a new one — a blank field means "keep the stored secret", so the key is omitted
  from the payload rather than sent empty (which would wipe it).
- **Every group PUT returns the whole settings object**, so one cache entry stays
  authoritative and no tab has to merge a partial response.
- **Tabs are real routes**, so a specific tab is linkable and survives a refresh. The settings
  query is resolved once by the layout; switching tabs never refetches.
- **Delivery tests run against saved config**, not the form's current values — the modal says
  so when the form is dirty.
- **Exactly one academic session is current.** Switching goes through
  `POST /academic-years/{id}/activate` rather than a flag on update, because the backend must
  demote the previous session in the same transaction. The current session cannot be deleted.
- Timezones come from `Intl.supportedValuesOf('timeZone')` with a curated fallback, so the
  list never goes stale.

Required backend endpoints:

```
GET    /settings                                          → { data: settings }
PUT    /settings/profile | /address | /localization       → { data: settings }
PUT    /settings/email   { …, password? }                 → { data: settings }
PUT    /settings/sms     { …, api_key? }                  → { data: settings }
POST   /settings/logo    multipart: logo                  → { data: settings }
DELETE /settings/logo                                     → { data: settings }
POST   /settings/email/test  { email }                    → { message }
POST   /settings/sms/test    { phone }                    → { message }
GET    /academic-years   ?per_page=all                    → { data: year[] }
POST   /academic-years   { name, start_date, end_date, is_current }
PUT    /academic-years/{id}
DELETE /academic-years/{id}                               → 204
POST   /academic-years/{id}/activate                      → { data: year }
```

### Students

- **One form, two shapes.** The four sections (`PersonalSection`, `GuardiansSection`,
  `MedicalSection`, `PreviousSchoolSection`) are shared: the admission screen steps through
  them in a wizard, the edit screen stacks them on one page. There is no second copy.
- **The schema mirrors the request payload exactly**, so Laravel's dotted error keys
  (`guardians.0.phone`, `address.city`) land on the right field with no remapping.
- **One `useForm` across every wizard step** — values survive navigation, the review step reads
  the whole record, and a single submit carries the complete payload. Each step gates on
  `form.trigger()` over its own fields only, so a user is never blocked by an error on a step
  they have not reached. A server 422 sends them back to step one, where the field is.
- **Exactly one primary guardian**, enforced by the schema. Marking one primary clears the
  others; deleting the primary promotes another.
- **Optional numbers are strings in the form**, converted in the service — a numeric input left
  blank yields `NaN`, not `null`, and `NaN` would reach the API as `0`.
- **Exports honour the active filters** and drop the paging params, so the file matches what is
  on screen and covers every match, not just the current page. The export menu says which.
- **Blob errors are decoded.** A failed download still returns JSON, but axios has already made
  it a `Blob`; `lib/download.ts` reads it back and rethrows a normal `ApiError`.
- **Documents stream through the API**, never a public storage URL — that is why there is no
  inline preview.
- **The ID card prints at CR80 (85.6 × 54 mm)**, sized in millimetres so the physical output is
  right regardless of screen DPI. Print rules live in `styles/index.css`: mark the printable
  subtree `print-target` and everything else is hidden.

Required backend endpoints:

```
GET    /students            ?page&per_page&search&sort_by&sort_dir&class_id&section_id&status&gender
GET    /students/{id}                                     → { data: student + relations }
POST   /students · PUT /students/{id} · DELETE /students/{id}
POST   /students/{id}/photo          multipart: photo     → { data: student }
GET    /students/export     ?format=pdf|excel &…filters   → file
GET    /students/{id}/id-card                             → PDF
GET    /students/{id}/documents                           → { data: document[] }
POST   /students/{id}/documents      multipart: file,type,title
DELETE /students/{id}/documents/{documentId}              → 204
GET    /students/{id}/documents/{documentId}/download     → file
GET    /academics/classes   ?per_page=all&with=sections   → { data: class[] }
```

Exports and downloads must send `Content-Disposition` — the filename is read from it.

### Teachers

- **Shares the form between create and edit** — sections are stacked rather than stepped,
  because a teacher record is usually edited one field at a time and a wizard would slow that
  down. Admission is the opposite case, which is why students use a wizard.
- **At most one class teacher per teacher**, enforced by the schema, and no duplicate
  class-section pair. Marking one class-teacher clears the others.
- **A current role has no end date.** Ticking "current" clears and disables the end-date field,
  and the service sends `to_date: null` regardless of what was left in the input.
- **Total experience is derived, not entered** — the API computes it from the experience rows,
  so it cannot drift from them.
- Qualifications require at least one entry; experience may be empty (a first appointment).

Required backend endpoints:

```
GET    /teachers   ?page&per_page&search&sort_by&sort_dir&department&status&employment_type&subject_id
GET    /teachers/{id}  ·  POST /teachers  ·  PUT /teachers/{id}  ·  DELETE /teachers/{id}
POST   /teachers/{id}/photo            multipart: photo
GET    /teachers/export ?format=pdf|excel &…filters        → file
GET/POST/DELETE  /teachers/{id}/documents[/{documentId}]
GET    /teachers/{id}/documents/{documentId}/download      → file
GET    /academics/subjects ?per_page=all                   → { data: subject[] }
```

The teacher resource needs `experience_years`, `subjects_count`, `classes_count` and
`class_teacher_of` (a display string) computed server-side.

### Staff (non-teaching)

Covers the seven non-teaching roles: accountant, receptionist, librarian, driver, cleaner,
peon and security. Teaching staff live in `features/teachers`.

- **`staff_type` is an HR classification, not a system role.** A librarian on the payroll and
  the `librarian` role in `types/auth.ts` are different things — one is what they do, the other
  is what they may access. A staff record does not imply a login.
- **Drivers must hold a valid licence.** The licence fields appear only for driving roles, are
  required there, and an already-expired date is rejected. Switching a driver to another type
  clears the licence rather than leaving a stale one on the record.
- **Licences expiring within 60 days** are flagged in the list and banner-warned on the profile
   — a lapsed licence grounds a driver.
- Changing the staff type fills in that role's usual designation, but only if the field still
  holds the previous default — it never overwrites something typed by hand.

Required backend endpoints:

```
GET    /staff  ?page&per_page&search&sort_by&sort_dir&staff_type&status&employment_type&shift
GET    /staff/{id} · POST /staff · PUT /staff/{id} · DELETE /staff/{id}
POST   /staff/{id}/photo             multipart: photo
GET/POST/DELETE  /staff/{id}/documents[/{documentId}]
GET    /staff/{id}/documents/{documentId}/download        → file
```

### Classes & sections

- **Shift and capacity live on the section, not the class.** A class is an academic level; a
  section is the physical group that occupies a room, in a shift, with a seat count. A class's
  capacity is the *sum* of its sections' — derived by the API, never stored, so the two cannot
  drift. A class with no sections has no capacity and cannot take an admission.
- **Capacity cannot be cut below current enrolment** — those seats are taken. Enforced in the
  form (the schema is built per-section from its enrolled count) and again by the API.
- **Records in use cannot be deleted.** A class or section holding students returns 409; the
  dialog says so and offers deactivation instead, which keeps enrolments intact and removes it
  from the admission and assignment pickers.
- **Occupancy is amber past 90% and red when over.** Over-capacity is a real state, not an
  impossible one — seats get cut, or students get admitted over the line.
- **One endpoint, two shapes.** `GET /academics/classes?per_page=all` is the lookup other
  modules read for their selects (sections nested); anything else is this module's paginated
  table (sections omitted, aggregates present).
- Writes invalidate `classKeys.all`, which covers the lookup options too — a new section shows
  up in the admission dropdown without a reload.

Required backend endpoints:

```
GET    /academics/classes  ?page&per_page&search&sort_by&sort_dir&status
GET    /academics/classes  ?per_page=all&with=sections        → { data: class[] }
GET    /academics/classes/{id}  ?with=sections                → { data: class + sections }
POST   /academics/classes · PUT /academics/classes/{id} · DELETE /academics/classes/{id}
POST   /academics/classes/{id}/sections
PUT    /academics/classes/{id}/sections/{sectionId}
DELETE /academics/classes/{id}/sections/{sectionId}
```

`sections_count`, `students_count` and `total_capacity` must be computed server-side. Deleting
a class or section that still has students must return 409, and cutting a section's capacity
below its enrolment must return 422 on `capacity`.

### Subjects

- **A subject must have theory, practical, or both.** One without either cannot be examined,
  so the schema rejects it. Each component carries its own maximum and pass marks, and
  `total_max_marks` is the sum — derived by the API, never stored.
- **Marks are only validated for the component that is switched on.** Their inputs are hidden
  otherwise, and a hidden numeric input holds `NaN` — so the fields are typed as strings and
  parsed conditionally. Switching a component off sends `null` for its marks, so stale values
  can never keep counting toward the total.
- **Pass marks cannot exceed the maximum** — an unreachable pass mark is a data-entry error.
- **subject↔teacher is one relationship, editable from either side.** The teacher form picks
  subjects; the subject list assigns teachers. Both write the whole set rather than deltas, and
  a write from either side invalidates both caches so the two views never disagree.
- **An assigned subject cannot be deleted** — 409, with the dialog offering deactivation
  instead, which keeps the history and removes it from the pickers.

Required backend endpoints:

```
GET    /academics/subjects  ?page&per_page&search&sort_by&sort_dir&component&status&elective
GET    /academics/subjects  ?per_page=all                     → { data: subject[] }
GET    /academics/subjects/{id} ?with=teachers                → { data: subject + teachers }
POST   /academics/subjects · PUT /academics/subjects/{id} · DELETE /academics/subjects/{id}
PUT    /academics/subjects/{id}/teachers  { teacher_ids[] }   → { data: subject + teachers }
GET    /teachers ?per_page=all&status=active                  → { data: teacher[] }
```

`total_max_marks` and `teachers_count` must be computed server-side. Deleting a subject that
is still assigned to a teacher must return 409.

### Attendance

- **One sheet, three populations.** Students, teachers and staff share the marking screen; only
  the class filter is student-specific. The sheet returns *everyone* in scope, marked or not,
  so "absent" stays distinguishable from "nobody has marked this yet" — a sparse list of
  records could not express that.
- **Edits batch.** Marks are held locally and submitted together, and only changed rows are
  sent. Marking fifty students one request at a time would half-save on a dropped connection.
- **A locked sheet always says why.** Holiday, Sunday, or a future date — each gives its reason
  rather than presenting a silently disabled screen.
- **Holidays have a scope.** `students` / `employees` / `all`, because staff routinely work
  through student vacations. A holiday locks only the populations it covers, and adding or
  removing one immediately changes which days count toward attendance percentages.
- **Leave wins over marking.** An approved leave pre-fills its row, locks it, and is ignored if
  a sheet tries to overwrite it — attendance must not contradict an approved leave. The record
  comes from the [leave module](#leave); only an *approved* application locks a day, so
  cancelling one puts the row back in play.
- **Late counts as attending.** The percentage is `(present + late) / working days`; a late
  student was there.
- **QR and biometric are capture sources, not separate records.** Both write into the same
  sheets; every entry carries the source it came from, so a disputed mark can be traced. The
  QR code is rendered and signed **server-side** — a client-generated code could be
  screenshotted and replayed, which the short expiry guards against.

Required backend endpoints:

```
GET    /attendance/sheet ?type&date&class_id&section_id     → { data: sheet }
POST   /attendance/sheet { date, type, class_id, section_id, entries[] }
GET    /attendance/reports/monthly ?type&year&month&class_id&section_id
GET    /attendance/reports/monthly/export ?…&format=pdf|excel → file
GET    /holidays ?page&per_page&search&year&type&scope · POST · PUT/{id} · DELETE/{id}
GET    /attendance/devices  ·  POST /attendance/devices/{id}/sync
GET    /attendance/qr-sessions ?active=1  ·  POST  ·  DELETE /{id}
GET    /attendance/qr-sessions/{id}/image                   → signed PNG
```

The sheet must return the full roster with `status: null` for unmarked people, and must reject
writes to a locked date. `working_days`, `non_working_days` and `attendance_percent` are
computed server-side.

### Leave

Two records: a **leave type** is a kind of absence the school recognises, with the rules that go
with it; an **application** is one person asking for some, and the approval that did or did not
follow.

- **Applicants are not a record here.** Students, teachers and staff are three rosters that
  already exist, and the discriminator is the attendance module's own `AttendanceType`, imported
  rather than restated. That is not tidiness: a person on approved leave is exactly the person
  whose attendance row is locked, and the two modules have to agree about who that is. Student,
  teacher and staff leave are therefore one register filtered by applicant, not three screens —
  the workflow, the columns and the decision are identical, and three copies would be three
  places to fix a bug in the approval rules.
- **Days are working days, and they are never stored.** Holidays and weekends come out, read
  from the attendance module's own calendar — a "week off" over the mid-term break costs two
  days, and a school that charged the other three to somebody's balance would be taking days
  they never had off. The count is derived on every read because the calendar can change after
  the fact. The apply form asks the API for it live, so the cost is known before filing rather
  than discovered in a balance afterwards.
- **Pending days count against the balance.** Without that, somebody could file thirty days
  across ten requests and every one would look affordable. `available` is `quota − taken −
  pending`, and approving simply moves days from one column to the other.
- **`approve` is its own permission.** Filing somebody's application on their behalf is clerical;
  granting it is not, and schools routinely give those two to different people. The front desk
  and teachers get `leave.create`; the head gets `leave.approve`. **And nobody decides their own
  leave**, however senior — the API returns 403 when the signed-in user is the applicant.
- **`withdrawn` and `cancelled` are different things.** The first is the applicant changing their
  mind before a decision; the second is a decision being undone afterwards. They read the same at
  a glance and mean quite different things in a dispute. One `STATUS_TRANSITIONS` table drives
  both the buttons and the API guards, so the screen and the server cannot disagree about what is
  still possible.
- **An approval cannot be undone once the leave has begun.** The person was either there or they
  were not, and a record saying otherwise is a record that lies.
- **A rejection requires a reason.** A refusal nobody explains is a refusal nobody can appeal.
- **Backdating is a property of the type.** Nobody files before falling ill, so sick leave must
  allow it; casual leave must not. Even where it is allowed there is a 30-day limit — a request
  dated three months back is somebody tidying a register rather than reporting an absence.
- **A pending application whose first day has passed is the row the register shouts about.**
  Somebody is either absent without permission or at work expecting not to be, and both are
  worse than a number in a grid, so it gets a banner rather than a count.
- **Leave types are retired, not deleted**, once anything references them — the same rule the
  fee heads and library categories follow.

Required backend endpoints:

```
GET/POST /leave/types  ·  PUT/DELETE /leave/types/{id}
GET      /leave/applications ?page&per_page&search&sort_by&sort_dir
                             &applicant_type&status&leave_type_id&from&to
GET      /leave/applications/preview ?from_date&to_date&applicant_type&day_portion
GET      /leave/applications/export ?…&format          → file
POST     /leave/applications  ·  GET/DELETE /leave/applications/{id}
POST     /leave/applications/{id}/review   { decision, note }
POST     /leave/applications/{id}/withdraw
POST     /leave/applications/{id}/cancel   { reason }
GET      /leave/balances ?…&applicant_type  ·  GET /leave/balances/{type}/{id}
GET      /leave/reports/usage ?from&to&applicant_type
GET      /leave/reports/usage/export ?…&format         → file
GET      /leave/reports/away ?applicant_type
GET      /leave/summary
```

Every application write returns the **recomputed** record, because `days`, `has_started` and
`is_current` are all derived. `preview` exists so the form can price a request before it is
filed. Overlapping live applications for one person are refused with a 409, as is deciding an
application twice, cancelling leave that has started, and deleting leave that has been taken.

### Fees

- **All money arithmetic goes through `lib/money.ts`, in integer paise.** Floating-point rupees
  do not add up (`0.1 + 0.2 !== 0.3`) and a ledger that is a paisa out is a ledger nobody
  trusts. Amounts cross the wire as decimals and convert the moment they are used.
- **A structure must reconcile.** Instalments have to total the fee lines exactly — a schedule
  that does not add up silently under- or over-charges every student assigned to it. The form
  shows both totals side by side and offers an exact even split (₹1000 over 3 → 333.34 +
  333.33 + 333.33, never losing a paisa).
- **A discount is a credit against the dues, not a note on the receipt.** It reduces what is
  owed, so paying "balance minus concession" actually clears the account. Cancelling the
  receipt reverses the concession too — it was granted as part of that transaction.
- **Allocation is oldest-first and belongs to the backend.** The collection modal previews the
  split so the cashier can tell a parent which instalment they cleared, but the real allocation
  happens server-side inside the transaction that writes the receipt — a client-computed split
  would race a concurrent payment.
- **Overpayment is refused**, not absorbed. `allocateAcross` returns the unallocatable
  remainder and the UI surfaces it rather than quietly banking it.
- **Receipts are cancelled, never deleted.** The number has already been handed to a parent, so
  a cancelled receipt stays in the ledger with a mandatory reason, watermarked on the printout.
- **Fines stop accruing once a due is settled**, and non-cash modes require a transaction
  reference — it is the only trace that the money moved.

Required backend endpoints:

```
GET/POST/PUT/DELETE  /fees/types[/{id}]        ?per_page=all&status=active for options
GET/POST/PUT/DELETE  /fees/discounts[/{id}]
GET/POST/PUT/DELETE  /fees/structures[/{id}]
GET    /fees/students/{id}/account                         → { data: account + dues }
POST   /fees/payments  { student_id, amount, mode, reference, discount_id, fine_amount, paid_at }
GET    /fees/payments ?search&mode&status  ·  GET /fees/payments/{id}
POST   /fees/payments/{id}/cancel  { reason }
GET    /fees/payments/{id}/receipt                         → PDF
GET    /fees/reports/dues ?…filters   ·  GET /fees/reports/dues/export ?format=
```

The account endpoint must return the full instalment list with gross/discount/fine/paid/balance
per due. Deleting a fee type, discount or structure that is in use must return 409. Collecting
more than the outstanding balance must return 422.

### Homework

- **Draft → publish → close.** Publishing is its own endpoint, not a status field on update: it
  is the moment students first see the brief and a submission row is raised for each of them.
  An edit therefore cannot silently publish, unpublish, or drop attachments.
- **A row exists for every student in scope from publication.** "Not handed in" is a state the
  teacher needs to see and chase; a list of only-those-who-submitted cannot show it.
- **Submission status is derived, never stored.** A stored "late" would go stale the moment the
  due date moved, so it is computed from `submitted_at` against `due_date` on every read.
- **The mark ceiling comes from the homework**, so `gradeSchemaFor(maxMarks)` is built per
  homework rather than shared — awarding 60 out of 50 is what it exists to stop, and the API
  rejects it too.
- **Grading requires something handed in** (409 otherwise), and can be undone — ungrading
  leaves the submission submitted but unmarked.
- **Attachments upload one file at a time**, so a 200 MB video failing cannot take three
  worksheets with it, and each kind carries its own ceiling: 15 MB PDF, 10 MB image, 200 MB
  video. Closed homework freezes its files. The record, the rules and the preview live in
  `components/attachments/` — assignments use the same ones.

Required backend endpoints:

```
GET    /homework ?page&per_page&search&sort_by&sort_dir&class_id&section_id&subject_id&status&overdue
GET    /homework/{id}  ·  POST /homework  ·  PUT /homework/{id}  ·  DELETE /homework/{id}
POST   /homework/{id}/publish  ·  POST /homework/{id}/close
POST   /homework/{id}/attachments        multipart: file
DELETE /homework/{id}/attachments/{attachmentId}
GET    /homework/{id}/attachments/{attachmentId}/download   → file
GET    /homework/{id}/submissions                → { data: submission[], summary }
POST   /homework/{id}/submissions  { student_id, student_note }
POST   /homework/{id}/submissions/{id}/grade  { marks_obtained, remarks }
DELETE /homework/{id}/submissions/{id}/grade
```

The submissions endpoint must return a row per student in scope with `status: 'pending'` for
those who have not handed in. Videos need `duration_seconds` and a generated `thumbnail_url`.

### Assignments

Coursework that counts toward internal assessment — distinct from homework, which is daily
practice marked out of ten.

- **The rubric must add up.** Criteria summing to 40 out of 50 silently cap every student at
  80%, and summing to 60 lets one exceed full marks. The form refuses to save an unbalanced
  scheme, publishing refuses again, and the evaluation ceiling for each criterion comes from
  the rubric — so `evaluationSchemaFor(assignment)` is built per assignment rather than shared.
  A rubric is optional: without one, work is marked out of a single total by the same code path
  via one synthetic "Overall" criterion.
- **The total is computed server-side.** The evaluation screen shows a running total, penalty
  and grade using the same formula, but only the per-criterion marks are sent. Two answers to
  "what did they score" is one too many.
- **Late penalties are a scheme, not a judgement.** `late_penalty_percent` of `max_marks` is
  docked per day late, never taking the result below zero, and both `raw_marks` and
  `final_marks` are stored — a student who lost marks to lateness is entitled to see that it
  happened, not just the lower number. A penalty can be waived per submission, deliberately and
  on the record. An assignment that refuses late work cannot carry a penalty at all.
- **Evaluating and publishing marks are different rights** (`assignments.approve` vs
  `assignments.print`). Marks stay a teacher's working note until published; releasing them one
  at a time would let a class compare partial results and read an unfinished pass as a final
  one. Publishing releases every evaluation at once, and says how many are still unmarked.
- **Returning work for revision requires feedback** (a 422 otherwise) — "resubmit this" is not
  something a student can act on. A return clears the marks, keeps the files, and the next hand-in
  becomes `attempt + 1` in the `under_review` state.
- **Submission status is derived, never stored.** A stored "late" would go stale the moment the
  due date moved, so it is computed from `submitted_at`, `attempt` and the evaluation on every
  read.
- Grade bands are floors on a percentage rather than ranges (`GRADE_BANDS`), so adding a band is
  a one-line change and no gap can open between two of them. The pass mark is the lowest passing
  floor.

Required backend endpoints:

```
GET    /assignments ?page&per_page&search&sort_by&sort_dir&class_id&section_id&subject_id
                     &type&status&marks_published&overdue
GET    /assignments/{id}  ·  POST /assignments  ·  PUT /assignments/{id}  ·  DELETE /assignments/{id}
POST   /assignments/{id}/publish  ·  POST /assignments/{id}/close
POST   /assignments/{id}/attachments        multipart: file
DELETE /assignments/{id}/attachments/{attachmentId}
GET    /assignments/{id}/attachments/{attachmentId}/download   → file
GET    /assignments/{id}/submissions             → { data: submission[], summary }
POST   /assignments/{id}/submissions  { student_id, student_note }
POST   /assignments/{id}/submissions/{id}/attachments        multipart: file
GET    /assignments/{id}/submissions/{id}/attachments/{attachmentId}/download   → file
POST   /assignments/{id}/submissions/{id}/evaluation  { criteria_scores[], feedback, waive_late_penalty }
DELETE /assignments/{id}/submissions/{id}/evaluation
POST   /assignments/{id}/submissions/{id}/return  { feedback }
POST   /assignments/{id}/marks/publish
GET    /assignments/{id}/marks/export            → CSV
```

The submissions endpoint must return a row per student in scope with `status: 'pending'` for
those who have not handed in, and a `summary` carrying the average, highest, lowest, pass/fail
counts and the grade distribution — the marks card and the list counts are built from it, so a
second endpoint would let the two disagree. `PUT` must not publish, release marks, drop
attachments or reassign the author.

### Communication

Three records: a **template** is a reusable body with placeholders; a **message** is one send —
a channel or several, an audience, and what happened to it; a **notice** is an item on the board.
An **announcement** is a message raised from a notice, not a fourth kind of thing.

- **Nothing here configures a channel.** SMTP credentials and the SMS provider belong to the
  settings module, which also owns the test-send; this module reads whether a channel is *ready*
  and uses it. Two places that both know the SMTP password is one too many, and the Channels tab
  links back to settings rather than duplicating the form.
- **An audience is a query, not a list.** Pick "Class 8, section A" and the message reaches the
  class as it is when it sends, not as it was when somebody drafted it — which is the whole
  reason a scheduled send does not carry a frozen list of names. Recipients are drawn from the
  student, guardian, teacher and staff rosters that already exist.
- **SMS is billed per segment, and the counter is live.** 161 GSM characters is two segments of
  153, not 160 plus 1, because each part carries a header. One curly quote pasted from a word
  processor pushes the whole body into UCS-2, which more than halves what fits — 150 plain
  characters is one segment; the same length with one `'` is three. The editor says which
  character did it. (`é` is *in* GSM-7, which naive implementations get wrong; the alphabet table
  is asserted against directly.)
- **WhatsApp will not carry a freeform message.** Meta approve the template text before it can be
  sent to anybody who has not written to the school first, so a new WhatsApp template starts
  `pending`, editing an approved body re-submits it, and an unapproved one is refused at send.
  Enforcing it here is the difference between a form error and nine hundred silent failures.
- **A channel that cannot send is refused up front**, for the same reason.
- **The board has an approval step.** Draft → pending → published, because a board anybody can
  post to unreviewed is a board nobody trusts. A published notice cannot be edited or deleted —
  people have read it — only taken down. Whether it is *live* is derived from the dates, so a
  notice past its end date comes down on its own.
- **An announcement takes its body from the notice**, so the board and the broadcast cannot say
  different things, and a notice may be announced more than once — a reminder is an announcement
  too, and the count is shown before you send a second one.
- **A sent message cannot be recalled.** Only a draft or a queued send can be cancelled; a sent
  one stays in the log. Pretending otherwise is the one thing a message log must never do.
- **Two permission resources, because they are two acts.** `notices.approve` is the right to put
  something on the board; `communication.approve` is the right to release a broadcast. Schools
  routinely grant the first without the second.
- **WhatsApp and push are "ready" the way attendance is ready for biometrics**: the template
  registry, the device registry, the delivery contract and these screens all work, and no vendor
  is bound. Stale push tokens can be purged so failed sends stop counting against people who
  uninstalled the app.

Required backend endpoints:

```
GET      /communication/channels             → readiness, read from settings
GET      /communication/push/devices  ·  POST /communication/push/devices/purge
GET/POST /communication/templates  ·  PUT/DELETE /communication/templates/{id}
POST     /communication/audience/preview     → counts and per-channel reachability
GET/POST /communication/messages  ·  GET /communication/messages/{id}
POST     /communication/messages/{id}/cancel  ·  DELETE /communication/messages/{id}
GET      /communication/messages/export ?…&format
GET/POST /communication/notices  ·  GET/PUT/DELETE /communication/notices/{id}
POST     /communication/notices/{id}/submit · /publish · /archive · /announce
GET      /communication/notices/{id}/print
GET      /communication/summary
```

The audience preview returns the count *and* how many are reachable on each channel, because a
guardian with no email address is not an email — knowing that before sending is worth more than
a failure report afterwards.

### Payroll

Four records: a **component** is a line the school pays or withholds, defined once and applied
to many people; a **structure** is one employee's standing salary; a **run** is one month; a
**payslip** is what one person got in that month.

- **Employees are not a record here.** Teachers and non-teaching staff are two rosters that
  already exist, and a third table of the same people would be a third place for a name, a
  designation or a bank account to go stale. The structure carries an `employee_type`
  discriminator, the same shape the library uses over its borrowers.
- **PF wages are not the gross**, and this is the single most consequential rule in the module.
  Provident fund is charged on basic plus dearness allowance only — house rent and conveyance are
  excluded by the Act, and marking them is the most common reason a return comes back rejected.
  Each component carries an `affects_pf` flag, and the form says so where it matters.
- **The two ceilings behave differently.** Above the ₹15,000 PF ceiling contribution continues on
  a *capped* wage (or the full wage, if the school elects to); above the ₹21,000 ESI ceiling an
  employee is simply **outside the scheme** with no contribution from either side. Conflating the
  two is the other common return error, so they are separate functions with separate tests.
- **Contributions are rounded to the rupee, not the paisa.** EPFO rounds every contribution, and
  it is the only way the published figures come out: 8.33% of the ceiling is ₹1,249.50, the
  statutory maximum pension contribution everybody quotes is ₹1,250, and rounding makes ₹1,800
  split into ₹550 PF and ₹1,250 pension exactly as the EPFO's own tables do.
- **An allowance may never be a percentage of the gross** — it would be a share of itself.
  Deductions may be, which is how advance recoveries are usually written.
- **Four states, three different people.** Processing is arithmetic, approving is a decision, and
  paying is irreversible — so `payroll.update`, `payroll.approve` and the act of paying are
  separated. Re-processing is allowed while nobody has signed off and refused afterwards; a month
  opens once; only an untouched draft can be deleted.
- **A payslip freezes at processing.** A payslip a school has handed out must not change because
  somebody revised a salary afterwards — the same live-then-frozen split as exam ranks, library
  fines and hostel roll calls. The suite asserts it directly: revise a basic, and the processed
  payslip does not move.
- **Loss of pay is read from the attendance register**, not recorded again, and pro-rated across
  the *whole* salary — a month with five unpaid days is five days without house rent allowance
  too. A month the register has nothing for costs a full month, which is honest rather than
  docking somebody for a gap in the data.
- **The PF and ESI registers are read off the payslips**, never recomputed. The return a school
  files has to match what it actually paid, and two calculations of one month is one too many.

Required backend endpoints:

```
GET/POST /payroll/components  ·  PUT/DELETE /payroll/components/{id}
GET      /payroll/structures ?page&per_page&search&sort_by&sort_dir&employee_type
GET      /payroll/structures/unassigned      → who has no salary yet
GET      /payroll/structures/{type}/{id}     ·  PUT /payroll/structures
GET/POST /payroll/runs  ·  GET/DELETE /payroll/runs/{id}
POST     /payroll/runs/{id}/process  ·  /approve  ·  /pay
GET      /payroll/runs/{id}/export  ·  GET /payroll/runs/{id}/payslips     → files
GET      /payroll/payslips/{id}  ·  GET /payroll/payslips/{id}/pdf
GET      /payroll/statutory ?month  ·  GET /payroll/statutory/export ?month&scheme
GET      /payroll/summary
```

`PUT /payroll/structures` is an upsert keyed on `(employee_type, employee_id)` and returns the
recomputed structure, because the gross, the deductions and the statutory lines are all derived
from the basic. A statutory component's rate cannot be edited and it cannot be deleted; an
allowance in use cannot become a deduction; and somebody inside the PF ceiling cannot be
excluded from the scheme.

### Hostel

Four records, nested: a **hostel** is a block with a warden and a mess, a **room** is a space
inside it, a **bed** is what actually gets allocated, and an **allocation** puts one student in
one bed.

- **A bed is the unit, not a room.** The same distinction the library draws between a title and
  the copy on the shelf, and for the same reason: "room 12 is full" cannot say which of its four
  beds is free. Occupancy, the room's own `full` status and every block percentage are readings
  of the beds — none of them is stored.
- **Hostel rooms are deliberately not the timetable's `Room`.** That one is a teaching space
  booked by period and released an hour later; this one is a residence held for a term, and it
  owns beds. One table answering both questions would answer neither.
- **Four rules on allocating, in a warden's order**: the bed is free, the room is open, the
  student is not already boarding, and the block is for their gender. The gender rule is applied
  by the student picker — a boys' block only searches boys — *and* enforced by the API, because
  a rule only the screen knows is not a rule.
- **Fees go into the fee ledger, not a second one.** The hostel owns what a bed *costs* — rent
  from the room, mess from the block and the plan — and raises a month's charges against the
  `hostel` fee head. What has been billed and collected belongs to the fees module, and
  collection happens on the fee desk. A second ledger would be a second answer to the only
  question a parent actually asks. A month can be raised once (409 on the second attempt),
  because raising it twice charges every resident twice.
- **The mess rate lives on the block and the plan is a multiplier**, so a block putting its mess
  charge up reaches every resident instead of being copied onto each allocation. Same shape as
  transport's one-way fare.
- **Roll call is not the attendance module's sheet.** A hostel night has no half day, and it has
  two states class attendance never needed: signed out on a pass and expected back, and back
  after curfew. What *is* shared is the shape — marks batched, only changed rows sent, and
  not-yet-called kept distinct from marked-absent. Anything other than present needs a note, on
  both sides: the entry somebody is asked about a week later is exactly the one left blank.
- **A register closes after two nights.** Long enough to fix a genuine mistake the next morning,
  short enough that last month's register is a record rather than a draft. Amending a closed one
  is `hostel.approve`, a right routinely withheld from the warden on duty.
- **Vacating keeps the stay.** Only the bed is freed — somebody will ask who was in it last term.

Required backend endpoints:

```
GET/POST /hostel/hostels  ·  PUT/DELETE /hostel/hostels/{id}
GET      /hostel/hostels/{id}/occupancy            → file
GET      /hostel/rooms ?page&per_page&search&sort_by&sort_dir&hostel_id&type&status
POST     /hostel/rooms  ·  GET/PUT/DELETE /hostel/rooms/{id}
POST     /hostel/rooms/{id}/beds  ·  PUT/DELETE /hostel/rooms/{id}/beds/{bedId}
GET      /hostel/vacancies ?hostel_id              → rooms with a free bed
GET      /hostel/allocations ?…&hostel_id&residency
POST     /hostel/allocations  { student_id, hostel_id, room_id, bed_id, mess_plan, allocated_on }
POST     /hostel/allocations/{id}/vacate  ·  POST /hostel/allocations/{id}/transfer
GET      /hostel/allocations/export ?…&format      → file
GET      /hostel/charges ?hostel_id  ·  GET /hostel/charges/summary
POST     /hostel/charges/raise  { hostel_id, month }
GET      /hostel/roll-call ?hostel_id&date
POST     /hostel/roll-call  { hostel_id, date, entries[] }
GET      /hostel/summary
```

Every bed write returns the recomputed **room**, because the bed counts and the room's own
status are derived from the beds. A block with rooms cannot be deleted (409), nor a room with
occupied beds, nor an occupied bed; a block's gender cannot be flipped while anybody is resident.

### Transport

Four records: a **vehicle** is a bus with its papers and a seat count, a **route** is the run it
makes, a **stop** is one point on that run with a pickup time and a monthly fare, and an
**assignment** puts one student on one stop.

- **Drivers are not a record here.** They are staff, with a licence the staff module already
  tracks, and a second driver table would be a second place for an expiry to go stale. Transport
  reads that roster and adds only what transport knows — which bus, which route, and whether the
  licence still lets them drive it. Editing a driver happens on their staff profile.
- **Two papers ground a bus, two do not.** Lapsed insurance or a lapsed fitness certificate is a
  refusal to put the bus on a route; a lapsed permit or pollution certificate is flagged and
  nothing more. Blocking on all four would stop a school running over a form nobody can renew in
  a morning. `missing` is kept distinct from `expired` — one is a bus nobody has recorded papers
  for, the other may not legally leave the yard.
- **A bus is in one place at seven in the morning**, and a driver behind one wheel. Both are
  refused with the name of what already has them.
- **Times belong to the position on the run, not to the place.** Moving a stop swaps its times
  with the stop it displaces, so the third stop is picked up third whichever stop that now is.
  Carrying the times along with the stop would leave the run out of order the moment anything
  moved — and the ordering rule (a later stop cannot be picked up earlier) is checked on both
  sides of every insert, edit and move. Sequences are renumbered contiguously after each write,
  because gaps are how a "stop 4" ends up between stops 6 and 7 six months later.
- **Seats are the bus's, so a route without a bus has none.** Nobody can be assigned to it — and
  a bus cannot be swapped for a smaller one, or shrunk, below what its route already carries.
- **The fare lives on the stop and the trip multiplier in the constants**, so a one-way rider's
  half fare is derived on read. A change to a stop's fare reaches everybody boarding there
  instead of being copied onto each assignment.
- **GPS is "ready" the way attendance is ready for biometrics**: the device registry, the
  position contract and the live view all work, and no vendor is bound. Trackers push to the
  backend over their own protocol; the frontend polls for what they pushed. `is_stale` comes
  from the server rather than a client-side clock comparison, because whether a fix is too old
  depends on the reporting interval the device is configured with.
- **The live view is a schematic, not a map.** Tiles would mean an external host, an API key and
  a network call this app does not make — and for the question actually being asked at 7:40am
  ("has it passed my child's stop yet?") a strip of stops with the bus on it answers better. The
  raw coordinates travel in the payload, so a real map drops in without touching anything else.

Required backend endpoints:

```
GET    /transport/vehicles ?page&per_page&search&sort_by&sort_dir&status&compliance
POST   /transport/vehicles  ·  GET/PUT/DELETE /transport/vehicles/{id}
GET    /transport/vehicles/export ?…&format        → file
GET    /transport/drivers                          → the staff roster, with what each is on
GET    /transport/routes ?…&is_active  ·  POST /transport/routes
GET/PUT/DELETE /transport/routes/{id}
GET    /transport/routes/{id}/sheet                → file
POST   /transport/routes/{id}/stops  ·  PUT/DELETE …/stops/{stopId}
PUT    /transport/routes/{id}/stops/{stopId}/sequence  { sequence }
GET    /transport/assignments ?route_id&stop_id
POST   /transport/assignments  { student_id, route_id, stop_id, trip, start_date }
DELETE /transport/assignments/{id}
GET    /transport/gps/devices  ·  POST /transport/gps/devices  ·  PUT/DELETE …/{id}
GET    /transport/tracking                         → live positions
GET    /transport/summary
```

Every stop write returns the recomputed **route**, because the run's start and end times, its
stop count and its fares are all derived from the stops. A bus on a route cannot be deleted
(409), nor a route carrying students, nor a stop anybody boards at.

### Library

The distinction the module rests on: a **book** is a title, a **copy** is a physical object on a
shelf. A library owns five copies of one book, each with its own accession number, its own
barcode and its own condition — and a **loan** is against a copy, never against a title.
Conflating the two is how a system ends up unable to say which of the five is missing.

- **Members are not a table.** Students and teachers already exist; a library card duplicating
  their names would be one more place for them to go stale. The loan carries a `member_type`
  discriminator, the same shape attendance uses over its three populations. One search covers
  the whole school, and the borrowing limit differs by type.
- **Availability is derived, never stored.** `available_copies` and `issued_copies` are counted
  from the copies on every read. A stored counter is two places that know how many books are
  out, and they part company the first time a return half-fails.
- **A fine accrues live and freezes on return.** While a book is out, the fine is what is owed
  *right now*; the moment the return is recorded it is written down and never moves again — a
  receipt that said ₹40 yesterday must still say ₹40 today. This is the same live-then-frozen
  split as exam ranks.
- **The fine is capped at the book's replacement price.** Without the cap, a book forgotten for
  a year attracts a fine several times its own value, which no library would ever collect. A
  two-day grace period comes first: fining somebody an hour late on a Monday teaches people to
  avoid the library.
- **A lost loan is a closed loan.** The book is not coming back, so the loan is resolved on the
  day it is written off and charged the replacement price outright. Leaving it open would make
  the copy simultaneously lost and still out with somebody.
- **Three borrow rules, applied in a librarian's order**: nothing overdue, nothing owed, room
  under the limit — and the reason travels with the refusal, because "no" without "why" sends
  somebody to the office to ask. The policy is enforced by the API; the screen only reports it.
- **An overdue book cannot be renewed.** Otherwise a renewal is a way to make a fine disappear.
- **Barcodes are Code 39, rendered as inline SVG** by `lib/barcode.ts` and `components/ui/Barcode`.
  No dependency: the whole symbology is one 44-entry table, it needs no check digit, and every
  handheld scanner reads it out of the box. Exactly three of every nine elements are wide, which
  is what makes it self-checking and what the test suite asserts against.
- **Scanner support is a text input that submits on Enter.** A handheld scanner is a keyboard
  that types very fast and presses Enter — there is nothing to integrate. Which is why the field
  does *not* search per keystroke: a scanner delivers twelve characters in under a tenth of a
  second, and looking up each prefix would fire a dozen requests for one scan.
- **Accession numbers are minted by the API, never typed** — uniqueness across the collection is
  not something a form can promise — and a deleted copy's number is retired, never reused, so
  the loan history stays readable.

Required backend endpoints:

```
GET    /library/categories  ·  POST /library/categories  ·  PUT/DELETE /library/categories/{id}
GET    /library/books ?page&per_page&search&sort_by&sort_dir&category_id&availability
GET    /library/books/{id}   → book with its copies
POST   /library/books  ·  PUT /library/books/{id}  ·  DELETE /library/books/{id}
GET    /library/books/export ?…&format            → file
POST   /library/books/{id}/copies  { quantity, condition, acquired_on, price, shelf_no }
PUT    /library/books/{id}/copies/{copyId}  ·  DELETE …/{copyId}
GET    /library/books/{id}/labels ?copy_ids       → file
GET    /library/copies/lookup ?accession_no       → { copy, book, loan }
GET    /library/members ?search&type              → borrowers across both rosters
GET    /library/members/{type}/{id}               → { member, loans }
GET    /library/loans ?…&status&member_type&overdue&has_fine
POST   /library/loans  { copy_id, member_type, member_id, due_on }
POST   /library/loans/{id}/return  { condition, collect_fine, remarks }
POST   /library/loans/{id}/renew
POST   /library/loans/{id}/fine/pay  { amount }   ·  POST /library/loans/{id}/fine/waive  { reason }
GET    /library/loans/export ?…&format            → file
GET    /library/summary
```

One lookup endpoint serves both desks: the issue desk wants a copy that is free, the return desk
wants the loan against it, and both start from the same scan — two endpoints would be two answers
to "what is this book doing". Every copy write returns the recomputed **book**, so the
availability counts come from the side that owns the arithmetic. A title with copies out cannot
be deleted (409), nor can a category holding titles; a copy on loan cannot be deleted or have its
status edited, because that is the loan's to change.

### Timetable

Three records. A **period** is a row of the daily time grid, one set per shift. A **room** is a
space that holds one class at a time. A **slot** is one section, on one weekday, in one period,
taking one subject with one teacher in one room.

- **One slot table, three views.** The teacher timetable and the room allocation are not
  records — they are the slots filtered by a different column. A teacher's Tuesday is not
  stored anywhere, which is precisely why it can never disagree with the class timetable it was
  taken from. Only the class view is editable; an edit on the teacher view would need a second
  copy of the clash rules, and two copies of a rule is one rule and one bug waiting.
- **The cell is the key.** A slot is identified by section + weekday + period, so saving the
  same three again replaces what is there. That is what dragging a lesson onto an occupied cell
  has to mean, and it makes the write idempotent.
- **Three clashes, three different answers.** A teacher already teaching elsewhere or a room
  already occupied is a 409 naming the lesson that has them. A break, a period from another
  shift, a non-working day, an unqualified teacher, or a teacher already at their daily ceiling
  is a 422 against the offending field. The distinction matters: one is a conflict with other
  data, the other is a malformed request.
- **The picker prevents the clash rather than the save rejecting it.** `GET /availability`
  answers "who is free in this cell, and qualified for this subject" before anything is
  submitted, so busy teachers arrive greyed out with `Class 8 — B, Mathematics` beside them. A
  409 afterwards is a scolding; a disabled option is a tool.
- **Periods are per shift.** A morning section and an afternoon section run different clocks,
  and one shared grid would put an afternoon class's first lesson at half past eight in the
  morning. A grid that spans shifts — a teacher who takes both — unions the periods and orders
  them by the clock, the only ordering that makes sense on one sheet.
- **Teacher qualification comes from the subject pivot**, the same one the subject and teacher
  forms both write. The timetable does not get its own idea of who can teach what.
- **Room capacity is a warning, not a rule.** A section larger than the room it is booked into
  is flagged live in the form and still saves — lessons legitimately split, and a hard block
  would be wrong more often than right.
- Clock arithmetic lives in `lib/time.ts`, shared with the exam schedule, so the two agree on
  what "overlapping" means. Touching ranges do not overlap: a period ending at 10:00 and one
  starting at 10:00 are back to back.

Required backend endpoints:

```
GET    /timetable/periods                        → the whole grid, all shifts
POST   /timetable/periods  ·  PUT /timetable/periods/{id}  ·  DELETE …/{id}
GET    /timetable/rooms ?page&per_page&search&sort_by&sort_dir&type&is_active
POST   /timetable/rooms  ·  PUT /timetable/rooms/{id}  ·  DELETE /timetable/rooms/{id}
GET    /timetable/rooms/{id}/grid                → that room's week
GET    /timetable/section ?class_id&section_id   → a section's week
GET    /timetable/teachers/{id}                  → a teacher's week
GET    /timetable/workload                       → every teacher's weekly load
GET    /timetable/availability ?day_of_week&period_id&subject_id&exclude_slot_id
PUT    /timetable/slots  { class_id, section_id, day_of_week, period_id, subject_id, teacher_id, room_id }
DELETE /timetable/slots/{id}
GET    /timetable/export ?scope&id               → file
```

Both writes return the recomputed **section grid** rather than the slot, so the summary, the
load breakdown and the free-period count come from the side that owns the arithmetic — a client
patching one cell and leaving the totals alone drifts within a single edit. A period holding
lessons cannot be deleted or turned into a break (409/422); a room with allocations cannot be
deleted (409) but can be marked unavailable, which hides it from the picker and leaves existing
lessons where they are.

### Examinations

Four records, in order: an **exam** is the term-level event; its **papers** are the schedule —
one per class-and-subject with its own date, slot and marks scheme; **marks** are entered per
paper against the class roster; a **result** is one student's whole exam.

- **Results are derived, never stored.** A result computed on read cannot drift from the marks
  it is derived from, which is exactly what a cached total eventually does after one correction.
  The totals, percentage, grade and pass verdict are all recomputed per request.
- **Ranks are the exception, and are frozen at publication.** A printed report card that says
  "4th of 38" must keep saying so after a later re-mark moves somebody else up, so publishing
  writes the rank map and later reads use it. Equal totals share a position and the next one
  skips — 1, 2, 2, 4. Before publication every rank is `null`, not a provisional guess.
- **An unmarked paper is not a zero.** `marks_obtained: null` means nothing has been entered;
  it is left out of the totals entirely, so an exam still being marked does not fail the whole
  class. Absence *is* a fail, and is recorded distinctly (`is_absent`) so a card can print "AB"
  rather than a nought a parent will read as a score.
- **Clash detection is on the class, not the room.** A paper is refused (409) when the same
  students would be sitting two at once — a whole-class paper collides with every section's,
  while two sections may sit different subjects in the same slot.
- **Marks entry is batched**, like attendance: a class of forty saved one request at a time
  half-saves on a dropped connection. Only the changed rows are sent, the server returns the
  recomputed sheet, and the client writes it straight into the cache rather than refetching.
- **Entering marks, publishing results and printing are different rights**
  (`exams.update` / `exams.approve` / `exams.print`). Marks are a teacher's working note until
  the results are published; the publish dialog says how many papers are still outstanding,
  because those subjects print as unmarked on every card in the class.
- **The maximum cannot drop below a mark already awarded** (422), and a paper with marks cannot
  be deleted (409) — either would silently invalidate work already done.
- The grade scale lives in `lib/grading.ts` and is shared with assignments. A school where the
  same 79% is a B on one screen and an A on another has two scales, not one.

Required backend endpoints:

```
GET    /exams ?page&per_page&search&sort_by&sort_dir&type&status&academic_year_id
GET    /exams/{id}   → exam with its papers
POST   /exams  ·  PUT /exams/{id}  ·  DELETE /exams/{id}
POST   /exams/{id}/publish-schedule
GET    /exams/{id}/classes                       → [{ id, name }]
GET    /exams/{id}/schedule/export               → file
POST   /exams/{id}/papers  ·  PUT /exams/{id}/papers/{paperId}  ·  DELETE …/{paperId}
GET    /exams/{id}/papers/{paperId}/marks        → { paper, data: mark[], summary }
POST   /exams/{id}/papers/{paperId}/marks  { marks: [{ student_id, marks_obtained, is_absent, remarks }] }
GET    /exams/{id}/results ?class_id&section_id  → { rows, summary, is_published }
POST   /exams/{id}/results/publish  { class_id, section_id, remarks }
GET    /exams/{id}/results/export ?class_id&section_id&format   → file
GET    /exams/{id}/report-cards/{studentId}      → report card
GET    /exams/{id}/report-cards/{studentId}/pdf  → file
GET    /exams/{id}/report-cards/bulk ?class_id&section_id       → file
```

The marks endpoints return the whole sheet — every student in scope, marked or not — plus a
`summary` with the entered/absent counts, average, highest and lowest, so the header and the
rows cannot disagree. `PUT /exams/{id}` must not publish the schedule, drop the papers, or
narrow the window past a paper already scheduled inside it.

### Analytics

Five analyses across performance, attendance, collection and cohorts.

- **Reports say what happened; this says what it means.** That is the entire reason both exist.
  A report answers a question you came to ask — how many, how much, this month against last. An
  analysis answers what you did not know to ask: that attendance and marks move together and by
  how much, which forty children are on a trajectory somebody should interrupt, whether the
  arrears are a few families or the payment schedule. The output differs accordingly: a report
  returns rows, an analysis returns **findings** — each with its evidence and sample size — plus
  a **cohort**, because an insight nobody can act on is trivia.
- **It computes no source figure.** Attendance comes from the attendance module's monthly
  report, fee balances from the fees module's account builder, results from the examinations
  module's own results builder. What it adds is the statistics *on top*, which is precisely what
  the reporting layer does not do.
- **The denominator travels with the claim.** Every analysis carries its method, its sample size
  and a confidence level, and the screen prints all three beside the headline. A coefficient
  shown on its own is how a school ends up reorganising around eleven students; below thirty
  pairs nothing here is called high confidence however tight the fit.
- **A trend line is a claim, so it is only drawn when the fit supports one.** Below `|r| = 0.3`
  the scatter has no line, and the caption says why rather than leaving a blank.
- **A missing measure is not a zero.** The risk score drops absent inputs and renormalises the
  remaining weights — a student with no marks yet is not a student who scored nothing, and
  counting them the same would put every new admission at the top of the list. Each row reports
  its `coverage` so a thin score says so.
- **Association is named as association.** The slope is phrased as "each point of attendance is
  worth about 0.8 marks" *and* immediately qualified — the same pressures often move both.

#### AI Ready

"AI ready" here is a **data contract, not a promise**, and the module is built so the claim can
be checked rather than believed:

- **Every analysis emits a feature vector** — the same numbers it drew its own conclusions from,
  flat, numeric, named columns, one row per subject, with a declared target where there is one.
  It is literally what you would hand a model. A schema version travels with it so an old model
  fails loudly rather than silently scoring the wrong columns. There is a separate
  `/features` endpoint for the notebook case, and a test asserts the two never diverge.
- **A provider registry with the same four states the communication channels use** — `ready`,
  `disabled`, `not_configured`, `unavailable` — because "we could do this but nobody has set it
  up" is a different message from "this build cannot", and both differ from an error.
- **`intelligence` is null on every analysis until a provider is bound**, and the screens already
  render the filled case. Binding one changes no screen — that is what makes the seam real.
- **Nothing in this module predicts anything.** The built-in provider is listed as `ready` with
  **zero capabilities**, which is the honest way to say "this is arithmetic". The intelligence
  panel states plainly that every figure came from the statistics named under each finding, and
  a test fails if any analysis ships intelligence while nothing is wired.

Required backend endpoints:

```
GET /analytics/providers                          → the registry
GET /analytics/{key} ?…analysis-specific params
GET /analytics/{key}/features ?…                  → the feature vector alone
GET /analytics/{key}/export ?…&format=pdf|excel   → the cohort as a file
```

Keys: `performance-drivers`, `at-risk-students`, `attendance-patterns`, `collection-health`,
`cohort-comparison`. Anything else is a 404. Exporting an analysis with no cohort is refused
rather than sent as an empty file.

### Reports

Twelve reports across six families — attendance, fees, students, teachers, payroll and
examinations — plus an overview that puts one chart from each side by side.

- **This module owns no data, and computes none of it.** Attendance percentages come from the
  attendance module's `buildMonthlyReport`, fee balances from the fees module's account builder,
  teaching load from the timetable's workload builder, results from the examinations module's own
  results builder. A reporting layer that did its own arithmetic would be a second answer to a
  question the school already has an answer to, and the two would drift the first time a rule
  changed. The assertion suite checks that agreement directly rather than trusting it.
- **One envelope for every report.** Columns, rows, totals, series and headline stats, whatever
  the subject — which is why the module is a registry and four components rather than six
  screens. Adding a report is a catalogue entry and a builder; no new page, filter bar, table,
  chart or export path.
- **The catalogue is a frontend registry, the numbers are the API's.** It declares what a report
  is *called* and which filter controls to draw; the server decides what it *says*. Two ends
  publishing a catalogue is two ends that can disagree about one.
- **An empty report says why it is empty.** "No marks entered for this exam yet" and "no payroll
  processed for this year" are different problems, and a blank table states neither.
- **A school percentage is weighted, never a mean of class percentages.** Averaging 98% across
  six students with 71% across forty gives 84.5%, which is true of nothing — the figure is
  computed from the underlying counts, and there is a test that would fail if somebody
  "simplified" it back.
- **Not every percentage is a share.** Attendance and pass rates cannot exceed 100; a teacher's
  load against the period ceiling and a class against its seat capacity can, and doing so is a
  state the school wants to see rather than an arithmetic error. The two are treated differently
  on purpose.
- **Filters live in the query string**, so a report somebody has narrowed to one class and one
  month is a link they can send. Switching report clears them — the next report never asked for
  them.
- **Exports are generated server-side from the report, not from the rendered page.** A
  spreadsheet must contain what the report *is*, not the page of it that happened to be on
  screen, and exporting a report with nothing in it is refused rather than sent as an empty file.
- **Every family links back to the module that owns it.** Reports summarise; the operational
  screen is where the work happens, and the page says so rather than pretending to replace it.

Required backend endpoints:

```
GET /reports/overview                    → one panel per family
GET /reports/{key} ?…report-specific params
GET /reports/{key}/export ?…&format=pdf|excel    → file
```

`{key}` is one of the twelve catalogue keys; anything else is a 404 rather than an empty report.
Parameters are echoed back on the result so an export and a screen cannot disagree about what
was asked. The reports are `attendance-by-class`, `attendance-trend`, `fee-collection`,
`fee-defaulters`, `student-strength`, `student-admissions`, `teacher-departments`,
`teacher-workload`, `payroll-cost`, `payroll-statutory`, `exam-performance` and
`exam-grade-spread`.

### Shared building blocks

Extracted when a second module needed them, rather than copied:

- **`components/attachments/`** — the attachment record, upload rules (PDF 15 MB, image 10 MB,
  video 200 MB), thumbnail and full preview. Homework had them first; assignments needed the
  identical set, which is when they moved. Videos preview with `preload="metadata"` — a class of
  thirty opening a large clip should not each pull the whole file before pressing play — and PDFs
  fall back to a download prompt where the browser refuses to embed them.
- **`lib/createDocumentService.ts` + `components/documents/`** — `{owner}/{id}/documents` is
  identical for every owner, so students and teachers share one service factory, one set of
  query hooks and one `DocumentsCard`. Each module supplies only its own type list.
- **`features/academics/`** — class, section and subject lookups, alongside the management
  screens that own them. Students and teachers read the lookups, and timetables and exams will
  too.
- **`components/ui/MultiSelect` + `components/form/FormMultiSelect`** — checkbox-list dropdown
  with chips in the trigger, so selections stay visible without opening the panel.
- **`lib/validation.ts`** — the person-shaped Zod fragments (names, phones, email, Aadhaar,
  PAN, past dates, postal address). Students, teachers and staff import these, so "what counts
  as a valid phone number" is one decision, not three.
- **`components/person/PersonFields.tsx`** — the personal, contact and address field blocks
  that teachers and staff have in common. They rely on the field names matching across
  schemas, which is exactly what the shared validation fragments guarantee.
- **`lib/money.ts`** — integer-paise arithmetic: exact sums, percentage rounding, even splits
  that add back to the total, and oldest-first allocation that reports its remainder instead of
  absorbing it. Every amount in the fee module passes through it.
- **`types/common.ts` → `PostalAddress`** — the address as the *API* returns it, with a
  nullable `line2`. Deliberately distinct from the form shape inferred from `addressSchema`,
  where an absent line is `''`; conflating the two is how a "not recorded" row renders blank.
- **`lib/statistics.ts`** — mean, sample standard deviation, z-scores, Pearson correlation,
  least-squares regression, quantiles, weighted scoring and bucketing. Pure and
  dependency-free, so the awkward cases are testable without rendering: two points never yield a
  correlation (any two lie on a line, and a coefficient of 1 there is an artefact), a flat series
  has no z-score rather than an infinite one, and every function returns `null` where the answer
  is genuinely undefined — `NaN` propagates silently through a chart and surfaces as an empty
  axis three components later.
- **`hooks/useDismiss.ts`** — close an open popover on a click away or Escape. Extracted when a
  fifth dropdown wanted it: the account menu, the multi-select, both export menus and the
  notification bell had the same effect written out verbatim, which was five places to fix the
  day somebody noticed a missing listener teardown. It listens on `mousedown` rather than
  `click`, because a click fires after the button inside the panel has already been re-rendered
  away.
- **`lib/relativeTime.ts`** — "2 hours ago", falling back to a date past a week, because "13 days
  ago" is arithmetic the reader then has to undo. Extracted when the notification bell wanted
  what the dashboard's activity feed already had. `now` is a parameter so the awkward cases — a
  timestamp a few seconds in the future from clock skew, the boundary between "yesterday" and "2
  days ago" — are testable without waiting for a clock.
- **`components/charts/`** — bar, line and donut, hand-rolled in SVG. A charting library would
  be the largest thing in the bundle for three shapes and a scale, and every candidate wants
  either a canvas the print stylesheet cannot see or a CDN the page is not allowed to reach.
  The maths lives apart from the drawing in `scale.ts`, so the awkward cases — an all-zero
  series, a single reading, a donut of one slice, an axis for a peak of 97 — are testable
  without rendering anything, and they are tested. Each plot is a `viewBox` with no pixel
  width, so it scales into its column instead of stretching its own labels.
# school_frontend
