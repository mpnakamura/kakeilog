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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  subCategoryId?: string;
  memo?: string;
  category?: {
    id: string;
    name: string;
  };
  subCategory?: {
    id: string;
    name: string;
  };
}

interface ExpenseSelectorProps {
  expenses: Expense[];
  sourceMonth: string;
  targetMonth: string;
  onSelectionChange: (selectedExpenses: { [key: string]: Date }) => void;
}

export function ExpenseSelector({
  expenses,
  sourceMonth,
  targetMonth,
  onSelectionChange,
}: ExpenseSelectorProps) {
  // 選択された支出のIDと新しい日付のマップ
  const [selectedExpenses, setSelectedExpenses] = useState<{
    [key: string]: Date;
  }>({});

  // 一括日付選択用の状態
  const [bulkDate, setBulkDate] = useState<Date>();

  // チェックボックスの状態管理
  const handleCheckboxChange = (expenseId: string, checked: boolean) => {
    const newSelectedExpenses = { ...selectedExpenses };
    if (checked) {
      // 新規選択時は対応する月の同じ日付を初期値として設定
      const originalDate = new Date(
        expenses.find((e) => e.id === expenseId)?.date || ""
      );
      const [targetYear, targetMonth] = sourceMonth.split("-").map(Number);
      const newDate = new Date(
        targetYear,
        targetMonth - 1,
        originalDate.getDate()
      );
      newSelectedExpenses[expenseId] = newDate;
    } else {
      delete newSelectedExpenses[expenseId];
    }
    setSelectedExpenses(newSelectedExpenses);
    onSelectionChange(newSelectedExpenses);
  };

  // 一括日付設定
  const handleBulkDateChange = (date: Date | undefined) => {
    if (!date) return;
    setBulkDate(date);
    const newSelectedExpenses = { ...selectedExpenses };
    Object.keys(selectedExpenses).forEach((id) => {
      newSelectedExpenses[id] = date;
    });
    setSelectedExpenses(newSelectedExpenses);
    onSelectionChange(newSelectedExpenses);
  };

  // 個別の日付変更
  const handleDateChange = (expenseId: string, date: Date) => {
    const newSelectedExpenses = {
      ...selectedExpenses,
      [expenseId]: date,
    };
    setSelectedExpenses(newSelectedExpenses);
    onSelectionChange(newSelectedExpenses);
  };

  // 日付選択用のカレンダーポップオーバー
  const DateSelector = ({
    date,
    onChange,
  }: {
    date?: Date;
    onChange: (date: Date) => void;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[180px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: ja }) : "日付を選択"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && onChange(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  // 全選択の状態計算
  const isAllSelected =
    expenses.length > 0 &&
    expenses.every((expense) => selectedExpenses[expense.id]);

  // 一部選択の状態計算
  const isPartiallySelected =
    expenses.some((expense) => selectedExpenses[expense.id]) && !isAllSelected;

  // 全選択/解除の処理
  const handleSelectAll = (checked: boolean) => {
    const newSelectedExpenses = { ...selectedExpenses };
    expenses.forEach((expense) => {
      if (checked) {
        const originalDate = new Date(expense.date);
        const [targetYear, targetMonth] = sourceMonth.split("-").map(Number);
        newSelectedExpenses[expense.id] = new Date(
          targetYear,
          targetMonth - 1,
          originalDate.getDate()
        );
      } else {
        delete newSelectedExpenses[expense.id];
      }
    });
    setSelectedExpenses(newSelectedExpenses);
    onSelectionChange(newSelectedExpenses);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isPartiallySelected}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">全選択</span>
        </div>
        <DateSelector date={bulkDate} onChange={handleBulkDateChange} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-[240px]">コピー先の日付</TableHead>
              <TableHead className="w-[200px]">タイトル</TableHead>
              <TableHead className="w-[150px]">カテゴリ</TableHead>
              <TableHead className="w-[150px]">サブカテゴリ</TableHead>
              <TableHead className="w-[120px] text-right">金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="w-12">
                  <Checkbox
                    checked={!!selectedExpenses[expense.id]}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(expense.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="w-[200px]">
                  {selectedExpenses[expense.id] ? (
                    <DateSelector
                      date={selectedExpenses[expense.id]}
                      onChange={(date) => handleDateChange(expense.id, date)}
                    />
                  ) : (
                    <span className="text-muted-foreground">未選択</span>
                  )}
                </TableCell>
                <TableCell className="w-[200px] truncate">
                  {expense.title}
                </TableCell>
                <TableCell className="w-[150px] truncate">
                  {expense.category?.name}
                </TableCell>
                <TableCell className="w-[150px] truncate">
                  {expense.subCategory?.name || "-"}
                </TableCell>
                <TableCell className="w-[120px] text-right">
                  ¥{expense.amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {Object.keys(selectedExpenses).length}件選択中
        </div>
      </div>
    </div>
  );
}
