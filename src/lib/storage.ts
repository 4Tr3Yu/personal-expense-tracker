import { AppData, Category, Expense, Income, UserSettings } from '@/types';

const STORAGE_KEY = 'pet-app-data';
const APP_VERSION = '1.0.0';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'housing', name: 'Housing', icon: 'Home', color: '#6366f1', isDefault: true },
  { id: 'utilities', name: 'Utilities', icon: 'Zap', color: '#f59e0b', isDefault: true },
  { id: 'food', name: 'Food & Groceries', icon: 'ShoppingCart', color: '#22c55e', isDefault: true },
  { id: 'transportation', name: 'Transportation', icon: 'Car', color: '#3b82f6', isDefault: true },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: '#ef4444', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: '#a855f7', isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', isDefault: true },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'CreditCard', color: '#14b8a6', isDefault: true },
  { id: 'insurance', name: 'Insurance', icon: 'Shield', color: '#64748b', isDefault: true },
  { id: 'savings', name: 'Savings', icon: 'PiggyBank', color: '#84cc16', isDefault: true },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#94a3b8', isDefault: true },
];

export const DEFAULT_SETTINGS: UserSettings = {
  currency: 'CLP',
  theme: 'dark',
  weekStartsOn: 0,
  defaultCategories: DEFAULT_CATEGORIES.map(c => c.id),
};

export function getDefaultAppData(): AppData {
  return {
    version: APP_VERSION,
    lastModified: new Date().toISOString(),
    categories: [...DEFAULT_CATEGORIES],
    expenses: [],
    incomes: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function loadAppData(): AppData {
  if (typeof window === 'undefined') {
    return getDefaultAppData();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const defaultData = getDefaultAppData();
      saveAppData(defaultData);
      return defaultData;
    }
    return JSON.parse(stored) as AppData;
  } catch {
    return getDefaultAppData();
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') return;

  const updatedData = {
    ...data,
    lastModified: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Expense operations
export function addExpense(data: AppData, expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newExpense: Expense = {
    ...expense,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...data,
    expenses: [...data.expenses, newExpense],
  };
}

export function updateExpense(data: AppData, id: string, updates: Partial<Expense>): AppData {
  return {
    ...data,
    expenses: data.expenses.map(e =>
      e.id === id
        ? { ...e, ...updates, updatedAt: new Date().toISOString() }
        : e
    ),
  };
}

export function deleteExpense(data: AppData, id: string): AppData {
  return {
    ...data,
    expenses: data.expenses.filter(e => e.id !== id),
  };
}

// Income operations
export function addIncome(data: AppData, income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newIncome: Income = {
    ...income,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...data,
    incomes: [...data.incomes, newIncome],
  };
}

export function updateIncome(data: AppData, id: string, updates: Partial<Income>): AppData {
  return {
    ...data,
    incomes: data.incomes.map(i =>
      i.id === id
        ? { ...i, ...updates, updatedAt: new Date().toISOString() }
        : i
    ),
  };
}

export function deleteIncome(data: AppData, id: string): AppData {
  return {
    ...data,
    incomes: data.incomes.filter(i => i.id !== id),
  };
}

// Category operations
export function addCategory(data: AppData, category: Omit<Category, 'id' | 'isDefault'>): AppData {
  const newCategory: Category = {
    ...category,
    id: generateId(),
    isDefault: false,
  };

  return {
    ...data,
    categories: [...data.categories, newCategory],
  };
}

export function updateCategory(data: AppData, id: string, updates: Partial<Category>): AppData {
  return {
    ...data,
    categories: data.categories.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ),
  };
}

export function deleteCategory(data: AppData, id: string): AppData {
  // Don't delete default categories
  const category = data.categories.find(c => c.id === id);
  if (category?.isDefault) return data;

  return {
    ...data,
    categories: data.categories.filter(c => c.id !== id),
    // Move expenses with this category to 'other'
    expenses: data.expenses.map(e =>
      e.categoryId === id ? { ...e, categoryId: 'other' } : e
    ),
  };
}

// Settings operations
export function updateSettings(data: AppData, settings: Partial<UserSettings>): AppData {
  return {
    ...data,
    settings: { ...data.settings, ...settings },
  };
}
