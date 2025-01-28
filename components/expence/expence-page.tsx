"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ExpenseList from "@/components/expence/expense-list";
import { getMonthlyExpenses } from "@/actions/actions";
import { Expense } from "@/types/dashboard";
import { updateExpensePaidStatus } from "@/actions/dashboard.action";

interface PeriodExpenseListProps {
  initialExpenses: Expense[];
  categories: any[];
}

export function PeriodExpenseList({
  initialExpenses,
  categories,
}: PeriodExpenseListProps) {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [loading, setLoading] = useState(false);

  const handleMonthChange = async (year: number, month: number) => {
    setLoading(true);
    try {
      const result = await getMonthlyExpenses(year, month);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
      } else {
        setExpenses(result.data || []);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "データの取得に失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaidStatusChange = async (
    expenseId: string,
    paid: boolean
  ): Promise<void> => {
    try {
      const result = await updateExpensePaidStatus(expenseId, paid);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
        return;
      }

      toast({
        title: "更新完了",
        description: `支払い状態を${paid ? "支払い済み" : "未払い"}に更新しました`,
      });

      // 現在表示中の月のデータを再取得する
      const currentDate = new Date();
      const [currentYear, currentMonth] = expenses[0]?.date
        .substring(0, 7)
        .split("-")
        .map(Number) || [currentDate.getFullYear(), currentDate.getMonth() + 1];

      await handleMonthChange(currentYear, currentMonth);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "支払い状態の更新に失敗しました",
      });
    }
  };

  return (
    <div>
      <ExpenseList
        expenses={expenses}
        categories={categories}
        onMonthChange={handleMonthChange}
        onPaidStatusChange={handlePaidStatusChange}
        loading={loading}
      />
    </div>
  );
}
