// app/dashboard/income/page.tsx
import { getCategories } from "@/actions/category.action";
import { getMonthlyIncomes } from "@/app/actions";
import { CategoryManagement } from "@/components/category-management";
import { IncomeTable } from "@/components/income/income-display";
import IncomeForm from "@/components/income/income-form";

export default async function IncomePage() {

  const { data: categories, error: categoryError } =
    await getCategories("income");
  const now = new Date();
  const { data: incomes, error: incomeError } = await getMonthlyIncomes(
    now.getFullYear(),
    now.getMonth() + 1
  );

  console.log("Page Debug Info:", {
    categoriesCount: categories?.length || 0,
    incomesCount: incomes?.length || 0,
    categoryError,
    incomeError,
  });

  if (categoryError || incomeError) {
    return (
      <div className="p-4">
        <div className="text-red-500">データの取得に失敗しました</div>
        <div className="mt-2 text-sm text-gray-600">
          {categoryError && <div>カテゴリエラー: {categoryError}</div>}
          {incomeError && <div>収入データエラー: {incomeError}</div>}
        </div>
      </div>
    );
  }

  // エラーチェック後なので、データは必ず存在する
  const safeCategories = categories || [];
  const safeIncomes = incomes || [];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">収入管理</h1>
        <CategoryManagement categories={safeCategories} />
      </div>

      <IncomeForm categories={safeCategories} />

      <div className="mt-8">
        <IncomeTable incomes={safeIncomes} categories={safeCategories} />
      </div>
    </div>
  );
}
