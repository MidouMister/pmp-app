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
import { CalendarIcon } from "lucide-react";
import { Phase } from "@prisma/client";
import { ProjectWithDetails } from "@/lib/types";
import { getStatusBadge } from "./utils";

interface OverviewTabProps {
  project: ProjectWithDetails;
  onAddPhase: () => void;
  onEditPhase: (phase: Phase) => void;
  onDeletePhase: (phase: Phase) => void;
}

/**
 * Composant pour l'onglet Aperçu qui affiche les informations générales du projet
 */
const OverviewTab = ({ project, onAddPhase }: OverviewTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Carte d'informations du projet */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Informations du projet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p>{project.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Statut
                </p>
                <p className="flex items-center gap-2">
                  {getStatusBadge(project.status)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Montant HT
                </p>
                <p>{project.montantHT.toLocaleString()} DA</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Montant TTC
                </p>
                <p>{project.montantTTC.toLocaleString()} DA</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Délai
                </p>
                <p>{project.delai}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Signé
                </p>
                <p>{project.signe ? "Oui" : "Non"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ODS</p>
                <p className="flex items-center gap-2">
                  {project.ods ? (
                    <>
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(project.ods)}
                    </>
                  ) : (
                    "Non défini"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Créé le
                </p>
                <p className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(project.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte d'informations du client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Informations du client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p>{project.Client.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Wilaya
                </p>
                <p>{project.Client.wilaya || "Non défini"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Téléphone
                </p>
                <p>{project.Client.phone || "Non défini"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p>{project.Client.email || "Non défini"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carte de résumé des phases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Résumé des phases</CardTitle>
          <CardDescription>
            {project.phases.length} phase(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {project.phases.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {project.phases.map((phase) => (
                  <Card key={phase.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{phase.name}</CardTitle>
                      <CardDescription>Code: {phase.code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Montant HT:
                          </span>
                          <span>{phase.montantHT.toLocaleString()} DA</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Statut:
                          </span>
                          <span>{getStatusBadge(phase.status)}</span>
                        </div>
                        {phase.start && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Début:
                            </span>
                            <span>{formatDate(phase.start)}</span>
                          </div>
                        )}
                        {phase.end && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Fin:
                            </span>
                            <span>{formatDate(phase.end)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-muted-foreground">
                  Aucune phase n&apos;a été ajoutée à ce projet
                </p>
                <Button className="mt-2" onClick={onAddPhase}>
                  Ajouter une phase
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
