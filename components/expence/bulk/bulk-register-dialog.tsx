import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"; // DialogCloseを追加
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ExpenseSelector } from "./bulk-expense-selector";
import {
  bulkCreateExpenses,
  getMonthlyExpensesForBulkRegister,
} from "@/actions/dashboard.action";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface BulkRegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkRegisterDialog({
  isOpen,
  onClose,
}: BulkRegisterDialogProps) {
  const { toast } = useToast();
  const [sourceMonth, setSourceMonth] = useState(getCurrentYearMonth());
  const [targetMonth, setTargetMonth] = useState(getNextMonth());
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<{
    [key: string]: Date;
  }>({});

  // データ取得関数
  const fetchExpenses = async (year: number, month: number) => {
    setLoading(true);
    try {
      const result = await getMonthlyExpensesForBulkRegister(year, month);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
        return;
      }
      setExpenses(result.data || []);
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

  // sourceMonthが変更されたら支出データを取得
  useEffect(() => {
    if (isOpen) {
      const [year, month] = sourceMonth.split("-").map(Number);
      fetchExpenses(year, month);
    }
  }, [sourceMonth, isOpen]);

  // 年月を扱うユーティリティ関数
  function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  function getNextMonth() {
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  // 年月の選択肢を生成（前後1年分）
  function generateMonthOptions() {
    const options = [];
    const now = new Date();

    for (let i = -12; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月`;
      options.push({ value, label });
    }

    return options;
  }

  const monthOptions = generateMonthOptions();

  // 選択状態の変更ハンドラ
  const handleSelectionChange = (selected: { [key: string]: Date }) => {
    setSelectedExpenses(selected);
  };

  const handleBulkRegister = async () => {
    setLoading(true);
    try {
      const bulkData = Object.entries(selectedExpenses).map(
        ([originalId, date]) => ({
          originalId,
          newDate: date.toISOString(),
        })
      );

      const result = await bulkCreateExpenses(bulkData, targetMonth);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
        return;
      }

      if (result.data) {
        toast({
          title: "登録完了",
          description: `${result.data.count}件の支出を${result.data.month}に登録しました`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "登録データが見つかりませんでした",
        });
      }

      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "支出の一括登録に失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          // ダイアログ外をクリックしても閉じないようにする
          return;
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>支出の一括登録</DialogTitle>
          <DialogClose onClick={onClose} /> {/* Xボタンで閉じる */}
        </DialogHeader>

        {/* スクロール可能なメインコンテンツエリア */}
        <div className="space-y-6 flex-1 overflow-y-auto min-h-0 pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 px-1">
              <Label>コピー元の年月</Label>
              <Select value={sourceMonth} onValueChange={setSourceMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="年月を選択" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>コピー先の年月</Label>
              <Select value={targetMonth} onValueChange={setTargetMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="年月を選択" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ExpenseSelector
            expenses={expenses}
            sourceMonth={sourceMonth}
            targetMonth={targetMonth}
            onSelectionChange={handleSelectionChange}
          />
        </div>

        {/* 固定されたボタンエリア */}
        <div className="flex justify-end space-x-2 pt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button
            onClick={handleBulkRegister}
            disabled={Object.keys(selectedExpenses).length === 0 || loading}
          >
            {loading ? "処理中..." : "登録する"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
