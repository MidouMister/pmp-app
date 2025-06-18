"use client";

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
import { Phase, TeamMember, User } from "@prisma/client";

interface DeletePhaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  phaseToDelete: Phase | null;
  onConfirm: () => void;
}

/**
 * Dialogue de confirmation pour la suppression d'une phase
 */
export const DeletePhaseDialog = ({
  isOpen,
  onOpenChange,
  phaseToDelete,
  onConfirm,
}: DeletePhaseDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action ne peut pas être annulée. Cela supprimera
            définitivement la phase
            {phaseToDelete ? ` "${phaseToDelete.name}"` : ""} et toutes ses
            données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface RemoveTeamMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamMemberToRemove: (TeamMember & { user: User }) | null;
  onConfirm: () => void;
}

/**
 * Dialogue de confirmation pour le retrait d'un membre d'équipe
 */
export const RemoveTeamMemberDialog = ({
  isOpen,
  onOpenChange,
  teamMemberToRemove,
  onConfirm,
}: RemoveTeamMemberDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action ne peut pas être annulée. Cela retirera définitivement
            {teamMemberToRemove
              ? ` ${teamMemberToRemove.user.name}`
              : " ce membre"}{" "}
            de l&apos;équipe du projet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Retirer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};