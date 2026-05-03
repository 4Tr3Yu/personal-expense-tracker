'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import type { Income } from '@/types';

const recurrenceValues = ['monthly', 'weekly', 'yearly'] as const;

const schema = z
  .object({
    amount: z.number({ error: 'Amount is required' }).positive('Amount must be greater than 0'),
    source: z.string().trim().min(1, 'Source is required'),
    date: z.string().min(1, 'Date is required'),
    isRecurring: z.boolean(),
    recurrence: z.enum(recurrenceValues).optional(),
  })
  .refine((v) => !v.isRecurring || !!v.recurrence, {
    path: ['recurrence'],
    message: 'Recurrence is required for recurring income',
  });

export type IncomeFormValues = z.infer<typeof schema>;

interface Props {
  initial?: Income;
  onSubmit: (values: IncomeFormValues) => void;
  onCancel: () => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function IncomeForm({ initial, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          amount: initial.amount,
          source: initial.source,
          date: initial.date.slice(0, 10),
          isRecurring: initial.isRecurring,
          recurrence: initial.recurrence,
        }
      : {
          amount: 0,
          source: '',
          date: todayISO(),
          isRecurring: false,
          recurrence: undefined,
        },
  });

  useEffect(() => {
    if (initial) {
      reset({
        amount: initial.amount,
        source: initial.source,
        date: initial.date.slice(0, 10),
        isRecurring: initial.isRecurring,
        recurrence: initial.recurrence,
      });
    }
  }, [initial, reset]);

  const isRecurring = watch('isRecurring');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="card preset-filled-surface-100-900 p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="h4">{initial ? 'Edit income' : 'New income'}</h2>
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
          <span className="text-sm font-medium">Source</span>
          <input
            type="text"
            placeholder="e.g. Salary, Freelance, Dividend"
            className="input"
            {...register('source')}
          />
          {errors.source && (
            <span className="text-xs text-error-500">{errors.source.message}</span>
          )}
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox"
            {...register('isRecurring')}
          />
          <span className="text-sm font-medium">Recurring income</span>
        </label>

        {isRecurring && (
          <label className="space-y-1 block">
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
          {initial ? 'Save changes' : 'Add income'}
        </button>
      </div>
    </form>
  );
}
