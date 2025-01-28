import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const { userId, limit = 12 } = await req.json();

    const { data, error } = await supabase
      .from("AnalysisResult")
      .select("*")
      .eq("userId", userId)
      .eq("type", "monthly")
      .not("insights", "is", null) // nullのinsightsを除外
      .order("analysisDate", { ascending: false })
      .limit(limit);

    if (error) throw error;

    // 空オブジェクトや必要なプロパティがないデータを除外
    const validData = data?.filter((item) => {
      if (!item.insights) return false;

      const insights = item.insights;
      return (
        insights.trends?.length > 0 &&
        insights.comparisons?.income &&
        insights.comparisons?.expense &&
        insights.suggestions?.length > 0
      );
    });

    return NextResponse.json({ data: validData });
  } catch (error) {
    console.error("分析履歴取得エラー:", error);
    return NextResponse.json(
      { error: "分析履歴の取得に失敗しました" },
      { status: 500 }
    );
  }
}
