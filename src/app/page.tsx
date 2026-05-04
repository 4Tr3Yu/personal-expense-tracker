'use client';

import { useAppData } from '@/hooks/use-app-data';
import {
  calculateMonthlyBalance,
  formatCurrency,
  getExpensesForMonth,
  getWeeklyBreakdown,
} from '@/lib/calculations';
import { ArrowDownIcon, ArrowUpIcon, WalletIcon, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { MonthCalendar } from '@/components/dashboard/month-calendar';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { SectionCard } from '@/components/shared/section-card';
import { SummaryCard } from '@/components/shared/summary-card';

export default function Dashboard() {
  const { data, isLoading } = useAppData();

  if (isLoading || !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-surface-200-800 rounded w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-200-800 rounded-lg" />
          ))}
        </div>
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
    currentMonth,
  );

  const weeklyData = getWeeklyBreakdown(
    data.expenses,
    currentYear,
    currentMonth,
    data.settings.weekStartsOn,
  );

  const monthExpenses = getExpensesForMonth(data.expenses, currentYear, currentMonth);
  const currency = data.settings.currency;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h2">Dashboard</h1>
        <p className="text-surface-600-400">
          {monthlyBalance.month} {monthlyBalance.year} overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total income"
          icon={ArrowUpIcon}
          iconAccent="success"
          accent="success"
          value={formatCurrency(monthlyBalance.totalIncome, currency)}
          sublabel="This month"
        />
        <SummaryCard
          label="Total expenses"
          icon={ArrowDownIcon}
          iconAccent="error"
          accent="error"
          value={formatCurrency(monthlyBalance.totalExpenses, currency)}
          sublabel={`Fixed: ${formatCurrency(monthlyBalance.fixedExpenses, currency)}`}
        />
        <SummaryCard
          label="Balance"
          icon={WalletIcon}
          accent={monthlyBalance.balance >= 0 ? 'success' : 'error'}
          value={formatCurrency(monthlyBalance.balance, currency)}
          sublabel="Income − expenses"
        />
        <SummaryCard
          label="Fixed expenses"
          icon={TrendingUp}
          value={formatCurrency(monthlyBalance.fixedExpenses, currency)}
          sublabel="Recurring monthly"
        />
      </div>

      <SectionCard
        title={`${monthlyBalance.month} at a glance`}
        subtitle="Daily expense totals for the current month"
      >
        <MonthCalendar
          expenses={monthExpenses}
          year={currentYear}
          month={currentMonth}
          weekStartsOn={data.settings.weekStartsOn}
          currency={currency}
        />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Weekly breakdown" subtitle="Expenses by week this month">
          {weeklyData.length === 0 ? (
            <p className="text-surface-600-400 text-center py-8">
              No expenses recorded this month yet
            </p>
          ) : (
            <div className="space-y-3">
              {weeklyData.map((week) => (
                <div
                  key={week.weekNumber}
                  className="flex items-center justify-between p-3 rounded-lg preset-tonal-surface"
                >
                  <div>
                    <p className="font-medium">Week {week.weekNumber}</p>
                    <p className="text-sm text-surface-600-400">
                      {new Date(week.startDate).toLocaleDateString()} −{' '}
                      {new Date(week.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(week.totalExpenses, currency)}
                    </p>
                    <p className="text-sm text-surface-600-400">
                      {week.expenses.length} transactions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent transactions" subtitle="Latest expenses and income">
          <RecentTransactions
            expenses={data.expenses}
            incomes={data.incomes}
            categories={data.categories}
            currency={currency}
          />
        </SectionCard>
      </div>

      {data.expenses.length === 0 && data.incomes.length === 0 && (
        <div className="card preset-outlined-surface-200-800 border-dashed p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <WalletIcon className="h-12 w-12 text-surface-600-400 mb-4" />
            <h2 className="h4 mb-2">Get started</h2>
            <p className="text-surface-600-400 mb-6">
              Start tracking your finances by adding your first income or expense.
            </p>
            <div className="flex gap-4">
              <Link href="/income" className="btn preset-filled-primary-500">
                Add income
              </Link>
              <Link href="/expenses" className="btn preset-outlined-surface-200-800">
                Add expense
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
