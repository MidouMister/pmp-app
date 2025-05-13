"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phase, Status } from "@prisma/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { upsertPhase } from "@/lib/queries";
import { formatAmount, parseFormattedNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useModal } from "@/providers/modal-provider";

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Le nom est requis" }),
  code: z.string().min(1, { message: "Le code est requis" }),
  montantHT: z.coerce
    .number()
    .min(0, { message: "Le montant doit être positif" }),
  start: z.string().optional(),
  end: z.string().optional(),
  status: z.enum(["New", "InProgress", "Pause", "Complete"]),
  obs: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PhaseFormProps {
  projectId: string;
  phase?: Phase;
  onSuccess: () => void;
  onCancel: () => void;
}

const PhaseForm = ({
  projectId,
  phase,
  onSuccess,
  onCancel,
}: PhaseFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formattedMontantHT, setFormattedMontantHT] = useState("");
  const { setClose } = useModal();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: phase?.id || "",
      name: phase?.name || "",
      code: phase?.code || "",
      montantHT: phase?.montantHT || 0,
      start: phase?.start
        ? new Date(phase.start).toISOString().split("T")[0]
        : "",
      end: phase?.end ? new Date(phase.end).toISOString().split("T")[0] : "",
      status: phase?.status || "New",
      obs: phase?.obs || "",
    },
  });

  useEffect(() => {
    if (phase?.montantHT) {
      setFormattedMontantHT(formatAmount(phase.montantHT, false));
    }
  }, [phase]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const phaseData: Phase = {
        id: values.id || uuidv4(),
        name: values.name,
        code: values.code,
        montantHT: values.montantHT,
        start: values.start ? new Date(values.start) : null,
        end: values.end ? new Date(values.end) : null,
        status: values.status as Status,
        obs: values.obs || null,
        projectId: projectId,
        productId: null,
      };

      await upsertPhase(phaseData);

      toast.success(`Phase ${phase ? "modifiée" : "ajoutée"} avec succès`);
      router.refresh();
      onSuccess();
      setClose();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la phase</FormLabel>
              <FormControl>
                <Input placeholder="Nom de la phase" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="Code de la phase" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="montantHT"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant HT</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Montant HT"
                  value={formattedMontantHT}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setFormattedMontantHT(inputValue);
                    const numericValue = parseFormattedNumber(inputValue);
                    field.onChange(numericValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de début</FormLabel>
                <FormControl>
                  <Input type="date" {...field} placeholder="JJ/MM/AAAA" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin</FormLabel>
                <FormControl>
                  <Input type="date" {...field} placeholder="JJ/MM/AAAA" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="New">Nouveau</SelectItem>
                  <SelectItem value="InProgress">En cours</SelectItem>
                  <SelectItem value="Pause">En pause</SelectItem>
                  <SelectItem value="Complete">Terminé</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="obs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observations</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observations"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Chargement..." : phase ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PhaseForm;
