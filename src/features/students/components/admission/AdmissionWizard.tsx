import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';

import { Form } from '@/components/form/Form';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { applyServerErrors } from '@/lib/formErrors';
import { toast } from '@/store/toastStore';

import type { StudentInput } from '../../schemas';
import { STEP_FIELDS, studentSchema } from '../../schemas';
import { emptyStudent } from '../../utils/defaults';
import { GuardiansSection } from '../sections/GuardiansSection';
import { MedicalSection } from '../sections/MedicalSection';
import { PersonalSection } from '../sections/PersonalSection';
import { PreviousSchoolSection } from '../sections/PreviousSchoolSection';

import { AdmissionStepper, type WizardStep } from './AdmissionStepper';
import { ReviewSection } from './ReviewSection';

const STEPS: WizardStep[] = [
  { key: 'personal', label: 'Student details' },
  { key: 'guardians', label: 'Parents & guardians' },
  { key: 'medical', label: 'Medical', optional: true },
  { key: 'previousSchool', label: 'Previous school', optional: true },
  { key: 'review', label: 'Review' },
];

/** Fields each step validates before it will let the user move on. */
const STEP_VALIDATION: Record<string, readonly string[]> = {
  personal: STEP_FIELDS.personal,
  guardians: STEP_FIELDS.guardians,
  medical: STEP_FIELDS.medical,
  previousSchool: STEP_FIELDS.previousSchool,
  review: [],
};

interface AdmissionWizardProps {
  onSubmit: (values: StudentInput, helpers: { onError: (error: unknown) => void }) => void;
  isPending: boolean;
  onCancel: () => void;
}

/**
 * Multi-step admission form.
 *
 * One `useForm` across every step — not a form per step — so values survive
 * navigation, the review step can read the whole record, and a single submit
 * carries the complete payload. Each step is gated by validating only its own
 * fields, so a user is never blocked by an error on a step they have not
 * reached.
 */
export function AdmissionWizard({ onSubmit, isPending, onCancel }: AdmissionWizardProps) {
  const [index, setIndex] = useState(0);
  const [furthest, setFurthest] = useState(0);

  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: emptyStudent(),
    // Re-validate on change only after a failed attempt, so the form does not
    // shout at the user while they are still typing the first field.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const step = STEPS[index];
  const isLastStep = index === STEPS.length - 1;

  const goTo = (next: number) => {
    setIndex(next);
    setFurthest((current) => Math.max(current, next));
    // A long step leaves the next one's first field below the fold.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async () => {
    const fields = STEP_VALIDATION[step.key] as readonly FieldPath<StudentInput>[];
    const valid = await form.trigger([...fields]);

    if (!valid) {
      toast.error('Check this step', 'Some fields need attention before you continue.');
      return;
    }

    goTo(index + 1);
  };

  const handleSubmit = (values: StudentInput) => {
    onSubmit(values, {
      onError: (error) => {
        if (applyServerErrors(error, form.setError)) {
          // The offending field is almost always back on step one; send the
          // user there rather than leaving them on a review page of red text.
          goTo(0);
          toast.error('Could not save', 'The server rejected some values — see the highlighted fields.');
          return;
        }

        form.setError('root.serverError', {
          type: 'server',
          message: error instanceof Error ? error.message : 'Could not admit this student.',
        });
      },
    });
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <AdmissionStepper
        steps={STEPS}
        currentIndex={index}
        furthestIndex={furthest}
        onStepClick={goTo}
      />

      <Card>
        <CardBody>
          {step.key === 'personal' && <PersonalSection />}
          {step.key === 'guardians' && <GuardiansSection />}
          {step.key === 'medical' && <MedicalSection />}
          {step.key === 'previousSchool' && <PreviousSchoolSection />}
          {step.key === 'review' && <ReviewSection />}
        </CardBody>

        <CardFooter className="justify-between">
          <Button
            variant="ghost"
            onClick={index === 0 ? onCancel : () => goTo(index - 1)}
            disabled={isPending}
            leftIcon={index === 0 ? undefined : <ArrowLeft className="size-4" />}
          >
            {index === 0 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:block">
              Step {index + 1} of {STEPS.length}
            </span>

            {isLastStep ? (
              <Button
                type="submit"
                isLoading={isPending}
                leftIcon={<UserPlus className="size-4" />}
              >
                Admit student
              </Button>
            ) : (
              // Deliberately not `type="submit"` — Enter on an intermediate
              // step must advance, not create the record.
              <Button onClick={handleNext} rightIcon={<ArrowRight className="size-4" />}>
                Continue
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Form>
  );
}
