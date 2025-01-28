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
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#6366F1",
  "#64748B",
];

function CategoryPieChart({
  categories,
}: {
  categories: CategoryBreakdownType[];
}) {
  return (
    <div className="w-full aspect-[4/3]">
      <ResponsiveContainer width="90%" height="90%">
        <PieChart>
          <Pie
            data={categories}
            dataKey="totalAmount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius="45%"
            innerRadius="25%"
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
              paddingLeft: "8px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function CategoryList({ categories }: { categories: CategoryBreakdownType[] }) {
  return (
    <div className="mt-4 h-64 overflow-auto">
      <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-lg">
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
    </div>
  );
}

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>カテゴリ別内訳</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expense">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">支出</TabsTrigger>
            <TabsTrigger value="income">収入</TabsTrigger>
          </TabsList>
          <TabsContent value="expense">
            <CategoryPieChart categories={data.expense} />
            <CategoryList categories={data.expense} />
          </TabsContent>
          <TabsContent value="income">
            <CategoryPieChart categories={data.income} />
            <CategoryList categories={data.income} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
