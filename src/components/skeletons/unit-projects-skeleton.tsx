import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UnitProjectsSkeleton() {
  const items = Array.from({ length: 6 });

  return (
    <div className="min-h-[300px]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-48 rounded" />
            <Skeleton className="h-10 w-12 rounded" />
          </div>
        </div>

        {/* Search / Controls */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Skeleton className="h-11 w-full md:w-1/2 rounded" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded" />
            <Skeleton className="h-11 w-36 rounded" />
          </div>
        </div>

        {/* Grid of project cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-24 rounded" />
                  <Skeleton className="h-8 w-20 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination placeholders */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Skeleton className="h-10 w-24 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
