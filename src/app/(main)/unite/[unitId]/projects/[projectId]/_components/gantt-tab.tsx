"use client";

import type React from "react";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Status } from "@prisma/client";
import type { ProjectWithDetails } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import CustomSheet from "@/components/global/custom-sheet";
import GanttMarkerForm from "@/components/forms/gantt-marker-form";
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureItem,
  GanttToday,
  GanttCreateMarkerTrigger,
  type GanttFeature,
  type GanttStatus,
  GanttMarker,
} from "@/components/ui/shadcn-io/gantt";
import {
  Calendar,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  ZoomIn,
  ZoomOut,
  Search,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";
import PhaseForm from "@/components/forms/phase-form";
import { useModal } from "@/providers/modal-provider";
import { deleteGanttMarker, deletePhase, onMovePhase } from "@/lib/queries";
import { Card } from "@/components/ui/card";

// Gantt-specific types for phases
export interface GanttPhaseFeature extends GanttFeature {
  code: string;
  montantHT: number;
  progress: number;
  obs?: string | null;
  duration?: number | null;
}

export interface GanttMarkerType {
  id: string;
  label: string;
  date: Date;
  className?: string | null;
  projectId: string;
}

type ViewRange = "daily" | "monthly" | "quarterly";

interface GanttTabProps {
  project: ProjectWithDetails;
}

// Status configuration with colors
const STATUS_CONFIG: Record<Status, GanttStatus> = {
  New: { id: "New", name: "Nouveau", color: "#64748b" },
  InProgress: { id: "InProgress", name: "En cours", color: "#3b82f6" },
  Pause: { id: "Pause", name: "En pause", color: "#f59e0b" },
  Complete: { id: "Complete", name: "Terminé", color: "#10b981" },
};

const GanttTab: React.FC<GanttTabProps> = ({ project }) => {
  const router = useRouter();
  const { setOpen, setClose } = useModal();
  const [viewRange, setViewRange] = useState<ViewRange>("monthly");
  const [zoom, setZoom] = useState(100);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");

  // Convert phases to Gantt features with filtering
  const ganttFeatures: GanttPhaseFeature[] = useMemo(() => {
    return project.phases
      .filter((phase) => {
        if (!phase.start || !phase.end) return false;

        // Filter by search term
        if (
          searchTerm &&
          !phase.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !phase.code.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        // Filter by status
        if (filterStatus !== "all" && phase.status !== filterStatus) {
          return false;
        }

        return true;
      })
      .map((phase) => ({
        id: phase.id,
        name: phase.name,
        code: phase.code,
        startAt: phase.start!,
        endAt: phase.end!,
        status: STATUS_CONFIG[phase.status],
        montantHT: phase.montantHT,
        progress: phase.progress,
        obs: phase.obs,
        duration: phase.duration,
      }));
  }, [project.phases, searchTerm, filterStatus]);

  // Convert Gantt markers
  const ganttMarkers: GanttMarkerType[] = useMemo(() => {
    return (project.GanttMarker || []).map((marker) => ({
      id: marker.id,
      label: marker.label,
      date: marker.date,
      className: marker.className,
      projectId: marker.projectId,
    }));
  }, [project.GanttMarker]);

  // Event handlers for phase operations
  const handleMovePhase = useCallback(
    async (id: string, startDate: Date, endDate: Date | null) => {
      if (!endDate) return;

      try {
        const response = await onMovePhase(id, startDate, endDate);

        if (!response) {
          throw new Error("Erreur lors de la mise à jour de la phase");
        }

        toast.success("Phase mise à jour avec succès");
        router.refresh();
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la phase:", error);
        toast.error("Erreur lors de la mise à jour de la phase");
      }
    },
    [router]
  );

  const handleViewPhase = useCallback(
    (id: string) => {
      const phase = project.phases.find((p) => p.id === id);
      if (phase) {
        const modalId = `view-phase-${phase.id}`;
        setOpen(
          modalId,
          <CustomSheet
            modalId={modalId}
            title="Détails de Phase"
            subheading={`Voir les détails de la phase ${phase.name}`}
          >
            <PhaseForm
              projectId={project.id}
              phase={phase}
              onSuccess={() => {
                router.refresh();
                toast.success("Phase modifiée avec succès");
                setClose();
              }}
              onCancel={() => {
                setClose();
              }}
            />
          </CustomSheet>
        );
      }
    },
    [project.phases, project.id, setOpen, setClose, router]
  );

  const handlePhaseclick = (id: string) => {
    console.log(`Phase selected: ${id}`);
  };

  const handleEditPhase = useCallback(
    (id: string) => {
      const phase = project.phases.find((p) => p.id === id);
      if (phase) {
        const modalId = `edit-phase-${phase.id}`;
        setOpen(
          modalId,
          <CustomSheet
            modalId={modalId}
            title="Modifier Une Phase"
            subheading={`Modifier la phase : ${phase.name}`}
          >
            <PhaseForm
              projectId={project.id}
              phase={phase}
              onSuccess={() => {
                router.refresh();
                toast.success("Phase modifiée avec succès");
                setClose();
              }}
              onCancel={() => {
                setClose();
              }}
            />
          </CustomSheet>
        );
      }
    },
    [project.phases, router, project.id, setOpen, setClose]
  );

  const handleRemovePhase = useCallback(
    async (id: string) => {
      try {
        const response = await deletePhase(id);

        if (!response) {
          throw new Error("Erreur lors de la suppression de la phase");
        }
        toast.success("Phase supprimée avec succès");
        router.refresh();
      } catch (error) {
        console.error("Erreur lors de la suppression de la phase:", error);
        toast.error("Erreur lors de la suppression de la phase");
      }
    },
    [router]
  );

  const handleAddPhase = useCallback(
    (date: Date) => {
      setSelectedDate(date);

      const modalId = `add-phase-${project.id}-${date.getTime()}`;

      setOpen(
        modalId,
        <CustomSheet
          modalId={modalId}
          title="Ajouter une phase"
          subheading="Ajouter une nouvelle phase au projet"
        >
          <PhaseForm
            projectId={project.id}
            onSuccess={() => {
              router.refresh();
              toast.success("Phase ajoutée avec succès");
              setClose();
            }}
            onCancel={() => {
              setClose();
            }}
          />
        </CustomSheet>
      );
    },
    [project.id, router, setOpen, setClose]
  );

  // Marker operations
  const handleCreateMarker = useCallback(
    async (date: Date) => {
      setSelectedDate(date);

      const modalId = `create-marker-${project.id}-${date.getTime()}`;
      setOpen(
        modalId,
        <CustomSheet
          modalId={modalId}
          title="Créer un marqueur"
          subheading="Ajouter un nouveau marqueur au diagramme de Gantt"
        >
          <GanttMarkerForm
            projectId={project.id}
            date={date}
            onSuccess={() => {
              router.refresh();
              toast.success("Marqueur créé avec succès");
              setClose();
            }}
            onCancel={() => {
              setClose();
            }}
          />
        </CustomSheet>
      );
    },
    [project.id, router, setOpen, setClose]
  );

  const handleEditMarker = useCallback(
    (marker: GanttMarkerType) => {
      const modalId = `edit-marker-${marker.id}`;
      setOpen(
        modalId,
        <CustomSheet
          modalId={modalId}
          title="Modifier le marqueur"
          subheading={`Modifier le marqueur : ${marker.label}`}
        >
          <GanttMarkerForm
            projectId={project.id}
            marker={{
              ...marker,
              className: marker.className || "",
              createdAt: new Date(),
              updatedAt: new Date(),
            }}
            onSuccess={() => {
              router.refresh();
              toast.success("Marqueur mis à jour avec succès");
              setClose();
            }}
            onCancel={() => {
              setClose();
            }}
          />
        </CustomSheet>
      );
    },
    [project.id, router, setOpen, setClose]
  );
  const handleRemoveMarker = useCallback(
    async (id: string) => {
      try {
        const response = await deleteGanttMarker(id);

        if (!response) {
          throw new Error("Erreur lors de la suppression du Markeur");
        }
        toast.success(" Marqueur supprimé avec succès");
        router.refresh();
      } catch (error) {
        console.error("Erreur lors de la suppression de marqueur:", error);
        toast.error("Erreur lors de la suppression de marqeur");
      }
    },
    [router]
  );

  return (
    <div className="space-y-4">
      {/* Gantt Controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Diagramme de Gantt</h3>
              <Badge variant="outline">
                {ganttFeatures.length} phase
                {ganttFeatures.length > 1 ? "s" : ""}
              </Badge>
              {ganttMarkers.length > 0 && (
                <Badge variant="secondary">
                  {ganttMarkers.length} marqueur
                  {ganttMarkers.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* View Range Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {viewRange === "daily" && "Quotidien"}
                    {viewRange === "monthly" && "Mensuel"}
                    {viewRange === "quarterly" && "Trimestriel"}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setViewRange("daily")}>
                    Affichage quotidien
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewRange("monthly")}>
                    Affichage mensuel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewRange("quarterly")}>
                    Affichage trimestriel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une phase..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterStatus === "all"
                    ? "Tous les statuts"
                    : STATUS_CONFIG[filterStatus as Status]?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  Tous les statuts
                </DropdownMenuItem>
                {Object.values(STATUS_CONFIG).map((status) => (
                  <DropdownMenuItem
                    key={status.id}
                    onClick={() => setFilterStatus(status.id as Status)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    {status.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(searchTerm || filterStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Effacer filtres
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Gantt Chart */}
      <div
        className="border rounded-lg "
        style={{ height: "550px", padding: "1px" }}
      >
        {ganttFeatures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <div>
              <h4 className="text-lg font-medium">Aucune phase planifiée</h4>
              <p className="text-muted-foreground">
                Ajoutez des phases avec des dates de début et de fin pour voir
                le diagramme de Gantt
              </p>
            </div>
            <Button onClick={() => handleAddPhase(new Date())}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une phase
            </Button>
          </div>
        ) : (
          <GanttProvider
            className="border"
            range={viewRange}
            zoom={zoom}
            onAddItem={handleAddPhase}
          >
            <GanttSidebar>
              <GanttSidebarGroup name="">
                {ganttFeatures.map((phase) => (
                  <GanttSidebarItem
                    key={phase.id}
                    feature={phase}
                    onSelectItem={handlePhaseclick}
                  />
                ))}
              </GanttSidebarGroup>
            </GanttSidebar>
            <GanttTimeline>
              <GanttHeader />

              <GanttFeatureList>
                <GanttFeatureListGroup>
                  {ganttFeatures.map((phase) => (
                    <div key={phase.id}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <button
                            onClick={() => handleViewPhase(phase.id)}
                            type="button"
                            // className="w-full"
                          >
                            <GanttFeatureItem
                              {...phase}
                              onMove={handleMovePhase}
                            >
                              <Badge
                                variant="secondary"
                                className="text-xs px-1 py-0"
                                style={{
                                  backgroundColor: phase.status.color,
                                }}
                              >
                                {phase.code}
                              </Badge>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {phase.progress > 0 && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{
                                          width: `${phase.progress}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {phase.progress}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </GanttFeatureItem>
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleViewPhase(phase.id)}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            Voir la phase
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleEditPhase(phase.id)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" />
                            Modifier la phase
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2 text-destructive"
                            onClick={() => handleRemovePhase(phase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer la phase
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  ))}
                </GanttFeatureListGroup>
              </GanttFeatureList>

              {ganttMarkers.map((marker) => (
                <div
                  key={marker.id}
                  onDoubleClick={() => handleEditMarker(marker)}
                >
                  <GanttMarker
                    key={marker.id}
                    id={marker.id}
                    label={marker.label}
                    date={marker.date}
                    className={marker.className || undefined}
                    onRemove={handleRemoveMarker}
                  />
                </div>
              ))}

              <GanttToday />
              <GanttCreateMarkerTrigger onCreateMarker={handleCreateMarker} />
            </GanttTimeline>
          </GanttProvider>
        )}
      </div>
    </div>
  );
};

export default GanttTab;
