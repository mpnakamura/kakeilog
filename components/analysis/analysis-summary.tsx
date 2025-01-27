import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AnalysisResult } from "@/types/analysis";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

export default function AnalysisSummary({ data }: { data: AnalysisResult }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b p-4">
        <h2 className="text-xl font-semibold text-gray-800">
          今月のハイライト
        </h2>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="flex items-center p-4 bg-blue-50 rounded-lg">
          <TrendingUp className="w-8 h-8 mr-4 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600 mb-1">主要傾向</p>
            <p className="font-medium text-gray-900">{data.trends[0]}</p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-green-50 rounded-lg">
          {data.comparisons.income.diff > 0 ? (
            <ArrowUp className="w-8 h-8 mr-4 text-green-600" />
          ) : (
            <ArrowDown className="w-8 h-8 mr-4 text-red-600" />
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">収入の前月比</p>
            <p className="font-medium text-gray-900">
              {Math.abs(data.comparisons.income.diff)}%
              {data.comparisons.income.diff > 0 ? "増加" : "減少"}
            </p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-purple-50 rounded-lg">
          <div className="w-8 h-8 mr-4 text-purple-600 text-xl">💰</div>
          <div>
            <p className="text-sm text-gray-600 mb-1">推奨節約額</p>
            <p className="font-medium text-gray-900">
              {Math.round(
                data.comparisons.expense.current * 0.15
              ).toLocaleString()}
              円
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
