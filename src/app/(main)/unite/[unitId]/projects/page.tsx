import { getUnitProjects } from "@/lib/queries";
import { getAuthUserDetails } from "@/lib/queries";
import { redirect } from "next/navigation";
import Unauthorized from "@/components/unauthorized";
import UnitProjects from "./unit-projects";
import { Suspense } from "react";
import Loading from "@/components/global/loading";

const ProjectsPage = async ({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) => {
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
  return (
    <div className="min-h-screen bg-background p-1">
      <div className=" container mx-auto py-6">
        <div className="mb-3">
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-muted-foreground">
            Gérez et suivez vos projets efficacement
          </p>
        </div>
        <Suspense
          fallback={<Loading text="Chargement..." variant="pulse" size="md" />}
        >
          <UnitProjects projects={projects} unitId={unitId} />
        </Suspense>
      </div>
    </div>
  );
};

export default ProjectsPage;
