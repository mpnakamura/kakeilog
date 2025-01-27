// income-dialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateIncome } from "@/actions/actions"; // updateIncome をインポート

interface EditIncomeDialogProps {
  income: any; // 収入データ
  categories: any[]; // カテゴリーデータ
  isOpen: boolean; // ダイアログの開閉状態
  onClose: () => void; // ダイアログを閉じる関数
  onSuccess: () => void; // 更新成功時のコールバック
}

export function EditIncomeDialog({
  income,
  categories,
  isOpen,
  onClose,
  onSuccess,
}: EditIncomeDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    income.categoryId
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      // サブカテゴリーが "none" の場合は null を設定
      if (formData.get("subCategory") === "none") {
        formData.set("subCategory", "");
      }

      // updateIncome を呼び出して収入データを更新
      const result = await updateIncome(income.id, formData);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
      } else {
        toast({
          title: "更新完了",
          description: "収入を更新しました",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "収入の更新に失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const subCategories = selectedCategory?.subCategories || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>収入の編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              defaultValue={income.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">金額</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              defaultValue={income.amount}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={income.date.substring(0, 10)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">カテゴリー</Label>
            <Select
              name="category"
              defaultValue={income.categoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="カテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subCategory">サブカテゴリー</Label>
            <Select
              name="subCategory"
              defaultValue={income.subCategoryId || "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder="サブカテゴリーを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">なし</SelectItem>
                {subCategories.map((subCategory: any) => (
                  <SelectItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Textarea id="memo" name="memo" defaultValue={income.memo || ""} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "更新中..." : "更新"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
