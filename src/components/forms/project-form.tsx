"use client";

import type React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CalendarIcon,
  User,
  DollarSign,
  Clock,
  Tag,
  X,
  Check,
  Loader2,
  Info,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fr } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatAmount, formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Client, Project, Status } from "@prisma/client";
import { getUnitClients, upsertProject } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";
import ClientModal from "./client-modal";

// Utiliser la fonction de formatage des montants
const formatNumber = (value: number) => {
  return formatAmount(value, false);
};

// Parse formatted number string back to number
const parseFormattedNumber = (value: string): number => {
  const cleanValue = value.replace(/[^\d.]/g, "");
  return Number.parseFloat(cleanValue) || 0;
};

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" })
    .max(100, { message: "Le nom ne peut pas dépasser 100 caractères" })
    .transform((value) => value.trim()),
  code: z
    .string()
    .min(2, { message: "Le code doit contenir au moins 2 caractères" })
    .max(50, { message: "Le code ne peut pas dépasser 50 caractères" }),
  type: z.string().min(1, { message: "Le type est requis" }),
  montantHT: z.coerce
    .number()
    .min(0, { message: "Le montant HT doit être positif" }),
  montantTTC: z.coerce
    .number()
    .min(0, { message: "Le montant TTC doit être positif" }),
  ods: z.date().optional().nullable(),
  delai: z.string().min(1, { message: "Le délai est requis" }),
  status: z.nativeEnum(Status, {
    errorMap: () => ({ message: "Le statut est requis" }),
  }),
  signe: z.boolean().default(false),
  clientId: z.string().min(1, { message: "Le client est requis" }),
});

interface ProjectFormProps {
  unitId: string;
  project?: Project;
}

