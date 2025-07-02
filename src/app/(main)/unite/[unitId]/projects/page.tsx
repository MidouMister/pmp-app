import { getUnitProjects } from "@/lib/queries";
import { getAuthUserDetails } from "@/lib/queries";
import { redirect } from "next/navigation";
import Unauthorized from "@/components/unauthorized";
import UnitProjects from "./unit-projects";

const ProjectsPage = async ({ params }: { params: { unitId: string } }) => {
  const { unitId } = await params;

  // Vérifier si l'utilisateur est autorisé (OWNER ou ADMIN)
  const user = await getAuthUserDetails();

  if (!user) {
    return redirect("/sign-in");
  }

  // Vérifier si l'utilisateur est OWNER ou ADMIN de cette unité
  const isOwner = user.role === "OWNER";
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return <Unauthorized />;
  }

  const projects = await getUnitProjects(unitId);

  return <UnitProjects projects={projects} unitId={unitId} />;
};

export default ProjectsPage;
