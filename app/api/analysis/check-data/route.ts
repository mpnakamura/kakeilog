// app/api/analysis/check-data/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const { userId } = await req.json();

    const { data } = await supabase
      .from("Income")
      .select("date")
      .or(`userId.eq.${userId},userId.eq.${userId}`)
      .order("date", { ascending: true });

    const uniqueMonths = new Set(
      data?.map((item) => new Date(item.date).toISOString().slice(0, 7))
    ).size;

    return NextResponse.json({
      hasEnough: uniqueMonths >= 2,
      months: uniqueMonths,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "データチェックに失敗しました" },
      { status: 500 }
    );
  }
}
