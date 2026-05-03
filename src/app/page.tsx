'use client';

import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAppData } from '@/hooks/use-app-data';
import { calculateMonthlyBalance, formatCurrency, getWeeklyBreakdown } from '@/lib/calculations';
import { ArrowDownIcon, ArrowUpIcon, WalletIcon, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { data, isLoading } = useAppData();

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-6 px-4 pb-24">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface-200-800 rounded w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-surface-200-800 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthlyBalance = calculateMonthlyBalance(
    data.expenses,
    data.incomes,
    currentYear,
    currentMonth
  );

  const weeklyData = getWeeklyBreakdown(
    data.expenses,
    currentYear,
    currentMonth,
    data.settings.weekStartsOn
  );

  const currency = data.settings.currency;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-6 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="h2">Dashboard</h1>
            <p className="text-surface-600-400">
              {monthlyBalance.month} {monthlyBalance.year} Overview
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Income */}
            <div className="card preset-filled-surface-100-900 p-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium">Total Income</span>
                <ArrowUpIcon className="h-4 w-4 text-success-500" />
              </div>
              <div className="text-2xl font-bold text-success-500">
                {formatCurrency(monthlyBalance.totalIncome, currency)}
              </div>
              <p className="text-xs text-surface-600-400">This month</p>
            </div>

            {/* Total Expenses */}
            <div className="card preset-filled-surface-100-900 p-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium">Total Expenses</span>
                <ArrowDownIcon className="h-4 w-4 text-error-500" />
              </div>
              <div className="text-2xl font-bold text-error-500">
                {formatCurrency(monthlyBalance.totalExpenses, currency)}
              </div>
              <p className="text-xs text-surface-600-400">
                Fixed: {formatCurrency(monthlyBalance.fixedExpenses, currency)}
              </p>
            </div>

            {/* Balance */}
            <div className="card preset-filled-surface-100-900 p-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium">Balance</span>
                <WalletIcon className="h-4 w-4 text-surface-600-400" />
              </div>
              <div className={`text-2xl font-bold ${monthlyBalance.balance >= 0 ? "text-success-500" : "text-error-500"}`}>
                {formatCurrency(monthlyBalance.balance, currency)}
              </div>
              <p className="text-xs text-surface-600-400">Income - Expenses</p>
            </div>

            {/* Fixed Expenses */}
            <div className="card preset-filled-surface-100-900 p-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium">Fixed Expenses</span>
                <TrendingUp className="h-4 w-4 text-surface-600-400" />
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(monthlyBalance.fixedExpenses, currency)}
              </div>
              <p className="text-xs text-surface-600-400">Recurring monthly</p>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <div className="card preset-filled-surface-100-900 p-4">
            <div className="pb-4">
              <h2 className="h4">Weekly Breakdown</h2>
              <p className="text-sm text-surface-600-400">Expenses by week this month</p>
            </div>
            {weeklyData.length === 0 ? (
              <p className="text-surface-600-400 text-center py-8">
                No expenses recorded this month yet
              </p>
            ) : (
              <div className="space-y-3">
                {weeklyData.map((week) => (
                  <div key={week.weekNumber} className="flex items-center justify-between p-3 rounded-lg preset-tonal-surface">
                    <div>
                      <p className="font-medium">Week {week.weekNumber}</p>
                      <p className="text-sm text-surface-600-400">
                        {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(week.totalExpenses, currency)}</p>
                      <p className="text-sm text-surface-600-400">{week.expenses.length} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Get Started Card */}
          {data.expenses.length === 0 && data.incomes.length === 0 && (
            <div className="card preset-outlined-surface-200-800 border-dashed p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <WalletIcon className="h-12 w-12 text-surface-600-400 mb-4" />
                <h3 className="h4 mb-2">Get Started</h3>
                <p className="text-surface-600-400 mb-6">
                  Start tracking your finances by adding your first income or expense.
                </p>
                <div className="flex gap-4">
                  <Link href="/income" className="btn preset-filled-primary-500">
                    Add Income
                  </Link>
                  <Link href="/expenses" className="btn preset-outlined-surface-200-800">
                    Add Expense
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
