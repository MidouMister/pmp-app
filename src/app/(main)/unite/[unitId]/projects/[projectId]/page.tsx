import { getProjectDetails, getAuthUserDetails } from "@/lib/queries";
import { redirect } from "next/navigation";
import Unauthorized from "@/components/unauthorized";
import Loading from "@/components/global/loading";
import { Suspense } from "react";
import ProjectDashboard from "./_components/project-dashboard";
import { ProjectWithDetails } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";

const ProjectPage = async ({
  params,
}: {
  params: Promise<{ unitId: string; projectId: string }>;
}) => {
  const { unitId, projectId } = await params;
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loading />
        </div>
      }
    >
      <ProjectDetailsComponents
        userEmail={user.emailAddresses[0].emailAddress}
        projectId={projectId}
        unitId={unitId}
      />
    </Suspense>
  );
};

export default ProjectPage;
async function ProjectDetailsComponents({
  userEmail,
  projectId,
  unitId,
}: {
  userEmail: string;
  projectId: string;
  unitId: string;
}) {
  "use cache";
  const userData = await getAuthUserDetails(userEmail);
  if (!userData) {
    redirect("/sign-in");
  }
  const isOwner = userData.role === "OWNER";
  const isAdmin = userData.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return <Unauthorized />;
  }

  // Récupérer les détails du projet
  const projectDetails = await getProjectDetails(projectId);
  return (
    <ProjectDashboard
      project={projectDetails as ProjectWithDetails}
      unitId={unitId}
    />
  );
}
