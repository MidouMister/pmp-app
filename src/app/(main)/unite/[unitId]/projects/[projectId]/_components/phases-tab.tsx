"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Phase } from "@prisma/client";
import { getStatusBadge } from "./utils";

interface PhasesTabProps {
  phases: Phase[];
  onAddPhase: () => void;
  onEditPhase: (phase: Phase) => void;
  onDeletePhase: (phase: Phase) => void;
}

/**
 * Composant pour l'onglet Phases qui permet de gérer les phases du projet
 */
const PhasesTab = ({
  phases,
  onAddPhase,
  onEditPhase,
  onDeletePhase,
}: PhasesTabProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Phases du projet</CardTitle>
          <CardDescription>Gérez les phases de votre projet</CardDescription>
        </div>
        <Button onClick={onAddPhase}>Ajouter une phase</Button>
      </CardHeader>
      <CardContent>
        {phases.length > 0 ? (
          <div className="space-y-4">
            {phases.map((phase) => (
              <Card key={phase.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{phase.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditPhase(phase)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeletePhase(phase)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Code: {phase.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Montant HT
                      </p>
                      <p>{phase.montantHT.toLocaleString()} DA</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Statut
                      </p>
                      <p className="flex items-center gap-2">
                        {getStatusBadge(phase.status)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Période
                      </p>
                      <p>
                        {phase.start && phase.end
                          ? `${formatDate(phase.start)} - ${formatDate(
                              phase.end
                            )}`
                          : "Non définie"}
                      </p>
                    </div>
                  </div>
                  {phase.obs && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Observations
                      </p>
                      <p>{phase.obs}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              Aucune phase n&apos;a été ajoutée à ce projet
            </p>
            <Button className="mt-4" onClick={onAddPhase}>
              Ajouter une phase
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhasesTab;
