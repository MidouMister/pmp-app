"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import { ProjectWithDetails } from "@/lib/types";
import CustomSheet from "@/components/global/custom-sheet";
import ProjectForm from "@/components/forms/project-form";
import { getStatusBadge, getStatusIcon } from "./utils";

interface ProjectHeaderProps {
  project: ProjectWithDetails;
  unitId: string;
}

/**
 * Composant d'en-tête du projet affichant les informations de base et le bouton de modification
 */
const ProjectHeader = ({ project, unitId }: ProjectHeaderProps) => {
  const { setOpen } = useModal();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span>Code: {project.code}</span>
          <span>•</span>
          <span>Client: {project.Client.name}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            {getStatusIcon(project.status)}
            {getStatusBadge(project.status)}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() =>
            setOpen(
              <CustomSheet
                key={`edit-project-${project.id}`}
                title="Modifier le projet"
                subheading="Modifiez les informations du projet"
              >
                <ProjectForm unitId={unitId} project={project} />
              </CustomSheet>
            )
          }
        >
          Modifier{" "}
        </Button>
      </div>
    </div>
  );
};

export default ProjectHeader;
