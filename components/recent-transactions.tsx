import { Income, Expense } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface RecentTransactionsProps {
  incomes: Income[];
  expenses: Expense[];
}

export default function RecentTransactions({
  incomes,
  expenses,
}: RecentTransactionsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 収入と支出を統合して表示用に並び替え
  const allTransactions = [
    ...incomes.map((income) => ({ ...income, type: "income" as const })),
    ...expenses.map((expense) => ({ ...expense, type: "expense" as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 収入のみ
  const incomeTransactions = allTransactions.filter(
    (transaction) => transaction.type === "income"
  );

  // 支出のみ
  const expenseTransactions = allTransactions.filter(
    (transaction) => transaction.type === "expense"
  );

  const TransactionList = ({
    transactions,
  }: {
    transactions: typeof allTransactions;
  }) => {
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTransactions = transactions.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    const handlePreviousPage = () => {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    // タブ切り替え時にページをリセット
    useEffect(() => {
      setCurrentPage(1);
    }, [transactions]);

    return (
      <>
        <div className="divide-y">
          {currentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-3 flex items-center justify-between"
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              前へ
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages} ページ
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              次へ
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近の取引</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="expense">支出</TabsTrigger>
            <TabsTrigger value="income">収入</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <TransactionList transactions={allTransactions} />
          </TabsContent>
          <TabsContent value="expense">
            <TransactionList transactions={expenseTransactions} />
          </TabsContent>
          <TabsContent value="income">
            <TransactionList transactions={incomeTransactions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
