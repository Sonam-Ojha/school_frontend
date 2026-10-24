import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/format';

import { EXPENSE_PERMISSIONS } from '../constants';
import { useDeleteCategory, useExpenseCategories, useSaveCategory } from '../hooks/useExpenses';
import type { ExpenseCategory } from '../types';

function CategoryRow({ category }: { category: ExpenseCategory }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const save = useSaveCategory(category.id);
  const remove = useDeleteCategory();

  return (
    <li className="flex items-center gap-3 px-1 py-2">
      {editing ? (
        <>
          <Input value={name} onChange={(event) => setName(event.target.value)} className="h-8 flex-1" maxLength={60} autoFocus aria-label="Category name" />
          <Button
            size="sm"
            iconOnly
            aria-label="Save"
            leftIcon={<Check className="size-4" />}
            isLoading={save.isPending}
            onClick={() =>
              save.mutate({ name: name.trim(), description: category.description, is_active: category.is_active }, { onSuccess: () => setEditing(false) })
            }
          />
          <Button size="sm" variant="ghost" iconOnly aria-label="Cancel" leftIcon={<X className="size-4" />} onClick={() => setEditing(false)} />
        </>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <p className={category.is_active ? 'font-medium text-slate-900' : 'font-medium text-slate-400 line-through'}>{category.name}</p>
            <p className="text-xs text-slate-500">
              {category.expenses_count} voucher{category.expenses_count === 1 ? '' : 's'} · {formatCurrency(category.total_amount)}
            </p>
          </div>
          {!category.is_active && <Badge>Not in use</Badge>}
          <Can permissions={[EXPENSE_PERMISSIONS.update]}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => save.mutate({ name: category.name, description: category.description, is_active: !category.is_active })}
              isLoading={save.isPending}
            >
              {category.is_active ? 'Retire' : 'Use again'}
            </Button>
            <Button size="sm" variant="ghost" iconOnly aria-label={`Rename ${category.name}`} leftIcon={<Pencil className="size-4" />} onClick={() => setEditing(true)} />
          </Can>
          {category.expenses_count === 0 && (
            <Can permissions={[EXPENSE_PERMISSIONS.delete]}>
              <Button
                size="sm"
                variant="ghost"
                iconOnly
                aria-label={`Delete ${category.name}`}
                leftIcon={<Trash2 className="size-4" />}
                isLoading={remove.isPending}
                onClick={() => remove.mutate(category.id)}
              />
            </Can>
          )}
        </>
      )}
    </li>
  );
}

/** The heads expenses are filed under. One in use is retired rather than deleted. */
export function CategoriesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const categories = useExpenseCategories();
  const create = useSaveCategory(null);
  const [name, setName] = useState('');

  const add = () =>
    create.mutate({ name: name.trim(), description: null, is_active: true }, { onSuccess: () => setName('') });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Expense categories" description="The heads your expenses are filed under.">
      <Can permissions={[EXPENSE_PERMISSIONS.create]}>
        <form
          className="mb-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim().length >= 2) add();
          }}
        >
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="New category, e.g. Security services" maxLength={60} aria-label="New category" />
          <Button type="submit" leftIcon={<Plus className="size-4" />} isLoading={create.isPending} disabled={name.trim().length < 2}>
            Add
          </Button>
        </form>
      </Can>
      {categories.isPending ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <ul className="max-h-[50vh] divide-y divide-slate-100 overflow-y-auto">
          {(categories.data ?? []).map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </ul>
      )}
    </Modal>
  );
}
