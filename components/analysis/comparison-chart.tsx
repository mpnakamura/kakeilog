import { AnalysisResult } from "@/types/analysis";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ComparisonChart({
  comparisons,
}: {
  comparisons: AnalysisResult["comparisons"];
}) {
  const data = [
    {
      name: "収入",
      今月: comparisons.income.current,
      前月: comparisons.income.previous,
    },
    {
      name: "支出",
      今月: comparisons.expense.current,
      前月: comparisons.expense.previous,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">前月との比較</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => `${value.toLocaleString()}円`}
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="今月"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              label={{
                position: "top",
                formatter: (v: { toLocaleString: () => any; }) => `${v.toLocaleString()}円`,
              }}
            />
            <Bar dataKey="前月" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
