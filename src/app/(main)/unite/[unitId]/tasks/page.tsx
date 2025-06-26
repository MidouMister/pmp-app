import { getAuthUserDetails } from "@/lib/queries";
import { redirect } from "next/navigation";
import KanbanBoard from "./kanban/kanban-board";

type Params = Promise<{ unitId: string }>;
const TasksPage = async ({ params }: { params: Params }) => {
  const { unitId } = await params;
  const user = await getAuthUserDetails();
  if (!user) return redirect("/sign-in");

  // Check if user has access to this unit
  const hasAccess =
    user.unitId === unitId || user.role === "OWNER" || user.role === "ADMIN";
  if (!hasAccess) return redirect("/dashboard");

  return (
    <div className="h-full w-full  ">
      <KanbanBoard unitId={unitId} />
    </div>
  );
};

export default TasksPage;
