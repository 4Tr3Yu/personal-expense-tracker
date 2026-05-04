import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}

export function StatTile({ label, value, className }: Props) {
  return (
    <div className={cn('card preset-tonal-surface p-3', className)}>
      <p className="text-xs text-surface-600-400">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
