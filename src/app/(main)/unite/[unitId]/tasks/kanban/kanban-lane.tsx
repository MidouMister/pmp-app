"use client";

import type { Lane } from "@prisma/client";
import type { TaskWithTags } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../../../../../../components/ui/button";
import { PlusIcon, MoreHorizontal, GripVertical } from "lucide-react";
import KanbanTask from "./kanban-task";
import { SortableContext } from "@dnd-kit/sortable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../components/ui/dropdown-menu";
import LaneForm from "@/components/forms/lane-form";
import TaskForm from "@/components/forms/task-form";
import { deleteLane } from "@/lib/queries";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CustomModal from "../../../../../../components/global/custom-model";

// Définition des couleurs pour les colonnes
const laneColors = [
  {
    bg: " bg-blue-900/20",
    text: "text-blue-700  ",
    border: "border-blue-800 ",
  },
  {
    bg: " bg-green-900/20",
    text: "text-green-700  ",
    border: "border-green-800  ",
  },
  {
    bg: " bg-purple-900/20",
    text: "text-purple-700  ",
    border: "border-purple-800  ",
  },

  {
    bg: " bg-pink-900/20",
    text: "text-pink-700  ",
    border: "border-pink-800  ",
  },
  {
    bg: " bg-indigo-900/20",
    text: "text-indigo-700  ",
    border: "border-indigo-800  ",
  },
  {
    bg: " bg-rose-900/20",
    text: "text-rose-700  ",
    border: "border-rose-800 ",
  },
  {
    bg: " bg-cyan-900/20",
    text: "text-cyan-700 ",
    border: "border-cyan-800  ",
  },
  {
    bg: "bg-teal-900/20",
    text: "text-teal-700  ",
    border: "border-teal-800  ",
  },
  {
    bg: "   bg-orange-900/20",
    text: "text-orange-700  ",
    border: "border-orange-800 ",
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
  return `${color.bg} ${color.text} ${color.border}`;
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
      className="w-[320px] min-w-[320px] bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col max-h-[calc(100vh-160px)] group"
    >
      {/* Lane Header */}
      <div className="p-4 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div
              className="cursor-grab hover:cursor-grabbing p-1.5 rounded-lg hover:bg-muted/50 transition-colors opacity-50 group-hover:opacity-100"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1">
              <h3
                className={`rounded-sm p-1 text-sm font-semibold border ${getLaneColorClasses(
                  lane.name
                )}`}
              >
                {lane.name.toLocaleUpperCase().toWellFormed()}
              </h3>
              {tasks.length > 0 && (
                <div
                  className={`flex items-center justify-center min-w-[20px] h-5 text-xs px-1.5 rounded-full font-medium ${getLaneCountColorClasses(
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
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
              <PlusIcon size={20} className="text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Aucune tâche pour le moment
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-dashed border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground"
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
