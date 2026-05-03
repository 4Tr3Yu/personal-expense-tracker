import { AppData } from '@/types';

// Simple compression using built-in APIs
export function encodeAppData(data: AppData): string {
  try {
    const json = JSON.stringify(data);
    // Use btoa for base64 encoding (works in browser)
    const encoded = btoa(unescape(encodeURIComponent(json)));
    return encoded;
  } catch (error) {
    console.error('Failed to encode app data:', error);
    throw new Error('Failed to encode data');
  }
}

export function decodeAppData(encoded: string): AppData | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(json) as AppData;

    // Validate basic structure
    if (!data.version || !data.lastModified || !Array.isArray(data.categories)) {
      throw new Error('Invalid data structure');
    }

    return data;
  } catch (error) {
    console.error('Failed to decode app data:', error);
    return null;
  }
}

export function generateShareableUrl(data: AppData, baseUrl: string): string {
  const encoded = encodeAppData(data);
  return `${baseUrl}/import?data=${encoded}`;
}

export interface DataConflict {
  hasConflict: boolean;
  localDate: Date | null;
  importDate: Date;
  localIsNewer: boolean;
}

export function detectDataConflict(localData: AppData | null, importData: AppData): DataConflict {
  const importDate = new Date(importData.lastModified);

  if (!localData || localData.expenses.length === 0 && localData.incomes.length === 0) {
    return {
      hasConflict: false,
      localDate: null,
      importDate,
      localIsNewer: false,
    };
  }

  const localDate = new Date(localData.lastModified);
  const localIsNewer = localDate > importDate;

  return {
    hasConflict: true,
    localDate,
    importDate,
    localIsNewer,
  };
}

export interface DataMergeOptions {
  strategy: 'replace' | 'merge' | 'keep-local';
}

export function mergeAppData(
  localData: AppData,
  importData: AppData,
  options: DataMergeOptions
): AppData {
  switch (options.strategy) {
    case 'replace':
      return importData;

    case 'keep-local':
      return localData;

    case 'merge':
      // Merge categories (avoid duplicates by ID)
      const categoryIds = new Set(localData.categories.map(c => c.id));
      const newCategories = importData.categories.filter(c => !categoryIds.has(c.id));

      // Merge expenses (avoid duplicates by ID)
      const expenseIds = new Set(localData.expenses.map(e => e.id));
      const newExpenses = importData.expenses.filter(e => !expenseIds.has(e.id));

      // Merge incomes (avoid duplicates by ID)
      const incomeIds = new Set(localData.incomes.map(i => i.id));
      const newIncomes = importData.incomes.filter(i => !incomeIds.has(i.id));

      return {
        ...localData,
        categories: [...localData.categories, ...newCategories],
        expenses: [...localData.expenses, ...newExpenses],
        incomes: [...localData.incomes, ...newIncomes],
        lastModified: new Date().toISOString(),
      };

    default:
      return localData;
  }
}
