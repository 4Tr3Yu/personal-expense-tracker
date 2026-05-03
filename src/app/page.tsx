'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppData } from '@/hooks/use-app-data';
import { calculateMonthlyBalance, formatCurrency, getWeeklyBreakdown } from '@/lib/calculations';
import { ArrowDownIcon, ArrowUpIcon, WalletIcon, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading } = useAppData();

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </main>
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
      <main className="flex-1 container py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {monthlyBalance.month} {monthlyBalance.year} Overview
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(monthlyBalance.totalIncome, currency)}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(monthlyBalance.totalExpenses, currency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Fixed: {formatCurrency(monthlyBalance.fixedExpenses, currency)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <WalletIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${monthlyBalance.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {formatCurrency(monthlyBalance.balance, currency)}
                </div>
                <p className="text-xs text-muted-foreground">Income - Expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fixed Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(monthlyBalance.fixedExpenses, currency)}
                </div>
                <p className="text-xs text-muted-foreground">Recurring monthly</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Breakdown</CardTitle>
              <CardDescription>Expenses by week this month</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No expenses recorded this month yet
                </p>
              ) : (
                <div className="space-y-4">
                  {weeklyData.map((week) => (
                    <div key={week.weekNumber} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Week {week.weekNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(week.totalExpenses, currency)}</p>
                        <p className="text-sm text-muted-foreground">{week.expenses.length} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {data.expenses.length === 0 && data.incomes.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <WalletIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Get Started</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start tracking your finances by adding your first income or expense.
                </p>
                <div className="flex gap-4">
                  <a href="/income" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Add Income
                  </a>
                  <a href="/expenses" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    Add Expense
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
