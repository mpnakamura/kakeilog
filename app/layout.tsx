// app/dashboard/layout.tsx または RootLayout.tsx

import Sidebar from "@/components/sidebar";
import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="jp" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        {/* フレックスコンテナを横方向に設定 */}
        <div className="flex min-h-screen">
          {/* サイドバーをフレックスコンテナの最初の子として配置 */}
          <Sidebar className="w-64" /> {/* 必要に応じて幅を調整 */}
          {/* メインコンテンツ */}
          <div className="flex-1 flex flex-col">
            {/* ナビゲーションバー */}
            <nav className="w-full flex justify-end border-b border-b-foreground/10 h-16 p-4">
              {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
            </nav>

            {/* コンテンツ */}
            <main className="flex-1 p-6">{children}</main>

            {/* フッター */}
          </div>
        </div>
      </body>
    </html>
  );
}
