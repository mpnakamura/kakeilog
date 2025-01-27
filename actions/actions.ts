"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export const fetchUserData = async () => {
  const supabase = await createClient();

  // 現在のセッションからユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null };
  }

  // `users` テーブルから追加情報を取得
  const { data: userData, error } = await supabase
    .from("User") // テーブル名を確認（通常は小文字の複数形）
    .select("name, image")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user data:", error);
    return { user: null, error: error.message };
  }

  return { user, userData };
};

export const fetchUserAllData = async () => {
  const supabase = await createClient();

  // 現在のセッションからユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null };
  }

  // `users` テーブルから追加情報を取得
  const { data: userData, error } = await supabase
    .from("User") // テーブル名を確認（通常は小文字の複数形）
    .select("name, email, image")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user data:", error);
    return { user: null, error: error.message };
  }

  return { user, userData };
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required"
    );
  }

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (authError) {
    return encodedRedirect("error", "/sign-up", authError.message);
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "アカウントを作成しました。メールの確認をお願いします。"
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  if (authData.user) {
    // Userテーブルにレコードが存在するか確認
    const { data: existingUser, error: checkError } = await supabase
      .from("User")
      .select()
      .eq("id", authData.user.id)
      .single();

    if (checkError || !existingUser) {
      // ユーザーレコードが存在しない場合は作成
      const { error: createError } = await supabase.from("User").insert([
        {
          id: authData.user.id,
          email: authData.user.email,
          name: null,
          emailVerified: authData.user.email_confirmed_at,
          image: null,
        },
      ]);

      if (createError) {
        console.error("User creation error:", createError);
        return encodedRedirect(
          "error",
          "/sign-in",
          "ユーザー情報の作成に失敗しました"
        );
      }
    }
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/dashboard/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/dashboard/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export async function createIncome(formData: FormData) {
  const supabase = await createClient();

  try {
    // ユーザー取得とログ
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return { error: "認証エラーが発生しました" };
    }

    if (!user) {
      console.error("No user found");
      return { error: "認証されていません" };
    }

    // FormDataの値を取得とログ
    const rawAmount = formData.get("amount");
    const rawDate = formData.get("date");
    const rawTitle = formData.get("title");
    const rawCategoryId = formData.get("category");

    // バリデーション
    if (!rawTitle || !rawAmount || !rawDate || !rawCategoryId) {
      console.error("Validation failed:", {
        title: !rawTitle,
        amount: !rawAmount,
        date: !rawDate,
        categoryId: !rawCategoryId,
      });
      return { error: "必須項目が入力されていません" };
    }

    const income = {
      id: uuidv4(),
      userId: user.id,
      title: rawTitle as string,
      amount: parseInt(rawAmount as string),
      date: new Date(rawDate as string).toISOString(),
      categoryId: rawCategoryId as string,
      subCategoryId: (formData.get("subCategory") as string) || null,
      memo: (formData.get("memo") as string) || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("Income")
      .insert([income])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return { error: error.message };
    }

    revalidatePath("/dashboard/income"); // パスを修正
    return { data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "予期せぬエラーが発生しました" };
  }
}

// app/actions.ts
export async function getRecentExpenses() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証されていません" };
  }

  const { data, error } = await supabase
    .from("Expense")
    .select("*")
    .eq("userId", user.id)
    .order("date", { ascending: false })
    .limit(50); // 最近の50件を取得

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証されていません" };
  }

  // 削除前に該当の支出が現在のユーザーのものか確認
  const { data: expense, error: fetchError } = await supabase
    .from("Expense")
    .select("userId")
    .eq("id", expenseId)
    .single();

  if (fetchError) {
    return { error: "支出データの取得に失敗しました" };
  }

  if (expense.userId !== user.id) {
    return { error: "権限がありません" };
  }

  const { error } = await supabase.from("Expense").delete().eq("id", expenseId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expense");
  return { success: true };
}

