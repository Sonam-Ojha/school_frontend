import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash2, Wand2 } from 'lucide-react';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { useClassOptions } from '@/features/academics/hooks/useAcademics';
import { useAcademicYears } from '@/features/settings/hooks/useAcademicYears';
import { cn } from '@/lib/cn';
import { applyServerErrors } from '@/lib/formErrors';
import { formatCurrency } from '@/lib/format';
import { amountsEqual, splitEvenly, subtractAmounts, sumAmounts } from '@/lib/money';

import { FREQUENCY_OPTIONS } from '../constants';
import { useFeeTypeOptions } from '../hooks/useFeeCatalogue';
import { feeStructureSchema, type FeeStructureInput } from '../schemas';

interface FeeStructureFormProps {
  defaultValues: FeeStructureInput;
  onSubmit: (values: FeeStructureInput, helpers: { onError: (error: unknown) => void }) => void;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
  requireDirty?: boolean;
}

/**
 * Build a fee structure: what is charged, and when it falls due.
 *
 * The two halves must reconcile — the schema rejects a schedule that does not
 * add up to the fee lines — so the running totals are shown side by side and
 * the difference is called out the moment it appears.
 */
export function FeeStructureForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
  requireDirty = false,
}: FeeStructureFormProps) {
  const { feeTypeOptions } = useFeeTypeOptions();
  const { data: academicYears } = useAcademicYears();

  const form = useForm<FeeStructureInput>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const classId = form.watch('class_id');
  const { classOptions, sectionOptions } = useClassOptions(classId);

  const items = useFieldArray({ control: form.control, name: 'items' });
  const installments = useFieldArray({ control: form.control, name: 'installments' });

  const watchedItems = form.watch('items');
  const watchedInstallments = form.watch('installments');

  const itemsTotal = useMemo(
    () => sumAmounts(watchedItems.map((item) => (Number.isFinite(item.amount) ? item.amount : 0))),
    [watchedItems],
  );

  const installmentsTotal = useMemo(
    () =>
      sumAmounts(
        watchedInstallments.map((entry) => (Number.isFinite(entry.amount) ? entry.amount : 0)),
      ),
    [watchedInstallments],
  );

  const difference = subtractAmounts(itemsTotal, installmentsTotal);
  const reconciles = amountsEqual(itemsTotal, installmentsTotal);

  const yearOptions = (academicYears ?? []).map((year) => ({ label: year.name, value: year.id }));

  /** Splits the current total evenly, keeping the existing due dates. */
  const redistribute = () => {
    const parts = splitEvenly(itemsTotal, installments.fields.length);
    parts.forEach((amount, index) => {
      form.setValue(`installments.${index}.amount`, amount, { shouldDirty: true });
    });
    void form.trigger('installments');
  };

  const handleSubmit = (values: FeeStructureInput) => {
    onSubmit(values, {
      onError: (error) => {
        if (applyServerErrors(error, form.setError)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not save this structure.',
        });
      },
    });
  };

  const itemsError = form.formState.errors.items?.message;
  const installmentsError = form.formState.errors.installments?.message;

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-8">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Applies to</h3>
            <FormGrid cols={2}>
              <FormInput<FeeStructureInput>
                name="name"
                label="Structure name"
                placeholder="Class 10 — 2025-2026"
                required
              />
              <FormSelect<FeeStructureInput>
                name="academic_year_id"
                label="Academic year"
                options={yearOptions}
                placeholder="Select a session"
                valueAsNumber
                required
              />
              <FormSelect<FeeStructureInput>
                name="class_id"
                label="Class"
                options={classOptions}
                placeholder="Select a class"
                valueAsNumber
                required
              />
              <FormSelect<FeeStructureInput>
                name="section_id"
                label="Section"
                options={sectionOptions}
                placeholder={classId ? 'All sections' : 'Select a class first'}
                disabled={sectionOptions.length === 0}
                valueAsNumber
                hint="Leave blank to apply to every section."
              />
            </FormGrid>

            <div className="mt-3">
              <FormCheckbox<FeeStructureInput>
                name="is_active"
                label="Active"
                description="Inactive structures are not billed to new students."
              />
            </div>
          </section>

          {/* --- fee lines --- */}
          <section className="border-t border-slate-200 pt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Fee lines</h3>
                <p className="mt-0.5 text-xs text-slate-500">What this class is charged.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm">
                  <span className="text-slate-500">Total </span>
                  <span className="font-semibold text-slate-900">{formatCurrency(itemsTotal)}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => items.append({ fee_type_id: 0, amount: 0, frequency: 'annual' })}
                  leftIcon={<Plus className="size-4" />}
                >
                  Add line
                </Button>
              </div>
            </div>

            {typeof itemsError === 'string' && (
              <Alert tone="danger" className="mb-3">
                {itemsError}
              </Alert>
            )}

            <div className="space-y-3">
              {items.fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start gap-3">
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                      <FormSelect<FeeStructureInput>
                        name={`items.${index}.fee_type_id`}
                        label="Fee type"
                        options={feeTypeOptions}
                        placeholder="Select a fee type"
                        valueAsNumber
                        required
                      />
                      <FormInput<FeeStructureInput>
                        name={`items.${index}.amount`}
                        type="number"
                        label="Amount"
                        min={0}
                        step={0.01}
                        required
                      />
                      <FormSelect<FeeStructureInput>
                        name={`items.${index}.frequency`}
                        label="Frequency"
                        options={FREQUENCY_OPTIONS}
                        required
                      />
                    </div>

                    {items.fields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Remove fee line ${index + 1}`}
                        className="mt-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => items.remove(index)}
                        leftIcon={<Trash2 className="size-4" />}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- schedule --- */}
          <section className="border-t border-slate-200 pt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Instalments</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  When the total falls due. Must add up to the fee lines.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <span className="text-slate-500">Scheduled </span>
                  <span
                    className={cn(
                      'font-semibold',
                      reconciles ? 'text-emerald-700' : 'text-red-700',
                    )}
                  >
                    {formatCurrency(installmentsTotal)}
                  </span>
                </span>

                {!reconciles && installments.fields.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={redistribute}
                    leftIcon={<Wand2 className="size-4" />}
                  >
                    Split evenly
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    installments.append({
                      name: `Instalment ${installments.fields.length + 1}`,
                      due_date: '',
                      amount: 0,
                    })
                  }
                  leftIcon={<Plus className="size-4" />}
                >
                  Add instalment
                </Button>
              </div>
            </div>

            {!reconciles && (
              <Alert tone="warning" className="mb-3">
                The schedule is {difference > 0 ? 'short by' : 'over by'}{' '}
                <strong>{formatCurrency(Math.abs(difference))}</strong>. Instalments must total{' '}
                {formatCurrency(itemsTotal)} before this can be saved.
              </Alert>
            )}

            {typeof installmentsError === 'string' && (
              <Alert tone="danger" className="mb-3">
                {installmentsError}
              </Alert>
            )}

            <div className="space-y-3">
              {installments.fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start gap-3">
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                      <FormInput<FeeStructureInput>
                        name={`installments.${index}.name`}
                        label="Name"
                        placeholder="Term 1"
                        required
                      />
                      <FormInput<FeeStructureInput>
                        name={`installments.${index}.due_date`}
                        type="date"
                        label="Due date"
                        required
                      />
                      <FormInput<FeeStructureInput>
                        name={`installments.${index}.amount`}
                        type="number"
                        label="Amount"
                        min={0}
                        step={0.01}
                        required
                      />
                    </div>

                    {installments.fields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Remove instalment ${index + 1}`}
                        className="mt-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => installments.remove(index)}
                        leftIcon={<Trash2 className="size-4" />}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </CardBody>

        <CardFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={requireDirty && !form.formState.isDirty}
            leftIcon={<Save className="size-4" />}
          >
            {submitLabel}
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
