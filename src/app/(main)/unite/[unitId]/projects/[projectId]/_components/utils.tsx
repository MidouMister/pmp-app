import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, AlertCircle, PauseCircle, PlayCircle } from "lucide-react";

/**
 * Renvoie un badge correspondant au statut du projet ou de la phase
 * @param status Statut du projet ou de la phase
 * @returns Badge avec la couleur appropriée
 */
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "New":
      return <Badge className="bg-blue-500">Nouveau</Badge>;
    case "InProgress":
      return <Badge className="bg-yellow-500">En cours</Badge>;
    case "Pause":
      return <Badge className="bg-orange-500">En pause</Badge>;
    case "Complete":
      return <Badge className="bg-green-500">Terminé</Badge>;
    default:
      return <Badge>Inconnu</Badge>;
  }
};

/**
 * Renvoie une icône correspondant au statut du projet ou de la phase
 * @param status Statut du projet ou de la phase
 * @returns Icône avec la couleur appropriée
 */
export const getStatusIcon = (status: string) => {
  switch (status) {
    case "New":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "InProgress":
      return <PlayCircle className="h-4 w-4 text-yellow-500" />;
    case "Pause":
      return <PauseCircle className="h-4 w-4 text-orange-500" />;
    case "Complete":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};