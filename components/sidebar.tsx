"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Lock, Settings, LogOut, Wallet, Banknote } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "ダッシュボード", icon: Home },
    { href: "/dashboard/expenditure", label: "支出登録", icon: Banknote },
    { href: "/dashboard/income", label: "収入登録", icon: Wallet },
    {
      href: "/dashboard/reset-password",
      label: "パスワード再設定",
      icon: Lock,
    },
    { href: "/dashboard/settings", label: "設定", icon: Settings },
    { href: "/logout", label: "ログアウト", icon: LogOut },
  ];

  return (
    <aside
      className={`${className} bg-white h-screen border-r border-gray-200`}
    >
      <div className="flex items-center justify-center h-16 border-b bg-white">
        <h1 className="text-blue-600 text-xl font-semibold">家計簿</h1>
      </div>
      <nav className="mt-10">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors ${
                    isActive ? "bg-blue-100 text-blue-600 font-semibold" : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
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
  );
}
