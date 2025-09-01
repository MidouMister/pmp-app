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
    cell: () => {
      return null;
    },
  },
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => {
      const avatarUrl = row.getValue("avatarUrl") as string;
      return (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 relative flex-none">
            <Image
              src={avatarUrl}
              fill
              className="rounded-full object-cover"
              alt="avatar image"
            />
          </div>
          <span>{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "avatarUrl",
    header: "",
    cell: () => {
      return null;
    },
  },
  { accessorKey: "email", header: "Email" },

  {
    accessorKey: "unitId",
    header: "Unité",
    cell: ({ row }) => {
      const isCompanyOwner = row.getValue("role") === "OWNER";
      const units = row.original?.Company?.units;

      if (isCompanyOwner)
        return (
          <div className="flex flex-col items-start">
            <div className="flex flex-col gap-2">
              <Badge className="border-emerald-500 whitespace-nowrap bg-transparent text-emerald-500 hover:text-white">
                Owner: {row?.original?.Company?.name}
              </Badge>
            </div>
          </div>
        );
      return (
        <div className="flex flex-col items-start">
          <div className="flex flex-col gap-2">
            {units && units.length > 0 && (
              <Badge className="border-primary whitespace-nowrap bg-transparent text-primary hover:text-white">
                Unit:{" "}
                {units.find((unit) => unit.id === row.getValue("unitId"))
                  ?.name || "Unknown"}
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "jobeTitle",
    header: "Poste",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role: Role = row.getValue("role");
      return (
        <Badge
          className={clsx({
            "bg-emerald-500": role === "OWNER",
            "bg-orange-400": role === "ADMIN",
            "bg-primary": role === "USER",
          })}
        >
          {role}
        </Badge>
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
  rowData: UsersWithCompanyUnit;
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const { setOpen } = useModal();

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const modalId = `user-details-${rowData?.id}`;
  if (!rowData) return;
  if (!rowData.Company) return;

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => navigator.clipboard.writeText(rowData?.email)}
          >
            <Copy size={15} /> Copy Email
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
                  const user = await getUser(rowData?.id);
                  return { user: user || undefined };
                }
              );
            }}
          >
            <Edit size={15} />
            Modifier les détails
          </DropdownMenuItem>
          {rowData.role !== "OWNER" && (
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
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
            l&apos;utilisateur et les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-destructive"
            onClick={async () => {
              setLoading(true);
              await deleteUser(rowData.id);
              toast.success("Utilaieur supprimé avec succès");
              setLoading(false);
              router.refresh();
            }}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
