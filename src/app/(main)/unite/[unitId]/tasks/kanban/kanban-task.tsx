"use client";

import type { TaskWithTags } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  CalendarIcon,
} from "lucide-react";

import TaskForm from "@/components/forms/task-form";
import { deleteTask } from "@/lib/queries";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/global/custom-model";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TagComponent from "@/components/global/tag";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CustomSheet from "@/components/global/custom-sheet";

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
      <CustomSheet
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
      <CustomModal
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
                  setOpen(null);
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
            ? "shadow-2xl scale-105 rotate-2 z-50"
            : "shadow-sm hover:shadow-lg"
        }
        ${task.complete ? "opacity-50" : "hover:shadow-md"}
        bg-card border border-border/20 rounded-xl p-3.5 
        transition-all duration-300 ease-out
        hover:border-primary/20 hover:-translate-y-0.5
        active:scale-95`}
      {...attributes}
      {...listeners}
      onClick={openEditTaskModal}
    >
      {/* Task Header */}
      <div className="flex items-start gap-2.5 mb-3">
        {/* Completion Status */}
        <button
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            // Handle completion toggle here
          }}
        >
          {task.complete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle
              className="h-5 w-5 text-muted-foreground/40 
                              group-hover:text-primary/60 transition-colors"
            />
          )}
        </button>

        {/* Task Title */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-sm leading-snug tracking-tight
            ${
              task.complete
                ? "text-muted-foreground line-through decoration-2"
                : "text-foreground group-hover:text-primary/90"
            } transition-colors duration-200`}
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
        <div className="mb-3">
          <p
            className="text-muted-foreground text-xs leading-relaxed line-clamp-2 
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
        className="flex items-center justify-between pt-2.5 
                     border-t border-border/10"
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
              className={`flex items-center gap-1.5 text-xs font-medium 
              px-1.5 py-0.5 rounded-md transition-colors
              ${
                isOverdue
                  ? "text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400"
                  : "text-muted-foreground bg-muted/30"
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
