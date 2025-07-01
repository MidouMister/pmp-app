"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModal } from "@/providers/modal-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { getLanesWithTaskAndTags, deleteTask } from "@/lib/queries";
import type { LaneDetail, TaskWithTags } from "@/lib/types";
import {
  Search,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  ArrowUpDown,
  CalendarIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TagComponent from "@/components/global/tag";
import TaskForm from "@/components/forms/task-form";
import CustomSheet from "@/components/global/custom-sheet";
import CustomModal from "@/components/global/custom-model";
import Loading from "@/components/global/loading";

type TaskTableProps = {
  unitId: string;
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

const TaskTable = ({ unitId }: TaskTableProps) => {
  const [lanes, setLanes] = useState<LaneDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "title",
    direction: "asc",
  });
  const { setOpen, setClose } = useModal();
  const router = useRouter();

  // Flatten all tasks from all lanes
  const allTasks = lanes.flatMap((lane) =>
    lane.Tasks.map((task) => ({
      ...task,
      laneName: lane.name,
    }))
  );

  // Filter tasks based on search term
  const filteredTasks = allTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.laneName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort tasks based on current sort configuration
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortConfig.key === "title") {
      return sortConfig.direction === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortConfig.key === "lane") {
      return sortConfig.direction === "asc"
        ? a.laneName.localeCompare(b.laneName)
        : b.laneName.localeCompare(a.laneName);
    } else if (sortConfig.key === "dueDate") {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortConfig.key === "status") {
      return sortConfig.direction === "asc"
        ? a.complete === b.complete
          ? 0
          : a.complete
          ? 1
          : -1
        : a.complete === b.complete
        ? 0
        : a.complete
        ? -1
        : 1;
    }
    return 0;
  });

  // Fetch lanes and tasks
  useEffect(() => {
    const fetchLanes = async () => {
      try {
        setLoading(true);
        const fetchedLanes = await getLanesWithTaskAndTags(unitId);
        if (fetchedLanes) {
          setLanes(fetchedLanes);
        }
      } catch (error) {
        console.error("Error fetching lanes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (unitId) {
      fetchLanes();
    }
  }, [unitId]);

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleTaskUpdate = (updatedTask: TaskWithTags[0]) => {
    setLanes((prevLanes) =>
      prevLanes.map((lane) => {
        if (lane.id === updatedTask.laneId) {
          return {
            ...lane,
            Tasks: lane.Tasks.map((task) =>
              task.id === updatedTask.id ? updatedTask : task
            ),
          };
        }
        return lane;
      })
    );
    setClose();
  };

  const openEditTaskModal = (task: TaskWithTags[0]) => {
    setOpen(
      <CustomSheet
        title="Modifier la Tâche"
        subheading="Modifier les détails de la tâche"
      >
        <TaskForm
          defaultData={task}
          laneId={task.laneId || ""}
          unitId={unitId}
          onTaskUpdate={handleTaskUpdate}
        />
      </CustomSheet>
    );
  };

  const openDeleteTaskModal = (task: TaskWithTags[0]) => {
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
    if (!date) return "--";
    return format(new Date(date), "dd MMM yyyy");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Liste des Tâches</h1>
            <p className="text-sm">Visualisez et gérez toutes vos tâches</p>
          </div>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des tâches..."
            className="pl-8 bg-background/50 border-border/50 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border border-border/50 overflow-hidden bg-card flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-12">État</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-1 hover:bg-transparent hover:text-primary"
                >
                  Titre
                  <ArrowUpDown size={14} />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("lane")}
                  className="flex items-center gap-1 hover:bg-transparent hover:text-primary"
                >
                  Colonne
                  <ArrowUpDown size={14} />
                </Button>
              </TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Assigné à</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("dueDate")}
                  className="flex items-center gap-1 hover:bg-transparent hover:text-primary"
                >
                  Date d&apos;échéance
                  <ArrowUpDown size={14} />
                </Button>
              </TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Search className="h-8 w-8 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Aucune tâche trouvée
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedTasks.map((task) => {
                // Determine if due date is overdue
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  !task.complete;

                return (
                  <TableRow
                    key={task.id}
                    className={`${
                      task.complete ? "bg-muted/20" : ""
                    } hover:bg-muted/10 cursor-pointer transition-colors`}
                    onClick={() => openEditTaskModal(task)}
                  >
                    <TableCell>
                      <div
                        className="flex justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle completion toggle here
                        }}
                      >
                        {task.complete ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-primary/60 transition-colors" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        <span
                          className={
                            task.complete
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {task.title}
                        </span>
                      </div>
                      {task.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {task.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted/30">
                        {task.laneName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {task.Tags.slice(0, 3).map((tag) => (
                          <TagComponent
                            key={tag.id}
                            title={tag.name}
                            colorName={tag.color}
                          />
                        ))}
                        {task.Tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground font-medium">
                            +{task.Tags.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.Assigned ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 ring-1 ring-border/20">
                            <AvatarImage
                              src={task.Assigned.avatarUrl || undefined}
                            />
                            <AvatarFallback className="text-xs bg-muted/70 font-medium text-muted-foreground">
                              {task.Assigned.name?.charAt(0).toUpperCase() ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-[100px]">
                            {task.Assigned.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Non assigné
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div
                          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${
                            isOverdue
                              ? "text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400"
                              : "text-muted-foreground bg-muted/30"
                          }`}
                        >
                          <CalendarIcon size={12} />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          --
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted/50"
                          >
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTaskModal(task);
                            }}
                          >
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteTaskModal(task);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TaskTable;
