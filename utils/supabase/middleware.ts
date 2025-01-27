import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // シンプルにResponseを作成
    let response = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set(name, value, options);
          },
          remove(name: string, options: any) {
            response.cookies.set(name, "", options);
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // パブリックルートの定義
    const publicRoutes = [
      "/sign-in",
      "/sign-up",
      "/forgot-password",
      "/auth/callback",
      "/auth/callback/",
      "/auth/setup",
    ];

    const path = request.nextUrl.pathname;
    const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

    // 認証状態に基づくリダイレクト制御
    if (user) {
      // 認証済みユーザーの処理
      const { data: userData } = await supabase
        .from("User")
        .select("name")
        .eq("id", user.id)
        .single();

      const isSetupComplete = !!userData?.name;

      // セットアップ状態のチェック
      if (path === "/auth/setup" && isSetupComplete) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (path === "/dashboard" && !isSetupComplete) {
        return NextResponse.redirect(new URL("/auth/setup", request.url));
      }

      // 認証済みユーザーがパブリックルートにアクセスした場合はダッシュボードへリダイレクト
      if (isPublicRoute && path !== "/auth/setup") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // ルートパスへのアクセスをダッシュボードへリダイレクト
      if (path === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } else {
      // 非認証ユーザーの処理
      // パブリックルート以外へのアクセスはサインインページへリダイレクト
      if (!isPublicRoute) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("next", path);
        return NextResponse.redirect(signInUrl);
      }
    }

    return response;
  } catch (e) {
    console.error(e);
    // エラー発生時のフォールバック
    const path = request.nextUrl.pathname;
    const isPublicRoute = ["/sign-in", "/sign-up", "/forgot-password"].some(
      (route) => path.startsWith(route)
    );

    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
  }
};
