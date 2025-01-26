// app/auth/google/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient(); // awaitを追加

  // セッションとユーザー情報の取得
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  console.log("セッション:", session); // セッションの内容をログに出力
  console.log("エラー:", sessionError); // エラーの内容をログに出力

  // セッションが無い場合はリダイレクト
  if (!session) {
    console.log("セッションが存在しません。リダイレクトします。");
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { user } = session;
  if (!user) {
    console.log("ユーザーが存在しません。リダイレクトします。");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Userテーブルに存在するかチェック
  const { data: existingUser, error: selectError } = await supabase
    .from("User")
    .select("*")
    .eq("id", user.id)
    .single();

  console.log("既存ユーザー:", existingUser); // 既存ユーザーの情報をログに出力

  if (!existingUser && !selectError) {
    // Google OAuth で取得できる名前や画像
    const name = user.user_metadata.full_name || null;
    const image = user.user_metadata.picture || null;

    const { error: insertError } = await supabase.from("User").insert([
      {
        id: user.id,
        email: user.email,
        name,
        image,
        emailVerified: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("User insert error:", insertError);
      return NextResponse.redirect(new URL("/error", request.url));
    }
    console.log("新しいユーザーが作成されました:", user.id); // 新しいユーザー作成のログ
  } else if (selectError && selectError.code !== "PGRST116") {
    // レコードが存在しない場合のエラーコードはプロジェクトによる
    console.error("ユーザー選択エラー:", selectError);
    return NextResponse.redirect(new URL("/error", request.url));
  } else {
    console.log("既存ユーザーのプロファイルを更新します:", user.id); // プロファイル更新のログ
    // 必要に応じてユーザー情報を更新
    // 例:
    // await supabase.from("User").update({ name, image }).eq("id", user.id);
  }

  // 最終的にダッシュボードにリダイレクト
  console.log("ダッシュボードにリダイレクトします。");
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
