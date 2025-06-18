"use client";

import { Button } from "@/components/ui/button";
import CustomSheet from "@/components/global/custom-sheet";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, formatMonthYear } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Phase, Product, Production } from "@prisma/client";
import TauxChart from "@/components/charts/taux-chart";

// Type pour les phases avec produit et productions
type PhaseWithProduct = Phase & {
  Product?: Product & {
    Productions?: Production[];
  };
};

interface ProductionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhase: PhaseWithProduct | undefined;
  onAddProduction: (
    phaseId: string,
    productId?: string,
    phase?: PhaseWithProduct
  ) => void;
  onEditProduction: (
    production: Production,
    productId: string,
    phaseId: string
  ) => void;
  onDeleteProduction: (productionId: string) => void;
}

/**
 * Composant pour la modale de détails de production qui affiche les productions mensuelles d'une phase
 */
const ProductionDetailsModal = ({
  isOpen,
  onClose,
  selectedPhase,
  onAddProduction,
  onEditProduction,
  onDeleteProduction,
}: ProductionDetailsModalProps) => {
  if (!isOpen || !selectedPhase) return null;

  return (
    <CustomSheet
      title={`${selectedPhase.name}`}
      subheading={`Détails des productions mensuelles`}
      defaultOpen={true}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Informations générales</h3>
            <p className="text-muted-foreground">
              Montant HT : {formatAmount(selectedPhase.montantHT)}
            </p>
            <p className="text-muted-foreground flex items-center gap-2">
              Taux total :{" "}
              <TauxChart taux={selectedPhase.Product?.taux || 0} />
            </p>
            <p className=" text-muted-foreground">
              Montant produit :{" "}
              {formatAmount(selectedPhase.Product?.montantProd || 0)}
            </p>
          </div>
          <Button
            onClick={() =>
              onAddProduction(
                selectedPhase.id,
                selectedPhase.Product?.id,
                selectedPhase
              )
            }
            className="font-semibold"
          >
            <Plus className="h-4 w-4" /> Production
          </Button>
        </div>

        {selectedPhase.Product?.Productions &&
        selectedPhase.Product.Productions.length > 0 ? (
          <Table>
            <TableCaption>Liste des productions mensuelles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Taux (%)</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedPhase.Product.Productions.map((production) => (
                <TableRow key={production.id}>
                  <TableCell>{formatMonthYear(production.date)}</TableCell>
                  <TableCell>
                    <TauxChart taux={production.taux} />
                  </TableCell>
                  <TableCell>{formatAmount(production.mntProd)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onEditProduction(
                            production,
                            selectedPhase.Product?.id || "",
                            selectedPhase.id
                          )
                        }
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteProduction(production.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-muted-foreground">
              Aucune production n&apos;a été ajoutée pour cette phase
            </p>
            <Button
              className="mt-2"
              onClick={() =>
                onAddProduction(
                  selectedPhase.id,
                  selectedPhase.Product?.id,
                  selectedPhase
                )
              }
            >
              Ajouter une production
            </Button>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </CustomSheet>
  );
};

export default ProductionDetailsModal;