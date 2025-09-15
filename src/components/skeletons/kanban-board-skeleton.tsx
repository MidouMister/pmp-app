"use client";

import { Skeleton } from "@/components/ui/skeleton";

const KanbanBoardSkeleton = () => {
  // Créer un tableau de 3 colonnes pour simuler les lanes
  const skeletonLanes = Array.from({ length: 3 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-xl font-bold">
          <Skeleton className="h-8 w-40" />
        </h2>
        <Skeleton className="h-10 w-10 rounded-md" /> {/* Bouton d'ajout */}
      </div>

      {/* Conteneur des lanes */}
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 h-full">
        {skeletonLanes.map((index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[300px] bg-muted/30 rounded-md p-3 flex flex-col h-[calc(100vh-200px)]"
          >
            {/* En-tête de lane */}
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-6 w-32" /> {/* Titre de lane */}
              <div className="flex gap-1">
                <Skeleton className="h-6 w-6 rounded-full" />{" "}
                {/* Bouton d'action */}
                <Skeleton className="h-6 w-6 rounded-full" />{" "}
                {/* Bouton d'action */}
              </div>
            </div>

            {/* Tâches */}
            <div className="space-y-3 flex-1">
              {Array.from({ length: 3 + index }, (_, i) => (
                <div key={i} className="bg-card rounded-md p-3 shadow-sm">
                  <Skeleton className="h-5 w-full mb-2" />{" "}
                  {/* Titre de tâche */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {Array.from({ length: 2 }, (_, tagIndex) => (
                        <Skeleton
                          key={tagIndex}
                          className="h-5 w-12 rounded-full"
                        />
                      ))}
                    </div>
                    <Skeleton className="h-6 w-6 rounded-full" />{" "}
                    {/* Avatar ou icône */}
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton d'ajout de tâche */}
            <div className="mt-3">
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        ))}

        {/* Lane d'ajout */}
        <div className="flex-shrink-0 w-[300px] h-[120px] rounded-md">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default KanbanBoardSkeleton;
