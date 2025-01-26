// app/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    // セッションの交換
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // ユーザーがUserテーブルに存在するか確認
      const { data: existingUser } = await supabase
        .from("User")
        .select()
        .eq("id", user.id)
        .single();

      if (!existingUser) {
        // Userテーブルにレコードがなければ作成
        const { error: insertError } = await supabase.from("User").insert([
          {
            id: user.id,
            email: user.email,
            name: null,
            emailVerified: user.confirmed_at,
            image: null,
          },
        ]);

        if (insertError) {
          console.error("Callback User Insert Error:", insertError);
        }
      }
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
