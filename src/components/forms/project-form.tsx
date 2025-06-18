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
  Sparkles,
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
import { type Client, type Project, Status } from "@prisma/client";
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
    .max(250, { message: "Le nom ne peut pas dépasser 250 caractères" })
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
  const { setClose } = useModal();
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
      <div className="flex items-center justify-center p-12">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-xl rounded-full" />
          <div className="relative bg-card border border-border/50 rounded-xl px-8 py-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div className="absolute inset-0 h-6 w-6 animate-ping rounded-full bg-primary/20" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Chargement des clients...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8">
        <div className="relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 via-red-50 to-red-100 dark:from-red-950/50 dark:via-red-900/30 dark:to-red-950/50 dark:border-red-800/50 px-6 py-5 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5" />
          <div className="relative">
            <p className="text-red-700 dark:text-red-300 font-medium">
              {loadError}
            </p>
            <Button
              variant="outline"
              className="mt-3 border-red-200 bg-white/50 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:hover:bg-red-800/30 transition-all duration-200"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-60 h-60 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg mb-4">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              {project ? "Modifier le projet" : "Nouveau projet"}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Remplissez les informations ci-dessous pour{" "}
              {project ? "modifier" : "créer"} votre projet
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Informations générales */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      Informations générales
                    </h3>
                  </div>

                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground/90">
                            Nom du projet*
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Textarea
                                placeholder="Décrivez votre projet..."
                                {...field}
                                className={cn(
                                  "min-h-[100px] resize-none transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm",
                                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-background",
                                  "group-hover:border-border",
                                  form.formState.errors.name
                                    ? "border-red-500 focus:ring-red-500/20"
                                    : field.value
                                    ? "border-green-500/50 focus:ring-green-500/20"
                                    : ""
                                )}
                                rows={3}
                              />
                              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-xs transition-colors",
                                    field.value.length > 250
                                      ? "text-amber-600"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {field.value.length}/100
                                </span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground/90">
                              Code du projet*
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="PRJ-2024-001"
                                  {...field}
                                  className={cn(
                                    "pl-11 transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm",
                                    "focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-background",
                                    form.formState.errors.code
                                      ? "border-red-500 focus:ring-red-500/20"
                                      : field.value
                                      ? "border-green-500/50 focus:ring-green-500/20"
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
                            <FormLabel className="text-sm font-medium text-foreground/90">
                              Type de projet*
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Site web, Application mobile..."
                                {...field}
                                className={cn(
                                  "transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm",
                                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-background",
                                  form.formState.errors.type
                                    ? "border-red-500 focus:ring-red-500/20"
                                    : field.value
                                    ? "border-green-500/50 focus:ring-green-500/20"
                                    : ""
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground/90">
                            Client*
                          </FormLabel>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={cn(
                                      "transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm",
                                      "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                                      form.formState.errors.clientId
                                        ? "border-red-500 focus:ring-red-500/20"
                                        : field.value
                                        ? "border-green-500/50 focus:ring-green-500/20"
                                        : ""
                                    )}
                                  >
                                    <SelectValue placeholder="Sélectionner un client" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {clients.length > 0 ? (
                                    clients.map((client) => (
                                      <SelectItem
                                        key={client.id}
                                        value={client.id}
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
                                setClients((prevClients) => [
                                  ...prevClients,
                                  {
                                    id: newClientId,
                                    name: newClientName,
                                  } as Client,
                                ]);
                                field.onChange(newClientId);
                                toast.success(
                                  "Nouveau client ajouté et sélectionné"
                                );
                              }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Informations financières */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      Informations financières
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="montantHT"
                      render={({ field: { ...restField } }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground/90">
                            Montant HT*
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="0,00"
                                defaultValue={formattedMontantHT}
                                onInput={handleMontantHTChange}
                                className={cn(
                                  "pl-12 transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm",
                                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-background",
                                  form.formState.errors.montantHT
                                    ? "border-red-500 focus:ring-red-500/20"
                                    : restField.value
                                    ? "border-green-500/50 focus:ring-green-500/20"
                                    : ""
                                )}
                                {...restField}
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  DA
                                </span>
                              </div>
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
                          <FormLabel className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                            Montant TTC*
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200/50 dark:border-blue-700/50">
                              <Sparkles className="h-3 w-3" />
                              Auto
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="0,00"
                                value={formattedMontantTTC}
                                className="pl-12 bg-muted/50 border-border/30 cursor-not-allowed"
                                readOnly
                                tabIndex={-1}
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  DA
                                </span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Planification */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Planification</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="ods"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium text-foreground/90">
                            Date ODS
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal transition-all duration-300",
                                    "border-border/50 bg-background/50 backdrop-blur-sm",
                                    "hover:border-border hover:bg-background",
                                    !field.value && "text-muted-foreground",
                                    form.formState.errors.ods
                                      ? "border-red-500 focus:ring-red-500/20"
                                      : field.value
                                      ? "border-green-500/50 focus:ring-green-500/20"
                                      : ""
                                  )}
                                  type="button"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    formatDate(field.value)
                                  ) : (
                                    <span>Sélectionner une date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={(date) => {
                                  field.onChange(date);
                                }}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
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
                          <FormLabel className="text-sm font-medium text-foreground/90 flex items-center gap-2">
                            Délai*
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Indiquez le délai estimé pour le projet (ex.
                                    : 30 jours)
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="30 jours, 2 mois..."
                              {...field}
                              className={cn(
                                "transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm",
                                "focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-background",
                                form.formState.errors.delai
                                  ? "border-red-500 focus:ring-red-500/20"
                                  : field.value
                                  ? "border-green-500/50 focus:ring-green-500/20"
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
              </div>

              {/* Statut */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      Statut et validation
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground/90">
                            Statut du projet*
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm",
                                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                                  form.formState.errors.status
                                    ? "border-red-500 focus:ring-red-500/20"
                                    : field.value
                                    ? "border-green-500/50 focus:ring-green-500/20"
                                    : ""
                                )}
                              >
                                <SelectValue placeholder="Sélectionner un statut" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={Status.New}>
                                🆕 Nouveau
                              </SelectItem>
                              <SelectItem value={Status.InProgress}>
                                ⚡ En cours
                              </SelectItem>
                              <SelectItem value={Status.Pause}>
                                ⏸️ En pause
                              </SelectItem>
                              <SelectItem value={Status.Complete}>
                                ✅ Terminé
                              </SelectItem>
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
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground/90">
                            Validation contractuelle
                          </FormLabel>
                          <div className="mt-2">
                            <div
                              className={cn(
                                "flex items-start space-x-4 rounded-xl border p-4 transition-all duration-300",
                                "border-border/50 bg-background/30 backdrop-blur-sm",
                                field.value
                                  ? "border-green-500/50 bg-green-500/5"
                                  : "hover:border-border hover:bg-background/50"
                              )}
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-0.5 transition-all duration-300"
                                />
                              </FormControl>
                              <div className="grid gap-1.5 leading-none">
                                <div className="font-medium">Contrat signé</div>
                                <p className="text-sm text-muted-foreground">
                                  Confirmer que le contrat a été signé par le
                                  client
                                </p>
                              </div>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearForm}
                  disabled={isSubmitting}
                  className="group flex items-center gap-2 transition-all duration-300 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 hover:scale-105"
                >
                  <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
                  Effacer tout
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
                      {project ? "Modifier le projet" : "Créer le projet"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
