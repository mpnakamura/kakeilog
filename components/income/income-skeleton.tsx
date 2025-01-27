import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function IncomeFormSkeleton() {
  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-4">
        <div className="flex whitespace-nowrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-2 shrink-0">
              <Skeleton className="h-6 w-20" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function IncomeTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>

      {[1, 2].map((groupIndex) => (
        <div key={groupIndex} className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <Skeleton className="h-7 w-32" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead className="w-40">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-4 ml-1" />
                  </div>
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-8" />
                </TableHead>
                <TableHead className="text-right w-32">
                  <div className="flex items-center justify-end">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-4 ml-1" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={4} className="text-right">
                  <Skeleton className="h-4 w-32 ml-auto" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-24 ml-auto" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

export function CategoryManagementSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

export default function IncomePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32" />
        <CategoryManagementSkeleton />
      </div>

      <IncomeFormSkeleton />

      <div className="mt-8">
        <IncomeTableSkeleton />
      </div>
    </div>
  );
}
