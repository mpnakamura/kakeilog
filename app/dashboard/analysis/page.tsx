"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { AnalysisResult } from "@/types/analysis";
import AnalysisSummary from "@/components/analysis/analysis-summary";
import ComparisonChart from "@/components/analysis/comparison-chart";
import SuggestionsList from "@/components/analysis/suggestions-list";
import Link from "next/link";

interface DataStatus {
  hasEnoughData: boolean;
  monthsCount: number;
}

export default function AnalysisPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState<DataStatus>({
    hasEnoughData: false,
    monthsCount: 0,
  });
  const [error, setError] = useState("");

  const checkDataStatus = async () => {
    try {
      const response = await fetch("/api/analysis/check-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current_user_id" }),
      });

      if (!response.ok) throw new Error("データ確認に失敗しました");

      const result = await response.json();
      setDataStatus({
        hasEnoughData: result.hasEnough,
        monthsCount: result.months,
      });
    } catch (err) {
      console.error("データ状態チェックエラー:", err);
      setError("データの確認中に問題が発生しました");
    }
  };

  useEffect(() => {
    checkDataStatus();
  }, []);

  const fetchAnalysis = async () => {
    if (!dataStatus.hasEnoughData) return;

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current_user_id" }),
      });

      if (!response.ok) throw new Error("分析に失敗しました");

      const { data } = await response.json();
      setAnalysisData(data);
      await checkDataStatus(); // 分析後にデータ状態を再確認
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        家計簿分析レポート
        <span className="text-sm ml-2 font-normal text-gray-500">
          （最低2ヶ月分のデータが必要）
        </span>
      </h1>

      {!analysisData && !loading && (
        <div className="text-center py-12 space-y-4">
          <div className="flex items-center justify-center gap-1 mb-4">
            <p className="text-gray-600">最新の分析結果を表示します</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p className="text-sm">
                    正確な分析のため、過去2ヶ月分以上のデータが必要です。
                    現在のデータ期間: {dataStatus.monthsCount}ヶ月
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            onClick={fetchAnalysis}
            size="lg"
            className="gap-2 relative"
            disabled={!dataStatus.hasEnoughData || loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                分析中...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6c0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8m0 14c-3.31 0-6-2.69-6-6c0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4l-4-4v3z"
                  />
                </svg>
                {dataStatus.hasEnoughData ? "分析を実行" : "データ不足"}
              </>
            )}
          </Button>

          {!dataStatus.hasEnoughData && (
            <div className="my-4 p-3  rounded-lg text-gray-700">
              <p className="text-sm">
                ※ 分析可能なデータが不足しています（現在{" "}
                {dataStatus.monthsCount}ヶ月分）
              </p>
              <div className="flex flex-row gap-6 my-6 justify-center">
                <Button
                  asChild
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-800"
                >
                  <Link href="/dashboard/income" className="text-sm">
                    収入登録
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-800"
                >
                  <Link href="/dashboard/expense" className="text-sm">
                    支出登録
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-[180px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200">
          <p className="font-medium">⚠️ エラーが発生しました</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      {analysisData && (
        <div className="space-y-8">
          <AnalysisSummary data={analysisData} />
          <ComparisonChart comparisons={analysisData.comparisons} />
          <SuggestionsList suggestions={analysisData.suggestions} />

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              最終分析日: {new Date().toLocaleDateString()}
            </p>
            <Button
              variant="outline"
              onClick={fetchAnalysis}
              disabled={!dataStatus.hasEnoughData}
            >
              最新データで再分析
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
