'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto card preset-tonal-error p-6 text-center space-y-3">
      <AlertCircle className="h-10 w-10 mx-auto" />
      <h2 className="h3">Something went wrong</h2>
      <p className="text-sm">
        An unexpected error occurred. Try again, or head back to the dashboard.
      </p>
      {error.digest && (
        <p className="text-xs font-mono text-surface-600-400">
          ref: {error.digest}
        </p>
      )}
      <div className="flex gap-2 justify-center pt-2">
        <button
          type="button"
          onClick={reset}
          className="btn preset-filled-primary-500"
        >
          Try again
        </button>
        <a href="/" className="btn preset-tonal-surface">
          Go home
        </a>
      </div>
    </div>
  );
}
