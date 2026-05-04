'use client';

import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { FixedForecast } from '@/components/projections/fixed-forecast';
import { TrendChart } from '@/components/projections/trend-chart';
import { useAppData } from '@/hooks/use-app-data';

export default function ProjectionsPage() {
  const { data, isLoading } = useAppData();

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-6 px-4 pb-24">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-surface-200-800 rounded" />
            <div className="h-48 bg-surface-200-800 rounded-lg" />
            <div className="h-64 bg-surface-200-800 rounded-lg" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const currency = data.settings.currency;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6 px-4 pb-24">
        <div className="space-y-6">
          <div>
            <h1 className="h2">Projections</h1>
            <p className="text-surface-600-400">
              Forecast your fixed costs and watch your spending trend
            </p>
          </div>

          <section className="card preset-filled-surface-100-900 p-4 space-y-4">
            <div>
              <h2 className="h4">Fixed expenses forecast</h2>
              <p className="text-sm text-surface-600-400">
                Recurring monthly expenses projected forward
              </p>
            </div>
            <FixedForecast expenses={data.expenses} currency={currency} />
          </section>

          <section className="card preset-filled-surface-100-900 p-4 space-y-4">
            <div>
              <h2 className="h4">Spending trend</h2>
              <p className="text-sm text-surface-600-400">
                Total expenses by month over the past 6 months
              </p>
            </div>
            <TrendChart expenses={data.expenses} currency={currency} />
          </section>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
