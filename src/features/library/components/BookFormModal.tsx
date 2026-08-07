import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { applyServerErrors } from '@/lib/formErrors';

import { LANGUAGE_OPTIONS } from '../constants';
import { useCategoryOptions, useCreateBook, useUpdateBook } from '../hooks/useLibrary';
import { bookSchema, type BookInput } from '../schemas';
import type { BookDetail } from '../types';

const FIELDS = [
  'title', 'subtitle', 'author', 'isbn', 'category_id', 'publisher',
  'edition', 'publication_year', 'language', 'pages', 'price', 'shelf_no', 'description',
] as const;

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to add. */
  book?: BookDetail | null;
  onCreated?: (book: BookDetail) => void;
}

export function BookFormModal({ isOpen, onClose, book = null, onCreated }: BookFormModalProps) {
  const isEdit = book !== null;

  const createBook = useCreateBook();
  const updateBook = useUpdateBook(book?.id ?? 0);
  const mutation = isEdit ? updateBook : createBook;

  const { categoryOptions, isLoading: categoriesLoading } = useCategoryOptions();

  const form = useForm<BookInput>({
    resolver: zodResolver(bookSchema),
    defaultValues: book
      ? {
          title: book.title,
          subtitle: book.subtitle ?? '',
          author: book.author,
          isbn: book.isbn ?? '',
          category_id: book.category_id,
          publisher: book.publisher ?? '',
          edition: book.edition ?? '',
          // Optional numbers are strings in the form; blank means not recorded.
          publication_year: book.publication_year === null ? '' : String(book.publication_year),
          language: book.language,
          pages: book.pages === null ? '' : String(book.pages),
          price: book.price,
          shelf_no: book.shelf_no ?? '',
          description: book.description ?? '',
        }
      : {
          title: '',
          subtitle: '',
          author: '',
          isbn: '',
          category_id: 0,
          publisher: '',
          edition: '',
          publication_year: '',
          language: 'English',
          pages: '',
          price: 0,
          shelf_no: '',
          description: '',
        },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (values: BookInput) => {
    mutation.mutate(values, {
      onSuccess: (saved) => {
        if (!isEdit) onCreated?.(saved);
        handleClose();
      },
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
      size="lg"
      title={isEdit ? `Edit ${book.title}` : 'Add a book'}
      description="The title and its bibliographic details. Copies are added separately."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="book-form" isLoading={mutation.isPending}>
            {isEdit ? 'Save changes' : 'Add book'}
          </Button>
        </>
      }
    >
      <Form id="book-form" form={form} onSubmit={onSubmit}>
        <FormGrid cols={2}>
          <FormFullRow>
            <FormInput<BookInput>
              name="title"
              label="Title"
              placeholder="Things Fall Apart"
              required
            />
          </FormFullRow>

          <FormFullRow>
            <FormInput<BookInput> name="subtitle" label="Subtitle" hint="Optional" />
          </FormFullRow>

          <FormInput<BookInput> name="author" label="Author" placeholder="Chinua Achebe" required />
          <FormSelect<BookInput>
            name="category_id"
            label="Category"
            options={categoryOptions}
            placeholder={categoriesLoading ? 'Loading categories…' : 'Select a category'}
            valueAsNumber
            required
          />

          <FormInput<BookInput>
            name="isbn"
            label="ISBN"
            placeholder="978-0-385-47454-2"
            hint="Hyphens are fine — the check digit is verified."
          />
          <FormInput<BookInput> name="publisher" label="Publisher" hint="Optional" />

          <FormInput<BookInput> name="edition" label="Edition" placeholder="3rd" hint="Optional" />
          <FormInput<BookInput>
            name="publication_year"
            inputMode="numeric"
            label="Year"
            placeholder="1994"
            hint="Optional"
          />

          <FormSelect<BookInput>
            name="language"
            label="Language"
            options={LANGUAGE_OPTIONS}
            required
          />
          <FormInput<BookInput>
            name="pages"
            inputMode="numeric"
            label="Pages"
            hint="Optional"
          />

          <FormInput<BookInput>
            name="price"
            type="number"
            label="Replacement price"
            min={0}
            step="0.01"
            hint="Caps any overdue fine on this book."
            required
          />
          <FormInput<BookInput>
            name="shelf_no"
            label="Shelf"
            placeholder="Rack 4, Shelf B"
            hint="Optional"
          />

          <FormFullRow>
            <FormTextarea<BookInput> name="description" label="Description" rows={3} />
          </FormFullRow>
        </FormGrid>
      </Form>
    </Modal>
  );
}
