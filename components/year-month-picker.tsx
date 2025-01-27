"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const currentYear = new Date().getFullYear();

export default function YearMonthPicker({
  year,
  month,
  onYearChange,
  onMonthChange,
}: {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}) {
  const years = Array.from({ length: 6 }, (_, i) => currentYear + 1 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleMonthNavigation = (direction: "prev" | "next") => {
    let newYear = year;
    let newMonth = month;

    if (direction === "prev") {
      if (newMonth === 1) {
        newYear -= 1;
        newMonth = 12;
      } else {
        newMonth -= 1;
      }
    } else {
      if (newMonth === 12) {
        newYear += 1;
        newMonth = 1;
      } else {
        newMonth += 1;
      }
    }

    onYearChange(newYear);
    onMonthChange(newMonth);
  };

  return (
    <div className="flex items-center gap-2">
      {/* 前月ボタン */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleMonthNavigation("prev")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* 年月選択 */}
      <div className="flex gap-2">
        <Select
          value={year.toString()}
          onValueChange={(value) => onYearChange(Number(value))}
        >
          <SelectTrigger className="w-24">
            <SelectValue placeholder="年を選択" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}年
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={month.toString()}
          onValueChange={(value) => onMonthChange(Number(value))}
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="月を選択" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m.toString()}>
                {m}月
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 翌月ボタン */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleMonthNavigation("next")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
