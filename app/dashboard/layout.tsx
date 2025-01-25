// app/dashboard/layout.tsx

import Sidebar from "@/components/sidebar";

// ↑ sidebar.tsx は、Tailwindなどでサイドバーを作ったコンポーネントを想定

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ルートレイアウトの <body> の中にネストされる
    <div className="flex min-h-screen w-full">
      {/* サイドバー */}
      <Sidebar />

      {/* メインコンテンツ */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
