import {
  Bell,
  CalendarCheck,
  CalendarOff,
  GraduationCap,
  LayoutDashboard,
  Library,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/cn';

const SIDEBAR: ReadonlyArray<{ label: string; icon: LucideIcon }> = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Students', icon: GraduationCap },
  { label: 'Teachers', icon: Users },
  { label: 'Fees', icon: Wallet },
  { label: 'Attendance', icon: CalendarCheck },
  { label: 'Library', icon: Library },
];

const CARDS: ReadonlyArray<{
  label: string;
  icon: LucideIcon;
  figure: string;
  meter: string;
  color: string;
  value: string;
}> = [
  { label: 'Students', icon: GraduationCap, figure: 'w-14', meter: 'w-4/5', color: 'bg-brand-500', value: '1,248' },
  { label: 'Fees collected', icon: Wallet, figure: 'w-20', meter: 'w-3/5', color: 'bg-emerald-500', value: '₹2.4L' },
  { label: 'Present today', icon: CalendarCheck, figure: 'w-12', meter: 'w-11/12', color: 'bg-violet-500', value: '94%' },
  { label: 'Leave pending', icon: CalendarOff, figure: 'w-8', meter: 'w-1/4', color: 'bg-amber-500', value: '3' },
];

const BARS = [
  { height: 'h-[55%]', active: false },
  { height: 'h-[72%]', active: false },
  { height: 'h-[64%]', active: false },
  { height: 'h-[86%]', active: false },
  { height: 'h-[78%]', active: false },
  { height: 'h-[94%]', active: true },
] as const;

const ACTIVITY = [
  { dot: 'bg-emerald-400', text: 'Fee collected · Class 8-B' },
  { dot: 'bg-brand-400', text: 'Attendance marked · 10-A' },
  { dot: 'bg-amber-400', text: 'Leave approved · R. Sharma' },
];

/**
 * A premium drawing of the dashboard for the hero — its shape, not a screenshot.
 * Deliberately uses placeholder figures: the real numbers are one sign-in away.
 */
export function AppPreview() {
  return (
    <div aria-hidden className="relative select-none">
      {/* Outer glow */}
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-600/30 via-purple-600/20 to-brand-600/10 blur-2xl" />

      {/* Browser chrome */}
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-slate-800/80 px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-500/80" />
          <span className="size-2.5 rounded-full bg-amber-500/80" />
          <span className="size-2.5 rounded-full bg-emerald-500/80" />
          <div className="ml-3 flex h-5 flex-1 items-center gap-1 rounded-md bg-slate-700/80 px-2">
            <div className="size-2 rounded-full bg-emerald-400" />
            <span className="text-[9px] text-slate-400">klimb school erp · /your-school/dashboard</span>
          </div>
          {/* Bell notification */}
          <div className="relative ml-2">
            <Bell className="size-3.5 text-slate-500" />
            <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-brand-500" />
          </div>
        </div>

        {/* App layout */}
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-36 shrink-0 space-y-0.5 border-r border-white/10 bg-slate-800/50 p-2.5 sm:block">
            {/* School logo placeholder */}
            <div className="mb-3 flex items-center gap-1.5 px-2 py-1">
              <div className="size-5 rounded-md bg-brand-600/60" />
              <div className="h-2 w-16 rounded-full bg-slate-700" />
            </div>
            {SIDEBAR.map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs',
                  index === 0
                    ? 'bg-brand-600/20 font-medium text-brand-300 ring-1 ring-brand-500/30'
                    : 'text-slate-400',
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                {label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1 space-y-3 bg-slate-900 p-4">
            {/* Greeting bar */}
            <div className="flex items-center justify-between">
              <div>
                <div className="h-2.5 w-28 rounded-full bg-slate-700" />
                <div className="mt-1 h-2 w-20 rounded-full bg-slate-800" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-14 rounded-md bg-brand-600/40 text-[8px] text-brand-300 flex items-center justify-center">
                  Today
                </div>
                <div className="size-6 rounded-full bg-slate-700" />
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-2">
              {CARDS.map(({ label, icon: Icon, meter, color, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/8 bg-slate-800/60 p-3 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] font-medium text-slate-400">{label}</span>
                    <Icon className="size-3 shrink-0 text-slate-500" />
                  </div>
                  <div className="mt-1.5 text-sm font-bold text-white">{value}</div>
                  <div className="mt-1.5 h-1 rounded-full bg-slate-700">
                    <div className={cn('h-full rounded-full', meter, color)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-white/8 bg-slate-800/60 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400">Attendance this week</span>
                <span className="text-[10px] font-semibold text-emerald-400">↑ 94%</span>
              </div>
              <div className="flex h-16 items-end gap-1.5">
                {BARS.map(({ height, active }, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex-1 rounded-t-sm transition-all',
                      height,
                      active
                        ? 'bg-gradient-to-t from-brand-600 to-brand-400'
                        : 'bg-slate-700',
                    )}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between">
                {['M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[8px] text-slate-500">{d}</span>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div className="rounded-xl border border-white/8 bg-slate-800/60 p-3">
              <span className="text-[10px] font-medium text-slate-400">Recent activity</span>
              <div className="mt-2 space-y-2">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={cn('size-1.5 shrink-0 rounded-full', a.dot)} />
                    <span className="text-[9px] text-slate-400">{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
