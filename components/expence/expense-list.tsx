"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  subCategoryId?: string;
  memo?: string;
}

interface Category {
  id: string;
  name: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
}

export default function ExpenseList({
  expenses,
  categories,
}: ExpenseListProps) {
  // カテゴリーごとに支出をグループ化
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      const category = categories.find((c) => c.id === expense.categoryId);
      if (!category) return acc;

      if (!acc[category.id]) {
        acc[category.id] = {
          name: category.name,
          expenses: [],
        };
      }
      acc[category.id].expenses.push(expense);
      return acc;
    },
    {} as Record<string, { name: string; expenses: Expense[] }>
  );

  return (
    <div className="space-y-6">
      {Object.entries(expensesByCategory).map(
        ([categoryId, { name, expenses }]) => (
          <div key={categoryId} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{name}</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>タイトル</TableHead>
                  <TableHead>メモ</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const subCategory = categories
                    .find((c) => c.id === expense.categoryId)
                    ?.subCategories.find((s) => s.id === expense.subCategoryId);

                  return (
                    <TableRow key={expense.id}>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>
                        {expense.title}
                        {subCategory && (
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({subCategory.name})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {expense.memo}
                      </TableCell>
                      <TableCell className="text-right">
                        ¥{expense.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    合計
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ¥
                    {expenses
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )
      )}
    </div>
  );
}
