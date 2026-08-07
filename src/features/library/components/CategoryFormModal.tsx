import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { useCreateCategory, useUpdateCategory } from '../hooks/useLibrary';
import { categorySchema, type CategoryInput } from '../schemas';
import type { BookCategory } from '../types';

const FIELDS = ['name', 'code', 'description', 'is_active'] as const;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  category?: BookCategory | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category = null,
}: CategoryFormModalProps) {
  const isEdit = category !== null;

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory(category?.id ?? 0);
  const mutation = isEdit ? updateCategory : createCategory;

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          code: category.code,
          description: category.description ?? '',
          is_active: category.is_active,
        }
      : { name: '', code: '', description: '', is_active: true },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: CategoryInput) => {
    mutation.mutate(values, {
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
      title={isEdit ? `Edit ${category.name}` : 'Add a category'}
      description="Categories shelve the collection and give accession numbers their stem."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add category'}
          </Button>
        </>
      }
    >
      <Form id="category-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormInput<CategoryInput>
            name="name"
            label="Name"
            placeholder="Science"
            required
          />
          <FormInput<CategoryInput>
            name="code"
            label="Code"
            placeholder="SCI"
            hint="Used as the accession-number stem, e.g. SCI-0001."
            required
          />

          <FormFullRow>
            <FormTextarea<CategoryInput> name="description" label="Description" rows={2} />
          </FormFullRow>

          <FormCheckbox<CategoryInput>
            name="is_active"
            label="Available for new books"
            description="Turn off to retire a category without disturbing the books already in it."
          />
        </FormGrid>

        {isEdit && category.books_count > 0 && !form.watch('is_active') && (
          <Alert tone="info">
            {category.books_count} title{category.books_count === 1 ? '' : 's'} stay filed under
            this category — it only disappears from the picker for new books.
          </Alert>
        )}
      </Form>
    </Modal>
  );
}
