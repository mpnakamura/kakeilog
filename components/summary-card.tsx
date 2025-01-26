// components/summary-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface SummaryCardProps {
  title: string;
  amount: string;
  description?: string;
}

export default function SummaryCard({
  title,
  amount,
  description,
}: SummaryCardProps) {
  const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{amount}</div>
        {description && (
          <div className="flex items-center justify-end">
            <p className="text-xs text-muted-foreground">{description}</p>
            {numericAmount > 0 ? (
              <TrendingUp className="ml-1 h-4 w-4" />
            ) : (
              <TrendingDown className="ml-1 h-4 w-4" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
