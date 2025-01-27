import { CategoryBreakdown as CategoryBreakdownType } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryBreakdownProps {
  data: {
    income: CategoryBreakdownType[];
    expense: CategoryBreakdownType[];
  };
}

const COLORS = [
  "#10B981", // 緑
  "#3B82F6", // 青
  "#F59E0B", // オレンジ
  "#EF4444", // 赤
  "#8B5CF6", // 紫
  "#EC4899", // ピンク
  "#6366F1", // インディゴ
  "#64748B", // スレート
];

// CategoryPieChart コンポーネントの修正
function CategoryPieChart({
  categories,
}: {
  categories: CategoryBreakdownType[];
}) {
  return (
    <div className="h-[300px]">
      {" "}
      {/* 高さを固定 */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categories}
            dataKey="totalAmount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
            label={({
              cx,
              cy,
              midAngle,
              innerRadius,
              outerRadius,
              percent,
            }) => {
              return `${((percent ?? 0) * 100).toFixed(0)}%`;
            }}
            labelLine={true}
          >
            {categories.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px",
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value, entry, index) => {
              const item = categories[index];
              if (!item) return `${value}: 不明`;
              return `${value}: ${formatCurrency(item.totalAmount)}`;
            }}
            wrapperStyle={{
              paddingLeft: "20px",
              fontSize: "14px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// CategoryList コンポーネントの修正
function CategoryList({ categories }: { categories: CategoryBreakdownType[] }) {
  return (
    <div className="mt-4 overflow-y-auto max-h-[200px] grid grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-lg">
      {categories.map((category, index) => (
        <div
          key={category.category}
          className="flex flex-col gap-2 p-4 bg-background rounded"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium">{category.category}</span>
            </div>
            <span className="font-semibold">
              {formatCurrency(category.totalAmount)}
            </span>
          </div>
          <div className="mt-2 pl-4 border-l-2 border-muted">
            {category.subCategories.map((subCategory) => (
              <div
                key={subCategory.subCategory}
                className="flex justify-between text-sm"
              >
                <span>{subCategory.subCategory}</span>
                <span>{formatCurrency(subCategory.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// メインコンポーネントの修正
export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <Card className="h-[580px]">
      {" "}
      {/* カード全体の高さを固定 */}
      <CardHeader className="pb-2">
        <CardTitle>カテゴリ別内訳</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expense" className="h-[500px]">
          {" "}
          {/* タブコンテンツの高さを固定 */}
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="expense">支出</TabsTrigger>
            <TabsTrigger value="income">収入</TabsTrigger>
          </TabsList>
          <TabsContent value="expense" className="h-full">
            <CategoryPieChart categories={data.expense} />
            <CategoryList categories={data.expense} />
          </TabsContent>
          <TabsContent value="income" className="h-full">
            <CategoryPieChart categories={data.income} />
            <CategoryList categories={data.income} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
