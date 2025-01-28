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

type TabType = "all" | "expense" | "income";

export default function RecentTransactions({
  incomes,
  expenses,
}: RecentTransactionsProps) {
  const [currentTab, setCurrentTab] = useState<TabType>("all");
  const [pages, setPages] = useState({
    all: 1,
    expense: 1,
    income: 1,
  });
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
    tabType,
  }: {
    transactions: typeof allTransactions;
    tabType: TabType;
  }) => {
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const startIndex = (pages[tabType] - 1) * itemsPerPage;
    const currentTransactions = transactions.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    const handlePreviousPage = () => {
      setPages((prev) => ({
        ...prev,
        [tabType]: Math.max(prev[tabType] - 1, 1),
      }));
    };

    const handleNextPage = () => {
      setPages((prev) => ({
        ...prev,
        [tabType]: Math.min(prev[tabType] + 1, totalPages),
      }));
    };

    return (
      <div className="flex flex-col h-[670px]">
        {" "}
        {/* 固定の高さを設定 */}
        <div className="flex-1 overflow-y-auto">
          {" "}
          {/* スクロール可能な領域 */}
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
                    <span>
                      {transaction.type === "income" ? "収入" : "支出"}
                    </span>
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
        </div>
        {/* ページネーション - 固定位置 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-4 border-t bg-white">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pages[tabType] === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              前へ
            </Button>
            <span className="text-sm text-muted-foreground">
              {pages[tabType]} / {totalPages} ページ
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pages[tabType] === totalPages}
            >
              次へ
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近の取引</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="all"
          onValueChange={(value) => setCurrentTab(value as TabType)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="expense">支出</TabsTrigger>
            <TabsTrigger value="income">収入</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="m-0">
            <TransactionList transactions={allTransactions} tabType="all" />
          </TabsContent>
          <TabsContent value="expense" className="m-0">
            <TransactionList
              transactions={expenseTransactions}
              tabType="expense"
            />
          </TabsContent>
          <TabsContent value="income" className="m-0">
            <TransactionList
              transactions={incomeTransactions}
              tabType="income"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
