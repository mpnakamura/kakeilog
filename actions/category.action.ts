"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function getCategories(type: "income" | "expense") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("ユーザーが認証されていません");
    return { error: "認証されていません" };
  }

  // カテゴリとサブカテゴリを別々に取得
  const categoriesPromise = supabase
    .from("Category")
    .select("*")
    .eq("type", type);

  const subCategoriesPromise = supabase
    .from("SubCategory")
    .select("*")
    .eq("userId", user.id);

  // 並列で実行
  const [categoriesResult, subCategoriesResult] = await Promise.all([
    categoriesPromise,
    subCategoriesPromise,
  ]);

  if (categoriesResult.error) {
    console.error("カテゴリ取得エラー:", categoriesResult.error);
    return { error: categoriesResult.error.message };
  }

  if (subCategoriesResult.error) {
    console.error("サブカテゴリ取得エラー:", subCategoriesResult.error);
    return { error: subCategoriesResult.error.message };
  }

  // カテゴリとサブカテゴリを結合
  const categoriesWithSubs = categoriesResult.data.map((category) => ({
    ...category,
    subCategories: subCategoriesResult.data.filter(
      (sub) => sub.categoryId === category.id
    ),
  }));

  return { data: categoriesWithSubs };
}

export async function addSubCategory(categoryId: string, name: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("ユーザーが認証されていません");
    return { error: "認証されていません" };
  }

  const { data, error } = await supabase
    .from("SubCategory")
    .insert([
      {
        id: uuidv4(),
        name,
        categoryId,
        userId: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("サブカテゴリ追加エラー:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/expense");
  return { data };
}
