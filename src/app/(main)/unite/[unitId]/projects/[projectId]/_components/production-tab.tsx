"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAmount } from "@/lib/utils";
import { Eye, MoreHorizontal, PieChart, Plus } from "lucide-react";
import { Phase, Product, Production } from "@prisma/client";
import TauxChart from "@/components/charts/taux-chart";

// Type pour les phases avec produit et productions
type PhaseWithProduct = Phase & {
  Product?: Product & {
    Productions?: Production[];
  };
};

interface ProductionTabProps {
  phases: Phase[];
  onAddPhase: () => void;
  onViewProductionDetails: (phase: PhaseWithProduct) => void;
  onAddProduction: (
    phaseId: string,
    productId?: string,
    phase?: PhaseWithProduct
  ) => void;
}

/**
 * Composant pour l'onglet Production qui permet de gérer les productions des phases
 */
const ProductionTab = ({
  phases,
  onAddPhase,
  onViewProductionDetails,
  onAddProduction,
}: ProductionTabProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Production par phase</CardTitle>
          <CardDescription>
            Gérez les productions de chaque phase du projet
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {phases.length > 0 ? (
          <Table>
            <TableCaption>Liste des phases avec leur production</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Phase</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Montant HT</TableHead>
                <TableHead>Taux (%)</TableHead>
                <TableHead>Montant produit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phases.map((phase: PhaseWithProduct) => (
                <TableRow key={phase.id}>
                  <TableCell className="font-medium">{phase.name}</TableCell>
                  <TableCell>{phase.code}</TableCell>
                  <TableCell>{formatAmount(phase.montantHT)}</TableCell>
                  <TableCell>
                    <TauxChart taux={phase.Product ? phase.Product.taux : 0} />
                  </TableCell>
                  <TableCell>
                    {phase.Product
                      ? formatAmount(phase.Product.montantProd)
                      : formatAmount(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            if (phase.Product) {
                              onViewProductionDetails(phase);
                            } else {
                              // Cette fonctionnalité nécessite createProductForPhase qui n'est plus disponible
                              alert(
                                "La fonctionnalité d'initialisation de production n'est pas disponible actuellement."
                              );
                            }
                          }}
                        >
                          {phase.Product ? (
                            <>
                              <Eye className="mr-2 h-4 w-4" /> Voir les détails
                            </>
                          ) : (
                            <>
                              <PieChart className="mr-2 h-4 w-4" /> Initialiser
                              la production
                            </>
                          )}
                        </DropdownMenuItem>
                        {phase.Product && (
                          <DropdownMenuItem
                            onClick={() =>
                              onAddProduction(
                                phase.id,
                                phase.Product?.id,
                                phase
                              )
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" /> Ajouter une
                            production
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      </CardContent>
    </Card>
  );
};

export default ProductionTab;
