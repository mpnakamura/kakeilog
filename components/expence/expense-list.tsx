"use client";

// ExpenseList.tsx
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ListFilter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExpenseListSkeleton } from "./expence-skeleton";

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
  subCategories: {
    id: string;
    name: string;
  }[];
}

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onMonthChange?: (year: number, month: number) => Promise<void>;
  loading?: boolean;
}

type ViewMode = "date" | "category";
type SortField = "date" | "category" | "subCategory" | "title" | "amount";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function ExpenseList({
  expenses,
  categories,
  onMonthChange,
  loading = false,
}: ExpenseListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("date");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  // 月選択時の処理を追加
  const handleMonthChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    if (onMonthChange) {
      const [year, month] = newMonth.split("-").map(Number);
      await onMonthChange(year, month);
    }
  };

  // 選択された月のデータをフィルタリング
  const filteredExpenses = expenses.filter((expense) => {
    const expenseMonth = expense.date.substring(0, 7);
    return expenseMonth === selectedMonth;
  });

  // ソート処理関数
  const sortExpenses = (expenses: Expense[]) => {
    return [...expenses].sort((a, b) => {
      const multiplier = sortConfig.direction === "asc" ? 1 : -1;

      switch (sortConfig.field) {
        case "date":
          return (
            (new Date(a.date).getTime() - new Date(b.date).getTime()) *
            multiplier
          );
        case "category":
          const categoryA =
            categories.find((c) => c.id === a.categoryId)?.name || "";
          const categoryB =
            categories.find((c) => c.id === b.categoryId)?.name || "";
          return categoryA.localeCompare(categoryB) * multiplier;
        case "subCategory":
          const subCategoryA =
            categories
              .find((c) => c.id === a.categoryId)
              ?.subCategories.find((s) => s.id === a.subCategoryId)?.name || "";
          const subCategoryB =
            categories
              .find((c) => c.id === b.categoryId)
              ?.subCategories.find((s) => s.id === b.subCategoryId)?.name || "";
          return subCategoryA.localeCompare(subCategoryB) * multiplier;
        case "title":
          return a.title.localeCompare(b.title) * multiplier;
        case "amount":
          return (a.amount - b.amount) * multiplier;
        default:
          return 0;
      }
    });
  };

  // ソートの切り替え処理
  const handleSort = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ソートアイコンコンポーネント
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field)
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  // ソート可能なヘッダーセル
  const SortableTableHead = ({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead
      className={cn("cursor-pointer select-none whitespace-nowrap", className)}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  // グループ化関数
  const groupExpenses = () => {
    const sortedExpenses = sortExpenses(filteredExpenses);

    if (viewMode === "date") {
      return sortedExpenses.reduce(
        (acc, expense) => {
          const month = new Date(expense.date).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
          });
          if (!acc[month]) acc[month] = [];
          acc[month].push(expense);
          return acc;
        },
        {} as Record<string, Expense[]>
      );
    } else {
      return sortedExpenses.reduce(
        (acc, expense) => {
          const category = categories.find((c) => c.id === expense.categoryId);
          const groupKey = category?.name || "未分類";
          if (!acc[groupKey]) acc[groupKey] = [];
          acc[groupKey].push(expense);
          return acc;
        },
        {} as Record<string, Expense[]>
      );
    }
  };

  const groupedExpenses = groupExpenses();

  // 共通のコントロール部分を定義
  const controls = (
    <div className="flex gap-2 mb-4 items-center">
      <Button
        variant={viewMode === "date" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("date")}
      >
        <Calendar className="h-4 w-4 mr-2" />
        日付順
      </Button>
      <Button
        variant={viewMode === "category" ? "default" : "outline"}
        size="sm"
        onClick={() => setViewMode("category")}
      >
        <ListFilter className="h-4 w-4 mr-2" />
        カテゴリ別
      </Button>
      <input
        type="month"
        value={selectedMonth}
        onChange={handleMonthChange}
        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
    </div>
  );

  return (
    <div>
      {controls}
      {loading ? (
        <ExpenseListSkeleton />
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          この期間の支出データはありません
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedExpenses).map(
            ([groupTitle, groupExpenses]) => (
              <div key={groupTitle} className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">{groupTitle}</h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead field="date" className="w-24">
                        日付
                      </SortableTableHead>
                      {viewMode === "date" && (
                        <SortableTableHead field="category" className="w-40">
                          カテゴリー
                        </SortableTableHead>
                      )}
                      <SortableTableHead
                        field="subCategory"
                        className="w-32 whitespace-nowrap"
                      >
                        サブカテゴリー
                      </SortableTableHead>
                      <SortableTableHead field="title">
                        タイトル
                      </SortableTableHead>
                      <TableHead className="whitespace-nowrap">メモ</TableHead>
                      <SortableTableHead
                        field="amount"
                        className="text-right w-32"
                      >
                        金額
                      </SortableTableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupExpenses.map((expense) => {
                      const category = categories.find(
                        (c) => c.id === expense.categoryId
                      );
                      const subCategory = category?.subCategories.find(
                        (s) => s.id === expense.subCategoryId
                      );

                      return (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            {new Date(expense.date).toLocaleDateString(
                              "ja-JP",
                              {
                                month: "2-digit",
                                day: "2-digit",
                              }
                            )}
                          </TableCell>
                          {viewMode === "date" && (
                            <TableCell>{category?.name}</TableCell>
                          )}
                          <TableCell>{subCategory?.name || "-"}</TableCell>
                          <TableCell>{expense.title}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {expense.memo || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            ¥{expense.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-muted/50">
                      <TableCell
                        colSpan={viewMode === "date" ? 5 : 4}
                        className="text-right font-medium"
                      >
                        {groupTitle}の合計
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ¥
                        {groupExpenses
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
      )}
    </div>
  );
}
