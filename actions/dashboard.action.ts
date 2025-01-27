"use server";

import { createClient } from "@/utils/supabase/server";
import { CategoryBreakdown, MonthlyData } from "@/types/dashboard";

export async function getMonthlyDashboardData(year: number, month: number) {
  console.log("開始: getMonthlyDashboardData", { year, month });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証されていません" };
  }

  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0).toISOString();
  const lastStartDate = new Date(year, month - 2, 1).toISOString();
  const lastEndDate = new Date(year, month - 1, 0).toISOString();

  console.log("日付範囲:", {
    current: { startDate, endDate },
    last: { lastStartDate, lastEndDate },
  });

  try {
    // 今月の収入データを取得
    const { data: incomes, error: incomeError } = await supabase
      .from("Income")
      .select(
        `
        *,
        category:Category(id, name),
        subCategory:SubCategory(id, name)
      `
      )
      .eq("userId", user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    if (incomeError) throw incomeError;

    // 今月の支出データを取得
    const { data: expenses, error: expenseError } = await supabase
      .from("Expense")
      .select(
        `
        *,
        category:Category(id, name),
        subCategory:SubCategory(id, name)
      `
      )
      .eq("userId", user.id)
      .gte("date", startDate)
      .lte("date", endDate);

    if (expenseError) throw expenseError;

    // 前月の収入データを取得
    const { data: lastMonthIncomes } = await supabase
      .from("Income")
      .select("amount")
      .eq("userId", user.id)
      .gte("date", lastStartDate)
      .lte("date", lastEndDate);

    // 前月の支出データを取得
    const { data: lastMonthExpenses } = await supabase
      .from("Expense")
      .select("amount")
      .eq("userId", user.id)
      .gte("date", lastStartDate)
      .lte("date", lastEndDate);

    // 今月の集計
    const totalIncome = (incomes || []).reduce(
      (sum, inc) => sum + inc.amount,
      0
    );
    const totalExpense = (expenses || []).reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const balance = totalIncome - totalExpense;

    // 前月の集計
    const lastMonthTotalIncome = (lastMonthIncomes || []).reduce(
      (sum, inc) => sum + inc.amount,
      0
    );
    const lastMonthTotalExpense = (lastMonthExpenses || []).reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const lastMonthBalance = lastMonthTotalIncome - lastMonthTotalExpense;

    // カテゴリ別の集計を計算
    const incomeCategoryBreakdown = calculateCategoryBreakdown(incomes || []);
    const expenseCategoryBreakdown = calculateCategoryBreakdown(expenses || []);

    // 過去6ヶ月のトレンドデータを取得
    const monthlyTrend = await getMonthlyTrend(user.id, year, month);

    const monthlyData: MonthlyData = {
      summary: {
        totalIncome,
        totalExpense,
        balance,
        incomeDiff: totalIncome - lastMonthTotalIncome,
        expenseDiff: totalExpense - lastMonthTotalExpense,
        balanceDiff: balance - lastMonthBalance,
        budgetRemaining: 0,
      },
      incomes: incomes || [],
      expenses: expenses || [],
      categoryBreakdown: {
        income: incomeCategoryBreakdown,
        expense: expenseCategoryBreakdown,
      },
      monthlyTrend,
    };

    console.log("月次データ:", {
      current: { totalIncome, totalExpense, balance },
      last: {
        totalIncome: lastMonthTotalIncome,
        totalExpense: lastMonthTotalExpense,
        balance: lastMonthBalance,
      },
      diff: {
        income: totalIncome - lastMonthTotalIncome,
        expense: totalExpense - lastMonthTotalExpense,
        balance: balance - lastMonthBalance,
      },
    });

    return { data: monthlyData };
  } catch (error) {
    console.error("ダッシュボードデータ取得エラー:", error);
    return { error: "データの取得に失敗しました" };
  }
}

// カテゴリ別の集計を計算する関数
function calculateCategoryBreakdown(transactions: any[]): CategoryBreakdown[] {
  const categoryTotals = transactions.reduce((acc, transaction) => {
    const categoryId = transaction.categoryId;
    const categoryName = transaction.category?.name || "未分類";
    const subCategoryId = transaction.subCategoryId;
    const subCategoryName = transaction.subCategory?.name || "その他";

    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: categoryName,
        totalAmount: 0,
        percentage: 0,
        subCategories: {},
      };
    }

    acc[categoryId].totalAmount += transaction.amount;

    if (!acc[categoryId].subCategories[subCategoryId || "other"]) {
      acc[categoryId].subCategories[subCategoryId || "other"] = {
        subCategory: subCategoryName,
        amount: 0,
        percentage: 0,
      };
    }

    acc[categoryId].subCategories[subCategoryId || "other"].amount +=
      transaction.amount;

    return acc;
  }, {});

  const total = Object.values(categoryTotals).reduce(
    (sum: number, cat: any) => sum + cat.totalAmount,
    0
  );

  return Object.values(categoryTotals).map((category: any) => {
    const subCategories = Object.values(category.subCategories).map(
      (sub: any) => ({
        ...sub,
        percentage: (sub.amount / category.totalAmount) * 100,
      })
    );

    return {
      category: category.category,
      totalAmount: category.totalAmount,
      percentage: (category.totalAmount / total) * 100,
      subCategories,
    };
  });
}

// 月次トレンドを取得する関数
async function getMonthlyTrend(userId: string, year: number, month: number) {
  const supabase = await createClient();
  const pastMonths = 6; // 過去5ヶ月 + 当月 = 6ヶ月分

  // 過去5ヶ月の開始日から当月の終了日までを取得
  const startDate = new Date(year, month - pastMonths, 1);
  const endDate = new Date(year, month, 0);

  console.log("トレンド期間:", {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  });

  const { data: incomes, error: incomeError } = await supabase
    .from("Income")
    .select("date, amount")
    .eq("userId", userId)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString());

  const { data: expenses, error: expenseError } = await supabase
    .from("Expense")
    .select("date, amount")
    .eq("userId", userId)
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString());

  console.log("取得データ:", {
    incomes: incomes?.length || 0,
    expenses: expenses?.length || 0,
    incomeError,
    expenseError,
  });

  // 月ごとの集計用のマップを初期化
  const monthlyIncomes = new Map();
  const monthlyExpenses = new Map();

  // 過去5ヶ月分と当月の月を生成
  for (let i = pastMonths - 1; i >= 0; i--) {
    const targetDate = new Date(year, month - i - 1, 1);
    const monthKey = targetDate.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
    });
    monthlyIncomes.set(monthKey, 0);
    monthlyExpenses.set(monthKey, 0);
  }

  // 収入を集計
  (incomes || []).forEach((income) => {
    const monthKey = new Date(income.date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
    });
    if (monthlyIncomes.has(monthKey)) {
      monthlyIncomes.set(
        monthKey,
        (monthlyIncomes.get(monthKey) || 0) + income.amount
      );
    }
  });

  // 支出を集計
  (expenses || []).forEach((expense) => {
    const monthKey = new Date(expense.date).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
    });
    if (monthlyExpenses.has(monthKey)) {
      monthlyExpenses.set(
        monthKey,
        (monthlyExpenses.get(monthKey) || 0) + expense.amount
      );
    }
  });

  // 結果を配列に変換
  const result = {
    income: Array.from(monthlyIncomes.entries()).map(([month, amount]) => ({
      month,
      amount,
    })),
    expense: Array.from(monthlyExpenses.entries()).map(([month, amount]) => ({
      month,
      amount,
    })),
  };

  console.log("トレンド計算結果:", result);

  return result;
}
