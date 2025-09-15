"use client";

import { Skeleton } from "@/components/ui/skeleton";

const TaskTableSkeleton = () => {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Search and actions header */}
      <div className="flex justify-between items-center mb-4 p-4">
        <div className="relative w-full max-w-sm">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border/50 overflow-hidden bg-card flex-1 overflow-y-auto">
        <div className="w-full">
          {/* Table header */}
          <div className="bg-muted/50 sticky top-0">
            <div className="grid grid-cols-5 px-4 py-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16 ml-auto" />
            </div>
          </div>
          
          {/* Table body */}
          <div>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="border-t border-border/50 grid grid-cols-5 px-4 py-3 items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTableSkeleton;