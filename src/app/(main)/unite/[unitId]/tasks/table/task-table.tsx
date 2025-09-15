"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModal } from "@/providers/modal-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { getLanesWithTaskAndTags, deleteTask } from "@/lib/queries";
import type { LaneDetail, TaskWithTags } from "@/lib/types";
import { Search } from "lucide-react";
import TaskForm from "@/components/forms/task-form";
import CustomSheet from "@/components/global/custom-sheet";
import CustomModal from "@/components/global/custom-model";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import TaskTableSkeleton from "../../../../../../components/skeletons/task-table-skeleton";
import TagComponent from "@/components/global/tag";

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
  console.log(allTasks);
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
          onTaskUpdate={handleTaskUpdate}
        />
      </CustomSheet>
    );
  };

  const openDeleteTaskModal = (task: TaskWithTags[0]) => {
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
    if (!date) return "--";
    return format(new Date(date), "dd MMM yyyy");
  };

  if (loading) {
    return <TaskTableSkeleton />;
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-80  ">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des tâches..."
            className="pl-8 bg-background/50 border-border/50 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0">
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center gap-1">
                  Titre
                  {sortConfig.key === "title" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("lane")}
              >
                <div className="flex items-center gap-1">
                  Colonne
                  {sortConfig.key === "lane" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead>Tags</TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("dueDate")}
              >
                <div className="flex items-center gap-1">
                  Date d&apos;échéance
                  {sortConfig.key === "dueDate" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-primary"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1">
                  Statut
                  {sortConfig.key === "status" && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      {task.laneName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.Tags && task.Tags.length > 0 ? (
                        task.Tags.map((tag) => (
                          <TagComponent
                            key={tag.id}
                            title={tag.name}
                            colorName={tag.color}
                          />
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Aucun tag
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        task.complete
                          ? "text-emerald-400 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 dark:border-emerald-600 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/30"
                          : "bg-orange-500/10 text-orange-400 border border-orange-400 shadow-sm hover:shadow-md"
                      )}
                    >
                      {task.complete ? "Terminée" : "En cours"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditTaskModal(task)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => openDeleteTaskModal(task)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground h-24"
                >
                  {searchTerm
                    ? "Aucune tâche ne correspond à votre recherche"
                    : "Aucune tâche disponible"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TaskTable;
