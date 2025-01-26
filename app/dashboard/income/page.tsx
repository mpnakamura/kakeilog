"use client";
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
import { createIncome } from "@/app/actions";

export default function IncomePage() {
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    const result = await createIncome(formData);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: result.error,
      });
    } else {
      toast({
        title: "成功",
        description: "収入を登録しました",
      });
      // フォームをリセット
      (document.getElementById("income-form") as HTMLFormElement).reset();
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">収入登録</h1>

      <form id="income-form" action={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" name="title" placeholder="1月分給与など" required />
        </div>

        <div>
          <Label htmlFor="amount">金額</Label>
          <Input
            type="number"
            id="amount"
            name="amount"
            placeholder="¥"
            required
          />
        </div>

        <div>
          <Label htmlFor="date">日付</Label>
          <Input type="date" id="date" name="date" required />
        </div>

        <div>
          <Label htmlFor="category">カテゴリ</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salary">給与</SelectItem>
              <SelectItem value="bonus">賞与</SelectItem>
              <SelectItem value="business_income">事業収入</SelectItem>
              <SelectItem value="side_job">副業</SelectItem>
              <SelectItem value="other">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="memo">メモ</Label>
          <Textarea id="memo" name="memo" placeholder="備考" />
        </div>

        <Button type="submit" className="w-full">
          登録する
        </Button>
      </form>
    </div>
  );
}
