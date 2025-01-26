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

    // setupページの制御
    if (user) {
      const { data: userData } = await supabase
        .from("User")
        .select("name")
        .eq("id", user.id)
        .single();

      const isSetupComplete = !!userData?.name;

      if (path === "/auth/setup" && isSetupComplete) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (path === "/dashboard" && !isSetupComplete) {
        return NextResponse.redirect(new URL("/auth/setup", request.url));
      }
    }

    // 非認証ユーザーはパブリックルート以外にアクセスできない
    if (!isPublicRoute && !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // 認証済みユーザーがルートにアクセスした場合はダッシュボードへ
    if (path === "/" && user) {
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
