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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowUpIcon, ArrowDownIcon, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Skeletonコンポーネントをインポート

interface AnalysisHistoryItem {
  id: string;
  analysisDate: string;
  insights: any;
}

export default function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleDetailClick = (item: AnalysisHistoryItem) => {
    setSelectedAnalysis(item);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          <Skeleton className="w-48 h-6" /> {/* タイトルのスケルトン */}
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="w-24 h-4" />
              </TableHead>
              <TableHead>
                <Skeleton className="w-24 h-4" />
              </TableHead>
              <TableHead>
                <Skeleton className="w-24 h-4" />
              </TableHead>
              <TableHead>
                <Skeleton className="w-24 h-4" />
              </TableHead>
              <TableHead>
                <Skeleton className="w-24 h-4" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="w-32 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-24 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-24 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-40 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-20 h-4" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        エラー: {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">分析履歴がありません</div>
    );
  }

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
          {history.map((item) => {
            const insights = item.insights;
            const trends = Array.isArray(insights?.trends)
              ? insights.trends
              : [];
            const comparisons = insights?.comparisons || {};
            const suggestions = Array.isArray(insights?.suggestions)
              ? insights.suggestions
              : [];

            return (
              <TableRow key={item.id}>
                <TableCell>
                  {format(new Date(item.analysisDate), "yyyy年MM月dd日", {
                    locale: ja,
                  })}
                </TableCell>
                <TableCell>
                  {comparisons.income && (
                    <div className="flex items-center space-x-1">
                      {comparisons.income.diff > 0 ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-500" />
                      )}
                      <span>{Math.abs(comparisons.income.diff)}%</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {comparisons.expense && (
                    <div className="flex items-center space-x-1">
                      {comparisons.expense.diff > 0 ? (
                        <ArrowUpIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-green-500" />
                      )}
                      <span>{Math.abs(comparisons.expense.diff)}%</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {trends[0] || "分析なし"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDetailClick(item)}
                  >
                    詳細を見る
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          {selectedAnalysis && (
            <div className="relative h-full">
              <DialogHeader className="bg-background pr-6">
                <DialogTitle className="text-2xl">
                  {format(
                    new Date(selectedAnalysis.analysisDate),
                    "yyyy年MM月の分析",
                    {
                      locale: ja,
                    }
                  )}
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  分析実施日:{" "}
                  {format(
                    new Date(selectedAnalysis.analysisDate),
                    "yyyy年MM月dd日",
                    {
                      locale: ja,
                    }
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-6">
                <div className="divide-y divide-gray-100">
                  {/* 収支の比較セクション */}
                  <div className="pb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">
                      前月比較
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-700 font-medium">
                            収入
                          </span>
                          <div className="flex items-center gap-1">
                            {selectedAnalysis.insights.comparisons.income.diff >
                            0 ? (
                              <ArrowUpIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-medium">
                              {Math.abs(
                                selectedAnalysis.insights.comparisons.income
                                  .diff
                              )}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-1">
                          <span>
                            今月:{" "}
                            {selectedAnalysis.insights.comparisons.income.current.toLocaleString()}
                            円
                          </span>
                          <span>
                            前月:{" "}
                            {selectedAnalysis.insights.comparisons.income.previous.toLocaleString()}
                            円
                          </span>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-700 font-medium">
                            支出
                          </span>
                          <div className="flex items-center gap-1">
                            {selectedAnalysis.insights.comparisons.expense
                              .diff > 0 ? (
                              <ArrowUpIcon className="w-4 h-4 text-red-500" />
                            ) : (
                              <ArrowDownIcon className="w-4 h-4 text-green-500" />
                            )}
                            <span className="font-medium">
                              {Math.abs(
                                selectedAnalysis.insights.comparisons.expense
                                  .diff
                              )}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 gap-1">
                          <span>
                            今月:{" "}
                            {selectedAnalysis.insights.comparisons.expense.current.toLocaleString()}
                            円
                          </span>
                          <span>
                            前月:{" "}
                            {selectedAnalysis.insights.comparisons.expense.previous.toLocaleString()}
                            円
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* トレンドセクション */}
                  <div className="py-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">
                      主要トレンド
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-3">
                        {Array.isArray(selectedAnalysis.insights?.trends) &&
                          selectedAnalysis.insights.trends.map(
                            (trend: any, i: any) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                                  {i + 1}
                                </span>
                                <span className="text-gray-700">{trend}</span>
                              </li>
                            )
                          )}
                      </ul>
                    </div>
                  </div>

                  {/* 提案セクション */}
                  <div className="pt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">
                      改善提案
                    </h3>
                    <div className="space-y-4">
                      {Array.isArray(selectedAnalysis.insights?.suggestions) &&
                        selectedAnalysis.insights.suggestions.map(
                          (suggestion: any, i: any) => (
                            <div
                              key={i}
                              className="bg-green-50 p-4 rounded-lg border border-green-100"
                            >
                              <h4 className="text-green-700 font-medium mb-2">
                                {typeof suggestion === "object"
                                  ? suggestion.title
                                  : "提案"}
                              </h4>
                              <p className="text-gray-600">
                                {typeof suggestion === "object"
                                  ? suggestion.content
                                  : suggestion}
                              </p>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
