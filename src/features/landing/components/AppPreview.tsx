import {
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

// Literal class names, so Tailwind can see them.
const CARDS: ReadonlyArray<{ label: string; icon: LucideIcon; figure: string; meter: string }> = [
  { label: 'Students', icon: GraduationCap, figure: 'w-14', meter: 'w-4/5' },
  { label: 'Fees collected', icon: Wallet, figure: 'w-20', meter: 'w-3/5' },
  { label: 'Present today', icon: CalendarCheck, figure: 'w-12', meter: 'w-11/12' },
  { label: 'Leave to decide', icon: CalendarOff, figure: 'w-8', meter: 'w-1/4' },
];

const BARS = ['h-[55%]', 'h-[72%]', 'h-[64%]', 'h-[86%]', 'h-[78%]', 'h-[94%]'] as const;

/**
 * A drawing of the dashboard for the hero — its shape, not a screenshot. The
 * figures are deliberately blank bars: the real numbers are one sign-in away,
 * and invented ones would only be decoration pretending to be data.
 */
export function AppPreview() {
  return (
    <div aria-hidden className="relative select-none">
      <div className="absolute -inset-4 rounded-[2rem] bg-brand-200/40 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-overlay">
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="ml-3 h-5 flex-1 rounded-md bg-white ring-1 ring-slate-200" />
        </div>

        <div className="flex">
          <div className="hidden w-36 shrink-0 space-y-0.5 border-r border-slate-200 bg-slate-50/70 p-2.5 sm:block">
            {SIDEBAR.map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs',
                  index === 0 ? 'bg-brand-50 font-medium text-brand-700' : 'text-slate-500',
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                {label}
              </div>
            ))}
          </div>

          <div className="min-w-0 flex-1 space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              {CARDS.map(({ label, icon: Icon, figure, meter }) => (
                <div key={label} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-medium text-slate-500">{label}</span>
                    <Icon className="size-3.5 shrink-0 text-brand-500" />
                  </div>
                  <div className={cn('mt-2.5 h-5 rounded bg-slate-200', figure)} />
                  <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full bg-brand-500', meter)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <span className="text-[11px] font-medium text-slate-500">Attendance this week</span>
              <div className="mt-3 flex h-20 items-end gap-2">
                {BARS.map((height, index) => (
                  <div
                    key={height}
                    className={cn(
                      'flex-1 rounded-t',
                      height,
                      index === BARS.length - 1 ? 'bg-brand-500' : 'bg-brand-200',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
