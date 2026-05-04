'use client';

import Link from 'next/link';
import { DataShare } from '@/components/shared/data-share';
import { useAppData } from '@/hooks/use-app-data';

export default function SettingsPage() {
  const { data, isLoading } = useAppData();

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

      <section className="card preset-filled-surface-100-900 p-4 space-y-3">
        <div>
          <h2 className="h4">Share &amp; backup</h2>
          <p className="text-sm text-surface-600-400">
            Generate a link to import your data on another device
          </p>
        </div>
        <DataShare data={data} />
      </section>

      <section className="card preset-filled-surface-100-900 p-4 space-y-3">
        <div>
          <h2 className="h4">Restore from a link</h2>
          <p className="text-sm text-surface-600-400">
            Open a shareable link to merge or replace your local data
          </p>
        </div>
        <Link href="/import" className="btn preset-tonal-surface">
          Open import page
        </Link>
      </section>
    </div>
  );
}
