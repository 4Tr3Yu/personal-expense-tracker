'use client';

import { Pencil, Trash2, Repeat } from 'lucide-react';
import type { Category, Expense } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface Props {
  expenses: Expense[];
  categories: Category[];
  currency: string;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ExpenseList({
  expenses,
  categories,
  currency,
  onEdit,
  onDelete,
}: Props) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  if (expenses.length === 0) {
    return (
      <div className="card preset-outlined-surface-200-800 border-dashed p-8 text-center">
        <p className="text-surface-600-400">No expenses yet. Add your first one above.</p>
      </div>
    );
  }

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((expense) => {
        const category = categoryById.get(expense.categoryId);
        return (
          <div
            key={expense.id}
            className="card preset-filled-surface-100-900 p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium truncate">{expense.description}</p>
                {expense.isFixed && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full preset-tonal-primary"
                    title={expense.recurrence ?? 'fixed'}
                  >
                    <Repeat className="h-3 w-3" />
                    {expense.recurrence ?? 'fixed'}
                  </span>
                )}
              </div>
              <p className="text-sm text-surface-600-400">
                {category?.name ?? 'Uncategorized'} · {formatDate(expense.date)}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="font-bold text-error-500">
                {formatCurrency(expense.amount, currency)}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                aria-label="Edit expense"
                className="btn btn-icon preset-tonal-surface"
                onClick={() => onEdit(expense)}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Delete expense"
                className="btn btn-icon preset-tonal-error"
                onClick={() => onDelete(expense)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
