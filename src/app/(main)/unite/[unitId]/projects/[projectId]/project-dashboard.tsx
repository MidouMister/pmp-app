"use client";

import { useState } from "react";
import { Phase, TeamMember, User } from "@prisma/client";
import { formatDate } from "@/lib/format-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useModal } from "@/providers/modal-provider";
import { deletePhase, removeTeamMember } from "@/lib/queries";
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
import CustomModal from "@/components/global/custom-model";
import ProjectForm from "@/components/forms/project-form";
import PhaseForm from "../../../../../../components/forms/phase-form";
import TeamMemberForm from "../../../../../../components/forms/team-member-form";
import { ProjectWithDetails } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProjectDashboardProps {
  project: ProjectWithDetails;
  unitId: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "New":
      return <Badge className="bg-blue-500">Nouveau</Badge>;
    case "InProgress":
      return <Badge className="bg-yellow-500">En cours</Badge>;
    case "Pause":
      return <Badge className="bg-orange-500">En pause</Badge>;
    case "Complete":
      return <Badge className="bg-green-500">Terminé</Badge>;
    default:
      return <Badge>Inconnu</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "New":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "InProgress":
      return <PlayCircle className="h-4 w-4 text-yellow-500" />;
    case "Pause":
      return <PauseCircle className="h-4 w-4 text-orange-500" />;
    case "Complete":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const ProjectDashboard = ({ project, unitId }: ProjectDashboardProps) => {
  const { setOpen } = useModal();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // États pour les modaux
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | undefined>(
    undefined
  );
  const [selectedTeamMember, setSelectedTeamMember] = useState<
    (TeamMember & { user: User }) | undefined
  >(undefined);

  // États pour les dialogues de confirmation
  const [isDeletePhaseDialogOpen, setIsDeletePhaseDialogOpen] = useState(false);
  const [isRemoveTeamMemberDialogOpen, setIsRemoveTeamMemberDialogOpen] =
    useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState<Phase | null>(null);
  const [teamMemberToRemove, setTeamMemberToRemove] = useState<
    (TeamMember & { user: User }) | null
  >(null);

  // Fonctions pour gérer les phases
  const handleAddPhase = () => {
    setSelectedPhase(undefined);
    setIsPhaseModalOpen(true);
  };

  const handleEditPhase = (phase: Phase) => {
    setSelectedPhase(phase);
    setIsPhaseModalOpen(true);
  };

  const handleDeletePhase = (phase: Phase) => {
    setPhaseToDelete(phase);
    setIsDeletePhaseDialogOpen(true);
  };

  const confirmDeletePhase = async () => {
    if (!phaseToDelete) return;

    try {
      await deletePhase(phaseToDelete.id);
      toast.success("Phase supprimée avec succès");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la suppression de la phase");
    } finally {
      setIsDeletePhaseDialogOpen(false);
      setPhaseToDelete(null);
    }
  };

  // Fonctions pour gérer les membres d'équipe
  const handleAddTeamMember = () => {
    setSelectedTeamMember(undefined);
    setIsTeamMemberModalOpen(true);
  };

  const handleEditTeamMember = (teamMember: TeamMember & { user: User }) => {
    setSelectedTeamMember(teamMember);
    setIsTeamMemberModalOpen(true);
  };

  const handleRemoveTeamMember = (teamMember: TeamMember & { user: User }) => {
    setTeamMemberToRemove(teamMember);
    setIsRemoveTeamMemberDialogOpen(true);
  };

  const confirmRemoveTeamMember = async () => {
    if (!teamMemberToRemove) return;

    try {
      await removeTeamMember(teamMemberToRemove.id);
      toast.success("Membre retiré avec succès");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du retrait du membre");
    } finally {
      setIsRemoveTeamMemberDialogOpen(false);
      setTeamMemberToRemove(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal pour les phases */}
      {isPhaseModalOpen && (
        <CustomModal
          title={selectedPhase ? "Modifier la phase" : "Ajouter une phase"}
          subheading={
            selectedPhase
              ? "Modifier les détails de la phase"
              : "Ajouter une nouvelle phase au projet"
          }
          defaultOpen={true}
        >
          <PhaseForm
            projectId={project.id}
            phase={selectedPhase}
            onSuccess={() => setIsPhaseModalOpen(false)}
            onCancel={() => setIsPhaseModalOpen(false)}
          />
        </CustomModal>
      )}

      {/* Modal pour les membres d'équipe */}
      {isTeamMemberModalOpen && (
        <CustomModal
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
            projectId={project.id}
            teamId={project.team?.id}
            teamMember={selectedTeamMember}
            onSuccess={() => setIsTeamMemberModalOpen(false)}
            onCancel={() => setIsTeamMemberModalOpen(false)}
            unitId={unitId}
          />
        </CustomModal>
      )}

      {/* Dialogue de confirmation pour la suppression de phase */}
      <AlertDialog
        open={isDeletePhaseDialogOpen}
        onOpenChange={setIsDeletePhaseDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera
              définitivement la phase du projet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePhase}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue de confirmation pour le retrait de membre */}
      <AlertDialog
        open={isRemoveTeamMemberDialogOpen}
        onOpenChange={setIsRemoveTeamMemberDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela retirera
              définitivement ce membre de l&apos;équipe du projet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveTeamMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* En-tête du projet */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Code: {project.code}</span>
            <span>•</span>
            <span>Client: {project.Client.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              {getStatusIcon(project.status)}
              {getStatusBadge(project.status)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              setOpen(
                <CustomModal
                  title="Modifier le projet"
                  subheading="Modifiez les informations du projet"
                >
                  <ProjectForm unitId={unitId} project={project} />
                </CustomModal>
              )
            }
          >
            Modifier{" "}
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
        </TabsList>

        {/* Onglet Aperçu */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Informations du projet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Type
                    </p>
                    <p>{project.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Statut
                    </p>
                    <p className="flex items-center gap-2">
                      {getStatusBadge(project.status)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Montant HT
                    </p>
                    <p>{project.montantHT.toLocaleString()} DA</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Montant TTC
                    </p>
                    <p>{project.montantTTC.toLocaleString()} DA</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Délai
                    </p>
                    <p>{project.delai}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Signé
                    </p>
                    <p>{project.signe ? "Oui" : "Non"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      ODS
                    </p>
                    <p className="flex items-center gap-2">
                      {project.ods ? (
                        <>
                          <CalendarIcon className="h-4 w-4" />
                          {formatDate(project.ods)}
                        </>
                      ) : (
                        "Non défini"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Créé le
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Informations du client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nom
                    </p>
                    <p>{project.Client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Wilaya
                    </p>
                    <p>{project.Client.wilaya || "Non défini"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Téléphone
                    </p>
                    <p>{project.Client.phone || "Non défini"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p>{project.Client.email || "Non défini"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Résumé des phases</CardTitle>
              <CardDescription>
                {project.phases.length} phase(s) au total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.phases.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {project.phases.map((phase) => (
                      <Card key={phase.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {phase.name}
                          </CardTitle>
                          <CardDescription>Code: {phase.code}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Montant HT:
                              </span>
                              <span>{phase.montantHT.toLocaleString()} DA</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Statut:
                              </span>
                              <span>{getStatusBadge(phase.status)}</span>
                            </div>
                            {phase.start && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Début:
                                </span>
                                <span>{formatDate(phase.start)}</span>
                              </div>
                            )}
                            {phase.end && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Fin:
                                </span>
                                <span>{formatDate(phase.end)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <p className="text-muted-foreground">
                      Aucune phase n&apos;a été ajoutée à ce projet
                    </p>
                    <Button className="mt-2" onClick={handleAddPhase}>
                      Ajouter une phase
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Phases */}
        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Phases du projet</CardTitle>
                <CardDescription>
                  Gérez les phases de votre projet
                </CardDescription>
              </div>
              <Button onClick={handleAddPhase}>Ajouter une phase</Button>
            </CardHeader>
            <CardContent>
              {project.phases.length > 0 ? (
                <div className="space-y-4">
                  {project.phases.map((phase) => (
                    <Card key={phase.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {phase.name}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPhase(phase)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePhase(phase)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                        <CardDescription>Code: {phase.code}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Montant HT
                            </p>
                            <p>{phase.montantHT.toLocaleString()} DA</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Statut
                            </p>
                            <p className="flex items-center gap-2">
                              {getStatusBadge(phase.status)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Période
                            </p>
                            <p>
                              {phase.start && phase.end
                                ? `${formatDate(phase.start)} - ${formatDate(
                                    phase.end
                                  )}`
                                : "Non définie"}
                            </p>
                          </div>
                        </div>
                        {phase.obs && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-muted-foreground">
                              Observations
                            </p>
                            <p>{phase.obs}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    Aucune phase n&apos;a été ajoutée à ce projet
                  </p>
                  <Button className="mt-4" onClick={handleAddPhase}>
                    Ajouter une phase
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Équipe */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Équipe du projet</CardTitle>
                <CardDescription>
                  Gérez les membres de l&apos;équipe du projet
                </CardDescription>
              </div>
              <Button onClick={handleAddTeamMember}>Ajouter un membre</Button>
            </CardHeader>
            <CardContent>
              {project.team && project.team.members.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {project.team.members.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                              {member.user.avatarUrl ? (
                                <Avatar className="w-fit h-fit">
                                  <AvatarImage
                                    src={member.user.avatarUrl || ""}
                                    alt={member.user.name}
                                  />
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    {member.user.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Users className="h-full w-full p-2" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{member.user.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {member.role}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTeamMember(member)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveTeamMember(member)}
                            >
                              Retirer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    Aucun membre n&apos;a été ajouté à l&apos;équipe du projet
                  </p>
                  <Button className="mt-4" onClick={handleAddTeamMember}>
                    Ajouter un membre
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogues de confirmation */}
      <AlertDialog
        open={isDeletePhaseDialogOpen}
        onOpenChange={setIsDeletePhaseDialogOpen}
      >
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
              onClick={confirmDeletePhase}
              className="bg-destructive text-destructive-foreground"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isRemoveTeamMemberDialogOpen}
        onOpenChange={setIsRemoveTeamMemberDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela retirera
              définitivement
              {teamMemberToRemove
                ? ` ${teamMemberToRemove.user.name}`
                : " ce membre"}{" "}
              de l&apos;équipe du projet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveTeamMember}
              className="bg-destructive text-destructive-foreground"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDashboard;
