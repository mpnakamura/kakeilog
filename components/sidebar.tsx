"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Lock,
  Settings,
  LogOut,
  Wallet,
  Banknote,
  Brain,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "ダッシュボード", icon: Home },
    { href: "/dashboard/expence", label: "支出登録", icon: Banknote },
    { href: "/dashboard/income", label: "収入登録", icon: Wallet },
    { href: "/dashboard/analysis", label: "AI分析", icon: Brain },
    { href: "/dashboard/settings", label: "設定", icon: Settings },
  ];

  return (
    <aside
      className={`${className} bg-white h-screen border-r border-gray-200`}
    >
      <div className="flex items-center justify-center h-20  bg-white">
        <Link href="/dashboard">
          <Image
            src="/img/logo.png"
            alt="Logo"
            width={200}
            height={60}
            className="object-contain"
            priority
          />
        </Link>
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
                  className={`flex items-center px-4 py-3 text-black hover:bg-gray-100 rounded-lg transition-colors ${
                    isActive ? "bg-gray-200 font-semibold" : ""
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
