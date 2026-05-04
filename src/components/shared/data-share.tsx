'use client';

import { useEffect, useState } from 'react';
import { Copy, Download, Link as LinkIcon } from 'lucide-react';
import { encodeAppData, generateShareableUrl } from '@/lib/data-encoding';
import type { AppData } from '@/types';

interface Props {
  data: AppData;
}

export function DataShare({ data }: Props) {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // window.location is unavailable during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const url = origin ? generateShareableUrl(data, origin) : '';

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadEncoded = () => {
    const encoded = encodeAppData(data);
    const blob = new Blob([encoded], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pet-share-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const summary =
    `${data.expenses.length} expenses · ${data.incomes.length} income entries · ${data.categories.length} categories`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-surface-600-400">{summary}</p>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Shareable link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={url}
            className="input flex-1 font-mono text-xs"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            onClick={copy}
            className="btn preset-filled-primary-500 shrink-0"
            disabled={!url}
            aria-label={copied ? 'Copied to clipboard' : 'Copy shareable link'}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
        </div>
        <p className="text-xs text-surface-600-400">
          Anyone with this link can import your data. Keep it private.
        </p>
        <p role="status" aria-live="polite" className="sr-only">
          {copied ? 'Link copied to clipboard' : ''}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={downloadJson}
          className="btn preset-tonal-surface"
        >
          <Download className="h-4 w-4" />
          Download JSON
        </button>
        <button
          type="button"
          onClick={downloadEncoded}
          className="btn preset-tonal-surface"
        >
          <Download className="h-4 w-4" />
          Download encoded share
        </button>
      </div>
    </div>
  );
}
