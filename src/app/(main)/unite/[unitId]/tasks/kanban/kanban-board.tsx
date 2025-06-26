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
import { PlusIcon, LayoutGrid } from "lucide-react";
import LaneForm from "../../../../../../components/forms/lane-form";
import { DragOverlay } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import KanbanTask from "./kanban-task";
import CustomModal from "../../../../../../components/global/custom-model";

type KanbanBoardProps = {
  unitId: string;
};

const KanbanBoard = ({ unitId }: KanbanBoardProps) => {
  const [lanes, setLanes] = useState<LaneDetail[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeLane, setActiveLane] = useState<Lane | null>(null);
  const { setOpen, setClose } = useModal();
  // Fetch lanes and tasks
  useEffect(() => {
    const fetchLanes = async () => {
      try {
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
      <CustomModal
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

    if (!over) return;
    if (active.id === over.id) return;

    if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Lane"
    ) {
      const activeTask = active.data.current.task as Task;
      const overLaneId = over.id as string;

      if (activeTask.laneId === overLaneId) return;

      setLanes((prevLanes) => {
        const sourceLane = prevLanes.find(
          (lane) => lane.id === activeTask.laneId
        );
        const destinationLane = prevLanes.find(
          (lane) => lane.id === overLaneId
        );

        if (!sourceLane || !destinationLane) return prevLanes;

        const updatedTask = {
          ...activeTask,
          laneId: overLaneId,
          order: destinationLane.Tasks ? destinationLane.Tasks.length : 0,
        };

        return prevLanes.map((lane) => {
          if (lane.id === sourceLane.id) {
            return {
              ...lane,
              Tasks: lane.Tasks
                ? lane.Tasks.filter((task) => task.id !== activeTask.id)
                : [],
            };
          }
          if (lane.id === destinationLane.id) {
            return {
              ...lane,
              Tasks: lane.Tasks
                ? [...lane.Tasks, updatedTask as unknown as TaskWithTags[0]]
                : [updatedTask as unknown as TaskWithTags[0]],
            };
          }
          return lane;
        });
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveLane(null);

    if (!over) return;

    if (
      active.data.current?.type === "Lane" &&
      over.data.current?.type === "Lane"
    ) {
      const activeLaneId = active.id as string;
      const overLaneId = over.id as string;

      if (activeLaneId === overLaneId) return;

      setLanes((prevLanes) => {
        const activeLaneIndex = prevLanes.findIndex(
          (lane) => lane.id === activeLaneId
        );
        const overLaneIndex = prevLanes.findIndex(
          (lane) => lane.id === overLaneId
        );

        const newOrder = arrayMove(prevLanes, activeLaneIndex, overLaneIndex);

        return newOrder.map((lane, index) => ({
          ...lane,
          order: index,
        }));
      });

      try {
        const lanesWithUpdatedOrder = lanes.map((lane, index) => ({
          ...lane,
          order: index,
        }));
        await updateLanesOrder(lanesWithUpdatedOrder);
      } catch (error) {
        console.error("Error updating lane order:", error);
      }
    }

    if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Task"
    ) {
      const activeTaskId = active.id as string;
      const overTaskId = over.id as string;

      if (activeTaskId === overTaskId) return;

      const activeTask = active.data.current.task as Task;
      const overTask = over.data.current.task as Task;

      if (activeTask.laneId === overTask.laneId) {
        setLanes((prevLanes) => {
          const laneIndex = prevLanes.findIndex(
            (lane) => lane.id === activeTask.laneId
          );
          if (laneIndex === -1) return prevLanes;

          const lane = prevLanes[laneIndex];
          const tasks = lane.Tasks ? [...lane.Tasks] : [];

          const activeTaskIndex = tasks.findIndex(
            (task) => task.id === activeTaskId
          );
          const overTaskIndex = tasks.findIndex(
            (task) => task.id === overTaskId
          );

          const reorderedTasks = arrayMove(
            tasks,
            activeTaskIndex,
            overTaskIndex
          );

          const tasksWithUpdatedOrder = reorderedTasks.map((task, index) => ({
            ...task,
            order: index,
          }));

          const newLanes = [...prevLanes];
          newLanes[laneIndex] = {
            ...lane,
            Tasks: tasksWithUpdatedOrder,
          };

          return newLanes;
        });

        try {
          const laneIndex = lanes.findIndex(
            (lane) => lane.id === activeTask.laneId
          );
          if (laneIndex !== -1) {
            const tasks = lanes[laneIndex].Tasks || [];
            const tasksWithUpdatedOrder = tasks.map((task, index) => ({
              ...task,
              order: index,
            }));
            await updateTaskOrder(tasksWithUpdatedOrder);
          }
        } catch (error) {
          console.error("Error updating task order:", error);
        }
      }
    }
  };

  return (
    <div className="h-full w-full  p-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LayoutGrid className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tableau des Tâches</h1>
            <p className="text-sm">Gérez vos tâches avec glisser-déposer</p>
          </div>
        </div>
        <Button
          onClick={openAddLaneModal}
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
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
        <div className="flex gap-6 overflow-x-auto pb-6 h-full scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
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
