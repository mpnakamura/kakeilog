"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import ExpenseList from "@/components/expence/expense-list";
import { getMonthlyExpenses } from "@/app/actions";
import PeriodSelector from "@/components/period-select";

interface PeriodExpenseListProps {
  initialExpenses: any[]; // 型は実際の Expense 型に合わせて調整してください
  categories: any[]; // 型は実際の Category 型に合わせて調整してください
}

export function PeriodExpenseList({
  initialExpenses,
  categories,
}: PeriodExpenseListProps) {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = async (year: number, month: number) => {
    setLoading(true);
    const result = await getMonthlyExpenses(year, month);
    setLoading(false);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: result.error,
      });
    } else {
      setExpenses(result.data || []);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <PeriodSelector onPeriodChange={handlePeriodChange} />
      </div>

      {loading ? (
        <div className="text-center py-8">データを読み込み中...</div>
      ) : expenses.length > 0 ? (
        <ExpenseList expenses={expenses} categories={categories} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          この期間の支出データはありません
        </div>
      )}
    </div>
  );
}
