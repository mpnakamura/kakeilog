"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";
import { addSubCategory } from "@/actions/category.action";

interface Category {
  id: string;
  name: string;
  type: string;
  subCategories: { id: string; name: string }[];
}

interface CategoryManagementProps {
  categories: Category[];
}

export function CategoryManagement({ categories }: CategoryManagementProps) {
  const [newSubCategory, setNewSubCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddSubCategory = async () => {
    if (!selectedCategory || !newSubCategory) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "カテゴリーとサブカテゴリー名を入力してください",
      });
      return;
    }

    const result = await addSubCategory(selectedCategory, newSubCategory);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: result.error,
      });
    } else {
      toast({
        title: "成功",
        description: "サブカテゴリーを追加しました",
      });
      setNewSubCategory("");
      setSelectedCategory(null);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          カテゴリー管理
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>カテゴリー管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{category.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  サブカテゴリー追加
                </Button>
              </div>

              {category.subCategories.length > 0 && (
                <div className="pl-4 space-y-1">
                  {category.subCategories.map((sub) => (
                    <div key={sub.id} className="text-sm text-muted-foreground">
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedCategory && (
          <div className="flex gap-2 mt-4">
            <Input
              value={newSubCategory}
              onChange={(e) => setNewSubCategory(e.target.value)}
              placeholder="新しいサブカテゴリー"
            />
            <Button onClick={handleAddSubCategory}>追加</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
