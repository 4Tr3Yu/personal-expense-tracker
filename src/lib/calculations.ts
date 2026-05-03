import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  format,
  addMonths,
  getWeek,
  eachWeekOfInterval,
} from 'date-fns';
import { Expense, Income, MonthlyBalance, WeeklyBreakdown } from '@/types';

export function getExpensesForMonth(expenses: Expense[], year: number, month: number): Expense[] {
  const date = new Date(year, month);
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return isWithinInterval(expenseDate, { start, end });
  });
}

export function getIncomesForMonth(incomes: Income[], year: number, month: number): Income[] {
  const date = new Date(year, month);
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return incomes.filter(income => {
    const incomeDate = new Date(income.date);
    return isWithinInterval(incomeDate, { start, end });
  });
}

export function calculateMonthlyBalance(
  expenses: Expense[],
  incomes: Income[],
  year: number,
  month: number
): MonthlyBalance {
  const monthlyExpenses = getExpensesForMonth(expenses, year, month);
  const monthlyIncomes = getIncomesForMonth(incomes, year, month);

  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const fixedExpenses = monthlyExpenses
    .filter(e => e.isFixed)
    .reduce((sum, e) => sum + e.amount, 0);
  const variableExpenses = totalExpenses - fixedExpenses;
  const totalIncome = monthlyIncomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalExpenses;

  return {
    month: format(new Date(year, month), 'MMMM'),
    year,
    totalIncome,
    totalExpenses,
    fixedExpenses,
    variableExpenses,
    balance,
  };
}

export function getWeeklyBreakdown(
  expenses: Expense[],
  year: number,
  month: number,
  weekStartsOn: 0 | 1 = 0
): WeeklyBreakdown[] {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn }
  );

  return weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn });
    const effectiveEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
    const effectiveStart = weekStart < monthStart ? monthStart : weekStart;

    const weekExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start: effectiveStart, end: effectiveEnd });
    });

    return {
      weekNumber: index + 1,
      startDate: effectiveStart.toISOString(),
      endDate: effectiveEnd.toISOString(),
      expenses: weekExpenses,
      totalExpenses: weekExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  });
}

export function calculateFixedExpensesForecast(
  expenses: Expense[],
  monthsAhead: number = 6
): Array<{ month: string; year: number; projectedExpenses: number }> {
  const fixedExpenses = expenses.filter(e => e.isFixed && e.recurrence === 'monthly');
  const monthlyFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);

  const forecast: Array<{ month: string; year: number; projectedExpenses: number }> = [];
  const today = new Date();

  for (let i = 1; i <= monthsAhead; i++) {
    const futureDate = addMonths(today, i);
    forecast.push({
      month: format(futureDate, 'MMMM'),
      year: futureDate.getFullYear(),
      projectedExpenses: monthlyFixed,
    });
  }

  return forecast;
}

export function calculateSpendingTrend(
  expenses: Expense[],
  monthsToAnalyze: number = 3
): { average: number; trend: 'increasing' | 'decreasing' | 'stable'; percentChange: number } {
  const today = new Date();
  const monthlyTotals: number[] = [];

  for (let i = 0; i < monthsToAnalyze; i++) {
    const targetDate = addMonths(today, -i);
    const monthExpenses = getExpensesForMonth(
      expenses,
      targetDate.getFullYear(),
      targetDate.getMonth()
    );
    monthlyTotals.push(monthExpenses.reduce((sum, e) => sum + e.amount, 0));
  }

  const average = monthlyTotals.reduce((sum, t) => sum + t, 0) / monthlyTotals.length;

  if (monthlyTotals.length < 2) {
    return { average, trend: 'stable', percentChange: 0 };
  }

  // Compare most recent to oldest
  const recent = monthlyTotals[0];
  const older = monthlyTotals[monthlyTotals.length - 1];

  if (older === 0) {
    return { average, trend: 'stable', percentChange: 0 };
  }

  const percentChange = ((recent - older) / older) * 100;

  let trend: 'increasing' | 'decreasing' | 'stable';
  if (percentChange > 5) {
    trend = 'increasing';
  } else if (percentChange < -5) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }

  return { average, trend, percentChange };
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getCategoryTotals(
  expenses: Expense[],
  year: number,
  month: number
): Array<{ categoryId: string; total: number; percentage: number }> {
  const monthlyExpenses = getExpensesForMonth(expenses, year, month);
  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryMap = new Map<string, number>();

  monthlyExpenses.forEach(expense => {
    const current = categoryMap.get(expense.categoryId) || 0;
    categoryMap.set(expense.categoryId, current + expense.amount);
  });

  return Array.from(categoryMap.entries())
    .map(([categoryId, total]) => ({
      categoryId,
      total,
      percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
