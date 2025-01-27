// components/summary-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  amount: string;
  description?: string;
  className?: string;
  amountClassName?: string;
  icon?: LucideIcon;
}

export default function SummaryCard({
  title,
  amount,
  description,
  className,
  amountClassName,
  icon: Icon,
}: SummaryCardProps) {
  const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl py-2 font-bold", amountClassName)}>
          {amount}
        </div>
        {description && (
          <div className="flex items-center justify-end">
            <p className="text-xs text-muted-foreground">{description}</p>
            {numericAmount > 0 ? (
              <TrendingUp className={cn("ml-1 h-4 w-4", amountClassName)} />
            ) : (
              <TrendingDown className={cn("ml-1 h-4 w-4", amountClassName)} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
