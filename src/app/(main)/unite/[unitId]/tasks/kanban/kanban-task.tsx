"use client";

import type { TaskWithTags } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
} from "lucide-react";

import TaskForm from "@/components/forms/task-form";
import CustomModal from "@/components/global/custom-model";
import CustomSheet from "@/components/global/custom-sheet";
import TagComponent from "@/components/global/tag";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTask } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type KanbanTaskProps = {
  task: TaskWithTags[0];
  unitId: string;
  onTaskUpdate: (updatedTask: TaskWithTags[0]) => void;
};

const KanbanTask = ({ task, unitId, onTaskUpdate }: KanbanTaskProps) => {
  const { setOpen, setClose } = useModal();
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 0,
  };

  const openEditTaskModal = () => {
    setOpen(
      "edit-task-modal",
      <CustomSheet
        modalId="edit-task-modal"
        title="Modifier la Tâche"
        subheading="Modifier les détails de la tâche"
      >
        <TaskForm
          defaultData={task}
          laneId={task.laneId || ""}
          unitId={unitId}
          onTaskUpdate={onTaskUpdate}
        />
      </CustomSheet>
    );
  };

  const openDeleteTaskModal = () => {
    setOpen(
      "delete-task-modal",
      <CustomModal
        modalId="delete-task-modal"
        title="Supprimer la Tâche"
        subheading="Confirmer la suppression"
        size="sm"
      >
        <div className="flex flex-col gap-6">
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold">Êtes-vous sûr ?</h3>
            <p className="text-sm text-muted-foreground">
              Cela supprimera définitivement la tâche. Cette action ne peut pas
              être annulée.
            </p>
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setClose();
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteTask(task.id);
                  toast.success("Tâche supprimée avec succès");
                  router.refresh();
                  setOpen("delete-task-modal", null);
                } catch (error) {
                  toast.error("Échec de la suppression de la tâche");
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

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return format(new Date(date), "MMM dd");
  };

  const dueDate = formatDate(task.dueDate);
  const startDate = formatDate(task.startDate);

  // Determine if due date is overdue
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && !task.complete;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative cursor-grab select-none
        ${
          isDragging
            ? "shadow-2xl scale-105 rotate-2 z-50 ring-2 ring-primary/30"
            : "shadow-md hover:shadow-xl"
        }
        ${task.complete ? "opacity-60" : "hover:shadow-lg"}
        bg-card/95 backdrop-blur-sm border border-border/30 rounded-xl p-4
        transition-all duration-300 ease-out
        hover:border-primary/30 hover:-translate-y-1
        active:scale-[0.98]`}
      {...attributes}
      {...listeners}
      onClick={openEditTaskModal}
    >
      {/* Task Header */}
      <div className="flex items-start gap-2.5 mb-3">
        {/* Completion Status */}
        <button
          className="mt-0.5 flex-shrink-0 transition-all duration-200 hover:scale-125 active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            // Handle completion toggle here
          }}
        >
          {task.complete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 drop-shadow-sm" />
          ) : (
            <Circle
              className="h-5 w-5 text-muted-foreground/30
                              group-hover:text-primary/70 transition-colors duration-200"
            />
          )}
        </button>

        {/* Task Title */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm leading-snug tracking-tight
            ${
              task.complete
                ? "text-muted-foreground/70 line-through decoration-2"
                : "text-foreground group-hover:text-primary transition-colors duration-200"
            }`}
          >
            {task.title}
          </h3>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 
                        transition-all duration-200 hover:bg-muted/50 
                        flex-shrink-0 rounded-md"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={14} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                openEditTaskModal();
              }}
            >
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                openDeleteTaskModal();
              }}
              className="text-destructive focus:text-destructive"
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Task Description */}
      {task.description && (
        <div className="mb-3.5">
          <p
            className="text-muted-foreground/90 text-xs leading-relaxed line-clamp-2
                       tracking-wide"
          >
            {task.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {task.Tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.Tags.slice(0, 3).map((tag) => (
            <TagComponent key={tag.id} title={tag.name} colorName={tag.color} />
          ))}
          {task.Tags.length > 3 && (
            <span
              className="inline-flex items-center px-2 py-1 rounded-md 
                           bg-muted/50 text-xs text-muted-foreground font-medium"
            >
              +{task.Tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Task Footer */}
      <div
        className="flex items-center justify-between pt-3
                     border-t border-border/20"
      >
        {/* Assignee */}
        <div className="flex items-center">
          {task.Assigned ? (
            <Avatar className="h-6 w-6 ring-1 ring-border/20">
              <AvatarImage src={task.Assigned.avatarUrl || undefined} />
              <AvatarFallback
                className="text-xs bg-muted/70 font-medium 
                                      text-muted-foreground"
              >
                {task.Assigned.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className="h-6 w-6 rounded-full bg-muted/30 border border-dashed 
                          border-muted-foreground/20"
            />
          )}
        </div>

        {/* Date Information */}
        <div className="flex items-center gap-2.5">
          {startDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} className="opacity-60" />
              <span className="font-medium">{startDate}</span>
            </div>
          )}
          {dueDate && (
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold
              px-2 py-1 rounded-lg transition-all duration-200 shadow-sm
              ${
                isOverdue
                  ? "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900"
                  : "text-muted-foreground bg-muted/40 hover:bg-muted/60"
              }`}
            >
              <CalendarIcon size={12} />
              <span>{dueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle drag indicator */}
      <div
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-20 
                     transition-opacity duration-300"
      >
        <div className="w-0.5 h-3 bg-muted-foreground/40 rounded-full" />
      </div>
    </div>
  );
};

export default KanbanTask;
