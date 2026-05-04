import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto card preset-tonal-surface p-6 text-center space-y-3">
      <Compass className="h-10 w-10 mx-auto text-primary-500" />
      <h2 className="h3">Page not found</h2>
      <p className="text-sm text-surface-600-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="btn preset-filled-primary-500 inline-flex">
        Back to dashboard
      </Link>
    </div>
  );
}
