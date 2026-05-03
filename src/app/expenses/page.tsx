'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ExpenseForm, type ExpenseFormValues } from '@/components/expenses/expense-form';
import { ExpenseList } from '@/components/expenses/expense-list';
import { useAppData } from '@/hooks/use-app-data';
import type { Expense } from '@/types';

function ExpensesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data, isLoading, createExpense, editExpense, removeExpense } = useAppData();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

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
      router.replace('/expenses');
    }
  };

  const handleSubmit = (values: ExpenseFormValues) => {
    const payload = {
      amount: values.amount,
      description: values.description,
      categoryId: values.categoryId,
      date: new Date(values.date).toISOString(),
      isFixed: values.isFixed,
      recurrence: values.isFixed ? values.recurrence : undefined,
    };

    if (editing) {
      editExpense(editing.id, payload);
    } else {
      createExpense(payload);
    }
    close();
  };

  const handleDelete = (expense: Expense) => {
    const ok = window.confirm(`Delete "${expense.description}"? This can't be undone.`);
    if (ok) removeExpense(expense.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="h2">Expenses</h1>
          <p className="text-surface-600-400">
            {data.expenses.length}{' '}
            {data.expenses.length === 1 ? 'expense' : 'expenses'} on record
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
            <span className="hidden sm:inline">Add expense</span>
          </button>
        )}
      </div>

      {formOpen && (
        <ExpenseForm
          categories={data.categories}
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={close}
        />
      )}

      <ExpenseList
        expenses={data.expenses}
        categories={data.categories}
        currency={data.settings.currency}
        onEdit={(expense) => {
          setEditing(expense);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6 px-4 pb-24">
        <Suspense
          fallback={
            <div className="animate-pulse space-y-3">
              <div className="h-8 w-40 bg-surface-200-800 rounded" />
              <div className="h-24 bg-surface-200-800 rounded-lg" />
            </div>
          }
        >
          <ExpensesContent />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
