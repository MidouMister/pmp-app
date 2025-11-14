"use client";

import { getAuthUserDetails } from "@/lib/queries";
import { useState, useEffect } from "react";

import Loading from "@/components/global/loading";
import type { UserAuthDetails } from "@/lib/types";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ unitId: string }>;
};

const TasksPage = ({ params }: PageProps) => {
  const [unitId, setUnitId] = useState<string>("");
  const [view, setView] = useState<"kanban" | "table">("kanban");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<UserAuthDetails>(null);
  const [loading, setLoading] = useState(true);

  // Extract unitId from params in useEffect
  useEffect(() => {
    const extractParams = async () => {
      const resolvedParams = await params;
      setUnitId(resolvedParams.unitId);
    };
    extractParams();
  }, [params]);

  useEffect(() => {
    if (!unitId) return; // Wait for unitId to be extracted

    const checkAuth = async () => {
      try {
        const userData = await getAuthUserDetails("midoumisterioso@gmail.com");
        if (!userData) {
          window.location.href = "/sign-in";
          return;
        }

        // Check if user has access to this unit
        const hasAccess =
          userData.unitId === unitId ||
          userData.role === "OWNER" ||
          userData.role === "ADMIN";
        if (!hasAccess) {
          window.location.href = "/dashboard";
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error("Authentication error:", error);
        window.location.href = "/sign-in";
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [unitId]);

  // Load saved view preference from localStorage
  useEffect(() => {
    if (!unitId) return;

    const savedView = localStorage.getItem(`tasks-view-${unitId}`);
    if (savedView === "kanban" || savedView === "table") {
      setView(savedView);
    }
  }, [unitId]);

  // Save view preference to localStorage when it changes
  useEffect(() => {
    if (!unitId) return;

    localStorage.setItem(`tasks-view-${unitId}`, view);
  }, [view, unitId]);

  if (loading || !unitId) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loading
          text="Chargement des tâches"
          size="lg"
          variant="dots"
          key={"tasks"}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-1">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <LayoutGrid className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Tableau des Tâches
              </h1>
              <p className="text-muted-foreground mt-1">
                Gérez vos tâches avec glisser-déposer
              </p>
            </div>
          </div>

          <div className="bg-card border border-border/30 rounded-xl p-1 flex items-center shadow-sm">
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("kanban")}
              className="flex items-center gap-2 rounded-lg "
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
        </div>

        <div className="flex-1 overflow-hidden">
          {/* {view === "kanban" ? (
            <Suspense fallback={<KanbanBoardSkeleton />}>
              <KanbanBoard unitId={unitId} />
            </Suspense>
          ) : (
            <Suspense fallback={<TaskTableSkeleton />}>
              <TaskTable unitId={unitId} />
            </Suspense>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
