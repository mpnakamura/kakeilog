"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import CategoryBreakdown from "@/components/category-breakdown";
import ExpenseChart from "@/components/expense-chart";
import RecentTransactions from "@/components/recent-transactions";
import DashboardSkeleton from "@/components/skeleton/dashborad";
import SummaryCard from "@/components/summary-card";
import { cn, formatCurrency } from "@/lib/utils";
import { MonthlyData } from "@/types/dashboard";
import { getMonthlyDashboardData } from "@/actions/dashboard.action";
import { Wallet, PiggyBank, Calculator, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import YearMonthPicker from "@/components/year-month-picker";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setAuthChecked(true);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    const { data, error } = await getMonthlyDashboardData(
      selectedYear,
      selectedMonth
    );

    if (error) {
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: "データの取得に失敗しました。再度お試しください。",
      });
      setMonthlyData(null);
    } else if (data) {
      setMonthlyData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authChecked) {
      fetchMonthlyData();
    }
  }, [selectedYear, selectedMonth, authChecked]);

  if (!authChecked) return <DashboardSkeleton />;

  return (
    <div className="flex-1 w-full flex flex-col max-w-7xl mx-auto p-4 gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">家計簿ダッシュボード</h1>
        <div className="flex items-center gap-4">
          <YearMonthPicker
            year={selectedYear}
            month={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMonthlyData}
            disabled={loading}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
            更新
          </Button>
        </div>
      </header>

      {loading ? (
        <DashboardSkeleton />
      ) : !monthlyData ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-lg text-muted-foreground">
            データを取得できませんでした
          </p>
          <Button onClick={fetchMonthlyData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard
              title="今月の収入"
              amount={formatCurrency(monthlyData.summary.totalIncome)}
              description={`先月比: ${formatCurrency(
                monthlyData.summary.incomeDiff
              )} ${monthlyData.summary.incomeDiff > 0 ? "増加" : "減少"}`}
              icon={Wallet}
            />
            <SummaryCard
              title="今月の支出"
              amount={formatCurrency(monthlyData.summary.totalExpense)}
              description={`先月比: ${formatCurrency(
                monthlyData.summary.expenseDiff
              )} ${monthlyData.summary.expenseDiff > 0 ? "増加" : "減少"}`}
              icon={PiggyBank}
            />
            <SummaryCard
              title="今月の残高"
              amount={formatCurrency(monthlyData.summary.balance)}
              amountClassName={cn(
                monthlyData.summary.balance > 0
                  ? "text-green-600"
                  : "text-red-600"
              )}
              description={`先月比: ${formatCurrency(
                monthlyData.summary.balanceDiff
              )} ${monthlyData.summary.balanceDiff > 0 ? "増加" : "減少"}`}
              icon={Calculator}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CategoryBreakdown data={monthlyData.categoryBreakdown} />
            <RecentTransactions
              incomes={monthlyData.incomes}
              expenses={monthlyData.expenses}
            />
          </div>
          <ExpenseChart data={monthlyData.monthlyTrend} />
        </>
      )}
    </div>
  );
}
