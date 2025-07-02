import { getProjectDetails, getAuthUserDetails } from "@/lib/queries";
import { redirect } from "next/navigation";
import Unauthorized from "@/components/unauthorized";
import Loading from "@/components/global/loading";
import { Suspense } from "react";
import ProjectDashboard from "./_components/project-dashboard";
import { ProjectWithDetails } from "@/lib/types";

const ProjectPage = async ({
  params,
}: {
  params: { unitId: string; projectId: string };
}) => {
  const { unitId, projectId } = await params;

  // Vérifier si l'utilisateur est autorisé (OWNER ou ADMIN)
  const user = await getAuthUserDetails();

  if (!user) {
    return redirect("/sign-in");
  }

  // Vérifier si l'utilisateur est OWNER ou ADMIN de cette unité
  const isOwner = user.role === "OWNER";
  const isAdmin = user.adminID === unitId;

  if (!isOwner && !isAdmin) {
    return <Unauthorized />;
  }

  // Récupérer les détails du projet
  const projectDetails = await getProjectDetails(projectId);

  if (!projectDetails) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold">Projet non trouvé</h1>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loading />
        </div>
      }
    >
      <ProjectDashboard
        project={projectDetails as ProjectWithDetails}
        unitId={unitId}
      />
    </Suspense>
  );
};

export default ProjectPage;
