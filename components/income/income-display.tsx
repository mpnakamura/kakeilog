"use client";

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

interface Income {
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

interface IncomeTableProps {
  incomes: Income[];
  categories: Category[];
}

type ViewMode = "date" | "category";
type SortField = "date" | "category" | "title" | "amount";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export function IncomeTable({ incomes, categories }: IncomeTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("date");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  // 選択された月のデータをフィルタリング
  const filteredIncomes = incomes.filter((income) => {
    const incomeMonth = income.date.substring(0, 7);
    return incomeMonth === selectedMonth;
  });

  // ソート処理関数
  const sortIncomes = (incomes: Income[]) => {
    return [...incomes].sort((a, b) => {
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
      className={cn("cursor-pointer select-none", className)}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  // 日付でグループ化
  const groupByDate = () => {
    return sortIncomes(filteredIncomes).reduce(
      (acc, income) => {
        const month = new Date(income.date).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
        });
        if (!acc[month]) acc[month] = [];
        acc[month].push(income);
        return acc;
      },
      {} as Record<string, Income[]>
    );
  };

  // カテゴリーでグループ化
  const groupByCategory = () => {
    return categories.reduce(
      (acc, category) => {
        const categoryIncomes = sortIncomes(
          filteredIncomes.filter((income) => income.categoryId === category.id)
        );
        if (categoryIncomes.length > 0) {
          acc[category.name] = categoryIncomes;
        }
        return acc;
      },
      {} as Record<string, Income[]>
    );
  };

  const groupedIncomes =
    viewMode === "date" ? groupByDate() : groupByCategory();

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
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
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {Object.entries(groupedIncomes).map(([groupTitle, groupIncomes]) => (
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
                    カテゴリ
                  </SortableTableHead>
                )}
                <SortableTableHead field="title">タイトル</SortableTableHead>
                <TableHead>メモ</TableHead>
                <SortableTableHead field="amount" className="text-right w-32">
                  金額
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupIncomes.map((income) => {
                const category = categories.find(
                  (c) => c.id === income.categoryId
                );
                return (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium">
                      {new Date(income.date).toLocaleDateString("ja-JP", {
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </TableCell>
                    {viewMode === "date" && (
                      <TableCell>{category?.name}</TableCell>
                    )}
                    <TableCell>{income.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {income.memo || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{income.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell
                  colSpan={viewMode === "date" ? 4 : 3}
                  className="text-right font-medium"
                >
                  {groupTitle}の合計
                </TableCell>
                <TableCell className="text-right font-bold">
                  ¥
                  {groupIncomes
                    .reduce((sum, i) => sum + i.amount, 0)
                    .toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
