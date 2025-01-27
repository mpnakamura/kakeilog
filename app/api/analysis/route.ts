// app/api/analysis/route.ts
import { NextResponse } from "next/server";
import { format, subMonths } from "date-fns";
import { Expense, Income } from "@/types/dashboard";
import { createClient } from "@/utils/supabase/server";

// 型定義
type ProcessedData = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

type AnalysisResult = {
  trends: string[];
  comparisons: {
    income: { current: number; previous: number; diff: number };
    expense: { current: number; previous: number; diff: number };
  };
  suggestions: string[];
};

// Supabaseクライアント初期化

const requestCounts = new Map<string, { count: number; lastReset: number }>();

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const WINDOW_MS = 60 * 1000; // 1分間
  const MAX_REQUESTS = 5; // 最大5リクエスト

  const record = requestCounts.get(identifier) || { count: 0, lastReset: now };

  if (now - record.lastReset > WINDOW_MS) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count++;
  requestCounts.set(identifier, record);

  return record.count <= MAX_REQUESTS;
};

// 日付計算関数
const getStartDate = (months: number): string => {
  return subMonths(new Date(), months).toISOString();
};

// 前処理関数
const preprocessData = (
  incomes: Income[],
  expenses: Expense[]
): ProcessedData[] => {
  const monthlyData: Record<string, { income: number; expense: number }> = {};

  const processItem = (item: Income | Expense) => {
    const date = new Date(item.date);
    const month = format(date, "yyyy-MM");
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }

    if ("categoryId" in item && item.categoryId === "income") {
      monthlyData[month].income += item.amount;
    } else {
      monthlyData[month].expense += item.amount;
    }
  };

  incomes.forEach(processItem);
  expenses.forEach(processItem);

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data,
      balance: data.income - data.expense,
    }));
};

// AI分析関数
const fetchAIAnalysis = async (
  data: ProcessedData[]
): Promise<AnalysisResult> => {
  const latestData = data.slice(-2);
  const promptData = {
    currentMonth: latestData[1] || latestData[0],
    previousMonth: latestData[0],
  };

  const prompt = {
    messages: [
      {
        role: "system",
        content:
          "家計簿データを分析し、以下のJSON形式で回答してください。数値は全て円単位、差分は百分率で計算してください。",
      },
      {
        role: "user",
        content: `分析データ:\n${JSON.stringify(promptData, null, 2)}`,
      },
    ],
    model: "deepseek-chat",
    temperature: 0.5,
    response_format: { type: "json_object" },
  };

  const response = await fetch(process.env.DEEPSEEK_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(prompt),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DeepSeek API Error: ${error.message}`);
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
};

export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    // レートリミット
    const identifier = req.headers.get("x-user-id") || "anonymous";
    const isAllowed = checkRateLimit(identifier);

    if (!isAllowed) {
      return new Response("Too many requests", { status: 429 });
    }

    const { userId, months = 3 } = await req.json();

    // データ取得
    const [{ data: incomes }, { data: expenses }] = await Promise.all([
      supabase
        .from("Income")
        .select("*")
        .eq("userId", userId)
        .gte("date", getStartDate(months)),
      supabase
        .from("Expense")
        .select("*")
        .eq("userId", userId)
        .gte("date", getStartDate(months)),
    ]);

    if (!incomes || !expenses) {
      throw new Error("データの取得に失敗しました");
    }

    // 前処理
    const processedData = preprocessData(incomes, expenses);

    if (processedData.length < 2) {
      return NextResponse.json(
        { error: "分析には最低2ヶ月分のデータが必要です" },
        { status: 400 }
      );
    }

    // AI分析
    const aiResponse = await fetchAIAnalysis(processedData);

    // 結果保存
    const { error } = await supabase.from("AnalysisResult").insert([
      {
        userId,
        insights: aiResponse,
        type: "monthly",
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ data: aiResponse });
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "分析処理に失敗しました" },
      { status: 500 }
    );
  }
}
