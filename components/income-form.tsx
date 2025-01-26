"use client";

import { useState } from "react";
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

interface Category {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

interface IncomeFormProps {
  categories: Category[];
}

export default function IncomeForm({ categories }: IncomeFormProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const category = categories.find((cat) => cat.id === value);
    console.log("Selected category:", category);
    console.log("Available subcategories:", category?.subCategories);
  };

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
      setSelectedCategory(null);
    }
  }

  return (
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
          min={0}
        />
      </div>

      <div>
        <Label htmlFor="date">日付</Label>
        <Input type="date" id="date" name="date" required />
      </div>

      <div>
        <Label htmlFor="category">カテゴリ</Label>
        <Select name="category" required onValueChange={handleCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="カテゴリを選択" />
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

      {selectedCategory &&
        categories.find((cat) => cat.id === selectedCategory)?.subCategories
          ?.length > 0 && (
          <div>
            <Label htmlFor="subCategory">サブカテゴリ（任意）</Label>
            <Select name="subCategory">
              <SelectTrigger id="subCategory">
                <SelectValue placeholder="サブカテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .find((cat) => cat.id === selectedCategory)
                  ?.subCategories?.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

      <div>
        <Label htmlFor="memo">メモ</Label>
        <Textarea id="memo" name="memo" placeholder="備考" />
      </div>

      <Button type="submit" className="w-full">
        登録する
      </Button>
    </form>
  );
}
