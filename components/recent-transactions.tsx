import { Income, Expense } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentTransactionsProps {
  incomes: Income[];
  expenses: Expense[];
}

export default function RecentTransactions({
  incomes,
  expenses,
}: RecentTransactionsProps) {
  // 収入と支出を統合して表示用に並び替え
  const transactions = [
    ...incomes.map((income) => ({ ...income, type: "income" })),
    ...expenses.map((expense) => ({ ...expense, type: "expense" })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // 日付順ソート

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近の取引</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="py-3 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="font-medium">{transaction.title}</span>
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <span>
                    {new Date(transaction.date).toLocaleDateString("ja-JP")}
                  </span>
                  <span>•</span>
                  <span>{transaction.type === "income" ? "収入" : "支出"}</span>
                </div>
                {transaction.memo && (
                  <span className="text-sm text-muted-foreground">
                    {transaction.memo}
                  </span>
                )}
              </div>
              <div
                className={`font-medium ${
                  transaction.type === "expense"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {transaction.type === "expense" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
