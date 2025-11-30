/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatAmount, formatMonthYear } from "@/lib/utils";
import { useModal } from "@/providers/modal-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Phase, Project } from "@prisma/client";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
  // Removed redundant local state: selectedProject, selectedPhase
  // We will use form.watch values directly

  // Valeurs par défaut du formulaire
  const defaultValues: Partial<UnitProductionFormValues> = {
    date: new Date(),
    taux: 0,
    // montant: 0, // Removed unused field
  };

  const form = useForm<UnitProductionFormValues>({
    resolver: zodResolver(unitProductionFormSchema),
    defaultValues,
  });

  // Watch form values for reactive UI
  const projectId = form.watch("projectId");
  const phaseId = form.watch("phaseId");
  const taux = form.watch("taux");

  // Derived state
  const selectedProjectObj = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projectId, projects]
  );

  const availablePhases = useMemo(
    () => selectedProjectObj?.phases || [],
    [selectedProjectObj]
  );

  const selectedPhaseObj = useMemo(
    () => availablePhases.find((p) => p.id === phaseId),
    [phaseId, availablePhases]
  );

  const phaseMontantHT = selectedPhaseObj?.montantHT || 0;

  // Calculate montant produit based on watched values
  const montantProduit = useMemo(() => {
    return (taux * phaseMontantHT) / 100;
  }, [taux, phaseMontantHT]);

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
      return product.id;
    } catch (error: any) {
      console.error("Erreur lors de la création du produit:", error);
      throw new Error(
        error.message || "Erreur lors de l'initialisation de la production"
      );
    }
  };

  const onSubmit = async (data: UnitProductionFormValues) => {
    setIsSubmitting(true);
    try {
      // Déterminer le productId à utiliser
      let productId;

      // Si la phase a un produit associé, utiliser son ID
      if (selectedPhaseObj?.Product) {
        productId = selectedPhaseObj.Product.id;
      } else {
        // Sinon, créer un nouveau produit
        toast.info("Initialisation de la production...");
        productId = await createProductForPhase(data.phaseId);
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
          // Note: montant is calculated server-side for validation
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Show specific validation error from server
        throw new Error(responseData.error || "Une erreur est survenue");
      }

      toast.success("Production ajoutée avec succès");
      router.refresh();
      setClose();
    } catch (error: any) {
      // Display specific error message
      toast.error(error.message || "Une erreur est survenue");
      console.error("Erreur lors de l'ajout de la production:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Sélection Projet et Phase */}
        <div className="space-y-6 p-6 rounded-lg border overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold ">Projet et Phase</h3>
          </div>
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem className="flex flex-col ">
                <FormLabel>Projet</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset phase when project changes
                    form.setValue("phaseId", "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-left">
                      <SelectValue placeholder="Sélectionner un projet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        className="py-3"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Badge
                            variant="outline"
                            className="text-xs font-medium h-6 px-2 min-w-fit"
                          >
                            {project.code}
                          </Badge>
                          <span className="font-medium text-sm">
                            {project.name}
                          </span>
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!projectId}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-left">
                      <SelectValue placeholder="Sélectionner une phase" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availablePhases.map((phase) => (
                      <SelectItem
                        key={phase.id}
                        value={phase.id}
                        className="py-3"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Badge
                            variant="outline"
                            className="text-xs font-medium h-6 px-2 min-w-fit"
                          >
                            {phase.code}
                          </Badge>
                          <span className="font-medium text-sm">
                            {phase.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Affichage du montant HT de la phase */}
        {phaseId && (
          <div className="p-5 bg-muted/50 rounded-lg border">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Montant HT de la phase
              </h3>
              <p className="text-xl font-semibold mt-1">
                {formatAmount(phaseMontantHT)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Montant produit calculé
              </h3>
              <p className="text-xl font-semibold text-primary mt-1">
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
          <Button type="submit" disabled={isSubmitting || !phaseId}>
            {isSubmitting ? "Enregistrement..." : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
