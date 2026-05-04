'use client';

import { FixedForecast } from '@/components/projections/fixed-forecast';
import { TrendChart } from '@/components/projections/trend-chart';
import { SectionCard } from '@/components/shared/section-card';
import { useAppData } from '@/hooks/use-app-data';

export default function ProjectionsPage() {
  const { data, isLoading } = useAppData();

  if (isLoading || !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-surface-200-800 rounded" />
        <div className="h-48 bg-surface-200-800 rounded-lg" />
        <div className="h-64 bg-surface-200-800 rounded-lg" />
      </div>
    );
  }

  const currency = data.settings.currency;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h2">Projections</h1>
        <p className="text-surface-600-400">
          Forecast your fixed costs and watch your spending trend
        </p>
      </div>

      <SectionCard
        title="Fixed expenses forecast"
        subtitle="Recurring monthly expenses projected forward"
      >
        <FixedForecast expenses={data.expenses} currency={currency} />
      </SectionCard>

      <SectionCard
        title="Spending trend"
        subtitle="Total expenses by month over the past 6 months"
      >
        <TrendChart expenses={data.expenses} currency={currency} />
      </SectionCard>
    </div>
  );
}
