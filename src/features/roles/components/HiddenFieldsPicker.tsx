import { EyeOff } from 'lucide-react';

import { Checkbox } from '@/components/ui/Checkbox';

/**
 * Groups of sensitive details a role can be kept from seeing. The server
 * blanks them out of every answer for that role, everywhere in the app —
 * hiding them on screen alone would not keep them from anybody.
 */
export const SENSITIVE_GROUPS: Array<{ key: string; label: string; description: string }> = [
  { key: 'contact', label: 'Contact details', description: 'Phone numbers, email addresses and home addresses of students, parents and staff.' },
  { key: 'identity', label: 'ID numbers', description: 'Aadhaar, PAN, passport and similar identity numbers.' },
  { key: 'medical', label: 'Medical details', description: 'Medical records, allergies, conditions, medication and blood group.' },
  { key: 'family', label: 'Family background', description: "Parents' occupation and annual income." },
  { key: 'salary', label: 'Salary and bank details', description: 'Salaries, payslip amounts and bank account details of staff.' },
];

interface HiddenFieldsPickerProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function HiddenFieldsPicker({ value, onChange, disabled }: HiddenFieldsPickerProps) {
  const toggle = (key: string, on: boolean) => onChange(on ? [...new Set([...value, key])] : value.filter((entry) => entry !== key));

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-start gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <EyeOff className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
        <p className="text-sm text-slate-600">
          Ticked details are shown as “Hidden” to anybody whose roles all hide them. Someone who also holds a role that shows
          them still sees them.
        </p>
      </div>
      <ul className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
        {SENSITIVE_GROUPS.map((group) => (
          <li key={group.key}>
            <Checkbox
              label={group.label}
              description={group.description}
              checked={value.includes(group.key)}
              disabled={disabled}
              onChange={(event) => toggle(group.key, event.target.checked)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
