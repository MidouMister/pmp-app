"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Client } from "@prisma/client";

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
  Copy,
  Edit,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Trash,
  User,
} from "lucide-react";
import { useModal } from "@/providers/modal-provider";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteUser, getClientById } from "@/lib/queries";
import { toast } from "sonner";
import ClientForm from "@/components/forms/client-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import CustomModal from "@/components/global/custom-model";

export const columns: ColumnDef<Client>[] = [
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
        <User size={16} className="text-primary" />
        <span>Nom</span>
      </div>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 font-medium">
                <User size={16} className="text-primary" />
                <span>{name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Client: {name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "wilaya",
    header: () => (
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-orange-500" />
        <span>Wilaya</span>
      </div>
    ),
    cell: ({ row }) => {
      const wilaya = row.getValue("wilaya") as string;
      return (
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-orange-500" />
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 hover:bg-orange-100"
          >
            {wilaya}
          </Badge>
        </div>
      );
    },
  },

  {
    accessorKey: "email",
    header: () => (
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-blue-500" />
        <span>Email</span>
      </div>
    ),
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-blue-500" />
          <span>{email}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "phone",
    header: () => (
      <div className="flex items-center gap-2">
        <Phone size={16} className="text-green-500" />
        <span>Phone</span>
      </div>
    ),
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return (
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-green-500" />
          <span>{phone}</span>
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
  rowData: Client;
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
            onClick={() => navigator.clipboard.writeText(rowData.email || "")}
          >
            <Copy size={15} className="text-blue-500" /> Copier l&apos;email
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal
                  title="Modifier les détails client"
                  subheading="vous pouvez modifier les détails du client"
                >
                  <ClientForm unitId={rowData.unitId} client={rowData} />
                </CustomModal>,
                async () => {
                  const client = await getClientById(rowData?.id);
                  return { client: client || undefined };
                }
              );
            }}
          >
            <Edit size={15} className="text-amber-500" />
            Modifier les détails
          </DropdownMenuItem>

          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="flex gap-2 text-destructive"
              onClick={() => {}}
            >
              <Trash size={15} /> Supprimer le client
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Êtes-vous sûr de vouloir supprimer ce client ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Cette action est irréversible. Cela supprimera définitivement le
            client.
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
              toast.success("Client supprimé avec succès");
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
