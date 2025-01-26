import { MonthlyData } from "@/types/dashboard";

export const mockDashboardData: Record<string, MonthlyData> = {
  "2025-01": {
    summary: {
      totalIncome: 350000,
      totalExpense: 280000,
      balance: 70000,
      lastMonthDiff: 12000,
      budgetRemaining: 75000,
    },
    incomes: [
      {
        id: "i1",
        userId: "user1",
        amount: 280000,
        date: "2025-01-01",
        categoryId: "c1",
        subCategoryId: "sc1",
        title: "1月給与",
        memo: "基本給",
      },
      {
        id: "i2",
        userId: "user1",
        amount: 50000,
        date: "2025-01-10",
        categoryId: "c2",
        subCategoryId: "sc2",
        title: "副業収入",
        memo: "フリーランス案件",
      },
    ],
    expenses: [
      {
        id: "e1",
        userId: "user1",
        amount: 85000,
        date: "2025-01-15",
        categoryId: "c3",
        subCategoryId: "sc3",
        title: "家賃",
        memo: "1月分家賃",
      },
      {
        id: "e2",
        userId: "user1",
        amount: 20000,
        date: "2025-01-20",
        categoryId: "c4",
        subCategoryId: "sc4",
        title: "電気代",
        memo: "東京電力",
      },
    ],
    categoryBreakdown: {
      income: [
        {
          category: "salary",
          totalAmount: 280000,
          percentage: 84,
          subCategories: [
            { subCategory: "基本給", amount: 280000, percentage: 100 },
          ],
        },
        {
          category: "side_job",
          totalAmount: 50000,
          percentage: 16,
          subCategories: [
            { subCategory: "フリーランス案件", amount: 50000, percentage: 100 },
          ],
        },
      ],
      expense: [
        {
          category: "家賃",
          totalAmount: 85000,
          percentage: 30.36,
          subCategories: [
            { subCategory: "家賃", amount: 85000, percentage: 100 },
          ],
        },
        {
          category: "光熱費",
          totalAmount: 35000,
          percentage: 12.5,
          subCategories: [
            { subCategory: "電気代", amount: 20000, percentage: 57.14 },
            { subCategory: "ガス代", amount: 15000, percentage: 42.86 },
          ],
        },
        {
          category: "食料品",
          totalAmount: 30000,
          percentage: 10.71,
          subCategories: [
            { subCategory: "食料品", amount: 25000, percentage: 83.33 },
            { subCategory: "飲料", amount: 5000, percentage: 16.67 },
          ],
        },
        {
          category: "交通費",
          totalAmount: 20000,
          percentage: 7.14,
          subCategories: [
            { subCategory: "公共交通", amount: 12000, percentage: 60 },
            { subCategory: "ガソリン", amount: 8000, percentage: 40 },
          ],
        },
        {
          category: "娯楽",
          totalAmount: 15000,
          percentage: 5.36,
          subCategories: [
            { subCategory: "映画", amount: 7000, percentage: 46.67 },
            { subCategory: "外食", amount: 8000, percentage: 53.33 },
          ],
        },
        {
          category: "健康",
          totalAmount: 10000,
          percentage: 3.57,
          subCategories: [
            { subCategory: "医療費", amount: 6000, percentage: 60 },
            { subCategory: "薬代", amount: 4000, percentage: 40 },
          ],
        },
      ],
    },
    monthlyTrend: {
      income: [
        { month: "2024-08", amount: 310000 },
        { month: "2024-09", amount: 320000 },
        { month: "2024-10", amount: 330000 },
        { month: "2024-11", amount: 340000 },
        { month: "2024-12", amount: 350000 },
        { month: "2025-01", amount: 350000 },
      ],
      expense: [
        { month: "2024-08", amount: 250000 },
        { month: "2024-09", amount: 260000 },
        { month: "2024-10", amount: 270000 },
        { month: "2024-11", amount: 275000 },
        { month: "2024-12", amount: 280000 },
        { month: "2025-01", amount: 280000 },
      ],
    },
  },
};


export const mockIncomes = [
  {
    id: "i1",
    userId: "user1",
    amount: 280000,
    date: "2025-01-01",
    categoryId: "c1",
    subCategoryId: "sc1",
    title: "1月給与",
    memo: "基本給",
  },
  {
    id: "i2",
    userId: "user1",
    amount: 50000,
    date: "2025-01-10",
    categoryId: "c2",
    subCategoryId: "sc2",
    title: "副業収入",
    memo: "フリーランス案件",
  },
];

export const mockExpenses = [
  {
    id: "e1",
    userId: "user1",
    amount: 85000,
    date: "2025-01-15",
    categoryId: "c3",
    subCategoryId: "sc3",
    title: "家賃",
    memo: "1月分家賃",
  },
  {
    id: "e2",
    userId: "user1",
    amount: 20000,
    date: "2025-01-20",
    categoryId: "c4",
    subCategoryId: "sc4",
    title: "電気代",
    memo: "東京電力",
  },
  {
    id: "e3",
    userId: "user1",
    amount: 15000,
    date: "2025-01-25",
    categoryId: "c4",
    subCategoryId: "sc5",
    title: "ガス代",
    memo: "東京ガス",
  },
];
