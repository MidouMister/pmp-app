/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  ArrowUpDown,
  Building,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Percent,
  Sparkles,
  Trash,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatAmount, formatMonthYear } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { ProductionWithDetails } from "@/lib/types";
import { deleteProduction } from "@/lib/queries";
import { toast } from "sonner";

// Actions Cell Component
const ActionsCell = ({ production }: { production: ProductionWithDetails }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteProduction(production.id);
      toast.success("Production supprimée");
      router.refresh();
    } catch (error) {
      toast("Une erreur est survenue lors de la suppression.");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 shadow-sm hover:shadow transition-all duration-200"
          >
            <span className="sr-only">Menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              // View logic
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Voir
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              // Edit logic
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et supprimera définitivement la
              production.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Enhanced Header Component with Icon
const EnhancedHeader = ({
  column,
  children,
  icon: Icon,
  color,
}: {
  column: any;
  children: React.ReactNode;
  icon: any;
  color?: string;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={cn(
        "flex items-center gap-1.5 px-0 font-medium hover:bg-transparent hover:text-foreground/80 shadow-sm",
        color === "primary" && "text-primary",
        color === "secondary" && "text-muted-foreground",
        color === "success" && "text-muted-foreground",
        color === "warning" && "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
      <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/30" />
    </Button>
  );
};

// Export the columns definition
export const columns: ColumnDef<ProductionWithDetails>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <EnhancedHeader icon={Calendar} color="warning" column={column}>
        Date
      </EnhancedHeader>
    ),
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return <div className="font-medium">{formatMonthYear(date)}</div>;
    },
  },
  {
    accessorKey: "Product.Phase.Project.name",
    header: ({ column }) => (
      <EnhancedHeader icon={Building} color="primary" column={column}>
        Projet
      </EnhancedHeader>
    ),
    cell: ({ row }) => {
      const production = row.original;
      const projectName = production.Product.Phase.Project.name;
      const projectCode = production.Product.Phase.Project.code;

      return (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{projectName}</div>
          <Badge
            variant="outline"
            className="font-mono text-xs rounded-md shadow-sm border border-border bg-primary/10 text-primary transition-all duration-200"
          >
            {projectCode}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "Product.Phase.name",
    header: ({ column }) => (
      <EnhancedHeader icon={FileText} color="secondary" column={column}>
        Phase
      </EnhancedHeader>
    ),
    cell: ({ row }) => {
      const production = row.original;
      const phaseName = production.Product.Phase.name;
      const phaseCode = production.Product.Phase.code;

      return (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{phaseName}</div>
          <Badge
            variant="outline"
            className="font-mono text-xs rounded-md shadow-sm border border-border bg-primary/10 text-primary transition-all duration-200"
          >
            {phaseCode}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "taux",
    header: ({ column }) => (
      <EnhancedHeader icon={Percent} color="success" column={column}>
        Taux
      </EnhancedHeader>
    ),
    cell: ({ row }) => {
      const taux = Number.parseFloat(row.getValue("taux"));
      return (
        <Badge
          variant="default"
          className="font-semibold text-center text-[14px] p-2 w-20 rounded-full border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5"
        >
          {taux} %
        </Badge>
      );
    },
  },
  {
    accessorKey: "mntProd",
    header: ({ column }) => (
      <EnhancedHeader icon={DollarSign} color="success" column={column}>
        Montant
      </EnhancedHeader>
    ),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("mntProd"));
      return (
        <div className="font-semibold tabular-nums">{formatAmount(amount)}</div>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right px-2">
        <div className="flex items-center justify-end gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Actions
        </div>
      </div>
    ),
    cell: ({ row }) => {
      const production = row.original;
      return <ActionsCell production={production} />;
    },
  },
];
