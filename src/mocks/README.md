# Development mock API

Answers every request in-memory so the UI can be driven before the Laravel backend exists.

**It never reaches production.** `main.tsx` imports it inside `if (import.meta.env.DEV)`, which
the bundler replaces with `false` at build time and drops — chunk included.

## Sign in

Password for every account: **`Password123`**

| Email | Role |
| ----- | ---- |
| `superadmin@school.test` | Super Admin |
| `admin@school.test` | School Admin |
| `principal@school.test` | Principal |
| `viceprincipal@school.test` | Vice Principal |
| `teacher@school.test` | Teacher |
| `accountant@school.test` | Accountant |
| `receptionist@school.test` | Receptionist |
| `librarian@school.test` | Librarian |
| `staff@school.test` | Staff |
| `parent@school.test` | Parent |
| `student@school.test` | Student |

Timetable rights are split three ways in the seed, which makes them the quickest way to see
`Can`, `ProtectedRoute` and the tab filtering all working: a **teacher** may read and print the
timetable but not rearrange it, a **vice principal** builds the grid but cannot add rooms to the
estate, and a **school admin** does both. Signing in as a teacher hides the Periods tab entirely.

The library splits the same way: a **librarian** runs the whole library including waiving fines
(`library.approve`), while a **teacher** gets `library.read` only — enough to browse the
catalogue, not enough to see the Issue, Return or Categories tabs. Transport splits the same way
again: a **receptionist** reads and prints it (they field the "where is the bus" calls), a
**parent** only reads it, and a **school admin** runs the fleet. The hostel goes further: a
**vice principal** runs boarding day to day but lacks `hostel.approve`, so a roll call older than
two nights is read-only for them and editable for a **principal**. Payroll splits the same way
along the money: an **accountant** builds salaries and costs the month but holds no
`payroll.approve`, so the Approve button is invisible to them and present for a **principal** —
who in turn cannot edit a salary. Communication splits twice over: a **receptionist** drafts
notices and messages but holds neither `notices.approve` nor `communication.approve`, a **vice
principal** can compose but not release a broadcast, and a **principal** does both.

The login screen lists these in a collapsible panel — click one to fill the form.

Each role carries a different permission set, so signing in as a teacher hides the Roles and
Permissions nav entries, while School Admin sees them. That is the fastest way to check the
`Can` guards and `ProtectedRoute` behave.

## What is mocked

All auth endpoints, roles CRUD, permissions, school settings, academic sessions, students
(47 seeded records with documents, exports and ID cards), teachers (32 seeded records with
qualifications, experience, subject and class assignments) and non-teaching staff (24 seeded
records across all seven roles, including drivers with licences) and the academic structure
(8 classes with sections, shifts and capacities), plus homework, assignments, attendance, fees
examinations, the timetable, the library, transport, the hostel, payroll and communication.
Requests include a ~350 ms delay so
skeletons and pending states are actually visible. Anything unmocked returns a 501 naming the
route, so a missing handler is obvious rather than silent.

Seed data is deliberately uneven. Some students have no medical record, no previous school or
no roll number; some teachers are freshers with no experience, have no department, or no class
assigned — so the "not recorded" branches, empty states and warning banners are all reachable
without editing anything first.

The class seed includes one class with no sections, one section over capacity, one nearly
full, one inactive and an afternoon shift — so both capacity warnings, the shift badges and
the empty state are all reachable. The subject seed mixes theory-only, practical-only and
both, plus a zero-credit subject, two electives and one retired — so every badge and marks
breakdown in the table is reachable too.

Attendance holidays are anchored to the **current year**, so a fresh clone always has a
calendar overlapping today. Marks are stored as a flat `type|date|person_id` map — what a real
`attendance` table is — and the sheet is assembled from the roster plus whatever marks exist.
Months with no saved marks fall back to a deterministic history so the monthly report is never
blank on first boot.

Homework dates are relative to today, so a fresh clone always has a mix of upcoming, due-soon
and overdue work, plus a draft and a closed one. Submissions are stored only where they exist —
"not handed in" is derived from the roster, and so is late/graded status.

Assignments follow the same shape, with one addition: their submissions are **seeded**, because
otherwise the marks card, the grade spread and the published-marks state would only be reachable
by hand-marking a class of thirty. The spread is derived from student ids rather than randomised,
so a reload shows the same picture twice: two in ten never hand in, one hands in late, and a live
assignment is part-marked while a closed one is marked throughout and released. Evaluations are
computed by the mock from the per-criterion marks — total, late penalty, percentage and grade —
never taken from the request, which is what the real API must do too.

Communication seeds **templates and notices**. Messages are generated so their audiences resolve
against the live rosters — a sent message hard-coded to "412 recipients" would drift from the
student list the moment anybody was admitted, and the point of an audience being a query is that
it does not. The log carries every status: several sent, one scheduled, one cancelled, and one
partly delivered where a single channel failed outright. The board carries a draft, one awaiting
approval, three published, one expired and one urgent-and-pinned.

Two seeds exist to make a warning reachable without typing anything: the annual-day SMS has a
**curly apostrophe** in it, so the unicode-segment warning fires on a real template, and one
WhatsApp template is **pending** while another is **rejected**, so neither can be sent. The SMS
channel reports as not configured because the seeded API key is deliberately empty — which is
what makes the "this channel cannot send" refusal reachable on first boot.

Payroll seeds the **component catalogue only**. Salary structures are generated from the live
teacher and staff rosters, and two months are already run — one paid and closed, one approved but
not yet released — so the registers have something to show and the run screen has a live state on
first boot. A few employees are deliberately left without a salary, because that gap is the one
that silently loses somebody a month's pay.

**The salary bands match the designations the rosters actually use** — `Housekeeping Attendant`,
`Bus Driver`, `Head of Department` — not job titles one might guess. An earlier version matched
on invented words, everybody fell through to the default basic, and the entire ESI half of the
module had no members to show. The figures now straddle both ceilings on purpose: with the seeded
allowances a gross lands inside the ₹21,000 ESI ceiling only up to a basic of about ₹10,600, so
the two lowest bands attract ESI and nobody else does — which is exactly who the scheme covers.

The hostel seeds **blocks and rooms only**. Beds are minted from each room's type, and residents
are drawn from the live student roster with the gender rule applied — an allocation hard-coded
against a student id would break the moment the seed moved, and a boys' block filled with girls
would be worse than useless. The blocks are deliberately uneven: one nearly full, one with room
to spare, one newly opened and one closed for renovation; a room under repair, one held back for
a visitor, and one dormitory furnished with fewer beds than its type implies. Last night's roll
call is seeded *mostly* taken, with a handful left uncalled on purpose — "still to call" is the
figure the screen exists to surface, and a fully-marked seed would hide it.

**Dates in the mock are UTC throughout.** `new Date('2026-08-07T00:00:00')` parses as *local*
midnight while `toISOString()` formats in UTC, so a naive round-trip shifts by a day anywhere
east of Greenwich — which is where this school is. `shiftDate` parses with the `Z` and steps with
`setUTCDate` so it, `TODAY_DATE` and `daysBetween` stay on one clock; the hostel, transport and
library seeds all depend on that.

Transport seeds **buses, routes and stops**. Drivers are not seeded — they are staff, and the
mock picks them off the live roster, so a driver's licence expiry has exactly one home. Student
assignments are minted from the live student list at about 45% of each bus's seats, which leaves
the "seats free" figure meaningful and lets somebody actually be assigned at the desk on a fresh
clone. Document expiry dates are relative to today, so a fresh clone always has one bus grounded
by lapsed insurance, one with a certificate about to run out, one with a paper never recorded and
one retired — a fixed calendar would put the whole fleet in one state and the compliance banner
would never fire. GPS positions are derived from the clock rather than randomised, so two polls a
second apart do not teleport a bus across the city and the morning run actually progresses while
somebody watches it.

The library seeds **titles and categories only** — copies and loans are minted by the mock from
the live rosters, because a loan hard-coded against a member id breaks the moment the seed moves.
Accession numbers are generated per category (`SCI-0007`) and are unique across the whole
collection; a deleted copy's number is retired rather than reused. The loans are spread on
purpose: several current, one overdue by about a week, one overdue for two months on a ₹40 book
so the fine sits pinned at the price cap, two already returned, and one written off as lost. A
lost loan is seeded **closed**, with a resolution date — the book is not coming back, and leaving
it open would make the copy simultaneously lost and still out with somebody, with its fine
climbing after the replacement had been paid for.

The timetable seeds the **period grid and the room register only** — the lessons themselves are
generated from the live class, subject and teacher rosters, because a timetable hard-coded
against ids would break the moment a class was renamed. The generator is greedy: it walks the
week section by section and takes the first qualified teacher who is free and still under their
daily ceiling, leaving the cell empty where nobody qualifies. Those holes are deliberate — they
give the "free periods" figure something real to count, and a generator that always filled every
cell would hide exactly the problem the screen exists to show. It also respects the same daily
limit the write endpoint enforces: a mock that seeds data its own API would reject is a mock
that lies about its rules.

Examinations seed four exams whose windows straddle today: one finished and published, one
finished but still part-marked, one about to start and one still a draft — so every status,
the publish warning and the provisional report card are reachable on first boot. Marks are
stored as a flat `paperId|studentId` map, and **results are never stored at all**: totals,
percentages, grades and the pass verdict are recomputed from the marks on every read, the way
the real API must. Ranks are the one exception — publishing freezes a rank map, so a later
correction changes the total on screen without reshuffling a card that has already been
printed. The seeded spread is derived from student and paper ids, so a reload shows the same
class twice: one in twenty-five is absent, one in ten fails, and every grade band is occupied.

**Seed cycles are kept coprime on purpose.** Students are assigned to classes on a 7-cycle, so
their status list has 9 entries rather than 7; with equal periods the two correlate perfectly
and three of the seven classes end up with no active students at all — which silently emptied
attendance sheets, fee dues and homework rosters for those classes.

