import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, ChevronLeft, ChevronRight } from "lucide-react";
import { Expense } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface PaymentStatusCardProps {
  expenses: Expense[];
}

interface PaymentStatusData {
  paid: {
    count: number;
    total: number;
    items: Array<{
      title: string;
      amount: number;
    }>;
  };
  unpaid: {
    count: number;
    total: number;
    items: Array<{
      title: string;
      amount: number;
      date: Date;
    }>;
  };
}

export function PaymentStatusCard({ expenses }: PaymentStatusCardProps) {
  const [paidPage, setPaidPage] = useState(1);
  const [unpaidPage, setUnpaidPage] = useState(1);
  const itemsPerPage = 5;

  // 支払い状態ごとにデータを集計
  const paymentData: PaymentStatusData = expenses.reduce(
    (acc, expense) => {
      if (expense.paid) {
        acc.paid.count++;
        acc.paid.total += expense.amount;
        acc.paid.items.push({
          title: expense.title,
          amount: expense.amount,
        });
      } else {
        acc.unpaid.count++;
        acc.unpaid.total += expense.amount;
        acc.unpaid.items.push({
          title: expense.title,
          amount: expense.amount,
          date: new Date(expense.date),
        });
      }
      return acc;
    },
    {
      paid: { count: 0, total: 0, items: [] },
      unpaid: { count: 0, total: 0, items: [] },
    } as PaymentStatusData
  );

  // 未払いのアイテムを支払日でソート
  const sortedUnpaidItems = [...paymentData.unpaid.items].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // ページごとのアイテムを取得
  const getPaginatedItems = (items: any[], page: number) => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  // 現在のページのアイテム
  const currentPaidItems = getPaginatedItems(paymentData.paid.items, paidPage);
  const currentUnpaidItems = getPaginatedItems(sortedUnpaidItems, unpaidPage);

  // 総ページ数を計算
  const paidTotalPages = Math.ceil(
    paymentData.paid.items.length / itemsPerPage
  );
  const unpaidTotalPages = Math.ceil(sortedUnpaidItems.length / itemsPerPage);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    });
  };

  const StatusSection = ({
    title,
    count,
    total,
    items,
    currentPage,
    totalPages,
    onPageChange,
    isUnpaid = false,
  }: {
    title: string;
    count: number;
    total: number;
    items: any[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isUnpaid?: boolean;
  }) => (
    <div className="flex flex-col h-full">
      {/* ヘッダー部分 */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold">
          {title} ({count}件)
        </h3>
      </div>

      {/* 合計金額 */}
      <div
        className={cn(
          "px-4 py-3 rounded-lg mb-4",
          isUnpaid ? "bg-red-50" : "bg-green-50"
        )}
      >
        <p
          className={cn(
            "text-xl font-bold",
            isUnpaid ? "text-red-700" : "text-green-700"
          )}
        >
          ¥{total.toLocaleString()}
        </p>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        {/* アイテムリスト */}
        <div className="flex-1">
          {items.map((item, i) => (
            <div key={i} className={cn("p-3 border-b", i === 0 && "border-t")}>
              <div className="flex justify-between items-start">
                <span className="font-medium">{item.title}</span>
                <span className="text-right font-semibold">
                  ¥{item.amount.toLocaleString()}
                </span>
              </div>
              {isUnpaid && item.date && (
                <div className="text-sm text-gray-500 mt-1">
                  支払予定日: {formatDate(item.date)}
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              データがありません
            </div>
          )}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="mt-auto pt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              前へ
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              次へ
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>支払い状況</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-6">
        {/* 支払い済み */}
        <StatusSection
          title="支払い済み"
          count={paymentData.paid.count}
          total={paymentData.paid.total}
          items={currentPaidItems}
          currentPage={paidPage}
          totalPages={paidTotalPages}
          onPageChange={setPaidPage}
        />

        {/* 未払い */}
        <StatusSection
          title="未払い"
          count={paymentData.unpaid.count}
          total={paymentData.unpaid.total}
          items={currentUnpaidItems}
          currentPage={unpaidPage}
          totalPages={unpaidTotalPages}
          onPageChange={setUnpaidPage}
          isUnpaid
        />
      </CardContent>
    </Card>
  );
}
