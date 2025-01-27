import { getCategories } from "@/actions/category.action";
import { getRecentExpenses } from "@/actions/actions";
import { CategoryManagement } from "@/components/category-management";
import { PeriodExpenseList } from "@/components/expence/expence-page";
import ExpenseForm from "@/components/expence/expense-form";

import { Suspense } from "react";
import {
  ExpenseFormSkeleton,
  ExpenseListSkeleton,
} from "@/components/expence/expence-skeleton";

export default async function ExpensePage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">支出管理</h1>
        <Suspense fallback={<div className="w-32 h-9" />}>
          <CategoryManagementWrapper />
        </Suspense>
      </div>

      <Suspense fallback={<ExpenseFormSkeleton />}>
        <ExpenseFormWrapper />
      </Suspense>

      <div className="mt-8">
        <Suspense fallback={<ExpenseListSkeleton />}>
          <ExpenseListWrapper />
        </Suspense>
      </div>
    </div>
  );
}

async function CategoryManagementWrapper() {
  const { data: categories, error: categoryError } =
    await getCategories("expense");
  if (categoryError) return <div>カテゴリーの取得に失敗しました</div>;
  return <CategoryManagement categories={categories || []} />;
}

async function ExpenseFormWrapper() {
  const { data: categories, error: categoryError } =
    await getCategories("expense");
  if (categoryError) return <div>カテゴリーの取得に失敗しました</div>;
  return <ExpenseForm categories={categories || []} />;
}

async function ExpenseListWrapper() {
  const { data: categories, error: categoryError } =
    await getCategories("expense");
  const { data: expenses, error: expenseError } = await getRecentExpenses();

  if (categoryError || expenseError) {
    return <div>データの取得に失敗しました</div>;
  }

  return (
    <PeriodExpenseList
      initialExpenses={expenses || []}
      categories={categories || []}
    />
  );
}
