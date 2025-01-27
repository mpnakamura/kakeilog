"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-1/4" />
      </header>

      <div className="grid grid-cols-3 gap-4">
        {Array(3)
          .fill(null)
          .map((_, index) => (
            <Skeleton key={index} className="h-24 shadow-md" />
          ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-64" />
        <div className="space-y-4">
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
        </div>
      </div>

      <Skeleton className="h-64" />
    </div>
  );
}