The fee mock stores only what was actually paid or credited (`studentId|dueId` maps), the way a
real ledger does — dues are derived from the student's structure each time. Structure due dates
straddle today, so the collection screen shows a mix of settled, pending and overdue
instalments without any setup. All of its arithmetic is in paise.

Approved leave is read from the **leave register**. It used to be derived from the person id,
because the leave module did not exist; `leaveFor` now looks up a real application, and the
attendance sheet, the monthly report and the biometric sync all go through it. Only
`ABSENT_STATUSES` locks a row — a pending request is not permission to be away, and cancelling
an approval unlocks the day again.

Leave seeds **types only**. Applications are generated against the live student, teacher and
staff rosters, because those three rosters are the applicants — there is no separate people
table, and an application hard-coded to a person id would break the moment a roster seed moved.
Every generated application is one the write endpoint would accept: a type the applicant may
actually ask for, short enough for that type's limit, backdated only where the type allows it,
and never overlapping another live request for the same person. Offsets straddle today on
purpose, so a fresh clone has somebody away right now, an approval that can still be undone, and
a pending request whose first day has already passed — the row the register shouts about.
`days` is never stored: it is working days between two dates, and the holiday calendar it
depends on can change after the fact.

**subject↔teacher is stored once**, on the teacher records; a subject's teacher list is
derived from them. Assigning from the subject side writes the teacher side, so the two views
cannot drift — which is the behaviour a real pivot table would give.

Derived fields are computed the way a real API would: a teacher's total experience comes from
their experience rows, `class_teacher_of` from their assignments, and a class's capacity and
student count from its sections — so the UI is never tested against values it could not
receive in production. Deletion guards behave like the real thing too: a class or section
holding students returns 409, not a silent success.

File responses (exports, ID cards, document downloads) return plain text with a real
`Content-Disposition` header. That exercises the blob path, the header parsing and the
filename handling end to end; generating valid XLSX/PDF binaries here would add no signal.

The mock honours the same secret-handling contract as the real API: SMTP passwords and SMS
API keys are held outside the settings object and only ever reported as `has_password` /
`has_api_key`. The seeded SMS key is deliberately empty so the "no API key stored" warning and
the failing test-SMS path are both visible without any setup.

Analytics seeds nothing at all, like reports — every figure it analyses comes from
`buildMonthlyReport`, `buildAccount` and `buildResults`, and what it adds is the statistics on
top. Two things about it are worth knowing when reading the mock. The **intelligence field is
null on every analysis**, and the provider registry is deliberately seeded with one `ready`
provider that declares *no* capabilities (the built-in statistics), one `not_configured` and one
`unavailable` — so all three states are reachable and nothing on any screen is a prediction.
And the **feature vector encodes a missing measure as `-1`** rather than omitting the column,
because a row whose shape varies is a row no model can consume; the score itself drops the
measure and renormalises, which is a different thing and is tested as such.

Notifications seed **shapes, not records**. A notification is raised *by* something — a fee
falling due, a leave decision, a payroll run — so the mock generates them per account against the
live stores, resolving each one's link and dropping any shape that has nothing to point at. Every
account gets the set its roles put it in, spread across read and unread, all three priorities and
all four delivery states, so the bell, the badge, the filters and the delivery column are all
reachable on a fresh clone. Delivery outcomes are computed from the user's own preferences and
the communication module's channel health, which is why SMS shows as `skipped` out of the box:
the seeded SMS key is deliberately empty, and "we never tried" is a different record from "we
tried and it failed".

The dashboard seeds nothing either, and for the same reason: every figure on it is read from the
module that owns it, and its charts are the report builders' own output. Two things in it are
mock-shaped and will change when a real backend arrives. First, the **student and parent accounts
are linked to a student by position** — `student@school.test` and `parent@school.test` are not on
the roster, so the mock matches on email and falls back to the first active student with a
guardian. It is deterministic and stable across reloads; a real backend reads the actual
relation, and nothing on the frontend changes. The **teacher account is linked the same way**, so
the teaching view has a timetable to show. Second, the activity feed is assembled by scanning the
in-memory stores; a real one is the same query against the same tables.

Reports seed **nothing at all**. Every one of the twelve calls the same builder the operational
screen calls — `buildMonthlyReport` for attendance, `buildAccount` for fee balances,
`buildWorkload` for teaching load, `buildResults` for exam results — so a report cannot disagree
with the screen it summarises, and there is no report data to keep in step with anything.
The overview panels are real report runs reduced to one chart apiece rather than a seventh
calculation, which is why a panel and the report it links to are always the same figure.

State is in memory: roles you create, settings edits and sessions survive navigation but reset
on a full page reload.

## Removing it

Three steps:

1. Delete `src/mocks/`.
2. Delete the `if (import.meta.env.DEV) { … }` block in `src/main.tsx`.
3. Delete `src/features/auth/components/DevCredentialsHint.tsx` and the `import.meta.env.DEV`
   block that renders it in `src/features/auth/components/LoginForm.tsx`.

Then point `VITE_API_BASE_URL` at the real API. Nothing else in the app knows the mock exists.
