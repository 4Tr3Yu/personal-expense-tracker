'use client';

import Link from 'next/link';
import { DataShare } from '@/components/shared/data-share';
import { SectionCard } from '@/components/shared/section-card';
import { CurrencyPicker } from '@/components/settings/currency-picker';
import { useAppData } from '@/hooks/use-app-data';

export default function SettingsPage() {
  const { data, isLoading, changeSettings } = useAppData();

  if (isLoading || !data) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-8 w-32 bg-surface-200-800 rounded" />
        <div className="h-48 bg-surface-200-800 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="h2">Settings</h1>
        <p className="text-surface-600-400">
          Back up, share, or restore your data
        </p>
      </div>

      <SectionCard
        title="Currency"
        subtitle="Used to format every amount across the app"
      >
        <CurrencyPicker
          value={data.settings.currency}
          onChange={(currency) => changeSettings({ currency })}
        />
      </SectionCard>

      <SectionCard
        title="Share & backup"
        subtitle="Generate a link to import your data on another device"
      >
        <DataShare data={data} />
      </SectionCard>

      <SectionCard
        title="Restore from a link"
        subtitle="Open a shareable link to merge or replace your local data"
      >
        <Link href="/import" className="btn preset-tonal-surface">
          Open import page
        </Link>
      </SectionCard>
    </div>
  );
}
