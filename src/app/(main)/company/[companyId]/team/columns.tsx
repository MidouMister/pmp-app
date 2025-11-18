"use client";

import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";
import { Role } from "@prisma/client";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
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
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useModal } from "@/providers/modal-provider";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { UsersWithCompanyUnit } from "@/lib/types";
import { deleteUser, getUser } from "@/lib/queries";
import { toast } from "sonner";
import CustomModal from "@/components/global/custom-model";
import UserDetails from "@/components/forms/user-details";

export const columns: ColumnDef<UsersWithCompanyUnit>[] = [
  {
    accessorKey: "id",
    header: "",
    cell: () => null,
  },
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => {
      const avatarUrl = row.original.avatarUrl;
      const name = row.getValue("name") as string;

      return (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 relative flex-none">
            <Image
              src={avatarUrl || "/default-avatar.png"}
              fill
              className="rounded-full object-cover"
              alt={`Avatar de ${name}`}
            />
          </div>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <span className="text-muted-foreground">{email}</span>;
    },
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => {
      const role: Role = row.getValue("role");
      return (
        <Badge
          className={clsx("font-semibold", {
            "bg-emerald-500 hover:bg-emerald-600": role === "OWNER",
            "bg-orange-400 hover:bg-orange-500": role === "ADMIN",
            "bg-primary hover:bg-primary/90": role === "USER",
          })}
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "unitId",
    header: "Unité / Entreprise",
    cell: ({ row }) => {
      const role = row.getValue("role") as Role;
      const isOwner = role === "OWNER";
      const companyName = row.original.Company?.name;
      const unitName = row.original.Unit?.name;

      if (isOwner && companyName) {
        return (
          <Badge
            variant="outline"
            className="border-emerald-500 text-emerald-600 bg-emerald-500/10 hover:bg-emerald-100 whitespace-nowrap"
          >
            Entreprise: {companyName}
          </Badge>
        );
      }

      if (unitName) {
        return (
          <Badge
            variant="outline"
            className="border-primary text-primary bg-primary/5 hover:bg-primary/10 whitespace-nowrap"
          >
            Unité: {unitName}
          </Badge>
        );
      }

      return (
        <Badge
          variant="outline"
          className="border-muted-foreground/30 text-muted-foreground whitespace-nowrap"
        ></Badge>
      );
    },
  },
  {
    accessorKey: "jobeTitle",
    header: "Poste",
    cell: ({ row }) => {
      const jobTitle = row.getValue("jobeTitle") as string | null;
      return (
        <span className="text-muted-foreground">
          {jobTitle || "Non spécifié"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const rowData = row.original;
      return <CellActions rowData={rowData} />;
    },
  },
];

interface CellActionsProps {
  rowData: UsersWithCompanyUnit;
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const { setOpen } = useModal();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const modalId = `user-details-${rowData.id}`;

  if (!rowData || !rowData.Company) return null;

  const isOwner = rowData.role === "OWNER";

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
            onClick={() => {
              navigator.clipboard.writeText(rowData.email);
              toast.success("Email copié dans le presse-papiers");
            }}
          >
            <Copy size={15} /> Copier l&apos;email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                modalId,
                <CustomModal
                  modalId={modalId}
                  title="Modifier les détails de l'utilisateur"
                  subheading="Vous ne pouvez modifier que le rôle de l'utilisateur et le poste"
                >
                  <UserDetails data={rowData} />
                </CustomModal>,
                async () => {
                  const user = await getUser(rowData.id);
                  return { user: user || undefined };
                }
              );
            }}
          >
            <Edit size={15} />
            Modifier les détails
          </DropdownMenuItem>
          {!isOwner && (
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex gap-2 text-destructive focus:text-destructive">
                <Trash size={15} /> Supprimer l&apos;utilisateur
              </DropdownMenuItem>
            </AlertDialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Êtes-vous sûr de vouloir supprimer cet utilisateur ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Cette action est irréversible. Cela supprimera définitivement
            l&apos;utilisateur <strong>{rowData.name}</strong> et les données
            associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
            onClick={async () => {
              setLoading(true);
              try {
                await deleteUser(rowData.id);
                toast.success("Utilisateur supprimé avec succès");
                router.refresh();
              } catch (error) {
                toast.error("Erreur lors de la suppression de l'utilisateur");
                console.error(error);
              } finally {
                setLoading(false);
              }
            }}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
