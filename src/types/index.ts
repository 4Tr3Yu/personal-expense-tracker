export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  isFixed: boolean;
  recurrence?: 'monthly' | 'weekly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  isRecurring: boolean;
  recurrence?: 'monthly' | 'weekly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  currency: string;
  theme: 'dark' | 'light' | 'system';
  weekStartsOn: 0 | 1;
  defaultCategories: string[];
}

export interface AppData {
  version: string;
  lastModified: string;
  categories: Category[];
  expenses: Expense[];
  incomes: Income[];
  settings: UserSettings;
}

export type TransactionType = 'expense' | 'income';

export interface MonthlyBalance {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  balance: number;
}

export interface WeeklyBreakdown {
  weekNumber: number;
  startDate: string;
  endDate: string;
  expenses: Expense[];
  totalExpenses: number;
}
