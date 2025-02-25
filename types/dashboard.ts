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
  createdAt: string; // 追加
  updatedAt: string; // 追加
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
  paid: boolean;
  createdAt: string; // 追加
  updatedAt: string; // 追加
}

export interface MonthlyData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    incomeDiff: number; // 収入の前月比
    expenseDiff: number; // 支出の前月比
    balanceDiff: number; // 収支の前月比
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