export async function updateExpense(expenseId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証されていません" };
  }

  // 更新前に該当の支出が現在のユーザーのものか確認
  const { data: existingExpense, error: fetchError } = await supabase
    .from("Expense")
    .select("userId")
    .eq("id", expenseId)
    .single();

  if (fetchError || !existingExpense) {
    return { error: "支出データの取得に失敗しました" };
  }

  if (existingExpense.userId !== user.id) {
    return { error: "権限がありません" };
  }

  // FormDataの値を取得
  const rawAmount = formData.get("amount");
  const rawDate = formData.get("date");
  const rawTitle = formData.get("title");
  const rawCategoryId = formData.get("category");

  // バリデーション
  if (!rawTitle || !rawAmount || !rawDate || !rawCategoryId) {
    return { error: "必須項目が入力されていません" };
  }

  const updatedExpense = {
    title: rawTitle as string,
    amount: parseInt(rawAmount as string),
    date: new Date(rawDate as string).toISOString(),
    categoryId: rawCategoryId as string,
    subCategoryId: (formData.get("subCategory") as string) || null,
    memo: (formData.get("memo") as string) || null,
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("Expense")
    .update(updatedExpense)
    .eq("id", expenseId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expense");
  return { data };
}

export async function getMonthlyIncomes(year: number, month: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証されていません" };
  }

  // 指定された年月の開始日と終了日を計算
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0).toISOString();

  const { data, error } = await supabase
    .from("Income")
    .select(
      `
      *,
      category:Category(id, name),
      subCategory:SubCategory(id, name)
    `
    )
    .eq("userId", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    console.error("収入データ取得エラー:", error);
    return { error: error.message };
  }

  return { data };
}

// 既存の最近の収入取得関数
export async function getRecentIncomes() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証されていません" };
  }

  const { data, error } = await supabase
    .from("Income")
    .select(
      `
      *,
      category:Category(id, name),
      subCategory:SubCategory(id, name)
    `
    )
    .eq("userId", user.id)
    .order("date", { ascending: false })
    .limit(50);

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function getMonthlyExpenses(year: number, month: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証されていません" };
  }

  // 指定された年月の開始日と終了日を計算
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0).toISOString();

  const { data, error } = await supabase
    .from("Expense")
    .select("*")
    .eq("userId", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    console.error("支出データ取得エラー:", error);
    return { error: error.message };
  }

  return { data };
}

export async function createExpense(formData: FormData) {
  const supabase = await createClient();

  // ユーザー取得
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("認証されていません");
    return { error: "認証されていません" };
  }

  // ユーザーがデータベースに存在するか確認
  const { data: dbUser, error: userError } = await supabase
    .from("User")
    .select("id")
    .eq("id", user.id)
    .single();

  if (userError || !dbUser) {
    console.error("ユーザーが見つかりません");
    return { error: "ユーザーが見つかりません" };
  }

  // FormDataからの値を型安全に取得
  const rawAmount = formData.get("amount");
  const rawDate = formData.get("date");
  const rawTitle = formData.get("title");
  const rawCategoryId = formData.get("category");

  // バリデーション
  if (!rawTitle || !rawAmount || !rawDate || !rawCategoryId) {
    console.error("必須項目が入力されていません");
    return { error: "必須項目が入力されていません" };
  }

  const expense = {
    id: uuidv4(),
    userId: user.id,
    title: rawTitle as string,
    amount: parseInt(rawAmount as string),
    date: new Date(rawDate as string).toISOString(),
    categoryId: rawCategoryId as string,
    subCategoryId: (formData.get("subCategory") as string) || null,
    memo: (formData.get("memo") as string) || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("Expense")
    .insert([expense])
    .select()
    .single();

  if (error) {
    console.error(error.message);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expense");

  return { data };
}

export async function updateIncome(incomeId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証されていません" };
  }

  // 更新前に該当の収入が現在のユーザーのものか確認
  const { data: existingIncome, error: fetchError } = await supabase
    .from("Income")
    .select("userId")
    .eq("id", incomeId)
    .single();

  if (fetchError || !existingIncome) {
    return { error: "収入データの取得に失敗しました" };
  }

  if (existingIncome.userId !== user.id) {
    return { error: "権限がありません" };
  }

  // FormDataの値を取得
  const rawAmount = formData.get("amount");
  const rawDate = formData.get("date");
  const rawTitle = formData.get("title");
  const rawCategoryId = formData.get("category");

  // バリデーション
  if (!rawTitle || !rawAmount || !rawDate || !rawCategoryId) {
    return { error: "必須項目が入力されていません" };
  }

  const updatedIncome = {
    title: rawTitle as string,
    amount: parseInt(rawAmount as string),
    date: new Date(rawDate as string).toISOString(),
    categoryId: rawCategoryId as string,
    subCategoryId: (formData.get("subCategory") as string) || null,
    memo: (formData.get("memo") as string) || null,
    updatedAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("Income")
    .update(updatedIncome)
    .eq("id", incomeId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  return { data };
}

export async function deleteIncome(incomeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "認証されていません" };
  }

  // 削除前に該当の収入が現在のユーザーのものか確認
  const { data: income, error: fetchError } = await supabase
    .from("Income")
    .select("userId")
    .eq("id", incomeId)
    .single();

  if (fetchError) {
    return { error: "収入データの取得に失敗しました" };
  }

  if (income.userId !== user.id) {
    return { error: "権限がありません" };
  }

  const { error } = await supabase.from("Income").delete().eq("id", incomeId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/income");
  return { success: true };
}
