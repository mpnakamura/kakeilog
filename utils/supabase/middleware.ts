import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // 現在のユーザー情報を取得
    const user = await supabase.auth.getUser();

    // パブリックルートの定義
    // ここに /auth/callback や /auth/google/callback を加える
    const publicRoutes = [
      "/sign-in",
      "/sign-up",
      "/forgot-password",
      "/auth/callback/*", // ← ここを追加
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    // 非認証ユーザーはパブリックルート以外にアクセスできない
    if (!isPublicRoute && user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // 認証済みユーザーがルート"/"にアクセスした場合はダッシュボードへ
    if (request.nextUrl.pathname === "/" && !user.error) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
