'use client';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/calculations';

const OPTIONS = [
  { code: 'CLP', label: 'Chilean peso (CLP)' },
  { code: 'USD', label: 'US dollar (USD)' },
] as const;

interface Props {
  value: string;
  onChange: (currency: string) => void;
}

export function CurrencyPicker({ value, onChange }: Props) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Currency</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const active = value === opt.code;
          return (
            <label
              key={opt.code}
              className={cn(
                'card p-4 cursor-pointer transition-colors flex items-start justify-between gap-3',
                active
                  ? 'preset-filled-primary-500'
                  : 'preset-tonal-surface hover:preset-filled-surface-100-900',
              )}
            >
              <div>
                <p className="font-semibold">{opt.label}</p>
                <p className="text-sm opacity-80">
                  e.g. {formatCurrency(1234.5, opt.code)}
                </p>
              </div>
              <input
                type="radio"
                name="currency"
                value={opt.code}
                checked={active}
                onChange={() => onChange(opt.code)}
                className="radio mt-1"
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
