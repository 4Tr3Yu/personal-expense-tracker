'use client';

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  calculateSpendingTrend,
  formatCurrency,
  getMonthlyExpenseHistory,
} from '@/lib/calculations';
import type { Expense } from '@/types';

interface Props {
  expenses: Expense[];
  currency: string;
  months?: number;
}

const W = 600;
const H = 220;
const PAD_L = 56;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 32;

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / exp;
  let m: number;
  if (n <= 1) m = 1;
  else if (n <= 2) m = 2;
  else if (n <= 5) m = 5;
  else m = 10;
  return m * exp;
}

export function TrendChart({ expenses, currency, months = 6 }: Props) {
  const history = getMonthlyExpenseHistory(expenses, months);
  const trend = calculateSpendingTrend(expenses, months);

  const maxValue = niceCeil(Math.max(...history.map((m) => m.total), 0));

  if (maxValue === 0) {
    return (
      <div className="card preset-outlined-surface-200-800 border-dashed p-8 text-center">
        <p className="text-surface-600-400">
          No expense history yet. Add some expenses to see your spending trend.
        </p>
      </div>
    );
  }

  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const slot = innerW / history.length;
  const barWidth = slot * 0.6;
  const avgY = PAD_T + innerH * (1 - trend.average / maxValue);

  const TrendIcon =
    trend.trend === 'increasing'
      ? ArrowUpRight
      : trend.trend === 'decreasing'
        ? ArrowDownRight
        : Minus;

  const trendColor =
    trend.trend === 'increasing'
      ? 'text-error-500'
      : trend.trend === 'decreasing'
        ? 'text-success-500'
        : 'text-surface-600-400';

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card preset-tonal-surface p-3">
          <p className="text-xs text-surface-600-400">Avg / month</p>
          <p className="text-xl font-bold">{formatCurrency(trend.average, currency)}</p>
        </div>
        <div className="card preset-tonal-surface p-3">
          <p className="text-xs text-surface-600-400">Trend</p>
          <p className={cn('text-xl font-bold capitalize flex items-center gap-1', trendColor)}>
            <TrendIcon className="h-5 w-5" />
            {trend.trend}
          </p>
        </div>
        <div className="card preset-tonal-surface p-3">
          <p className="text-xs text-surface-600-400">vs. {months} months ago</p>
          <p className={cn('text-xl font-bold', trendColor)}>
            {trend.percentChange >= 0 ? '+' : ''}
            {trend.percentChange.toFixed(1)}%
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Monthly expenses chart"
        className="w-full h-auto text-error-500"
      >
        {/* Y-axis gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD_T + innerH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y}
                y2={y}
                className="stroke-surface-200-800"
                strokeDasharray="2 4"
              />
              <text
                x={PAD_L - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-surface-600-400 text-[10px]"
              >
                {formatCurrency(maxValue * t, currency)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {history.map((m, i) => {
          const barH = innerH * (m.total / maxValue);
          const x = PAD_L + slot * i + (slot - barWidth) / 2;
          const y = PAD_T + innerH - barH;
          return (
            <g key={`${m.year}-${m.month}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={4}
                fill="currentColor"
              />
              <text
                x={x + barWidth / 2}
                y={H - PAD_B + 16}
                textAnchor="middle"
                className="fill-surface-600-400 text-[11px]"
              >
                {m.label}
              </text>
            </g>
          );
        })}

        {/* Average line */}
        {trend.average > 0 && (
          <g>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={avgY}
              y2={avgY}
              className="stroke-primary-500"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <text
              x={W - PAD_R}
              y={avgY - 4}
              textAnchor="end"
              className="fill-primary-500 text-[10px] font-medium"
            >
              avg
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
