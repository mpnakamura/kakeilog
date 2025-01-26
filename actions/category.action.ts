"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function getCategories(type: "income" | "expense") {
  const supabase = await createClient();

  // ユーザー取得
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("ユーザーが認証されていません");
    return { error: "認証されていません" };
  }

  const { data, error } = await supabase
    .from("Category")
    .select(`id, name, type, subCategories(*)`)
    // Category は global なので type だけ絞る
    .eq("type", type);

  if (error) {
    console.error("カテゴリ取得エラー:", error.message);
    return { error: error.message };
  }

  // ここでサブカテゴリをユーザーIDでフィルタする
  const filtered =
    data?.map((cat) => ({
      ...cat,
      subCategories:
        cat.subCategories?.filter((sub) => sub.userId === user.id) || [],
    })) || [];

  console.log("フィルタリングされたカテゴリ:", filtered);
  return { data: filtered };
}

export async function addSubCategory(categoryId: string, name: string) {
  const supabase = await createClient();

  // ユーザー認証チェック
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
        userId: user.id, // <-- ここを追加
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("サブカテゴリ追加エラー:", error.message);
    return { error: error.message };
  }

  console.log("追加されたサブカテゴリ:", data);
  revalidatePath("/dashboard/income");
  revalidatePath("/dashboard/expense");
  return { data };
}