export default function ProjectForm({ unitId, project }: ProjectFormProps) {
  const router = useRouter();
  const { setClose } = useModal(); // Add setOpen here
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formattedMontantHT, setFormattedMontantHT] = useState("");
  const [formattedMontantTTC, setFormattedMontantTTC] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoadingClients(true);
        setLoadError(null);
        const clientsData = await getUnitClients(unitId);
        setClients(clientsData);
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        setLoadError("Impossible de charger les clients. Veuillez réessayer.");
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, [unitId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      code: project?.code || "",
      type: project?.type || "",
      montantHT: project?.montantHT || 0,
      montantTTC: project?.montantTTC || 0,
      ods: project?.ods ? new Date(project.ods) : null,
      delai: project?.delai || "",
      status: project?.status || Status.New,
      signe: project?.signe || false,
      clientId: project?.clientId || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (project) {
      setFormattedMontantHT(formatNumber(project.montantHT));
      setFormattedMontantTTC(formatNumber(project.montantTTC));
    }
  }, [project]);
  const odsValue = form.watch("ods");
  useEffect(() => {
    console.log("Valeur ODS mise à jour:", odsValue);
  }, [odsValue]);

  const handleMontantHTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setFormattedMontantHT(inputValue);
    const numericValue = parseFormattedNumber(inputValue);
    form.setValue("montantHT", numericValue);
    const ttcValue = numericValue * 1.19;
    form.setValue("montantTTC", Number.parseFloat(ttcValue.toFixed(2)));
    setFormattedMontantTTC(formatNumber(ttcValue));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (
      project &&
      !window.confirm("Êtes-vous sûr de vouloir modifier ce projet ?")
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      const projectData: Project = {
        id: project?.id || uuidv4(),
        name: values.name,
        code: values.code,
        type: values.type,
        montantHT: values.montantHT,
        montantTTC: values.montantTTC,
        ods: values.ods || null,
        delai: values.delai,
        status: values.status,
        signe: values.signe,
        clientId: values.clientId,
        unitId: unitId,
        createdAt: project?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await upsertProject(projectData);
      toast.success(
        project ? "Projet modifié avec succès" : "Projet ajouté avec succès"
      );

      router.refresh();
      if (!project) {
        form.reset();
        setFormattedMontantHT("");
        setFormattedMontantTTC("");
      }
      setClose();
    } catch (erreur) {
      toast.error("Une erreur est survenue: " + erreur);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClearForm = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer tous les champs ?")) {
      form.reset();
      setFormattedMontantHT("");
      setFormattedMontantTTC("");
      toast.info("Formulaire réinitialisé");
    }
  };

  if (isLoadingClients) {
    return (
      <div className="flex items-center justify-center p-8 animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Chargement des clients...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
          <p>{loadError}</p>
          <Button
            variant="outline"
            className="mt-2 hover:bg-red-100 transition-colors"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-2">
          {/* Informations générales */}
          <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations générales
            </h3>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Nom du projet"
                        {...field}
                        className={cn(
                          "pr-16 min-h-[80px] resize-none transition-all duration-300",
                          form.formState.errors.name
                            ? "border-red-500 focus:ring-red-500"
                            : field.value
                            ? "border-green-500 focus:ring-green-500"
                            : ""
                        )}
                        title={field.value}
                        rows={2}
                      />
                      <span className="absolute right-3 top-6 text-xs text-muted-foreground">
                        {field.value.length}/100
                      </span>
                    </div>
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
                  <FormLabel>Code*</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Code du projet"
                        {...field}
                        className={cn(
                          "pl-10 transition-all duration-300",
                          form.formState.errors.code
                            ? "border-red-500 focus:ring-red-500"
                            : field.value
                            ? "border-green-500 focus:ring-green-500"
                            : ""
                        )}
                      />
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type du projet"
                      {...field}
                      className={cn(
                        "transition-all duration-300",
                        form.formState.errors.type
                          ? "border-red-500 focus:ring-red-500"
                          : field.value
                          ? "border-green-500 focus:ring-green-500"
                          : ""
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client*</FormLabel>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              form.formState.errors.clientId
                                ? "border-red-500 focus:ring-red-500"
                                : field.value
                                ? "border-green-500 focus:ring-green-500"
                                : ""
                            )}
                          >
                            <SelectValue
                              placeholder="Sélectionner un client"
                              className="truncate"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.length > 0 ? (
                            clients.map((client) => (
                              <SelectItem
                                key={client.id}
                                value={client.id}
                                className="truncate"
                              >
                                {client.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-clients" disabled>
                              Aucun client disponible
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <ClientModal
                      unitId={unitId}
                      onClientCreated={(newClientId, newClientName) => {
                        // Ajouter le nouveau client à la liste
                        setClients((prevClients) => [
                          ...prevClients,
                          { id: newClientId, name: newClientName } as Client,
                        ]);
                        // Sélectionner le nouveau client
                        field.onChange(newClientId);
                        toast.success("Nouveau client ajouté et sélectionné");
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Informations financières */}
          <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Informations financières
            </h3>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="montantHT"
                render={({ field: { ...restField } }) => (
                  <FormItem>
                    <FormLabel>Montant HT*</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Montant HT"
                          defaultValue={formattedMontantHT}
                          onInput={handleMontantHTChange}
                          className={cn(
                            "pl-12 transition-all duration-300",
                            form.formState.errors.montantHT
                              ? "border-red-500 focus:ring-red-500"
                              : restField.value
                              ? "border-green-500 focus:ring-green-500"
                              : ""
                          )}
                          {...restField}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          DA
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="montantTTC"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Montant TTC*
                      <span className="text-xs bg-blue-100 dark:bg-accent text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                        Calculé
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Montant TTC"
                          value={formattedMontantTTC}
                          className="pl-12 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                          readOnly
                          tabIndex={-1}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          DA
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Planification */}
          <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Planification
            </h3>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="ods"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date ODS</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal transition-all duration-300",
                              !field.value && "text-muted-foreground",
                              form.formState.errors.ods
                                ? "border-red-500 focus:ring-red-500"
                                : field.value
                                ? "border-green-500 focus:ring-green-500"
                                : ""
                            )}
                            type="button"
                          >
                            {field.value ? (
                              formatDate(field.value)
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
                          selected={field.value || undefined}
                          onSelect={(date) => {
                            field.onChange(date); // Met à jour directement la valeur
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={fr}
                          weekStartsOn={1}
                          formatters={{
                            formatCaption: (date) => {
                              return date.toLocaleString("fr", {
                                month: "long",
                                year: "numeric",
                              });
                            },
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Délai*
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Indiquez le délai estimé pour le projet (ex. : 30
                              jours)
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Délai du projet"
                        {...field}
                        className={cn(
                          "transition-all duration-300",
                          form.formState.errors.delai
                            ? "border-red-500 focus:ring-red-500"
                            : field.value
                            ? "border-green-500 focus:ring-green-500"
                            : ""
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Statut
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn(
                            form.formState.errors.status
                              ? "border-red-500 focus:ring-red-500"
                              : field.value
                              ? "border-green-500 focus:ring-green-500"
                              : ""
                          )}
                        >
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Status.New}>Nouveau</SelectItem>
                        <SelectItem value={Status.InProgress}>
                          En cours
                        </SelectItem>
                        <SelectItem value={Status.Pause}>En pause</SelectItem>
                        <SelectItem value={Status.Complete}>Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white dark:bg-gray-700">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="transition-all duration-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Contrat signé</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Cochez si le contrat a été signé par le client
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Boutons d’action */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearForm}
              disabled={isSubmitting}
              className="flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900 transition-all duration-300 transform hover:scale-105"
            >
              <X className="h-4 w-4" />
              Effacer tout
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2  transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {project ? "Modifier le projet" : "Créer le projet"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
