
import { createClient } from "@/utils/supabase/server";

export async function fetchMonthlyData(month: string) {
  const supabase = await createClient();
  const [year, monthNum] = month.split("-");

  const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

  const { data, error } = await supabase
    .from("income")
    .select("*")
    .gte("date", startDate.toISOString())
    .lte("date", endDate.toISOString());

  if (error) throw error;
  return data;
}
