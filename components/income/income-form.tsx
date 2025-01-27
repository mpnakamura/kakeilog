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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { createIncome } from "@/actions/actions";
import { Card } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  subCategories: { id: string; name: string }[];
}

interface IncomeFormProps {
  categories: Category[];
  onSuccess?: (newIncome: any) => void;
}

export default function IncomeForm({ categories, onSuccess }: IncomeFormProps) {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const quickCategories = categories;

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
      if (onSuccess) {
        onSuccess(result.data);
      }
      (document.getElementById("income-form") as HTMLFormElement).reset();
      setSelectedCategory(null);
      setIsOpen(false);
    }
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-4">
        <div className="flex whitespace-nowrap gap-2">
          {quickCategories.map((category) => (
            <Popover
              key={category.id}
              open={isOpen && selectedCategory === category.id}
              onOpenChange={(open) => {
                setIsOpen(open);
                if (open) setSelectedCategory(category.id);
              }}
            >
              <PopoverTrigger asChild>
                <Card className="p-2 cursor-pointer hover:bg-accent shrink-0">
                  <p className="text-center px-2 text-sm font-semibold">
                    {category.name}
                  </p>
                </Card>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <form
                  id="income-form"
                  action={handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">金額</Label>
                      <Input
                        type="number"
                        id="amount"
                        name="amount"
                        placeholder="¥"
                        required
                        min={0}
                        className="text-xl"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">日付</Label>
                      <Input
                        type="date"
                        id="date"
                        name="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">タイトル</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="収入の内容"
                      required
                    />
                  </div>

                  <input type="hidden" name="category" value={category.id} />

                  {category.subCategories.length > 0 && (
                    <div>
                      <Label htmlFor="subCategory">サブカテゴリ</Label>
                      <Select name="subCategory">
                        <SelectTrigger id="subCategory">
                          <SelectValue placeholder="サブカテゴリを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {category.subCategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="memo">メモ（任意）</Label>
                    <Textarea id="memo" name="memo" placeholder="備考" />
                  </div>

                  <Button type="submit" className="w-full">
                    登録する
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </div>
    </div>
  );
}
