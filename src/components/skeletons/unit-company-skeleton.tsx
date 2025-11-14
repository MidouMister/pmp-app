import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UnitCompanySkeleton() {
  const itemsPerPage = 9;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="w-full sm:w-48 h-12" />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
              {/* Search Input */}
              <Skeleton className="flex-1 h-11 rounded-lg" />
              {/* Select */}
              <Skeleton className="h-11 w-32 rounded-lg" />
              {/* Sort Button */}
              <Skeleton className="h-11 w-12 rounded-lg" />
            </div>
            {/* Tabs */}
            <Skeleton className="w-full sm:w-auto h-11 rounded-lg" />
          </div>
        </div>

        {/* Grid View Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <Card
              key={index}
              className="border-border/50 bg-card overflow-hidden animate-pulse"
            >
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                {/* Email Section */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>

                {/* Phone Section */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>

                {/* Address Section */}
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-4 flex justify-end gap-2 border-t border-border/50">
                <Skeleton className="h-9 w-24 rounded" />
                <Skeleton className="h-9 w-24 rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <Skeleton className="h-10 w-24 rounded" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded" />
            ))}
          </div>
          <Skeleton className="h-10 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
