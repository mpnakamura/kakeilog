"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ExpenseList from "@/components/expence/expense-list";
import { getMonthlyExpenses } from "@/actions/actions";
import { Expense } from "@/types/dashboard";
import { Category } from "@prisma/client";

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

  return (
    <div>
      <ExpenseList
        expenses={expenses}
        categories={categories}
        onMonthChange={handleMonthChange}
        loading={loading}
      />
    </div>
  );
}
