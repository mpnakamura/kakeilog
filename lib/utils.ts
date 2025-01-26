import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// lib/utils.ts

/**
 * 数値を日本円形式にフォーマットする
 * @param amount 数値
 * @returns ¥マーク付きの3桁区切りの文字列
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// lib/utils.ts

/**
 * 現在の年月を'YYYY-MM'形式で取得する
 * @returns YYYY-MM形式の文字列
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// lib/utils.ts
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // 日本の日付フォーマット（年/月/日）
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    // hour: '2-digit',
    // minute: '2-digit'
  });
}

// 時間も含める場合のオプション
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
