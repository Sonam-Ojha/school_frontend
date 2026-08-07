import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';
import { todayInputValue } from '@/lib/format';

import { COPY_CONDITION_OPTIONS, MAX_COPIES_PER_BATCH } from '../constants';
import { useAddCopies } from '../hooks/useLibrary';
import { addCopiesSchema, type AddCopiesInput } from '../schemas';
import type { BookDetail } from '../types';

const FIELDS = ['quantity', 'condition', 'acquired_on', 'price', 'shelf_no', 'remarks'] as const;

interface AddCopiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookDetail;
}

/**
 * Add a delivery of copies.
 *
 * Quantity rather than one form per copy: a librarian unpacking a carton of
 * twelve is doing one thing, not twelve. Accession numbers come back from the
 * API, which is the only place that can guarantee they are unique.
 */
export function AddCopiesModal({ isOpen, onClose, book }: AddCopiesModalProps) {
  const addCopies = useAddCopies(book.id);

  const form = useForm<AddCopiesInput>({
    resolver: zodResolver(addCopiesSchema),
    defaultValues: {
      quantity: 1,
      condition: 'new',
      acquired_on: todayInputValue(),
      price: book.price,
      shelf_no: book.shelf_no ?? '',
      remarks: '',
    },
  });

  const quantity = form.watch('quantity');

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: AddCopiesInput) => {
    addCopies.mutate(values, {
      onSuccess: handleClose,
      onError: (error) => {
        if (applyServerErrors(error, form.setError, FIELDS)) return;
        form.setError('root.serverError', { type: 'server', message: error.message });
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Add copies"
      description={`${book.title} — ${book.author}`}
      closeOnOverlayClick={!addCopies.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={addCopies.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="add-copies-form" isLoading={addCopies.isPending}>
            Add {Number.isFinite(quantity) && quantity > 0 ? quantity : ''}{' '}
            {quantity === 1 ? 'copy' : 'copies'}
          </Button>
        </>
      }
    >
      <Form id="add-copies-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<AddCopiesInput>
            name="quantity"
            type="number"
            label="How many"
            min={1}
            max={MAX_COPIES_PER_BATCH}
            required
          />
          <FormSelect<AddCopiesInput>
            name="condition"
            label="Condition"
            options={COPY_CONDITION_OPTIONS}
            required
          />

          <FormInput<AddCopiesInput>
            name="acquired_on"
            type="date"
            label="Acquired on"
            max={todayInputValue()}
            required
          />
          <FormInput<AddCopiesInput>
            name="price"
            type="number"
            label="Price paid, per copy"
            min={0}
            step="0.01"
            required
          />

          <FormInput<AddCopiesInput>
            name="shelf_no"
            label="Shelf"
            placeholder={book.shelf_no ?? 'Rack 4, Shelf B'}
            hint="Optional"
          />

          <FormTextarea<AddCopiesInput> name="remarks" label="Remarks" rows={2} />
        </FormGrid>

        <Alert tone="info">
          Accession numbers are generated in a run, and their barcodes can be printed straight
          afterwards.
        </Alert>
      </Form>
    </Modal>
  );
}
