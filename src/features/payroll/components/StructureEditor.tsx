import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { applyServerErrors } from '@/lib/formErrors';
import { cn } from '@/lib/cn';
import { formatCurrency, todayInputValue } from '@/lib/format';
import { fromMinor, sumAmounts, toMinor } from '@/lib/money';

import { CALCULATION_LABELS, EMPLOYEE_TYPE_LABELS } from '../constants';
import { useComponentCatalogue, useSaveStructure } from '../hooks/usePayroll';
import { structureSchema, type StructureInput } from '../schemas';
import {
  ESI_WAGE_CEILING,
  PF_WAGE_CEILING,
  esiFor,
  pfFor,
  statutoryEligibility,
} from '../statutory';
import type { SalaryComponent, SalaryStructure, UnassignedEmployee } from '../types';

const FIELDS = ['basic', 'effective_from', 'pf_on_full_wage', 'pf_excluded', 'lines'] as const;

interface StructureEditorProps {
  /** The employee being paid, from either roster. */
  employee: Pick<
    UnassignedEmployee,
    'employee_type' | 'employee_id' | 'employee_name' | 'employee_code' | 'designation' | 'photo_url'
  >;
  /** Their current structure, or null for somebody not yet on the payroll. */
  structure: SalaryStructure | null;
  onSaved?: () => void;
}

/** What one component works out to at a given basic and gross. */
function amountFor(
  component: Pick<SalaryComponent, 'calculation'>,
  value: number,
  basic: number,
  grossSoFar: number,
): number {
  if (!Number.isFinite(value)) return 0;

  if (component.calculation === 'fixed') return value;
  if (component.calculation === 'percent_of_basic') {
    return fromMinor(Math.round((toMinor(basic) * value) / 100));
  }
  return fromMinor(Math.round((toMinor(grossSoFar) * value) / 100));
}

/**
 * One employee's standing salary.
 *
 * The whole point is the live total: somebody setting a basic needs to see
 * the gross, the statutory deductions it attracts and the net *before* they
 * save, because the number that matters to the person being paid is the last
 * one. The preview uses the same functions the server does, so what is shown
 * is what will be stored.
 */
