'use client';

import { TrendingUp } from 'lucide-react';
import { calculateFixedExpensesForecast, formatCurrency } from '@/lib/calculations';
import type { Expense } from '@/types';

interface Props {
  expenses: Expense[];
  currency: string;
  monthsAhead?: number;
}

export function FixedForecast({ expenses, currency, monthsAhead = 6 }: Props) {
  const forecast = calculateFixedExpensesForecast(expenses, monthsAhead);
  const monthlyFixed = forecast[0]?.projectedExpenses ?? 0;
  const total = forecast.reduce((sum, m) => sum + m.projectedExpenses, 0);

  if (monthlyFixed === 0) {
    return (
      <div className="card preset-outlined-surface-200-800 border-dashed p-8 text-center">
        <TrendingUp className="h-10 w-10 text-surface-600-400 mx-auto mb-3" />
        <p className="text-surface-600-400">
          No recurring monthly expenses on record. Mark an expense as fixed
          (monthly) to see it forecast here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card preset-tonal-surface p-3">
          <p className="text-xs text-surface-600-400">Monthly fixed</p>
          <p className="text-xl font-bold">{formatCurrency(monthlyFixed, currency)}</p>
        </div>
        <div className="card preset-tonal-surface p-3">
          <p className="text-xs text-surface-600-400">Next {monthsAhead} months</p>
          <p className="text-xl font-bold">{formatCurrency(total, currency)}</p>
        </div>
        <div className="card preset-tonal-surface p-3">
          <p className="text-xs text-surface-600-400">Annualized</p>
          <p className="text-xl font-bold">{formatCurrency(monthlyFixed * 12, currency)}</p>
        </div>
      </div>

      <ul className="divide-y divide-surface-200-800">
        {forecast.map((m) => (
          <li
            key={`${m.year}-${m.month}`}
            className="flex items-center justify-between py-3"
          >
            <div>
              <p className="font-medium">
                {m.month} {m.year}
              </p>
              <p className="text-xs text-surface-600-400">Projected fixed expenses</p>
            </div>
            <p className="font-bold">{formatCurrency(m.projectedExpenses, currency)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
