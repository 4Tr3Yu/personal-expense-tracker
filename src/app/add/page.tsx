'use client';

import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Receipt, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6 px-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-icon preset-tonal-surface">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="h3">Add Transaction</h1>
          </div>

          <div className="grid gap-4">
            <Link
              href="/expenses?action=add"
              className="card preset-filled-surface-100-900 p-6 card-hover flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full preset-filled-error-500 flex items-center justify-center">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <h2 className="h4">Add Expense</h2>
                <p className="text-sm text-surface-600-400">Record a new expense or bill</p>
              </div>
            </Link>

            <Link
              href="/income?action=add"
              className="card preset-filled-surface-100-900 p-6 card-hover flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full preset-filled-success-500 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <h2 className="h4">Add Income</h2>
                <p className="text-sm text-surface-600-400">Record salary, payment, or other income</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
