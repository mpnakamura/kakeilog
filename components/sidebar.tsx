"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-100 border-r border-gray-300 p-4">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={`block px-4 py-2 rounded ${
                pathname === "/dashboard" ? "bg-gray-200 font-bold" : ""
              }`}
            >
              ダッシュボード
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/reset-password"
              className={`block px-4 py-2 rounded ${
                pathname === "/dashboard/reset-password"
                  ? "bg-gray-200 font-bold"
                  : ""
              }`}
            >
              パスワード再設定
            </Link>
          </li>
          {/* 必要に応じてメニューを追加 */}
        </ul>
      </nav>
    </aside>
  );
}
