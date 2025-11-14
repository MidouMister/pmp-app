import Unauthorized from "@/components/unauthorized";
import { getLanesWithTaskAndTags } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import TasksClientPage from "./tasks-client-page";
import { LayoutGrid } from "lucide-react";
import { Suspense } from "react";
import KanbanBoardSkeleton from "@/components/skeletons/kanban-board-skeleton";

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
    <div className="min-h-screen bg-background p-[1px]">
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
