"use client";
import CategoryBreakdown from "@/components/category-breakdown";
import ExpenseChart from "@/components/expense-chart";
import MonthPicker from "@/components/month-picker";
import RecentTransactions from "@/components/recent-transactions";
import DashboardSkeleton from "@/components/skeleton/dashborad";
import SummaryCard from "@/components/summary-card";
import { formatCurrency, getCurrentYearMonth } from "@/lib/utils";
import { mockDashboardData } from "@/mocks/dashboard-data";
import { MonthlyData } from "@/types/dashboard";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);

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
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    console.log("Selected Month:", selectedMonth);
    console.log("Mock Data:", mockDashboardData);
    const data =
      mockDashboardData[selectedMonth as keyof typeof mockDashboardData];
    console.log("Current Month Data:", data);
    setMonthlyData(data || null);

    setProgressValue(data ? 100 : 0);
  }, [selectedMonth]);

  if (loading) return <DashboardSkeleton />;

  if (!monthlyData)
    return (
      <div className="flex justify-center items-center h-screen">
        データが利用できません
      </div>
    );

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">家計簿ダッシュボード</h1>
        <div className="flex gap-4">
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          title="今月の収入"
          amount={formatCurrency(monthlyData.summary.totalIncome)}
          description={`先月比: ${formatCurrency(monthlyData.summary.lastMonthDiff)}`}
        />
        <SummaryCard
          title="今月の支出"
          amount={formatCurrency(monthlyData.summary.totalExpense)}
        />
        <SummaryCard
          title="収支バランス"
          amount={formatCurrency(monthlyData.summary.balance)}
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
    </div>
  );
}
