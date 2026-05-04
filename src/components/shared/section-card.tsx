import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SectionCard({ title, subtitle, action, className, children }: Props) {
  return (
    <section className={cn('card preset-filled-surface-100-900 p-4 space-y-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="h4">{title}</h2>
          {subtitle && <p className="text-sm text-surface-600-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
