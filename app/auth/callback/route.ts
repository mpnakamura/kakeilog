import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const supabase = await createClient();

  try {
    if (!code) {
      return NextResponse.redirect(new URL("/sign-in", requestUrl.origin));
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return NextResponse.redirect(
        new URL("/sign-in?error=auth_failed", requestUrl.origin)
      );
    }

    // ユーザーが既に設定済みかチェック
    const { data: existingUser } = await supabase
      .from("User")
      .select()
      .eq("id", data.user.id)
      .single();

    if (existingUser?.name) {
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
    }

    // 未設定の場合はセットアップページへ
    return NextResponse.redirect(new URL("/auth/setup", requestUrl.origin));
  } catch (e) {
    console.error("Callback error:", e);
    return NextResponse.redirect(
      new URL("/sign-in?error=server_error", requestUrl.origin)
    );
  }
}
