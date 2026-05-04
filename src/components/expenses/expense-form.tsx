'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import type { Category, Expense } from '@/types';

const recurrenceValues = ['monthly', 'weekly', 'yearly'] as const;

const schema = z
  .object({
    amount: z.number({ error: 'Amount is required' }).positive('Amount must be greater than 0'),
    description: z.string().trim().min(1, 'Description is required'),
    categoryId: z.string().min(1, 'Pick a category'),
    date: z.string().min(1, 'Date is required'),
    isFixed: z.boolean(),
    recurrence: z.enum(recurrenceValues).optional(),
  })
  .refine((v) => !v.isFixed || !!v.recurrence, {
    path: ['recurrence'],
    message: 'Recurrence is required for fixed expenses',
  });

export type ExpenseFormValues = z.infer<typeof schema>;

interface Props {
  categories: Category[];
  initial?: Expense;
  onSubmit: (values: ExpenseFormValues) => void;
  onCancel: () => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function ExpenseForm({ categories, initial, onSubmit, onCancel }: Props) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          amount: initial.amount,
          description: initial.description,
          categoryId: initial.categoryId,
          date: initial.date.slice(0, 10),
          isFixed: initial.isFixed,
          recurrence: initial.recurrence,
        }
      : {
          amount: 0,
          description: '',
          categoryId: categories[0]?.id ?? '',
          date: todayISO(),
          isFixed: false,
          recurrence: undefined,
        },
  });

  useEffect(() => {
    if (initial) {
      reset({
        amount: initial.amount,
        description: initial.description,
        categoryId: initial.categoryId,
        date: initial.date.slice(0, 10),
        isFixed: initial.isFixed,
        recurrence: initial.recurrence,
      });
    }
  }, [initial, reset]);

  const isFixed = useWatch({ control, name: 'isFixed' });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card preset-filled-surface-100-900 p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="h4">{initial ? 'Edit expense' : 'New expense'}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 block">
          <span className="text-sm font-medium">Amount</span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className="input"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <span className="text-xs text-error-500">{errors.amount.message}</span>
          )}
        </label>

        <label className="space-y-1 block">
          <span className="text-sm font-medium">Date</span>
          <input type="date" className="input" {...register('date')} />
          {errors.date && (
            <span className="text-xs text-error-500">{errors.date.message}</span>
          )}
        </label>

        <label className="space-y-1 block md:col-span-2">
          <span className="text-sm font-medium">Description</span>
          <input
            type="text"
            placeholder="e.g. Grocery run at Whole Foods"
            className="input"
            {...register('description')}
          />
          {errors.description && (
            <span className="text-xs text-error-500">{errors.description.message}</span>
          )}
        </label>

        <label className="space-y-1 block">
          <span className="text-sm font-medium">Category</span>
          <select className="select" {...register('categoryId')}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <span className="text-xs text-error-500">{errors.categoryId.message}</span>
          )}
        </label>

        <label className="flex items-center gap-2 mt-6">
          <input type="checkbox" className="checkbox" {...register('isFixed')} />
          <span className="text-sm font-medium">Fixed / recurring expense</span>
        </label>

        {isFixed && (
          <label className="space-y-1 block md:col-span-2">
            <span className="text-sm font-medium">Recurrence</span>
            <select className="select" {...register('recurrence')}>
              <option value="">Select recurrence…</option>
              {recurrenceValues.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
            {errors.recurrence && (
              <span className="text-xs text-error-500">{errors.recurrence.message}</span>
            )}
          </label>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          className="btn preset-tonal-surface"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn preset-filled-primary-500"
          disabled={isSubmitting}
        >
          {initial ? 'Save changes' : 'Add expense'}
        </button>
      </div>
    </form>
  );
}
