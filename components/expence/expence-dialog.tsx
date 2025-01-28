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
import { updateExpense } from "@/actions/actions";

interface EditExpenseDialogProps {
  expense: any;
  categories: any[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditExpenseDialog({
  expense,
  categories,
  isOpen,
  onClose,
  onSuccess,
}: EditExpenseDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    expense.categoryId
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

      const result = await updateExpense(expense.id, formData);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
      } else {
        toast({
          title: "更新完了",
          description: "支出を更新しました",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "支出の更新に失敗しました",
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
          <DialogTitle>支出の編集</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              defaultValue={expense.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">金額</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              defaultValue={expense.amount}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">日付</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={expense.date.substring(0, 10)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">カテゴリー</Label>
            <Select
              name="category"
              defaultValue={expense.categoryId}
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
              defaultValue={expense.subCategoryId || "none"}
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
            <Textarea id="memo" name="memo" defaultValue={expense.memo || ""} />
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
