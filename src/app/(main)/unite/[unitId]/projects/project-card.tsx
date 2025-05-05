"use client";

import { Project, Status } from "@prisma/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Edit,
  FileText,
  MoreHorizontal,
  Trash,
  Clock,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Eye,
  CreditCard,
  XCircle,
  User2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "@/components/global/custom-model";
import ProjectForm from "@/components/forms/project-form";
import { deleteProject } from "@/lib/queries";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { formatAmount } from "@/lib/format-utils";
import Link from "next/link";
interface ProjectCardProps {
  project: Project & { Client: { name: string } };
  unitId: string;
}

const ProjectCard = ({ project, unitId }: ProjectCardProps) => {
  const { setOpen } = useModal();
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Function to get status badge styling
  const getStatusConfig = (status: Status) => {
    switch (status) {
      case Status.New:
        return {
          color: "bg-blue-500",
          textColor: "text-white",
          hoverBg: "hover:bg-blue-600",
          icon: <PlayCircle className="h-3.5 w-3.5 mr-1" />,
          label: "Nouveau",
          borderColor: "border-blue-500",
        };
      case Status.InProgress:
        return {
          color: "bg-amber-500",
          textColor: "text-white",
          hoverBg: "hover:bg-amber-600",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          label: "En cours",
          borderColor: "border-amber-500",
        };
      case Status.Pause:
        return {
          color: "bg-orange-500",
          textColor: "text-white",
          hoverBg: "hover:bg-orange-600",
          icon: <PauseCircle className="h-3.5 w-3.5 mr-1" />,
          label: "En pause",
          borderColor: "border-orange-500",
        };
      case Status.Complete:
        return {
          color: "bg-emerald-500",
          textColor: "text-white",
          hoverBg: "hover:bg-emerald-600",
          icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />,
          label: "Terminé",
          borderColor: "border-emerald-500",
        };
      default:
        return {
          color: "bg-slate-500",
          textColor: "text-white",
          hoverBg: "hover:bg-slate-600",
          icon: null,
          label: status,
          borderColor: "border-slate-500",
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "p-1 w-full max-w-md overflow-hidden transition-all duration-300 group",
          `border-l-4 ${statusConfig.borderColor}`,
          "bg-background hover:shadow-xl dark:hover:shadow-primary/10",
          "relative"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-5 pb-3">
          <div className="flex justify-between items-start gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-1.5 max-w-[calc(100%-80px)]">
                  <h3 className="font-bold text-xl leading-tight tracking-tight group-hover:text-foreground line-clamp-2 hover:line-clamp-none transition-all duration-300">
                    <Link
                      href={`/unite/${project.unitId}/projects/${project.id}`}
                    >
                      {project.name}
                    </Link>
                  </h3>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>{project.name}</p>
              </TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-2 shrink-0">
              <Badge
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center",
                  statusConfig.color,
                  statusConfig.textColor,
                  "transition-transform group-hover:scale-105"
                )}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </Badge>

              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Ouvrir le menu</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="flex items-center cursor-pointer"
                      onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Détails du projet"
                            subheading="Informations détaillées du projet"
                          >
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold">Nom du projet</h3>
                                <p>{project.name}</p>
                              </div>
                              <div>
                                <h3 className="font-semibold">Client</h3>
                                <p>{project.Client.name}</p>
                              </div>
                            </div>
                          </CustomModal>
                        );
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                      Voir détails
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center cursor-pointer"
                      onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Modifier les détails du projet"
                            subheading="Vous pouvez modifier les détails du projet"
                          >
                            <ProjectForm unitId={unitId} project={project} />
                          </CustomModal>
                        );
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="flex items-center text-rose-600 focus:text-rose-600 cursor-pointer">
                        <Trash className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Êtes-vous absolument sûr?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera
                      définitivement le projet{" "}
                      <span className="font-bold">{project.name}</span>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={async () => {
                        try {
                          setLoading(true);
                          await deleteProject(project.id, unitId);
                          toast.success("Projet supprimé avec succès");
                          router.refresh();
                        } catch (error) {
                          toast.error("Une erreur est survenue" + error);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      {loading ? "Suppression..." : "Supprimer"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <FileText className="h-3.5 w-3.5 mr-1.5 text-teal-400" />
            <span className="text-xs text-muted-foreground block mr-1">
              Code:
            </span>
            <span className="text-xs font-medium uppercase tracking-wider">
              {project.code}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 pb-0 bg-background dark:bg-background/80">
          <div className="flex flex-col space-y-4 text-sm">
            <div className="flex items-center group/item">
              <CreditCard className="h-4 w-4 mr-2 text-teal-400 group-hover/item:text-muted-foreground transition-colors" />
              <div>
                <span className="text-xs text-muted-foreground block">
                  Montant HT
                </span>
                <span className="font-semibold">
                  {formatAmount(project.montantHT)}
                </span>
              </div>
            </div>

            <div className="flex items-center group/item">
              <Clock className="h-4 w-4 mr-2 text-teal-400 group-hover/item:text-slate-600 transition-colors" />
              <div>
                <span className="text-xs text-muted-foreground block">
                  Délai
                </span>
                <span className="font-semibold">{project.delai}</span>
              </div>
            </div>
            <div className="flex items-center group/item">
              <User2 className="h-4 w-4 mr-2 text-teal-400 group-hover/item:text-slate-600 transition-colors" />
              <div>
                <span className="text-xs text-muted-foreground block">
                  Client
                </span>
                <span className="font-semibold">
                  {project.Client?.name || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex items-center group/item">
              <Calendar className="h-4 w-4 mr-2 text-teal-400 group-hover/item:text-slate-600 transition-colors" />
              <div>
                <span className="text-xs text-muted-foreground block">
                  Type
                </span>
                <span className="font-semibold">{project.type}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <Separator className="bg-border " />

        <CardFooter
          className={cn(
            "p-2 flex justify-between items-center",
            "bg-gradient-to-r from-muted/50 to-muted",
            "dark:from-muted/30 dark:to-muted/60",
            "transition-all duration-300",
            isHovered
              ? "from-muted to-muted/80 dark:from-muted/50 dark:to-muted/80"
              : ""
          )}
        >
          {project.signe ? (
            <div className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full text-xs font-medium border-[1px] border-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Signé
            </div>
          ) : (
            <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full text-xs font-medium border-[1px] border-amber-400">
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Non signé
            </div>
          )}
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">
              Montant TTC
            </div>
            <div
              className={cn(
                "text-lg font-bold transition-all duration-300",
                isHovered
                  ? "text-emerald-600 dark:text-emerald-400 scale-105"
                  : "text-foreground"
              )}
            >
              {formatAmount(project.montantTTC)}
            </div>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default ProjectCard;
