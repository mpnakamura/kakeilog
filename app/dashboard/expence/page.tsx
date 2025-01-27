import { getCategories } from "@/actions/category.action";
import { getRecentExpenses } from "@/actions/actions";
import { CategoryManagement } from "@/components/category-management";
import { PeriodExpenseList } from "@/components/expence/expence-page";
import ExpenseForm from "@/components/expence/expense-form";

export default async function ExpensePage() {
  const { data: categories, error: categoryError } =
    await getCategories("expense");
  const { data: expenses, error: expenseError } = await getRecentExpenses();

  if (categoryError || expenseError) {
    return <div>データの取得に失敗しました</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">支出管理</h1>
        <CategoryManagement categories={categories || []} />
      </div>

      <ExpenseForm categories={categories || []} />

      <div className="mt-8">
        <PeriodExpenseList
          initialExpenses={expenses || []}
          categories={categories || []}
        />
      </div>
    </div>
  );
}
