/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Phase, TeamMember, User, Production, Product } from "@prisma/client";
import CustomSheet from "@/components/global/custom-sheet";
import ProjectForm from "@/components/forms/project-form";

// Import des composants créés
import ProjectHeader from "./project-header";

import ProductionDetailsModal from "./production-details-modal";
import { PhaseModal, TeamMemberModal, ProductionModal } from "./form-modals";
import {
  DeletePhaseDialog,
  RemoveTeamMemberDialog,
} from "./confirmation-dialogs";
import OverviewTab from "./overview-tab";
import PhasesTab from "./phases-tab";
import TeamTab from "./team-tab";
import ProductionTab from "./production-tab";
import { ProjectWithDetails } from "@/lib/types";

// // Types pour les données du projet
// type ProjectWithRelations = Project & {
//   phases: (Phase & {
//     Product?: Product & {
//       Productions?: Production[];
//     };
//   })[];
//   team?: {
//     id: string;
//     TeamMembers: (TeamMember & {
//       user: User;
//     })[];
//   };
// };

interface ProjectDashboardProps {
  project: ProjectWithDetails;
  unitId: string;
}

const ProjectDashboard = ({ project, unitId }: ProjectDashboardProps) => {
  const router = useRouter();
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isAddPhaseOpen, setIsAddPhaseOpen] = useState(false);
  const [isEditPhaseOpen, setIsEditPhaseOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase>();
  const [isDeletePhaseOpen, setIsDeletePhaseOpen] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState<Phase | null>(null);
  const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false);
  const [isEditTeamMemberOpen, setIsEditTeamMemberOpen] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<
    (TeamMember & { user: User }) | undefined
  >();
  const [isRemoveTeamMemberOpen, setIsRemoveTeamMemberOpen] = useState(false);
  const [teamMemberToRemove, setTeamMemberToRemove] = useState<
    (TeamMember & { user: User }) | null
  >(null);
  const [isAddProductionOpen, setIsAddProductionOpen] = useState(false);
  const [isEditProductionOpen, setIsEditProductionOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production>();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [isProductionDetailsOpen, setIsProductionDetailsOpen] = useState(false);
  const [selectedPhaseForDetails, setSelectedPhaseForDetails] = useState<
    | (Phase & {
        Product?: Product & {
          Productions?: Production[];
        };
      })
    | undefined
  >();

  // Fonctions de gestion des phases
  const handleAddPhase = () => {
    setSelectedPhase(undefined);
    setIsAddPhaseOpen(true);
  };

  const handleEditPhase = (phase: Phase) => {
    setSelectedPhase(phase);
    setIsEditPhaseOpen(true);
  };

  const handleDeletePhase = (phase: Phase) => {
    setPhaseToDelete(phase);
    setIsDeletePhaseOpen(true);
  };

  const confirmDeletePhase = async () => {
    if (!phaseToDelete) return;

    try {
      const response = await fetch(`/api/phases/${phaseToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la phase");
      }

      toast.success("Phase supprimée avec succès");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la suppression de la phase:", error);
      toast.error("Erreur lors de la suppression de la phase");
    } finally {
      setIsDeletePhaseOpen(false);
      setPhaseToDelete(null);
    }
  };

  // Fonctions de gestion des membres d'équipe
  const handleAddTeamMember = () => {
    setSelectedTeamMember(undefined);
    setIsAddTeamMemberOpen(true);
  };

  const handleEditTeamMember = (teamMember: TeamMember & { user: User }) => {
    setSelectedTeamMember(teamMember);
    setIsEditTeamMemberOpen(true);
  };

  const handleRemoveTeamMember = (teamMember: TeamMember & { user: User }) => {
    setTeamMemberToRemove(teamMember);
    setIsRemoveTeamMemberOpen(true);
  };

  const confirmRemoveTeamMember = async () => {
    if (!teamMemberToRemove) return;

    try {
      const response = await fetch(
        `/api/team-members/${teamMemberToRemove.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du retrait du membre");
      }

      toast.success("Membre retiré avec succès");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors du retrait du membre:", error);
      toast.error("Erreur lors du retrait du membre");
    } finally {
      setIsRemoveTeamMemberOpen(false);
      setTeamMemberToRemove(null);
    }
  };

  // Fonctions de gestion des productions
  const handleAddProduction = (
    phaseId: string,
    productId?: string,
    phase?: Phase & {
      Product?: Product & {
        Productions?: Production[];
      };
    }
  ) => {
    if (!productId && phase) {
      // Si le produit n'existe pas encore, créer un nouveau produit
      createProduct(phaseId, phase);
      return;
    }

    setSelectedProduction(undefined);
    setSelectedProductId(productId || "");
    setSelectedPhaseId(phaseId);
    setIsAddProductionOpen(true);
  };

  const handleEditProduction = (
    production: Production,
    productId: string,
    phaseId: string
  ) => {
    setSelectedProduction(production);
    setSelectedProductId(productId);
    setSelectedPhaseId(phaseId);
    setIsEditProductionOpen(true);
  };

  const handleDeleteProduction = async (productionId: string) => {
    try {
      const response = await fetch(`/api/productions/${productionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la production");
      }

      toast.success("Production supprimée avec succès");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la suppression de la production:", error);
      toast.error("Erreur lors de la suppression de la production");
    }
  };

  const createProduct = async (
    phaseId: string,
    phase: Phase & {
      Product?: Product & {
        Productions?: Production[];
      };
    }
  ) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phaseId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du produit");
      }

      const data = await response.json();
      toast.success("Produit créé avec succès");

      // Ouvrir le formulaire d'ajout de production avec le nouveau produit
      setSelectedProduction(undefined);
      setSelectedProductId(data.id);
      setSelectedPhaseId(phaseId);
      setIsAddProductionOpen(true);
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
      toast.error("Erreur lors de la création du produit");
    }
  };

  const handleViewProductionDetails = (
    phase: Phase & {
      Product?: Product & {
        Productions?: Production[];
      };
    }
  ) => {
    setSelectedPhaseForDetails(phase);
    setIsProductionDetailsOpen(true);
  };

  // Gestion des formulaires
  const handleProjectFormSuccess = () => {
    setIsEditProjectOpen(false);
    router.refresh();
    toast.success("Projet mis à jour avec succès");
  };

  const handlePhaseFormSuccess = () => {
    setIsAddPhaseOpen(false);
    setIsEditPhaseOpen(false);
    router.refresh();
    toast.success(
      `Phase ${selectedPhase ? "modifiée" : "ajoutée"} avec succès`
    );
  };

  const handleTeamMemberFormSuccess = () => {
    setIsAddTeamMemberOpen(false);
    setIsEditTeamMemberOpen(false);
    router.refresh();
    toast.success(
      `Membre ${selectedTeamMember ? "modifié" : "ajouté"} avec succès`
    );
  };

  const handleProductionFormSuccess = () => {
    setIsAddProductionOpen(false);
    setIsEditProductionOpen(false);
    router.refresh();
    toast.success(
      `Production ${selectedProduction ? "modifiée" : "ajoutée"} avec succès`
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête du projet */}
      <ProjectHeader project={project} unitId={unitId} />

      {/* Onglets du projet */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab
            project={project}
            onEditPhase={handleEditPhase}
            onDeletePhase={handleDeletePhase}
            onAddPhase={handleAddPhase}
          />
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <PhasesTab
            phases={project.phases}
            onEditPhase={handleEditPhase}
            onDeletePhase={handleDeletePhase}
            onAddPhase={handleAddPhase}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamTab
            team={
              project.team
                ? {
                    id: project.team.id,
                    TeamMembers: project.team.members.map((member) => ({
                      ...member,
                      user: member.user,
                    })),
                  }
                : undefined
            }
            onAddTeamMember={handleAddTeamMember}
            onEditTeamMember={handleEditTeamMember}
            onRemoveTeamMember={handleRemoveTeamMember}
          />
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <ProductionTab
            phases={project.phases}
            onViewProductionDetails={handleViewProductionDetails}
            onAddProduction={handleAddProduction}
            onAddPhase={handleAddPhase}
          />
        </TabsContent>
      </Tabs>

      {/* Modales et dialogues */}
      <CustomSheet
        title="Modifier le projet"
        subheading="Modifier les détails du projet"
        defaultOpen={isEditProjectOpen}
      >
        <ProjectForm project={project} unitId={unitId} />
      </CustomSheet>

      {/* Modales de phase */}
      <PhaseModal
        isOpen={isAddPhaseOpen || isEditPhaseOpen}
        projectId={project.id}
        selectedPhase={selectedPhase}
        onSuccess={handlePhaseFormSuccess}
        onCancel={() => {
          setIsAddPhaseOpen(false);
          setIsEditPhaseOpen(false);
        }}
      />

      {/* Modales de membre d'équipe */}
      <TeamMemberModal
        isOpen={isAddTeamMemberOpen || isEditTeamMemberOpen}
        projectId={project.id}
        teamId={project.team?.id}
        selectedTeamMember={selectedTeamMember}
        onSuccess={handleTeamMemberFormSuccess}
        onCancel={() => {
          setIsAddTeamMemberOpen(false);
          setIsEditTeamMemberOpen(false);
        }}
        unitId={unitId}
      />

      {/* Modales de production */}
      <ProductionModal
        isOpen={isAddProductionOpen || isEditProductionOpen}
        productId={selectedProductId}
        phaseId={selectedPhaseId}
        selectedProduction={selectedProduction}
        phaseData={{
          montantHT:
            project.phases.find((p) => p.id === selectedPhaseId)?.montantHT ||
            0,
        }}
        onSuccess={handleProductionFormSuccess}
        onCancel={() => {
          setIsAddProductionOpen(false);
          setIsEditProductionOpen(false);
        }}
      />

      {/* Modale de détails de production */}
      <ProductionDetailsModal
        isOpen={isProductionDetailsOpen}
        onClose={() => setIsProductionDetailsOpen(false)}
        selectedPhase={selectedPhaseForDetails}
        onAddProduction={handleAddProduction}
        onEditProduction={handleEditProduction}
        onDeleteProduction={handleDeleteProduction}
      />

      {/* Dialogues de confirmation */}
      <DeletePhaseDialog
        isOpen={isDeletePhaseOpen}
        onOpenChange={setIsDeletePhaseOpen}
        phaseToDelete={phaseToDelete}
        onConfirm={confirmDeletePhase}
      />

      <RemoveTeamMemberDialog
        isOpen={isRemoveTeamMemberOpen}
        onOpenChange={setIsRemoveTeamMemberOpen}
        teamMemberToRemove={teamMemberToRemove}
        onConfirm={confirmRemoveTeamMember}
      />
    </div>
  );
};

export default ProjectDashboard;
