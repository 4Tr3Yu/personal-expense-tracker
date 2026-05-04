import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Accent = 'success' | 'error' | 'default';

const ACCENT_CLASS: Record<Accent, string> = {
  success: 'text-success-500',
  error: 'text-error-500',
  default: '',
};

interface Props {
  label: ReactNode;
  value: ReactNode;
  sublabel?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  accent?: Accent;
  iconAccent?: Accent;
}

export function SummaryCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = 'default',
  iconAccent,
}: Props) {
  return (
    <div className="card preset-filled-surface-100-900 p-4">
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium">{label}</span>
        {Icon && (
          <Icon
            className={cn(
              'h-4 w-4',
              ACCENT_CLASS[iconAccent ?? 'default'] || 'text-surface-600-400',
            )}
          />
        )}
      </div>
      <div className={cn('text-2xl font-bold', ACCENT_CLASS[accent])}>{value}</div>
      {sublabel && <p className="text-xs text-surface-600-400">{sublabel}</p>}
    </div>
  );
}
