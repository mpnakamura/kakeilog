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
import { ExpenseListSkeleton } from "./expence-skeleton";
import { useToast } from "@/hooks/use-toast";
import { deleteExpense } from "@/actions/actions";
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
import { EditExpenseDialog } from "./expence-dialog";
import { BulkRegisterDialog } from "./bulk/bulk-register-dialog";
import { Switch } from "../ui/switch";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  subCategoryId?: string;
  memo?: string;
  paid: boolean;
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
  onPaidStatusChange?: (expenseId: string, paid: boolean) => Promise<void>;
}

type ViewMode = "date" | "category";
type SortField = "date" | "category" | "subCategory" | "title" | "amount";
type SortDirection = "asc" | "desc";
type PaidFilter = "all" | "paid" | "unpaid";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function ExpenseList({
  expenses,
  categories,
  onMonthChange,
  loading = false,
  onPaidStatusChange,
}: ExpenseListProps) {
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
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [paidFilter, setPaidFilter] = useState<PaidFilter>("all");
  const [isBulkRegisterOpen, setIsBulkRegisterOpen] = useState(false);
  // 選択された月のデータをフィルタリング
  const filterExpenses = (expenses: Expense[]) => {
    let filtered = expenses.filter((expense) => {
      const expenseMonth = expense.date.substring(0, 7);
      return expenseMonth === selectedMonth;
    });

    switch (paidFilter) {
      case "paid":
        filtered = filtered.filter((expense) => expense.paid);
        break;
      case "unpaid":
        filtered = filtered.filter((expense) => !expense.paid);
        break;
    }
    return filtered;
  };

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

  // 削除処理
  const handleDelete = async () => {
    if (!deletingExpense) return;

    setIsDeleting(true);
    try {
      const result = await deleteExpense(deletingExpense.id);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
      } else {
        toast({
          title: "削除完了",
          description: "支出を削除しました",
        });
        // 現在の月のデータを再取得
        const [year, month] = selectedMonth.split("-").map(Number);
        await onMonthChange?.(year, month);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "支出の削除に失敗しました",
      });
    } finally {
      setIsDeleting(false);
      setDeletingExpense(null);
    }
  };

  // 編集後の更新処理
  const handleEditSuccess = async () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    await onMonthChange?.(year, month);
  };

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
    const sortedExpenses = sortExpenses(filterExpenses(expenses));

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

  // TableRowコンポーネント
  const renderTableRow = (expense: Expense) => {
    const category = categories.find((c) => c.id === expense.categoryId);
    const subCategory = category?.subCategories.find(
      (s) => s.id === expense.subCategoryId
    );

    const handlePaidChange = async (checked: boolean) => {
      try {
        if (onPaidStatusChange) {
          await onPaidStatusChange(expense.id, checked);
          // ステータス更新後にデータを再取得
          const [year, month] = selectedMonth.split("-").map(Number);
          await onMonthChange?.(year, month);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "支払い状態の更新に失敗しました",
        });
      }
    };

    return (
      <TableRow key={expense.id}>
        <TableCell className="font-medium">
          {new Date(expense.date).toLocaleDateString("ja-JP", {
            month: "2-digit",
            day: "2-digit",
          })}
        </TableCell>
        {viewMode === "date" && <TableCell>{category?.name}</TableCell>}
        <TableCell>{subCategory?.name || "-"}</TableCell>
        <TableCell>{expense.title}</TableCell>
        <TableCell className="text-muted-foreground">
          {expense.memo || "-"}
        </TableCell>
        <TableCell className="px-2">
          ¥{expense.amount.toLocaleString()}
        </TableCell>
        <TableCell>
          <Switch
            checked={expense.paid}
            onCheckedChange={handlePaidChange}
            disabled={loading}
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingExpense(expense)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingExpense(expense)}
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
      <Select
        value={paidFilter}
        onValueChange={(value: PaidFilter) => setPaidFilter(value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="支払い状態" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="paid">支払い済み</SelectItem>
          <SelectItem value="unpaid">未払い</SelectItem>
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
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsBulkRegisterOpen(true)}
      >
        一括登録
      </Button>
    </div>
  );

  return (
    <div>
      {controls}
      {loading ? (
        <ExpenseListSkeleton />
      ) : filterExpenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          この期間の支出データはありません
        </div>
      ) : (
        <>
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
                        <TableHead className="w-24 text-center">
                          支払い
                        </TableHead>
                        <TableHead className="text-right w-24">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupExpenses.map((expense) => renderTableRow(expense))}
                      <TableRow className="bg-muted/50">
                        <TableCell
                          colSpan={viewMode === "date" ? 6 : 5}
                          className="text-right font-medium"
                        >
                          {groupTitle}の合計
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          ¥
                          {groupExpenses
                            .reduce((sum, e) => sum + e.amount, 0)
                            .toLocaleString()}
                        </TableCell>
                        <TableCell />
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )
            )}
          </div>

          {/* 編集ダイアログ */}
          {editingExpense && (
            <EditExpenseDialog
              expense={editingExpense}
              categories={categories}
              isOpen={!!editingExpense}
              onClose={() => setEditingExpense(null)}
              onSuccess={handleEditSuccess}
            />
          )}

          {/* 削除確認ダイアログ */}
          <AlertDialog
            open={!!deletingExpense}
            onOpenChange={(isOpen) => !isOpen && setDeletingExpense(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>支出の削除</AlertDialogTitle>
                <AlertDialogDescription>
                  この支出を削除してもよろしいですか？この操作は取り消せません。
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
      <BulkRegisterDialog
        isOpen={isBulkRegisterOpen}
        onClose={() => setIsBulkRegisterOpen(false)}
      />
    </div>
  );
}
