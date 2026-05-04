'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { useAppData } from '@/hooks/use-app-data';
import {
  decodeAppData,
  detectDataConflict,
  mergeAppData,
} from '@/lib/data-encoding';
import type { AppData } from '@/types';

type Strategy = 'replace' | 'merge';

function formatDate(iso: string | Date | null) {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleString();
}

function ImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: localData, isLoading, importData } = useAppData();
  const [done, setDone] = useState<Strategy | null>(null);

  const encoded = searchParams.get('data');

  const incoming = useMemo<AppData | null>(() => {
    if (!encoded) return null;
    return decodeAppData(encoded);
  }, [encoded]);

  if (!encoded) {
    return (
      <div className="card preset-outlined-surface-200-800 border-dashed p-8 text-center">
        <Database className="h-12 w-12 text-surface-600-400 mx-auto mb-3" />
        <h2 className="h4 mb-2">Nothing to import</h2>
        <p className="text-surface-600-400">
          Open this page from a shared link to import data. Visit Settings to
          generate your own shareable link.
        </p>
      </div>
    );
  }

  if (!incoming) {
    return (
      <div className="card preset-tonal-error p-6 text-center space-y-2">
        <XCircle className="h-10 w-10 mx-auto" />
        <h2 className="h4">Couldn&apos;t decode this link</h2>
        <p className="text-sm">
          The shared data is corrupted or in an unsupported format.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-surface-200-800 rounded-lg" />
        <div className="h-48 bg-surface-200-800 rounded-lg" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="card preset-tonal-success p-6 text-center space-y-3">
        <CheckCircle2 className="h-12 w-12 mx-auto" />
        <h2 className="h4">Import complete</h2>
        <p className="text-sm">
          {done === 'replace'
            ? 'Your data has been replaced with the imported data.'
            : 'Imported items have been merged into your existing data.'}
        </p>
        <button
          type="button"
          className="btn preset-filled-primary-500"
          onClick={() => router.push('/')}
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  const conflict = detectDataConflict(localData, incoming);

  const apply = (strategy: Strategy) => {
    if (!localData) {
      importData(incoming);
    } else if (strategy === 'replace') {
      importData(incoming);
    } else {
      importData(mergeAppData(localData, incoming, { strategy: 'merge' }));
    }
    setDone(strategy);
  };

  return (
    <div className="space-y-4">
      <div className="card preset-filled-surface-100-900 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-primary-500" />
          <div>
            <h2 className="h4">Incoming data</h2>
            <p className="text-sm text-surface-600-400">
              Saved {formatDate(incoming.lastModified)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="card preset-tonal-surface p-3">
            <p className="text-xs text-surface-600-400">Expenses</p>
            <p className="text-xl font-bold">{incoming.expenses.length}</p>
          </div>
          <div className="card preset-tonal-surface p-3">
            <p className="text-xs text-surface-600-400">Income</p>
            <p className="text-xl font-bold">{incoming.incomes.length}</p>
          </div>
          <div className="card preset-tonal-surface p-3">
            <p className="text-xs text-surface-600-400">Categories</p>
            <p className="text-xl font-bold">{incoming.categories.length}</p>
          </div>
        </div>
      </div>

      {conflict.hasConflict && (
        <div className="card preset-tonal-warning p-4 flex gap-3">
          {conflict.localIsNewer ? (
            <ShieldAlert className="h-6 w-6 shrink-0" />
          ) : (
            <AlertTriangle className="h-6 w-6 shrink-0" />
          )}
          <div className="text-sm space-y-1">
            <p className="font-semibold">
              {conflict.localIsNewer
                ? 'Your local data is newer than this import.'
                : 'You already have local data.'}
            </p>
            <p>
              Local saved {formatDate(conflict.localDate)} · incoming saved{' '}
              {formatDate(conflict.importDate)}
            </p>
          </div>
        </div>
      )}

      <div className="card preset-filled-surface-100-900 p-4 space-y-3">
        <h3 className="h5">Choose how to import</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="card preset-outlined-surface-200-800 p-4 text-left hover:preset-tonal-surface space-y-1"
            onClick={() => apply('merge')}
          >
            <p className="font-semibold">Merge</p>
            <p className="text-sm text-surface-600-400">
              Add new items from the import without overwriting your existing
              data. Items with matching IDs are kept as local.
            </p>
          </button>
          <button
            type="button"
            className="card preset-outlined-error-500 p-4 text-left hover:preset-tonal-error space-y-1"
            onClick={() => {
              if (
                !conflict.hasConflict ||
                window.confirm(
                  'Replace will overwrite your local data. This cannot be undone. Continue?',
                )
              ) {
                apply('replace');
              }
            }}
          >
            <p className="font-semibold">Replace</p>
            <p className="text-sm text-surface-600-400">
              Discard your local data and use the imported data as-is.
            </p>
          </button>
        </div>
        <button
          type="button"
          className="btn preset-tonal-surface w-full"
          onClick={() => router.push('/')}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ImportPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="h2">Import data</h1>
        <p className="text-surface-600-400">
          Review the incoming data before merging or replacing your local copy
        </p>
      </div>
      <Suspense
        fallback={
          <div className="animate-pulse space-y-3">
            <div className="h-32 bg-surface-200-800 rounded-lg" />
            <div className="h-48 bg-surface-200-800 rounded-lg" />
          </div>
        }
      >
        <ImportContent />
      </Suspense>
    </div>
  );
}
