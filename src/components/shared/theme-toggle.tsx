'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'pet-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

const ORDER: Theme[] = ['dark', 'light', 'system'];

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_KEY) as Theme | null) ?? 'dark';
    setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  const Icon = theme === 'light' ? Sun : theme === 'system' ? Monitor : Moon;
  const label =
    theme === 'light'
      ? 'Light theme'
      : theme === 'system'
        ? 'System theme'
        : 'Dark theme';

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Switch theme (currently ${label})`}
      title={label}
      suppressHydrationWarning
      className={cn(
        'btn btn-icon preset-tonal-surface',
        !mounted && 'opacity-0',
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
