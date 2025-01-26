"use client";

export default function DashboardSkeleton() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 animate-pulse">
      <header className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {Array(3)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="h-24 bg-gray-200 rounded shadow-md"
            ></div>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="h-10 bg-gray-200 rounded"></div>
            ))}
        </div>
      </div>

      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
}
