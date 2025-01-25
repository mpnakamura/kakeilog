// components/sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lock, Settings, User, LogOut, Menu, X } from "lucide-react"; // Import additional icons if needed
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: "/dashboard", label: "ダッシュボード", icon: Home },
    {
      href: "/dashboard/reset-password",
      label: "パスワード再設定",
      icon: Lock,
    },
    { href: "/dashboard/settings", label: "設定", icon: Settings },
    { href: "/dashboard/profile", label: "プロフィール", icon: User },
    { href: "/logout", label: "ログアウト", icon: LogOut },
    // 必要に応じてメニューを追加
  ];

  return (
    <>
      {/* モバイル用ハンバーガーメニュー */}
      <div className="md:hidden flex items-center justify-between bg-blue-600 p-4">
        <h1 className="text-white text-xl font-semibold">MyApp</h1>
        <button onClick={toggleSidebar} aria-label="メニューを開く">
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* サイドバー */}
      <aside
        className={`${className} bg-white shadow-lg border-r border-gray-200 fixed md:static inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col z-50`}
      >
        <div className="hidden md:flex items-center justify-center h-16 bg-blue-600">
          <h1 className="text-white text-xl font-semibold">MyApp</h1>
        </div>
        <nav className="mt-10 flex-1 overflow-y-auto">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors ${
                      isActive ? "bg-blue-100 text-blue-600 font-semibold" : ""
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsOpen(false)} // メニュー項目をクリックしたらサイドバーを閉じる
                  >
                    <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
