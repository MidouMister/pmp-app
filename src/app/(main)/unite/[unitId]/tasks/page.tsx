import KanbanBoardSkeleton from "@/components/skeletons/kanban-board-skeleton";
import Unauthorized from "@/components/unauthorized";
import { getLanesWithTaskAndTags } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { LayoutGrid } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import TasksClientPage from "./tasks-client-page";

const TasksUnitePage = async ({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (
    user.privateMetadata.role !== "OWNER" &&
    user.privateMetadata.role !== "ADMIN"
  ) {
    return <Unauthorized />;
  }
  const { unitId } = await params;
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              <div className="relative p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-2xl border border-primary/10 shadow-lg">
                <LayoutGrid className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Tableau des Tâches
              </h1>
              <p className="text-muted-foreground mt-2 text-sm font-medium">
                Gérez vos tâches avec glisser-déposer
              </p>
            </div>
          </div>
        </div>
        <Suspense fallback={<KanbanBoardSkeleton />}>
          <UnitTasksPage unitId={unitId} />
        </Suspense>
      </div>
    </div>
  );
};

export default TasksUnitePage;

async function UnitTasksPage({ unitId }: { unitId: string }) {
  "use cache";
  const lanes = await getLanesWithTaskAndTags(unitId);

  return <TasksClientPage unitId={unitId} initialLanes={lanes} />;
}
