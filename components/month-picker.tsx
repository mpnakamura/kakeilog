"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MonthPicker() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date || new Date())}
      dateFormat="yyyy/MM"
      showMonthYearPicker
      aria-label="月を選択"
      className="border rounded px-2 py-1"
    />
  );
}
