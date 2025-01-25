import CategoryBreakdown from "@/components/category-breakdown";
import ExpenseChart from "@/components/expense-chart";
import MonthPicker from "@/components/month-picker";
import RecentTransactions from "@/components/recent-transactions";
import SummaryCard from "@/components/summary-card";
import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">家計簿ダッシュボード</h1>
        <div className="flex gap-4">
          <MonthPicker />
          <Button>支出を追加</Button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard title="今月の支出" amount="¥125,000" />
        <SummaryCard title="先月比" amount="-¥12,000" />
        <SummaryCard title="予算残" amount="¥75,000" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ExpenseChart />
        <CategoryBreakdown />
      </div>

      <RecentTransactions />
    </div>
  );
}
