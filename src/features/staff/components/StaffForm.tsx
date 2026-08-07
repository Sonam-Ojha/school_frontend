import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Form } from '@/components/form/Form';
import {
  AddressFields,
  ContactFields,
  PersonalDetailsFields,
} from '@/components/person/PersonFields';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { applyServerErrors } from '@/lib/formErrors';
import { ageFrom } from '@/lib/format';

import { staffSchema, type StaffInput } from '../schemas';

import { StaffEmploymentSection } from './StaffEmploymentSection';

interface StaffFormProps {
  defaultValues: StaffInput;
  onSubmit: (values: StaffInput, helpers: { onError: (error: unknown) => void }) => void;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
  /** Only edit needs the dirty guard; create starts blank and is always saveable. */
  requireDirty?: boolean;
}

/**
 * Shared by the create and edit screens — the two differ only in
 * `defaultValues` and which mutation they hand to `onSubmit`.
 *
 * The personal, contact and address blocks come from the shared person field
 * groups, so staff and teachers cannot drift apart on the fields they have in
 * common.
 */
export function StaffForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  onCancel,
  requireDirty = false,
}: StaffFormProps) {
  const form = useForm<StaffInput>({
    resolver: zodResolver(staffSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const age = ageFrom(form.watch('date_of_birth'));

  const handleSubmit = (values: StaffInput) => {
    onSubmit(values, {
      onError: (error) => {
        if (applyServerErrors(error, form.setError)) return;
        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not save this staff member.',
        });
      },
    });
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Card>
        <CardBody className="space-y-8">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Personal details</h3>
            <PersonalDetailsFields<StaffInput>
              ageHint={age !== null ? `${age} years old` : undefined}
            />
          </section>

          <div className="border-t border-slate-200 pt-6">
            <StaffEmploymentSection />
          </div>

          <section className="border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Contact</h3>
            <ContactFields<StaffInput> emailHint="Used to sign in once an account is created." />
          </section>

          <section className="border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Address</h3>
            <AddressFields<StaffInput> />
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
