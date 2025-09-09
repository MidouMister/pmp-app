import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal } from "lucide-react";

const TeamSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Header with search and add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center py-4 gap-2">
          <Search className="text-muted-foreground" />
          <div className="relative">
            <Input
              placeholder="Rechercher un nom..."
              className="h-12 w-64"
              disabled
            />
            <Skeleton className="absolute inset-0 rounded-md" />
          </div>
        </div>
        <Button className="flex gap-2" disabled>
          <Plus size={15} />
          Ajouter
        </Button>
      </div>

      {/* Table skeleton */}
      <div className="border bg-background rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {/* Name column with avatar */}
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>

                {/* Email column */}
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>

                {/* Unit column */}
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>

                {/* Role column */}
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>

                {/* Actions column */}
                <TableCell>
                  <Button variant="ghost" className="h-8 w-8 p-0" disabled>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamSkeleton;