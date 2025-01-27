"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getCategories } from "@/actions/category.action";
import { getMonthlyIncomes } from "@/actions/actions";
import { CategoryManagement } from "@/components/category-management";
import { IncomeTable } from "@/components/income/income-display";
import IncomeForm from "@/components/income/income-form";
import { Income } from "@/types/dashboard";
import IncomePageSkeleton from "@/components/income/income-skeleton";

export default function IncomePage() {
  const { toast } = useToast();
  const [initialLoading, setInitialLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 初期データの取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesResult, incomesResult] = await Promise.all([
          getCategories("income"),
          getMonthlyIncomes(
            new Date().getFullYear(),
            new Date().getMonth() + 1
          ),
        ]);

        if (categoriesResult.error || incomesResult.error) {
          setError(
            categoriesResult.error ||
              incomesResult.error ||
              "データの取得に失敗しました"
          );
        } else {
          setCategories(categoriesResult.data || []);
          setIncomes(incomesResult.data || []);
        }
      } catch (e) {
        setError("データの取得に失敗しました");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 月変更時のデータ取得
  const handleMonthChange = async (year: number, month: number) => {
    setTableLoading(true);
    try {
      const result = await getMonthlyIncomes(year, month);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
      } else {
        setIncomes(result.data || []);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "データの取得に失敗しました",
      });
    } finally {
      setTableLoading(false);
    }
  };

  if (initialLoading) {
    return <IncomePageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">収入管理</h1>
        <CategoryManagement categories={categories} />
      </div>

      <IncomeForm categories={categories} />

      <div className="mt-8">
        <IncomeTable
          incomes={incomes}
          categories={categories}
          onMonthChange={handleMonthChange}
          loading={tableLoading}
        />
      </div>
    </div>
  );
}