export function StructureEditor({ employee, structure, onSaved }: StructureEditorProps) {
  const saveStructure = useSaveStructure();
  const { earnings, deductions } = useComponentCatalogue();

  const form = useForm<StructureInput>({
    resolver: zodResolver(structureSchema),
    defaultValues: {
      employee_type: employee.employee_type,
      employee_id: employee.employee_id,
      basic: structure?.basic ?? 0,
      effective_from: structure?.effective_from ?? todayInputValue(),
      pf_on_full_wage: false,
      pf_excluded: false,
      lines:
        structure?.lines
          .filter((line) => !line.is_statutory)
          .map((line) => ({ component_id: line.component_id, value: line.value })) ?? [],
      is_active: structure?.is_active ?? true,
    },
  });

  // Rebuild when the editor is pointed at somebody else.
  useEffect(() => {
    form.reset({
      employee_type: employee.employee_type,
      employee_id: employee.employee_id,
      basic: structure?.basic ?? 0,
      effective_from: structure?.effective_from ?? todayInputValue(),
      pf_on_full_wage: false,
      pf_excluded: false,
      lines:
        structure?.lines
          .filter((line) => !line.is_statutory)
          .map((line) => ({ component_id: line.component_id, value: line.value })) ?? [],
      is_active: structure?.is_active ?? true,
    });
  }, [employee.employee_id, employee.employee_type, structure, form]);

  const basic = form.watch('basic');
  const lines = form.watch('lines');
  const pfOnFullWage = form.watch('pf_on_full_wage');
  const pfExcluded = form.watch('pf_excluded');

  const selected = useMemo(
    () => new Map(lines.map((line) => [line.component_id, line.value])),
    [lines],
  );

  const toggle = (component: SalaryComponent) => {
    const current = form.getValues('lines');
    const exists = current.some((line) => line.component_id === component.id);

    form.setValue(
      'lines',
      exists
        ? current.filter((line) => line.component_id !== component.id)
        : [...current, { component_id: component.id, value: component.value }],
      { shouldValidate: true },
    );
  };

  const setValue = (componentId: number, value: number) => {
    form.setValue(
      'lines',
      form.getValues('lines').map((line) =>
        line.component_id === componentId ? { ...line, value } : line,
      ),
      { shouldValidate: true },
    );
  };

  /**
   * The live figures, computed exactly as the server will.
   *
   * Earnings first, because a gross-based deduction needs the gross — which
   * is why an earning may never be defined against it.
   */
  const preview = useMemo(() => {
    const safeBasic = Number.isFinite(basic) ? basic : 0;

    const earningLines = earnings
      .filter((component) => selected.has(component.id))
      .map((component) => ({
        component,
        amount: amountFor(component, selected.get(component.id)!, safeBasic, 0),
      }));

    const gross = sumAmounts([safeBasic, ...earningLines.map((line) => line.amount)]);

    // PF wages are basic plus only the allowances the Act counts.
    const pfWages = sumAmounts([
      safeBasic,
      ...earningLines.filter((line) => line.component.affects_pf).map((line) => line.amount),
    ]);

    const pf = pfFor(pfWages, {
      contributeOnFullWage: pfOnFullWage,
      isExcluded: pfExcluded,
    });
    const esi = esiFor(gross);

    const deductionLines = deductions
      .filter((component) => selected.has(component.id))
      .map((component) => ({
        component,
        amount: amountFor(component, selected.get(component.id)!, safeBasic, gross),
      }));

    const totalDeductions = sumAmounts([
      pf.employee,
      esi.employee,
      ...deductionLines.map((line) => line.amount),
    ]);

    return {
      earningLines,
      deductionLines,
      gross,
      pfWages,
      pf,
      esi,
      totalDeductions,
      net: fromMinor(toMinor(gross) - toMinor(totalDeductions)),
      eligibility: statutoryEligibility(pfWages, gross),
    };
  }, [basic, earnings, deductions, selected, pfOnFullWage, pfExcluded]);

  const onSubmit = (values: StructureInput) => {
    saveStructure.mutate(values, {
      onSuccess: () => onSaved?.(),
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <Form id="structure-form" form={form} onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardBody className="flex items-start gap-3">
          <Avatar name={employee.employee_name} src={employee.photo_url} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{employee.employee_name}</p>
            <p className="truncate text-xs text-slate-500">
              <code>{employee.employee_code}</code> · {employee.designation}
            </p>
            <Badge tone="neutral" className="mt-1.5">
              {EMPLOYEE_TYPE_LABELS[employee.employee_type]}
            </Badge>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Basic" description="Everything else is worked out from it." />
        <CardBody>
          <FormGrid cols={2}>
            <FormInput<StructureInput>
              name="basic"
              type="number"
              label="Basic salary"
              min={1}
              step="0.01"
              required
            />
            <FormInput<StructureInput>
              name="effective_from"
              type="date"
              label="Effective from"
              required
            />
          </FormGrid>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Allowances" description="Added to the basic to make the gross." />
          <CardBody className="space-y-3">
            {earnings.length === 0 ? (
              <p className="text-sm text-slate-500">No allowances defined yet.</p>
            ) : (
              earnings.map((component) => {
                const isOn = selected.has(component.id);
                const amount = preview.earningLines.find(
                  (line) => line.component.id === component.id,
                )?.amount;

                return (
                  <div key={component.id} className="flex items-start gap-3">
                    <Checkbox
                      checked={isOn}
                      onChange={() => toggle(component)}
                      aria-label={`Apply ${component.name}`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {component.name}
                        {component.affects_pf && (
                          <Badge tone="info" className="ml-2">
                            PF wages
                          </Badge>
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        <code>{component.code}</code> ·{' '}
                        {CALCULATION_LABELS[component.calculation].toLowerCase()}
                      </p>
                    </div>

                    {isOn && (
                      <div className="flex shrink-0 items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={selected.get(component.id) ?? 0}
                          onChange={(event) =>
                            setValue(component.id, Number(event.target.value))
                          }
                          aria-label={`${component.name} ${component.calculation === 'fixed' ? 'amount' : 'percentage'}`}
                          className="w-24"
                        />
                        <span className="w-24 text-right font-mono text-xs tabular-nums text-slate-700">
                          {formatCurrency(amount ?? 0)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Deductions"
            description="PF and ESI are added by rule — they are not listed here."
          />
          <CardBody className="space-y-3">
            {deductions.filter((component) => !component.is_statutory).length === 0 ? (
              <p className="text-sm text-slate-500">No optional deductions defined yet.</p>
            ) : (
              deductions
                .filter((component) => !component.is_statutory)
                .map((component) => {
                  const isOn = selected.has(component.id);
                  const amount = preview.deductionLines.find(
                    (line) => line.component.id === component.id,
                  )?.amount;

                  return (
                    <div key={component.id} className="flex items-start gap-3">
                      <Checkbox
                        checked={isOn}
                        onChange={() => toggle(component)}
                        aria-label={`Apply ${component.name}`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {component.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          <code>{component.code}</code> ·{' '}
                          {CALCULATION_LABELS[component.calculation].toLowerCase()}
                        </p>
                      </div>

                      {isOn && (
                        <div className="flex shrink-0 items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={selected.get(component.id) ?? 0}
                            onChange={(event) =>
                              setValue(component.id, Number(event.target.value))
                            }
                            aria-label={`${component.name} value`}
                            className="w-24"
                          />
                          <span className="w-24 text-right font-mono text-xs tabular-nums text-slate-700">
                            {formatCurrency(amount ?? 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
            )}

            <div className="border-t border-slate-100 pt-3">
              <FormCheckbox<StructureInput>
                name="pf_excluded"
                label="Excluded from PF"
                description={`Only allowed above the ceiling of ${formatCurrency(PF_WAGE_CEILING)}.`}
              />
              <FormCheckbox<StructureInput>
                name="pf_on_full_wage"
                label="Contribute PF on the full wage"
                description="Rather than capping at the statutory ceiling."
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {pfExcluded && preview.eligibility.pf_compulsory && (
        <Alert tone="danger" title="This employee cannot be excluded from PF">
          PF wages of {formatCurrency(preview.pfWages)} are at or below the ceiling of{' '}
          {formatCurrency(PF_WAGE_CEILING)}, so contribution is compulsory.
        </Alert>
      )}

      <Card>
        <CardHeader title="What this comes to" description="The same arithmetic the payroll run will do." />
        <CardBody>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Gross', preview.gross, 'text-slate-900'],
              ['PF wages', preview.pfWages, 'text-slate-600'],
              ['Deductions', preview.totalDeductions, 'text-red-700'],
              ['Net pay', preview.net, 'text-emerald-700'],
            ].map(([label, amount, tone]) => (
              <div key={label as string}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className={cn('mt-0.5 font-mono text-lg font-semibold tabular-nums', tone)}>
                  {formatCurrency(amount as number)}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs sm:grid-cols-4">
            <div>
              <p className="text-slate-500">Employee PF</p>
              <p className="font-mono tabular-nums">{formatCurrency(preview.pf.employee)}</p>
            </div>
            <div>
              <p className="text-slate-500">Employer PF</p>
              <p className="font-mono tabular-nums">{formatCurrency(preview.pf.employer)}</p>
            </div>
            <div>
              <p className="text-slate-500">Employee ESI</p>
              <p className="font-mono tabular-nums">
                {preview.esi.applicable ? formatCurrency(preview.esi.employee) : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Employer ESI</p>
              <p className="font-mono tabular-nums">
                {preview.esi.applicable ? formatCurrency(preview.esi.employer) : '—'}
              </p>
            </div>
          </div>

          {!preview.esi.applicable && preview.gross > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              Gross is above the ESI ceiling of {formatCurrency(ESI_WAGE_CEILING)} — outside the
              scheme, with no contribution from either side.
            </p>
          )}
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={saveStructure.isPending}
          leftIcon={<Save className="size-4" />}
        >
          {structure ? 'Save salary' : 'Put on payroll'}
        </Button>
      </div>
    </Form>
  );
}
