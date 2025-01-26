
import { getCategories } from "@/actions/category.action";
import { CategoryManagement } from "@/components/category-management";
import IncomeForm from "@/components/income-form";

export default async function IncomePage() {
  const { data: categories, error } = await getCategories("income");

  if (error) {
    return <div>カテゴリーの取得に失敗しました</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">収入登録</h1>
        <CategoryManagement categories={categories || []} />
      </div>

      <IncomeForm categories={categories || []} />
    </div>
  );
}
