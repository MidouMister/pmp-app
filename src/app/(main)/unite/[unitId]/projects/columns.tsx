"use client";

import type React from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { type Project, Status } from "@prisma/client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Code,
  Copy,
  Edit,
  FileText,
  MoreHorizontal,
  Timer,
  Trash,
  User,
  Clock,
  DollarSign,
  AlertCircle,
  Pause,
  CheckCircle2,
} from "lucide-react";
import { useModal } from "@/providers/modal-provider";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteProject } from "@/lib/queries";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import CustomModal from "@/components/global/custom-model";
import ProjectForm from "@/components/forms/project-form";
import { formatAmount } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const columns: ColumnDef<Project & { Client: { name: string } }>[] = [
  {
    accessorKey: "id",
    header: "",
    cell: () => {
      return null;
    },
  },
  {
    accessorKey: "name",
    header: () => (
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-primary" />
        <span>Nom</span>
      </div>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-start gap-2 font-medium min-w-0 w-full">
                <Link
                  href={`/unite/${row.original.unitId}/projects/${row.original.id}`}
                  className="block min-w-0 max-w-[400px] leading-5 text-sm hover:text-primary transition-colors"
                >
                  <span className="block break-words whitespace-normal line-clamp-3 text-left">
                    {name.toLocaleUpperCase().toWellFormed()}
                  </span>
                </Link>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[400px]">
              <p className="break-words">{name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 350,
  },
  {
    accessorKey: "code",
    header: () => (
      <div className="flex items-center gap-2">
        <Code size={16} className="text-blue-500" />
        <span>Code</span>
      </div>
    ),
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="font-mono text-xs rounded-md shadow-sm border border-border bg-primary/10 text-primary transition-all duration-200"
          >
            {code}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "Client.name",
    header: () => (
      <div className="flex items-center gap-2">
        <User size={16} className="text-green-500" />
        <span>Client</span>
      </div>
    ),
    cell: ({ row }) => {
      const client = row.original.Client.name;
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-green-500">{client}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "montantTTC",
    header: () => (
      <div className="flex items-center gap-2">
        <DollarSign size={16} className="text-blue-400" />
        <span>Montant TTC</span>
      </div>
    ),
    cell: ({ row }) => {
      const montant = Number.parseFloat(row.getValue("montantTTC"));
      const formattedMontant = formatAmount(montant);

      return <div className="font-semibold">{formattedMontant}</div>;
    },
  },
  {
    accessorKey: "ods",
    header: () => (
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-orange-500" />
        <span>ODS</span>
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("ods") as Date;
      return (
        <div className="flex items-center gap-2">
          <span>
            {date ? format(new Date(date), "dd/MM/yyyy", { locale: fr }) : "-"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "delai",
    header: () => (
      <div className="flex items-center gap-2">
        <Timer size={16} className="text-purple-500" />
        <span>Délai</span>
      </div>
    ),
    cell: ({ row }) => {
      const delai = row.getValue("delai") as string;
      return (
        <div className="flex items-center gap-2">
          <span>{delai}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-yellow-500" />
        <span>Statut</span>
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as Status;
      const statusConfig = {
        [Status.New]: {
          label: "Nouveau",
          icon: AlertCircle,
          className:
            " text-[#57acea]  dark:text-[#57acea] border-[1px] border-[#57acea]",
        },
        [Status.InProgress]: {
          label: "En cours",
          icon: Clock,
          className:
            " text-amber-600  dark:text-amber-400 border-[1px] border-amber-400",
        },
        [Status.Pause]: {
          label: "En pause",
          icon: Pause,
          className:
            " text-orange-600  dark:text-orange-400 border-[1px] border-orange-400",
        },
        [Status.Complete]: {
          label: "Terminé",
          icon: CheckCircle2,
          className:
            " text-green-600  dark:text-green-400 border-[1px] border-green-400",
        },
      };

      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "font-medium border-transparent transition-colors rounded-md flex items-center gap-1.5",
              config.className
            )}
          >
            <Icon size={16} className="flex-shrink-0" />
            {config.label}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => (
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-indigo-500" />
        <span>Type</span>
      </div>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <div className="flex items-start gap-2 min-w-0 w-[100px]">
          <Badge
            variant="outline"
            className="font-mono text-xs rounded-md shadow-sm border border-border bg-purple-600/10 text-purple-400 transition-all duration-200"
          >
            <span className="block break-words whitespace-normal line-clamp-2 text-left leading-4 text-xs">
              {type.toLocaleUpperCase().toWellFormed()}
            </span>
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original;

      return <CellActions rowData={rowData} />;
    },
  },
];

interface CellActionsProps {
  rowData: Project & { Client: { name: string } };
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const { setOpen } = useModal();

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  if (!rowData) return;

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => navigator.clipboard.writeText(rowData.code || "")}
          >
            <Copy size={15} className="text-blue-500" /> Copier le code
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal
                  title="Modifier les détails du projet"
                  subheading="Vous pouvez modifier les détails du projet"
                >
                  <ProjectForm unitId={rowData.unitId} project={rowData} />
                </CustomModal>
              );
            }}
          >
            <Edit size={15} className="text-amber-500" /> Modifier
          </DropdownMenuItem>

          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2">
              <Trash size={15} className="text-red-500" /> Supprimer
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous absolument sûr?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action ne peut pas être annulée. Cela supprimera
            définitivement le projet{" "}
            <span className="font-bold">{rowData.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={async () => {
              try {
                setLoading(true);
                await deleteProject(rowData.id, rowData.unitId);
                toast.success("Projet supprimé avec succès");
                router.refresh();
              } catch (error) {
                toast.error("Une erreur est survenue" + error);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
