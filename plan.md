# Personal Expense Tracker (PET)

## Project Overview

A personal expense tracking web application built with Next.js, designed to help manage monthly finances with support for fixed and custom expenses, income tracking, balance calculations, and spending projections.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Storage**: Local Storage (browser)
- **Deployment**: Vercel

## Core Features

### 1. Expense Management
- **Fixed Expenses**: Recurring monthly expenses (rent, utilities, subscriptions, etc.)
- **Custom Expenses**: One-time or variable expenses
- **Categories**: Predefined categories with ability to add custom ones

### 2. Income Tracking
- Track income sources
- Calculate real balance (Income - Expenses)

### 3. Balance & Projections
- Current month balance view
- Fixed expenses forecast for upcoming months
- Spending trend analysis (when sufficient data exists)

### 4. Time Views
- **Monthly View**: Primary view with full month breakdown
- **Weekly Breakdown**: Expenses organized by week within a month

### 5. Data Portability
- Generate shareable encoded link containing all data
- Import data from encoded link
- Date-based conflict detection
- User confirmation before data override

## Data Models

### Category
```typescript
interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean; // true for predefined categories
}
```

### Expense
```typescript
interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO date string
  isFixed: boolean;
  recurrence?: 'monthly' | 'weekly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}
```

### Income
```typescript
interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  isRecurring: boolean;
  recurrence?: 'monthly' | 'weekly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}
```

### AppData (Root storage object)
```typescript
interface AppData {
  version: string;
  lastModified: string; // ISO date string
  categories: Category[];
  expenses: Expense[];
  incomes: Income[];
  settings: UserSettings;
}
```

### UserSettings
```typescript
interface UserSettings {
  currency: string;
  theme: 'dark' | 'light' | 'system';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  defaultCategories: string[]; // Category IDs to show first
}
```

## Default Categories

1. Housing (rent, mortgage)
2. Utilities (electric, water, gas, internet)
3. Food & Groceries
4. Transportation
5. Healthcare
6. Entertainment
7. Shopping
8. Subscriptions
9. Insurance
10. Savings
11. Other

## Application Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (Dashboard)
│   ├── expenses/
│   │   └── page.tsx
│   ├── income/
│   │   └── page.tsx
│   ├── projections/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── import/
│       └── page.tsx (Handle encoded data links)
├── components/
│   ├── ui/ (Shadcn components)
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── nav.tsx
│   ├── expenses/
│   │   ├── expense-form.tsx
│   │   ├── expense-list.tsx
│   │   ├── expense-card.tsx
│   │   └── category-select.tsx
│   ├── income/
│   │   ├── income-form.tsx
│   │   └── income-list.tsx
│   ├── dashboard/
│   │   ├── balance-card.tsx
│   │   ├── monthly-summary.tsx
│   │   ├── weekly-breakdown.tsx
│   │   └── recent-transactions.tsx
│   ├── projections/
│   │   ├── fixed-forecast.tsx
│   │   └── trend-chart.tsx
│   └── shared/
│       ├── data-import-dialog.tsx
│       ├── data-export-button.tsx
│       └── theme-toggle.tsx
├── hooks/
│   ├── use-local-storage.ts
│   ├── use-expenses.ts
│   ├── use-income.ts
│   └── use-categories.ts
├── lib/
│   ├── utils.ts
│   ├── storage.ts
│   ├── data-encoding.ts
│   └── calculations.ts
└── types/
    └── index.ts
```

## Implementation Phases

### Phase 1: Foundation
- [x] Project setup (Next.js, Tailwind, Shadcn)
- [ ] Type definitions
- [ ] Local storage utilities
- [ ] Basic layout (header, navigation)
- [ ] Theme toggle (dark mode default)

### Phase 2: Core Data Management
- [ ] Category management (CRUD + defaults)
- [ ] Expense management (add, edit, delete)
- [ ] Income management (add, edit, delete)
- [ ] Local storage persistence

### Phase 3: Dashboard & Views
- [ ] Dashboard with balance overview
- [ ] Monthly expense view
- [ ] Weekly breakdown component
- [ ] Recent transactions list

### Phase 4: Projections
- [ ] Fixed expenses forecast
- [ ] Spending trend analysis
- [ ] Visual charts/graphs

### Phase 5: Data Portability
- [ ] Data encoding/decoding utilities
- [ ] Generate shareable link
- [ ] Import page with conflict detection
- [ ] User confirmation dialogs

### Phase 6: Polish
- [ ] Responsive design optimization
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Error handling and edge cases

## Data Encoding Strategy

For the shareable link feature:
1. Serialize `AppData` to JSON
2. Compress using a lightweight algorithm (e.g., LZ-string)
3. Base64 encode for URL safety
4. Append to URL: `https://[domain]/import?data=[encoded]`

Import flow:
1. Detect if URL has `data` parameter
2. Decode and validate data structure
3. Compare `lastModified` dates
4. If local data is newer, warn user with confirmation dialog
5. Show preview of incoming data
6. User confirms or cancels import

## UI/UX Guidelines

- **Theme**: Dark mode by default, light mode available
- **Mobile-first**: Responsive design for all screen sizes
- **Accessibility**: Proper ARIA labels, keyboard navigation
- **Feedback**: Toast notifications for actions
- **Confirmation**: Destructive actions require confirmation

## Future Considerations (Not in Current Scope)

- User authentication (when opened to public)
- Cloud sync/backup
- Multiple currency support
- Budget goals and alerts
- Expense attachments (receipts)
- Export to CSV/PDF
- Recurring expense automation

## Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Session Notes

### Session 1 (Initial Setup)
- Created Next.js project with TypeScript, Tailwind CSS v4
- Initialized Shadcn UI with essential components
- Installed dependencies: react-hook-form, zod, date-fns, lucide-react
- Created this plan document
- Next steps: Set up types and project structure
