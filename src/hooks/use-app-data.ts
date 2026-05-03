'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppData, Category, Expense, Income, UserSettings } from '@/types';
import {
  loadAppData,
  saveAppData,
  addExpense,
  updateExpense,
  deleteExpense,
  addIncome,
  updateIncome,
  deleteIncome,
  addCategory,
  updateCategory,
  deleteCategory,
  updateSettings,
} from '@/lib/storage';

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadAppData();
    setData(loaded);
    setIsLoading(false);
  }, []);

  const save = useCallback((newData: AppData) => {
    saveAppData(newData);
    setData(newData);
  }, []);

  // Expense operations
  const createExpense = useCallback(
    (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!data) return;
      const updated = addExpense(data, expense);
      save(updated);
    },
    [data, save]
  );

  const editExpense = useCallback(
    (id: string, updates: Partial<Expense>) => {
      if (!data) return;
      const updated = updateExpense(data, id, updates);
      save(updated);
    },
    [data, save]
  );

  const removeExpense = useCallback(
    (id: string) => {
      if (!data) return;
      const updated = deleteExpense(data, id);
      save(updated);
    },
    [data, save]
  );

  // Income operations
  const createIncome = useCallback(
    (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!data) return;
      const updated = addIncome(data, income);
      save(updated);
    },
    [data, save]
  );

  const editIncome = useCallback(
    (id: string, updates: Partial<Income>) => {
      if (!data) return;
      const updated = updateIncome(data, id, updates);
      save(updated);
    },
    [data, save]
  );

  const removeIncome = useCallback(
    (id: string) => {
      if (!data) return;
      const updated = deleteIncome(data, id);
      save(updated);
    },
    [data, save]
  );

  // Category operations
  const createCategory = useCallback(
    (category: Omit<Category, 'id' | 'isDefault'>) => {
      if (!data) return;
      const updated = addCategory(data, category);
      save(updated);
    },
    [data, save]
  );

  const editCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      if (!data) return;
      const updated = updateCategory(data, id, updates);
      save(updated);
    },
    [data, save]
  );

  const removeCategory = useCallback(
    (id: string) => {
      if (!data) return;
      const updated = deleteCategory(data, id);
      save(updated);
    },
    [data, save]
  );

  // Settings operations
  const changeSettings = useCallback(
    (settings: Partial<UserSettings>) => {
      if (!data) return;
      const updated = updateSettings(data, settings);
      save(updated);
    },
    [data, save]
  );

  // Import data
  const importData = useCallback(
    (newData: AppData) => {
      save(newData);
    },
    [save]
  );

  return {
    data,
    isLoading,
    // Expenses
    createExpense,
    editExpense,
    removeExpense,
    // Income
    createIncome,
    editIncome,
    removeIncome,
    // Categories
    createCategory,
    editCategory,
    removeCategory,
    // Settings
    changeSettings,
    // Import
    importData,
  };
}
