/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useModal } from "@/providers/modal-provider";
import { cn, formatAmount } from "@/lib/utils";
import { formatMonthYear } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phase, Project } from "@prisma/client";

// Schéma de validation pour le formulaire de production unitaire
const unitProductionFormSchema = z.object({
  projectId: z.string({
    required_error: "Le projet est requis",
  }),
  phaseId: z.string({
    required_error: "La phase est requise",
  }),
  date: z.date({
    required_error: "La date est requise",
  }),
  taux: z.coerce
    .number()
    .min(0, "Le taux doit être positif")
    .max(100, "Le taux ne peut pas dépasser 100%"),
  montant: z.number().optional(),
});

type UnitProductionFormValues = z.infer<typeof unitProductionFormSchema>;

interface UnitProductionFormProps {
  projects: (Project & { phases: (Phase & { Product?: { id: string } })[] })[];
}

export default function UnitProductionForm({
  projects,
}: UnitProductionFormProps) {
  const { setClose } = useModal();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");
  const [phaseMontantHT, setPhaseMontantHT] = useState<number>(0);
  const [montantProduit, setMontantProduit] = useState<number>(0);

  // Valeurs par défaut du formulaire
  const defaultValues: Partial<UnitProductionFormValues> = {
    date: new Date(),
    taux: 0,
    montant: 0,
  };

  const form = useForm<UnitProductionFormValues>({
    resolver: zodResolver(unitProductionFormSchema),
    defaultValues,
  });

  // Filtrer les phases en fonction du projet sélectionné
  const availablePhases = selectedProject
    ? projects.find((p) => p.id === selectedProject)?.phases || []
    : [];

  // Mettre à jour le projet sélectionné lorsque le champ projectId change
  useEffect(() => {
    const projectId = form.getValues("projectId");
    if (projectId) {
      setSelectedProject(projectId);
    }
  }, [form.watch("projectId")]);

  // Mettre à jour la phase sélectionnée lorsque le champ phaseId change
  useEffect(() => {
    const phaseId = form.getValues("phaseId");
    if (phaseId) {
      // Récupérer le montant HT de la phase sélectionnée
      const phase = availablePhases.find((p) => p.id === phaseId);
      if (phase) {
        setPhaseMontantHT(phase.montantHT);
        
        // Vérifier si la phase a un produit associé
        if (phase.Product) {
          setSelectedPhase(phase.Product.id);
        } else {
          // Si pas de produit, on utilise l'ID de la phase
          // On créera un produit au moment de la soumission
          setSelectedPhase(phaseId);
        }
      }
    }
  }, [form.watch("phaseId"), availablePhases]);

  // Calculer le montant produit lorsque le taux change
  const calculateMontantProduit = (taux: number) => {
    const montant = (taux * phaseMontantHT) / 100;
    setMontantProduit(montant);
    return montant;
  };

  // Mettre à jour le montant produit lorsque le taux change
  useEffect(() => {
    const taux = form.getValues("taux");
    calculateMontantProduit(taux);
  }, [form.watch("taux"), phaseMontantHT]);

  // Fonction pour créer un produit pour une phase si nécessaire
  const createProductForPhase = async (phaseId: string) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phaseId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création du produit");
      }

      const product = await response.json();
      toast.success("Production initialisée avec succès");
      return product.id;
    } catch (error: any) {
      toast.error(
        error.message || "Erreur lors de l'initialisation de la production"
      );
      return null;
    }
  };

  const onSubmit = async (data: UnitProductionFormValues) => {
    setIsSubmitting(true);
    try {
      // Calculer le montant produit
      const montant = calculateMontantProduit(data.taux);

      // Vérifier si un produit existe pour cette phase
      let productId = selectedPhase;
      const selectedPhaseObj = availablePhases.find(p => p.id === data.phaseId);
      
      // Si aucun produit n'existe, en créer un
      if (selectedPhaseObj && !selectedPhaseObj.Product) {
        productId = await createProductForPhase(data.phaseId);
        
        // Si la création du produit a échoué, arrêter le processus
        if (!productId) {
          throw new Error("Impossible de créer un produit pour cette phase");
        }
      }

      // Appel à l'API pour créer une nouvelle production
      const response = await fetch("/api/productions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          date: data.date,
          taux: data.taux,
          montant: montant,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Une erreur est survenue");
      }

      toast.success("Production ajoutée avec succès");
      router.refresh();
      setClose();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projet</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedProject(value);
                  // Réinitialiser la phase sélectionnée
                  form.setValue("phaseId", "");
                  setSelectedPhase("");
                  setPhaseMontantHT(0);
                  setMontantProduit(0);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un projet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal h-5 px-1.5"
                        >
                          {project.code}
                        </Badge>
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phaseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phase</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedPhase(value);
                  // Récupérer le montant HT de la phase sélectionnée
                  const phase = availablePhases.find((p) => p.id === value);
                  if (phase) {
                    setPhaseMontantHT(phase.montantHT);
                    // Recalculer le montant produit
                    const taux = form.getValues("taux");
                    calculateMontantProduit(taux);
                  }
                }}
                defaultValue={field.value}
                disabled={!selectedProject}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une phase" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availablePhases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal h-5 px-1.5"
                        >
                          {phase.code}
                        </Badge>
                        <span>{phase.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Affichage du montant HT de la phase */}
        {selectedPhase && (
          <div className="p-4 bg-muted rounded-md">
            <div className="mb-2">
              <h3 className="text-sm font-medium">Montant HT de la phase</h3>
              <p className="text-lg font-semibold">
                {formatAmount(phaseMontantHT)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Montant produit calculé</h3>
              <p className="text-lg font-semibold text-primary">
                {formatAmount(montantProduit)}
              </p>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        formatMonthYear(field.value)
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taux"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taux de production (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Entrez le taux de production"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    calculateMontantProduit(parseFloat(e.target.value) || 0);
                  }}
                />
              </FormControl>
              <FormDescription>
                Le taux de production en pourcentage (0-100%)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setClose()}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || !selectedPhase}>
            {isSubmitting ? "Enregistrement..." : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
