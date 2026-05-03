'use client';

import { Pencil, Trash2, Repeat } from 'lucide-react';
import type { Income } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface Props {
  incomes: Income[];
  currency: string;
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function IncomeList({ incomes, currency, onEdit, onDelete }: Props) {
  if (incomes.length === 0) {
    return (
      <div className="card preset-outlined-surface-200-800 border-dashed p-8 text-center">
        <p className="text-surface-600-400">No income yet. Add your first one above.</p>
      </div>
    );
  }

  const sorted = [...incomes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((income) => (
        <div
          key={income.id}
          className="card preset-filled-surface-100-900 p-4 flex items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium truncate">{income.source}</p>
              {income.isRecurring && (
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full preset-tonal-success"
                  title={income.recurrence ?? 'recurring'}
                >
                  <Repeat className="h-3 w-3" />
                  {income.recurrence ?? 'recurring'}
                </span>
              )}
            </div>
            <p className="text-sm text-surface-600-400">{formatDate(income.date)}</p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-bold text-success-500">
              {formatCurrency(income.amount, currency)}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-label="Edit income"
              className="btn btn-icon preset-tonal-surface"
              onClick={() => onEdit(income)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Delete income"
              className="btn btn-icon preset-tonal-error"
              onClick={() => onDelete(income)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
