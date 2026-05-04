'use client';

import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/calculations';
import type { Expense } from '@/types';

interface Props {
  expenses: Expense[];
  year: number;
  month: number;
  weekStartsOn: 0 | 1;
  currency: string;
}

const WEEKDAY_LABELS_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LABELS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function MonthCalendar({
  expenses,
  year,
  month,
  weekStartsOn,
  currency,
}: Props) {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const totalsByDay = new Map<string, number>();
  for (const e of expenses) {
    const key = format(new Date(e.date), 'yyyy-MM-dd');
    totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + e.amount);
  }

  const labels = weekStartsOn === 1 ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN;

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {labels.map((l) => (
          <div
            key={l}
            className="text-center text-xs font-medium text-surface-600-400"
          >
            {l}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const key = format(day, 'yyyy-MM-dd');
          const total = totalsByDay.get(key) ?? 0;
          const today = isToday(day);
          const hasExpenses = total > 0;

          return (
            <div
              key={key}
              className={cn(
                'aspect-square min-h-12 rounded-md p-1 flex flex-col items-start justify-between',
                inMonth ? 'preset-tonal-surface' : 'opacity-30',
                today && 'ring-2 ring-primary-500',
              )}
              title={
                hasExpenses
                  ? `${format(day, 'PP')} — ${formatCurrency(total, currency)}`
                  : format(day, 'PP')
              }
            >
              <span
                className={cn(
                  'text-xs font-medium',
                  today && 'text-primary-500',
                )}
              >
                {format(day, 'd')}
              </span>
              {hasExpenses && (
                <span className="text-[10px] sm:text-xs text-error-500 font-medium leading-tight truncate w-full">
                  {formatCurrency(total, currency)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
