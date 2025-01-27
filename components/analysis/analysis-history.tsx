// components/analysis/analysis-history.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface AnalysisHistoryItem {
  id: string;
  analysisDate: string;
  insights: {
    trends: string[];
    comparisons: {
      income: { current: number; previous: number; diff: number };
      expense: { current: number; previous: number; diff: number };
    };
    suggestions: { title: string; content: string }[];
  };
}

export default function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisHistoryItem | null>(null);
  const supabase = createClient();

  const fetchHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch("/api/analysis/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error("履歴の取得に失敗しました");

      const { data } = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">分析履歴</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>分析日</TableHead>
            <TableHead>収入前月比</TableHead>
            <TableHead>支出前月比</TableHead>
            <TableHead>主要トレンド</TableHead>
            <TableHead>詳細</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {format(new Date(item.analysisDate), "yyyy年MM月dd日", {
                  locale: ja,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {item.insights.comparisons.income.diff > 0 ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span>
                    {Math.abs(item.insights.comparisons.income.diff)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {item.insights.comparisons.expense.diff > 0 ? (
                    <ArrowUpIcon className="w-4 h-4 text-red-500" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-green-500" />
                  )}
                  <span>
                    {Math.abs(item.insights.comparisons.expense.diff)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {item.insights.trends[0]}
              </TableCell>
              <TableCell>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAnalysis(item)}
                    >
                      詳細を見る
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>
                        {format(
                          new Date(item.analysisDate),
                          "yyyy年MM月の分析",
                          { locale: ja }
                        )}
                      </SheetTitle>
                      <SheetDescription>
                        分析日:{" "}
                        {format(new Date(item.analysisDate), "yyyy年MM月dd日", {
                          locale: ja,
                        })}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">トレンド</h3>
                        <ul className="list-disc pl-4 space-y-2">
                          {item.insights.trends.map((trend, i) => (
                            <li key={i}>{trend}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">提案</h3>
                        <div className="space-y-4">
                          {item.insights.suggestions.map((suggestion, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900">
                                {suggestion.title}
                              </h4>
                              <p className="text-gray-600 mt-1">
                                {suggestion.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
