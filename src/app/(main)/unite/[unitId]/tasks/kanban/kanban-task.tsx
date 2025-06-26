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
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 0,
  };

  const openEditTaskModal = () => {
    setOpen(
      <CustomModal
        title="Modifier la Tâche"
        subheading="Modifier les détails de la tâche"
        size="lg"
      >
        <TaskForm
          defaultData={task}
          laneId={task.laneId || ""}
          unitId={unitId}
          onTaskUpdate={onTaskUpdate}
        />
      </CustomModal>
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
      // Amélioration des styles de la carte de tâche
      className={`group bg-card border border-border/40 rounded-xl p-4 cursor-grab shadow-sm hover:shadow-md hover:border-accent transition-all duration-200 
      ${isDragging ? "shadow-lg rotate-2" : ""} 
      ${task.complete ? "opacity-75 grayscale" : ""} `}
      {...attributes}
      {...listeners}
      onClick={() => {
        openEditTaskModal();
      }}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-0.5 flex-shrink-0">
            {task.complete ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            )}
          </div>
          <h4
            className={`font-semibold text-base leading-snug ${
              task.complete
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {task.title}
          </h4>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted flex-shrink-0"
            >
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={openEditTaskModal}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={openDeleteTaskModal}
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
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {task.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {task.Tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {task.Tags.map((tag) => (
            <TagComponent key={tag.id} title={tag.name} colorName={tag.color} />
          ))}
        </div>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center">
          {task.Assigned && (
            <Avatar className="h-7 w-7 ring-2 ring-background">
              <AvatarImage src={task.Assigned.avatarUrl || undefined} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground font-medium">
                {task.Assigned.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2">
          {startDate && (
            <div className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-400  px-2.5 py-1.5 rounded-md font-medium">
              <Clock size={12} />
              <span>{startDate}</span>
            </div>
          )}
          {dueDate && (
            <div
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md font-medium ${
                isOverdue
                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-400"
              }`}
            >
              <CalendarIcon size={12} />
              <span>{dueDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanTask;
