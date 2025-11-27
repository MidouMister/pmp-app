"use client";

import LaneForm from "@/components/forms/lane-form";
import TaskForm from "@/components/forms/task-form";
import { deleteLane } from "@/lib/queries";
import type { TaskWithTags } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lane } from "@prisma/client";
import { GripVertical, MoreHorizontal, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CustomModal from "../../../../../../components/global/custom-model";
import { Button } from "../../../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../components/ui/dropdown-menu";
import KanbanTask from "./kanban-task";

// Définition des couleurs pour les colonnes - Modern HSL-based gradients
const laneColors = [
  {
    bg: "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500/30",
    shadow: "shadow-blue-500/10",
  },
  {
    bg: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
    shadow: "shadow-emerald-500/10",
  },
  {
    bg: "bg-gradient-to-br from-purple-500/10 to-purple-600/5",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-500/30",
    shadow: "shadow-purple-500/10",
  },
  {
    bg: "bg-gradient-to-br from-pink-500/10 to-pink-600/5",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-500/30",
    shadow: "shadow-pink-500/10",
  },
  {
    bg: "bg-gradient-to-br from-indigo-500/10 to-indigo-600/5",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-500/30",
    shadow: "shadow-indigo-500/10",
  },
  {
    bg: "bg-gradient-to-br from-rose-500/10 to-rose-600/5",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/30",
    shadow: "shadow-rose-500/10",
  },
  {
    bg: "bg-gradient-to-br from-cyan-500/10 to-cyan-600/5",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-500/30",
    shadow: "shadow-cyan-500/10",
  },
  {
    bg: "bg-gradient-to-br from-teal-500/10 to-teal-600/5",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-500/30",
    shadow: "shadow-teal-500/10",
  },
  {
    bg: "bg-gradient-to-br from-orange-500/10 to-orange-600/5",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-500/30",
    shadow: "shadow-orange-500/10",
  },
];

// Fonction pour générer un index basé sur le nom de la colonne
const getColorIndexFromName = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % laneColors.length;
};

// Fonction pour obtenir les classes de couleur pour le titre de la colonne
const getLaneColorClasses = (name: string): string => {
  const colorIndex = getColorIndexFromName(name);
  const color = laneColors[colorIndex];
  return `${color.bg} ${color.text} ${color.border} ${color.shadow}`;
};

// Fonction pour obtenir les classes de couleur pour le compteur de tâches
const getLaneCountColorClasses = (name: string): string => {
  const colorIndex = getColorIndexFromName(name);
  const color = laneColors[colorIndex];
  return `${color.bg} ${color.text}`;
};

type KanbanLaneProps = {
  lane: Lane;
  tasks: TaskWithTags;
  unitId: string;
  onTaskUpdate: (updatedTask: TaskWithTags[0]) => void;
};

const KanbanLane = ({ lane, tasks, unitId, onTaskUpdate }: KanbanLaneProps) => {
  const { setOpen } = useModal();
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lane.id,
    data: {
      type: "Lane",
      lane,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const openAddTaskModal = () => {
    setOpen(
      "add-task-modal",
      <CustomModal
        modalId="add-task-modal"
        title="Ajouter une Tâche"
        subheading="Ajouter une nouvelle tâche à cette colonne"
        size="md"
      >
        <TaskForm
          laneId={lane.id}
          unitId={unitId}
          onTaskUpdate={onTaskUpdate}
        />
      </CustomModal>
    );
  };

  const openEditLaneModal = () => {
    setOpen(
      "edit-lane-modal",
      <CustomModal
        modalId="edit-lane-modal"
        title="Modifier la Colonne"
        subheading="Modifier les détails de la colonne"
        size="sm"
      >
        <LaneForm unitId={unitId} defaultData={lane} />
      </CustomModal>
    );
  };

  const openDeleteLaneModal = () => {
    setOpen(
      "delete-lane-modal",
      <CustomModal
        modalId="delete-lane-modal"
        title="Supprimer la Colonne"
        subheading="Confirmer la suppression"
        size="sm"
      >
        <div className="flex flex-col gap-6">
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold">Êtes-vous sûr ?</h3>
            <p className="text-sm text-muted-foreground">
              Cela supprimera la colonne et toutes ses tâches. Cette action ne
              peut pas être annulée.
            </p>
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setOpen("delete-lane-modal", null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteLane(lane.id);
                  toast.success("Colonne supprimée avec succès");
                  router.refresh();
                  setOpen("delete-lane-modal", null);
                } catch (error) {
                  toast.error("Échec de la suppression de la colonne");
                  console.error(error);
                }
              }}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </CustomModal>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-[320px] min-w-[320px] bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col max-h-[calc(100vh-160px)] group"
    >
      {/* Lane Header */}
      <div className="p-4 pb-3 border-b border-border/20 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div
              className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-muted/70 transition-all duration-200 opacity-0 group-hover:opacity-100"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <h3
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider border shadow-sm ${getLaneColorClasses(
                  lane.name
                )}`}
              >
                {lane.name.toLocaleUpperCase().toWellFormed()}
              </h3>
              {tasks.length > 0 && (
                <div
                  className={`flex items-center justify-center min-w-[22px] h-6 text-xs px-2 rounded-full font-bold shadow-sm ${getLaneCountColorClasses(
                    lane.name
                  )}`}
                >
                  {tasks.length}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-foreground"
              onClick={openAddTaskModal}
            >
              <PlusIcon size={14} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={openEditLaneModal}>
                  Modifier la Colonne
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={openDeleteLaneModal}
                  className="text-destructive focus:text-destructive"
                >
                  Supprimer la Colonne
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent">
        <SortableContext items={tasks.map((task) => task.id)}>
          {tasks.map((task) => (
            <KanbanTask
              key={task.id}
              task={task}
              unitId={unitId}
              onTaskUpdate={onTaskUpdate}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mb-4 shadow-inner">
              <PlusIcon size={24} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground/80 mb-5 text-center font-medium">
              Aucune tâche pour le moment
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-dashed border-2 border-primary/30 text-muted-foreground hover:bg-primary/5 hover:text-foreground hover:border-primary/50 transition-all duration-300 rounded-lg"
              onClick={openAddTaskModal}
            >
              <PlusIcon size={14} className="mr-2" />
              Ajouter une Tâche
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanLane;
