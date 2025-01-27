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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Calendar,
  ListFilter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IncomeTableSkeleton } from "./income-skeleton";
import { useToast } from "@/hooks/use-toast";
import { deleteIncome } from "@/actions/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditIncomeDialog } from "./income-dialog";

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

export function IncomeTable({
  incomes,
  categories,
  onMonthChange,
  loading = false,
}: IncomeTableProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("date");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "desc",
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectChange = async (value: string) => {
    setSelectedMonth(value);
    if (onMonthChange) {
      const [year, month] = value.split("-").map(Number);
      await onMonthChange(year, month);
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-based

    // 現在から前後半年間の月をループ
    for (let offset = -6; offset <= 6; offset++) {
      const targetDate = new Date(currentYear, currentMonth + offset - 1, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth() + 1; // 1-based
      const value = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;
      const label = `${targetYear}年${String(targetMonth).padStart(2, "0")}月`;
      options.push({ value, label });
    }

    return options;
  };

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
        default:
          return 0;
      }
    });
  };

  // 削除処理
  const handleDelete = async () => {
    if (!deletingIncome) return;

    setIsDeleting(true);
    try {
      const result = await deleteIncome(deletingIncome.id);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
      } else {
        toast({
          title: "削除完了",
          description: "収入を削除しました",
        });
        // 現在の月のデータを再取得
        const [year, month] = selectedMonth.split("-").map(Number);
        await onMonthChange?.(year, month);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "収入の削除に失敗しました",
      });
    } finally {
      setIsDeleting(false);
      setDeletingIncome(null);
    }
  };

  // 編集後の更新処理
  const handleEditSuccess = async () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    await onMonthChange?.(year, month);
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
  const groupIncomes = () => {
    const sortedIncomes = sortIncomes(filteredIncomes);

    if (viewMode === "date") {
      return sortedIncomes.reduce(
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
    } else {
      return sortedIncomes.reduce(
        (acc, income) => {
          const category = categories.find((c) => c.id === income.categoryId);
          const groupKey = category?.name || "未分類";
          if (!acc[groupKey]) acc[groupKey] = [];
          acc[groupKey].push(income);
          return acc;
        },
        {} as Record<string, Income[]>
      );
    }
  };

  const groupedIncomes = groupIncomes();

  // TableRowコンポーネント
  const renderTableRow = (income: Income) => {
    const category = categories.find((c) => c.id === income.categoryId);
    const subCategory = category?.subCategories.find(
      (s) => s.id === income.subCategoryId
    );

    return (
      <TableRow key={income.id}>
        <TableCell className="font-medium">
          {new Date(income.date).toLocaleDateString("ja-JP", {
            month: "2-digit",
            day: "2-digit",
          })}
        </TableCell>
        {viewMode === "date" && <TableCell>{category?.name}</TableCell>}
        <TableCell>{subCategory?.name || "-"}</TableCell>
        <TableCell>{income.title}</TableCell>
        <TableCell className="text-muted-foreground">
          {income.memo || "-"}
        </TableCell>
        <TableCell className="px-2">
          ¥{income.amount.toLocaleString()}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingIncome(income)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingIncome(income)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const monthOptions = generateMonthOptions();
  // 共通のコントロール部分
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
      <Select
        value={selectedMonth}
        onValueChange={handleSelectChange}
        disabled={loading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="月を選択" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex-1" /> {/* スペーサー */}
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          const [year, month] = selectedMonth.split("-").map(Number);
          await onMonthChange?.(year, month);
        }}
        disabled={loading}
      >
        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
        更新
      </Button>
    </div>
  );

  return (
    <div>
      {controls}
      {loading ? (
        <IncomeTableSkeleton />
      ) : filteredIncomes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          この期間の収入データはありません
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {Object.entries(groupedIncomes).map(
              ([groupTitle, groupIncomes]) => (
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
                        <SortableTableHead field="subCategory" className="w-32">
                          サブカテゴリー
                        </SortableTableHead>
                        <SortableTableHead field="title">
                          タイトル
                        </SortableTableHead>
                        <TableHead>メモ</TableHead>
                        <SortableTableHead
                          field="amount"
                          className="text-right w-32"
                        >
                          金額
                        </SortableTableHead>
                        <TableHead className="text-right w-24">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupIncomes.map((income) => renderTableRow(income))}
                      <TableRow className="bg-muted/50">
                        <TableCell
                          colSpan={viewMode === "date" ? 5 : 4}
                          className="text-right font-medium"
                        >
                          {groupTitle}の合計
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          ¥
                          {groupIncomes
                            .reduce((sum, i) => sum + i.amount, 0)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )
            )}
          </div>

          {/* 編集ダイアログ */}
          {editingIncome && (
            <EditIncomeDialog
              income={editingIncome}
              categories={categories}
              isOpen={!!editingIncome}
              onClose={() => setEditingIncome(null)}
              onSuccess={handleEditSuccess}
            />
          )}

          {/* 削除確認ダイアログ */}
          <AlertDialog
            open={!!deletingIncome}
            onOpenChange={(isOpen) => !isOpen && setDeletingIncome(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>収入の削除</AlertDialogTitle>
                <AlertDialogDescription>
                  この収入を削除してもよろしいですか？この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  キャンセル
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "削除中..." : "削除"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
