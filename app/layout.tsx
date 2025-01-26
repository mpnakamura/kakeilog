// app/layout.tsx
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import Sidebar from "@/components/sidebar";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="jp" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        {/* 
          画面全体 (親要素) の設定
          h-screen: ブラウザの高さを100%使用
          overflow-hidden: 子要素側でオーバーフローを制御するため
        */}
        <div className="flex h-screen overflow-hidden">
          {/* サイドバー（ユーザーがログインしていれば表示） */}
          {user && (
            <div
              className="w-64 shrink-0 h-full overflow-y-auto
                         border-r border-r-foreground/10"
            >
              <Sidebar />
            </div>
          )}

          {/* メインコンテンツ用のラッパ */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* 
              ヘッダーを固定表示にする: sticky top-0 
              z-10 は重なり順制御用
              bg-background は下のコンテンツが透けないように背景をつける
            */}
            <nav className="sticky top-0 z-10 bg-background h-16 p-4 flex justify-end shrink-0">
              {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
            </nav>

            {/* スクロールが起こるメイン領域 */}
            <div className="flex-1 overflow-y-auto">
              <main className={`p-10 ${!user && "flex justify-center"}`}>
                {children}
                <Toaster />
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
