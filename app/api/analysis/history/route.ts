// app/api/analysis/history/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const { userId, limit = 12 } = await req.json(); // デフォルトで12ヶ月分

    const { data, error } = await supabase
      .from("AnalysisResult")
      .select("*")
      .eq("userId", userId)
      .eq("type", "monthly")
      .order("analysisDate", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("分析履歴取得エラー:", error);
    return NextResponse.json(
      { error: "分析履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}
