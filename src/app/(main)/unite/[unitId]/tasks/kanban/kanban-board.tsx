"use client";

import { useEffect, useState } from "react";
import type { Lane, Task } from "@prisma/client";
import type { LaneDetail, TaskWithTags } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import {
  getLanesWithTaskAndTags,
  updateLanesOrder,
  updateTaskOrder,
} from "@/lib/queries";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import KanbanLane from "./kanban-lane";
import { Button } from "../../../../../../components/ui/button";
import { PlusIcon } from "lucide-react";
import LaneForm from "../../../../../../components/forms/lane-form";
import { DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import KanbanTask from "./kanban-task";
import CustomModal from "../../../../../../components/global/custom-model";
import KanbanBoardSkeleton from "../../../../../../components/skeletons/kanban-board-skeleton";

type KanbanBoardProps = {
  unitId: string;
  initialLanes: LaneDetail[];
};

const KanbanBoard = ({ unitId, initialLanes }: KanbanBoardProps) => {
  const [lanes, setLanes] = useState<LaneDetail[]>(initialLanes);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeLane, setActiveLane] = useState<Lane | null>(null);
  const [loading, setLoading] = useState(true);
  const { setOpen, setClose } = useModal();
  // Fetch lanes and tasks
  useEffect(() => {
    const fetchLanes = async () => {
      try {
        setLoading(true);
        const fetchedLanes = await getLanesWithTaskAndTags(unitId);
        if (fetchedLanes) {
          const sortedLanes = [...fetchedLanes].sort(
            (a, b) => a.order - b.order
          );

          const lanesWithSortedTasks = sortedLanes.map((lane) => ({
            ...lane,
            Tasks: lane.Tasks
              ? [...lane.Tasks].sort((a, b) => a.order - b.order)
              : [],
          }));

          setLanes(lanesWithSortedTasks);
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

  const handleTaskUpdate = (updatedTask: TaskWithTags[0]) => {
    setLanes((prevLanes) =>
      prevLanes.map((lane) => {
        // If the task's laneId has changed, remove it from the old lane
        if (updatedTask.laneId !== lane.id) {
          const taskExistsInCurrentLane = lane.Tasks?.some(
            (task) => task.id === updatedTask.id
          );
          if (taskExistsInCurrentLane) {
            return {
              ...lane,
              Tasks: lane.Tasks.filter((task) => task.id !== updatedTask.id),
            };
          }
        }

        // Update the task in its new (or same) lane
        if (lane.id === updatedTask.laneId) {
          const taskExists = lane.Tasks?.some(
            (task) => task.id === updatedTask.id
          );
          if (taskExists) {
            return {
              ...lane,
              Tasks: lane.Tasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
              ),
            };
          } else {
            // Add new task to the lane
            return {
              ...lane,
              Tasks: [...(lane.Tasks || []), updatedTask],
            };
          }
        }
        return lane;
      })
    );
    setClose(); // Close the modal after update
  };

  const openAddLaneModal = () => {
    setOpen(
      "add-lane-modal",
      <CustomModal
        modalId="add-lane-modal"
        title="Créer une Colonne"
        subheading="Créer une nouvelle colonne pour vos tâches"
        size="sm"
      >
        <LaneForm unitId={unitId} />
      </CustomModal>
    );
  };

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;

    if (active.data.current?.type === "Task") {
      const task = active.data.current.task as Task;
      setActiveTask(task);
    }

    if (active.data.current?.type === "Lane") {
      const lane = active.data.current.lane as Lane;
      setActiveLane(lane);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverALane = over.data.current?.type === "Lane";

    // Handle dropping a task over a lane
    if (isActiveATask && isOverALane) {
      setLanes((prevLanes) => {
        const activeIndex = prevLanes.findIndex((lane) =>
          lane.Tasks.some((task) => task.id === active.id)
        );
        const overIndex = prevLanes.findIndex((lane) => lane.id === over.id);

        const activeLane = prevLanes[activeIndex];
        const overLane = prevLanes[overIndex];

        if (!activeLane || !overLane || activeLane.id === overLane.id) {
          return prevLanes;
        }

        const taskToMove = activeLane.Tasks.find(
          (task) => task.id === active.id
        )!;

        const newActiveLaneTasks = activeLane.Tasks.filter(
          (task) => task.id !== active.id
        );
        const newOverLaneTasks = [
          ...overLane.Tasks,
          { ...taskToMove, laneId: overLane.id },
        ];

        // Re-order tasks in the new lane
        newOverLaneTasks.forEach((task, index) => {
          task.order = index;
        });

        const newLanes = [...prevLanes];
        newLanes[activeIndex] = { ...activeLane, Tasks: newActiveLaneTasks };
        newLanes[overIndex] = { ...overLane, Tasks: newOverLaneTasks };

        return newLanes;
      });
    }

    // Handle dropping a task over another task in a different lane
    if (isActiveATask && isOverATask) {
      const activeLane = lanes.find((lane) =>
        lane.Tasks.some((task) => task.id === active.id)
      );
      const overLane = lanes.find((lane) =>
        lane.Tasks.some((task) => task.id === over.id)
      );

      if (activeLane && overLane && activeLane.id !== overLane.id) {
        setLanes((prevLanes) => {
          const activeIndex = prevLanes.findIndex(
            (lane) => lane.id === activeLane.id
          );
          const overIndex = prevLanes.findIndex(
            (lane) => lane.id === overLane.id
          );

          const taskToMove = activeLane.Tasks.find(
            (task) => task.id === active.id
          )!;
          const overTaskIndex = overLane.Tasks.findIndex(
            (task) => task.id === over.id
          );

          const newActiveLaneTasks = activeLane.Tasks.filter(
            (task) => task.id !== active.id
          );
          const newOverLaneTasks = [...overLane.Tasks];
          newOverLaneTasks.splice(overTaskIndex, 0, {
            ...taskToMove,
            laneId: overLane.id,
          });

          // Re-order tasks in the new lane
          newOverLaneTasks.forEach((task, index) => {
            task.order = index;
          });

          const newLanes = [...prevLanes];
          newLanes[activeIndex] = { ...activeLane, Tasks: newActiveLaneTasks };
          newLanes[overIndex] = { ...overLane, Tasks: newOverLaneTasks };

          return newLanes;
        });
      }
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveLane(null);

    if (!over) return;

    // Handle Lane dragging
    if (
      active.data.current?.type === "Lane" &&
      over.data.current?.type === "Lane" &&
      active.id !== over.id
    ) {
      const activeLaneId = active.id as string;
      const overLaneId = over.id as string;

      const activeLaneIndex = lanes.findIndex(
        (lane) => lane.id === activeLaneId
      );
      const overLaneIndex = lanes.findIndex((lane) => lane.id === overLaneId);

      const newLanes = arrayMove(lanes, activeLaneIndex, overLaneIndex);
      const lanesWithUpdatedOrder = newLanes.map((lane, index) => ({
        ...lane,
        order: index,
      }));

      setLanes(lanesWithUpdatedOrder);
      await updateLanesOrder(lanesWithUpdatedOrder);
      return;
    }

    // Handle Task dragging
    if (active.data.current?.type === "Task") {
      const activeTaskId = active.id as string;
      const overId = over.id as string;

      const activeLane = lanes.find((lane) =>
        lane.Tasks.some((task) => task.id === activeTaskId)
      );
      let overLane = lanes.find((lane) =>
        lane.Tasks.some((task) => task.id === overId)
      );

      if (!overLane) {
        overLane = lanes.find((lane) => lane.id === overId);
      }

      if (!activeLane || !overLane) return;

      // Moving task to a different lane
      if (activeLane.id !== overLane.id) {
        const activeTask = activeLane.Tasks.find(
          (task) => task.id === activeTaskId
        )!;

        // Remove from source lane
        const newSourceTasks = activeLane.Tasks.filter(
          (task) => task.id !== activeTaskId
        ).map((task, index) => ({ ...task, order: index }));

        // Add to destination lane
        const overTaskIndex = overLane.Tasks.findIndex(
          (task) => task.id === overId
        );
        const newDestTasks = [...overLane.Tasks];
        if (over.data.current?.type === "Task") {
          newDestTasks.splice(overTaskIndex, 0, activeTask);
        } else {
          newDestTasks.push(activeTask);
        }

        const reorderedDestTasks = newDestTasks.map((task, index) => ({
          ...task,
          laneId: overLane!.id,
          order: index,
        }));

        const newLanes = [...lanes];
        const sourceLaneIndex = newLanes.findIndex(
          (lane) => lane.id === activeLane.id
        );
        const destLaneIndex = newLanes.findIndex(
          (lane) => lane.id === overLane!.id
        );

        newLanes[sourceLaneIndex] = { ...activeLane, Tasks: newSourceTasks };
        newLanes[destLaneIndex] = { ...overLane, Tasks: reorderedDestTasks };

        setLanes(newLanes);

        const tasksToUpdate = [...newSourceTasks, ...reorderedDestTasks];
        await updateTaskOrder(tasksToUpdate);
      } else {
        // Moving task within the same lane
        const taskIndex = activeLane.Tasks.findIndex(
          (task) => task.id === activeTaskId
        );
        const overTaskIndex = activeLane.Tasks.findIndex(
          (task) => task.id === overId
        );

        const reorderedTasks = arrayMove(
          activeLane.Tasks,
          taskIndex,
          overTaskIndex
        ).map((task, index) => ({ ...task, order: index }));

        const newLanes = [...lanes];
        const laneIndex = newLanes.findIndex(
          (lane) => lane.id === activeLane.id
        );
        newLanes[laneIndex] = { ...activeLane, Tasks: reorderedTasks };

        setLanes(newLanes);
        await updateTaskOrder(reorderedTasks);
      }
    }
  };

  if (loading) {
    return <KanbanBoardSkeleton />;
  }

  return (
    <div className="h-full w-full  p-1">
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={openAddLaneModal}
          className="flex items-center gap-2 bg-chart-4 hover:bg-chart-4/70 text-primary-foreground shadow-sm"
        >
          <PlusIcon size={16} />
          Ajouter une Colonne
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 h-full scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 border border-dashed rounded-md p-2  ">
          <SortableContext items={lanes.map((lane) => lane.id)}>
            {lanes.map((lane) => (
              <KanbanLane
                key={lane.id}
                lane={lane}
                tasks={lane.Tasks || []}
                unitId={unitId}
                onTaskUpdate={handleTaskUpdate}
              />
            ))}
          </SortableContext>

          {/* Add Lane Placeholder */}
          <div className="min-w-[320px] w-[320px]">
            <Button
              variant="outline"
              onClick={openAddLaneModal}
              className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2"
            >
              <PlusIcon size={24} className="text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">
                Ajouter une Nouvelle Colonne
              </span>
            </Button>
          </div>
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay>
              {activeTask && (
                <div className="rotate-3 scale-105">
                  <KanbanTask
                    task={activeTask as unknown as TaskWithTags[0]}
                    unitId={unitId}
                    onTaskUpdate={handleTaskUpdate}
                  />
                </div>
              )}
              {activeLane && (
                <div className="rotate-1 scale-105">
                  <KanbanLane
                    lane={activeLane}
                    tasks={[]}
                    unitId={unitId}
                    onTaskUpdate={handleTaskUpdate}
                  />
                </div>
              )}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
