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
import { cn, formatAmount } from "@/lib/utils";
import { formatMonthYear } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";

// Schéma de validation pour le formulaire de production
const productionFormSchema = z.object({
  date: z.date({
    required_error: "La date est requise",
  }),
  taux: z.coerce
    .number()
    .min(0, "Le taux doit être positif")
    .max(100, "Le taux ne peut pas dépasser 100%"),
  montant: z.number().optional(),
});

type ProductionFormValues = z.infer<typeof productionFormSchema>;

interface ProductionFormProps {
  productId: string;
  phaseId: string;
  production?: {
    id: string;
    date: Date;
    taux: number;
    mntProd: number;
  };
  phaseData?: {
    montantHT: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductionForm({
  productId,
  phaseId,
  production,
  phaseData,
  onSuccess,
  onCancel,
}: ProductionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phaseMontantHT, setPhaseMontantHT] = useState<number>(
    phaseData?.montantHT || 0
  );
  const [montantProduit, setMontantProduit] = useState<number>(
    production?.mntProd || 0
  );

  // Valeurs par défaut du formulaire
  const defaultValues: Partial<ProductionFormValues> = {
    date: production?.date || new Date(),
    taux: production?.taux || 0,
    montant: production?.mntProd || 0,
  };

  const form = useForm<ProductionFormValues>({
    resolver: zodResolver(productionFormSchema),
    defaultValues,
  });

  // Memoize the calculation function to prevent unnecessary re-renders
  const calculateMontantProduit = useCallback(
    (taux: number) => {
      const montant = (taux * phaseMontantHT) / 100;
      setMontantProduit(montant);
      return montant;
    },
    [phaseMontantHT]
  );

  // Watch the taux field value
  const tauxValue = form.watch("taux");

  // Mettre à jour le montant produit lorsque le taux change
  useEffect(() => {
    const taux = form.getValues("taux");
    calculateMontantProduit(taux);
  }, [tauxValue, phaseMontantHT, calculateMontantProduit, form]);

  // Récupérer les données de la phase si elles ne sont pas fournies
  useEffect(() => {
    const fetchPhaseData = async () => {
      if (!phaseData && phaseId) {
        try {
          const response = await fetch(`/api/phases/${phaseId}`);
          if (response.ok) {
            const data = await response.json();
            setPhaseMontantHT(data.montantHT || 0);
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données de la phase:",
            error
          );
        }
      }
    };

    fetchPhaseData();
  }, [phaseData, phaseId]);

  const onSubmit = async (data: ProductionFormValues) => {
    setIsSubmitting(true);
    try {
      // Déterminer si c'est une création ou une mise à jour
      const url = "/api/productions";
      const method = production ? "PATCH" : "POST";

      // Calculer le montant produit
      const montant = calculateMontantProduit(data.taux);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: production?.id,
          productId,
          phaseId,
          date: data.date,
          taux: data.taux,
          montant: montant,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Une erreur est survenue");
      }

      toast.success(
        production
          ? "Production mise à jour avec succès"
          : "Production ajoutée avec succès"
      );
      router.refresh();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Affichage du montant HT de la phase */}
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
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Enregistrement..."
              : production
              ? "Mettre à jour"
              : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
