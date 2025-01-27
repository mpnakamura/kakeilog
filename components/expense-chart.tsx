"use client";

import { MonthlyTrend } from "@/types/dashboard";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface ExpenseChartProps {
  data: {
    income: MonthlyTrend[];
    expense: MonthlyTrend[];
  };
}

export default function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = data.income.map((income) => {
    const expense = data.expense.find((exp) => exp.month === income.month);
    return {
      month: income.month.replace(/(\d+)年(\d+)月/, "$2月"), // "2024年7月" → "7月"
      収入: income.amount,
      支出: expense?.amount || 0,
      収支差額: income.amount - (expense?.amount || 0),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>収支推移</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 14 }}
                interval={0} // すべてのラベルを表示
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                label={{
                  value: "金額",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="収入"
                fill="#10B981"
                barSize={40}
                opacity={0.8}
              />
              <Bar
                yAxisId="left"
                dataKey="支出"
                fill="#EF4444"
                barSize={40}
                opacity={0.8}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="収支差額"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
