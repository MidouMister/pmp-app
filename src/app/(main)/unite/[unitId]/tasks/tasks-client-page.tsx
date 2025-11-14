// app/unite/[unitId]/tasks/tasks-client-page.tsx (Client Component)
"use client";

import { useState, useEffect } from "react";
import type { LaneDetail } from "@/lib/types";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import KanbanBoard from "./kanban/kanban-board";
import TaskTable from "./table/task-table";
// Nouveau composant pour le sélecteur de vue
function ViewSelector({
  view,
  setView,
}: {
  view: "kanban" | "table";
  setView: (view: "kanban" | "table") => void;
}) {
  return (
    <div className="bg-card border border-border/30 rounded-xl p-1 flex items-center shadow-sm">
      <Button
        variant={view === "kanban" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("kanban")}
        className="flex items-center gap-2 rounded-lg"
      >
        <LayoutGrid size={16} />
        <span>Kanban</span>
      </Button>
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("table")}
        className="flex items-center gap-2 rounded-lg"
      >
        <List size={16} />
        <span>Tableau</span>
      </Button>
    </div>
  );
}
type TasksClientPageProps = {
  unitId: string;
  initialLanes: LaneDetail[];
};

export default function TasksClientPage({
  unitId,
  initialLanes,
}: TasksClientPageProps) {
  const [view, setView] = useState<"kanban" | "table">("kanban");

  // Load saved view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem(`tasks-view-${unitId}`);
    if (savedView === "kanban" || savedView === "table") {
      setView(savedView);
    }
  }, [unitId]);

  // Save view preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`tasks-view-${unitId}`, view);
  }, [view, unitId]);

  return (
    <>
      <div className="flex justify-end mb-4">
        <ViewSelector view={view} setView={setView} />
      </div>

      <div className="flex-1 overflow-hidden">
        {view === "kanban" ? (
          <KanbanBoard unitId={unitId} initialLanes={initialLanes} />
        ) : (
          <TaskTable unitId={unitId} initialLanes={initialLanes} />
        )}
      </div>
    </>
  );
}
