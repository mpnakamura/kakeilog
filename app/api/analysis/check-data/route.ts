import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const { userId } = await req.json();

    // 収入と支出のデータを取得
    const [{ data: incomes }, { data: expenses }] = await Promise.all([
      supabase.from("Income").select("date").eq("userId", userId),
      supabase.from("Expense").select("date").eq("userId", userId),
    ]);

    // 月ごとにグループ化（収入と支出を合わせて）
    const allMonths = new Set([
      ...(incomes || []).map((item) =>
        new Date(item.date).toISOString().slice(0, 7)
      ),
      ...(expenses || []).map((item) =>
        new Date(item.date).toISOString().slice(0, 7)
      ),
    ]);

    const monthsCount = allMonths.size;

    // デバッグ情報も含めて返す
    return NextResponse.json({
      hasEnough: monthsCount >= 2,
      months: monthsCount,
      debug: {
        uniqueMonths: Array.from(allMonths),
        incomeCount: incomes?.length || 0,
        expenseCount: expenses?.length || 0,
      },
    });
  } catch (error) {
    console.error("Data check error:", error);
    return NextResponse.json(
      { error: "データチェックに失敗しました" },
      { status: 500 }
    );
  }
}
