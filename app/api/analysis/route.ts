import { NextResponse } from "next/server";
import { format, subMonths } from "date-fns";
import { Expense, Income } from "@/types/dashboard";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { AnalysisResult } from "@/types/analysis";

// 型定義
type ProcessedData = {
  month: string;
  income: number;
  expense: number;
  balance: number;
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
        content: `家計簿データを分析し、以下の形式のJSONで回答してください:
{
  "trends": [
    "収支に関する主要なトレンドを説明する文章",
    "2つ目のトレンド（オプション）",
    "3つ目のトレンド（オプション）"
  ],
  "comparisons": {
    "income": {
      "current": 現在月の収入額（数値）,
      "previous": 前月の収入額（数値）,
      "diff": 前月比の変化率（パーセント、小数点以下1桁）
    },
    "expense": {
      "current": 現在月の支出額（数値）,
      "previous": 前月の支出額（数値）,
      "diff": 前月比の変化率（パーセント、小数点以下1桁）
    }
  },
  "suggestions": [
    {
      "title": "提案1のタイトル（例：支出の見直し）",
      "content": "提案1の具体的な内容と理由（例：先月と比べて食費が20%増加しています...）"
    },
    {
      "title": "提案2のタイトル",
      "content": "提案2の具体的な内容"
    },
    {
      "title": "提案3のタイトル",
      "content": "提案3の具体的な内容"
    }
  ]
}

要件：
- 数値は全て円単位で表示
- 変化率は百分率で小数点以下1桁まで計算
- trendsには必ず1つ以上の文章を含める
- suggestionsは必ずtitleとcontentのペアで提供
- titleは簡潔に（30文字以内）
- contentには具体的な説明や数値を含める
- 分析は日本語で提供`,
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

  try {
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
    const analysisResult = JSON.parse(result.choices[0].message.content);

    // レスポンスの検証と必要に応じた補完
    const validatedResult: AnalysisResult = {
      trends: Array.isArray(analysisResult.trends)
        ? analysisResult.trends
        : ["データ分析中"],
      comparisons: {
        income: {
          current: Number(analysisResult.comparisons?.income?.current) || 0,
          previous: Number(analysisResult.comparisons?.income?.previous) || 0,
          diff: Number(analysisResult.comparisons?.income?.diff) || 0,
        },
        expense: {
          current: Number(analysisResult.comparisons?.expense?.current) || 0,
          previous: Number(analysisResult.comparisons?.expense?.previous) || 0,
          diff: Number(analysisResult.comparisons?.expense?.diff) || 0,
        },
      },
      suggestions: Array.isArray(analysisResult.suggestions)
        ? analysisResult.suggestions.map((suggestion: any) => ({
            title: suggestion.title || "改善提案",
            content: suggestion.content || suggestion.toString(),
          }))
        : [
            {
              title: "定期的な見直し",
              content: "支出を定期的に見直すことをお勧めします",
            },
          ],
    };

    return validatedResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // エラー時のフォールバック
    return {
      trends: ["データの分析中にエラーが発生しました"],
      comparisons: {
        income: {
          current: promptData.currentMonth.income,
          previous: promptData.previousMonth.income,
          diff: 0,
        },
        expense: {
          current: promptData.currentMonth.expense,
          previous: promptData.previousMonth.expense,
          diff: 0,
        },
      },
      suggestions: [
        {
          title: "一時的なエラー",
          content:
            "データ分析に問題が発生しました。しばらく時間をおいて再度お試しください",
        },
      ],
    };
  }
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
        id: uuidv4(),
        userId,
        insights: aiResponse,
        type: "monthly",
        analysisDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
