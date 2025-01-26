export interface SubCategoryTotal {
  subCategory: string; // サブカテゴリ名
  amount: number;
  percentage: number;
}

export interface CategoryBreakdown {
  category: string; // 大カテゴリ名
  totalAmount: number; // 大カテゴリの合計金額
  percentage: number; // 大カテゴリの全体に対する割合
  subCategories: SubCategoryTotal[]; // サブカテゴリの詳細
}

export interface MonthlyTrend {
  month: string;
  amount: number;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  date: string;
  categoryId: string;
  subCategoryId?: string;
  title: string;
  memo?: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  date: string;
  categoryId: string;
  subCategoryId?: string;
  title: string;
  memo?: string;
}

export interface MonthlyData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    lastMonthDiff: number;
    budgetRemaining: number;
  };
  incomes: Income[]; // 収入
  expenses: Expense[]; // 支出
  categoryBreakdown: {
    income: CategoryBreakdown[];
    expense: CategoryBreakdown[];
  };
  monthlyTrend: {
    income: MonthlyTrend[];
    expense: MonthlyTrend[];
  };
}

export const mockDashboardData: Record<string, MonthlyData> = {};
