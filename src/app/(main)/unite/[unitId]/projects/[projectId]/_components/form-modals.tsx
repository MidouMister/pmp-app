"use client";

import CustomSheet from "@/components/global/custom-sheet";
import PhaseForm from "@/components/forms/phase-form";
import TeamMemberForm from "@/components/forms/team-member-form";
import ProductionForm from "@/components/forms/production-form";
import { Phase, Production, TeamMember, User } from "@prisma/client";

interface PhaseModalProps {
  isOpen: boolean;
  projectId: string;
  selectedPhase: Phase | undefined;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Modale pour l'ajout ou la modification d'une phase
 */
export const PhaseModal = ({
  isOpen,
  projectId,
  selectedPhase,
  onSuccess,
  onCancel,
}: PhaseModalProps) => {
  if (!isOpen) return null;

  return (
    <CustomSheet
      title={selectedPhase ? "Modifier la phase" : "Ajouter une phase"}
      subheading={
        selectedPhase
          ? "Modifier les détails de la phase"
          : "Ajouter une nouvelle phase au projet"
      }
      defaultOpen={true}
    >
      <PhaseForm
        projectId={projectId}
        phase={selectedPhase}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </CustomSheet>
  );
};

interface TeamMemberModalProps {
  isOpen: boolean;
  projectId: string;
  teamId: string | undefined;
  selectedTeamMember: (TeamMember & { user: User }) | undefined;
  onSuccess: () => void;
  onCancel: () => void;
  unitId: string;
}

/**
 * Modale pour l'ajout ou la modification d'un membre d'équipe
 */
export const TeamMemberModal = ({
  isOpen,
  projectId,
  teamId,
  selectedTeamMember,
  onSuccess,
  onCancel,
  unitId,
}: TeamMemberModalProps) => {
  if (!isOpen) return null;

  return (
    <CustomSheet
      title={
        selectedTeamMember ? "Modifier le membre" : "Ajouter un membre"
      }
      subheading={
        selectedTeamMember
          ? "Modifier les détails du membre"
          : "Ajouter un nouveau membre à l'équipe"
      }
      defaultOpen={true}
    >
      <TeamMemberForm
        projectId={projectId}
        teamId={teamId}
        teamMember={selectedTeamMember}
        onSuccess={onSuccess}
        onCancel={onCancel}
        unitId={unitId}
      />
    </CustomSheet>
  );
};

interface ProductionModalProps {
  isOpen: boolean;
  productId: string;
  phaseId: string;
  selectedProduction: Production | undefined;
  phaseData: {
    montantHT: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Modale pour l'ajout ou la modification d'une production
 */
export const ProductionModal = ({
  isOpen,
  productId,
  phaseId,
  selectedProduction,
  phaseData,
  onSuccess,
  onCancel,
}: ProductionModalProps) => {
  if (!isOpen) return null;

  return (
    <CustomSheet
      title={
        selectedProduction
          ? "Modifier la production"
          : "Ajouter une production"
      }
      subheading={
        selectedProduction
          ? "Modifier les détails de la production"
          : "Ajouter une nouvelle production à la phase"
      }
      defaultOpen={true}
    >
      <ProductionForm
        productId={productId}
        phaseId={phaseId}
        production={selectedProduction}
        phaseData={phaseData}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </CustomSheet>
  );
};