'use client';

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/calculations';
import type { Category, Expense, Income } from '@/types';

interface Props {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  currency: string;
  limit?: number;
}

type Row =
  | { kind: 'expense'; id: string; date: string; label: string; amount: number; categoryId: string }
  | { kind: 'income'; id: string; date: string; label: string; amount: number };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function RecentTransactions({
  expenses,
  incomes,
  categories,
  currency,
  limit = 8,
}: Props) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const rows: Row[] = [
    ...expenses.map<Row>((e) => ({
      kind: 'expense',
      id: e.id,
      date: e.date,
      label: e.description,
      amount: e.amount,
      categoryId: e.categoryId,
    })),
    ...incomes.map<Row>((i) => ({
      kind: 'income',
      id: i.id,
      date: i.date,
      label: i.source,
      amount: i.amount,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);

  if (rows.length === 0) {
    return (
      <p className="text-surface-600-400 text-center py-8">
        No transactions yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-surface-200-800">
      {rows.map((row) => {
        const isExpense = row.kind === 'expense';
        const category = isExpense ? categoryById.get(row.categoryId) : null;
        return (
          <li key={`${row.kind}-${row.id}`} className="flex items-center gap-3 py-3">
            <div
              className={cn(
                'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                isExpense ? 'preset-tonal-error' : 'preset-tonal-success',
              )}
            >
              {isExpense ? (
                <ArrowDownIcon className="h-4 w-4" />
              ) : (
                <ArrowUpIcon className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{row.label}</p>
              <p className="text-xs text-surface-600-400">
                {category ? `${category.name} · ` : ''}
                {formatDate(row.date)}
              </p>
            </div>
            <p
              className={cn(
                'font-bold shrink-0',
                isExpense ? 'text-error-500' : 'text-success-500',
              )}
            >
              {isExpense ? '-' : '+'}
              {formatCurrency(row.amount, currency)}
            </p>
          </li>
        );
      })}
      <li className="pt-3">
        <div className="flex justify-between text-xs text-surface-600-400">
          <Link href="/expenses" className="hover:text-surface-950-50">
            See all expenses →
          </Link>
          <Link href="/income" className="hover:text-surface-950-50">
            See all income →
          </Link>
        </div>
      </li>
    </ul>
  );
}
