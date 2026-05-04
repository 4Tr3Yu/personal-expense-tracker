'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { IncomeForm, type IncomeFormValues } from '@/components/income/income-form';
import { IncomeList } from '@/components/income/income-list';
import { useAppData } from '@/hooks/use-app-data';
import type { Income } from '@/types';

function IncomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data, isLoading, createIncome, editIncome, removeIncome } = useAppData();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setFormOpen(true);
      setEditing(null);
    }
  }, [searchParams]);

  if (isLoading || !data) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-40 bg-surface-200-800 rounded" />
        <div className="h-24 bg-surface-200-800 rounded-lg" />
        <div className="h-24 bg-surface-200-800 rounded-lg" />
      </div>
    );
  }

  const close = () => {
    setFormOpen(false);
    setEditing(null);
    if (searchParams.get('action')) {
      router.replace('/income');
    }
  };

  const handleSubmit = (values: IncomeFormValues) => {
    const payload = {
      amount: values.amount,
      source: values.source,
      date: new Date(values.date).toISOString(),
      isRecurring: values.isRecurring,
      recurrence: values.isRecurring ? values.recurrence : undefined,
    };

    if (editing) {
      editIncome(editing.id, payload);
    } else {
      createIncome(payload);
    }
    close();
  };

  const handleDelete = (income: Income) => {
    const ok = window.confirm(`Delete "${income.source}"? This can't be undone.`);
    if (ok) removeIncome(income.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="h2">Income</h1>
          <p className="text-surface-600-400">
            {data.incomes.length}{' '}
            {data.incomes.length === 1 ? 'entry' : 'entries'} on record
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            className="btn preset-filled-primary-500"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add income</span>
          </button>
        )}
      </div>

      {formOpen && (
        <IncomeForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={close}
        />
      )}

      <IncomeList
        incomes={data.incomes}
        currency={data.settings.currency}
        onEdit={(income) => {
          setEditing(income);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function IncomePage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-40 bg-surface-200-800 rounded" />
          <div className="h-24 bg-surface-200-800 rounded-lg" />
        </div>
      }
    >
      <IncomeContent />
    </Suspense>
  );
}
