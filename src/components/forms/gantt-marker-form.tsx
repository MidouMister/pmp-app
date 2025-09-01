"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GanttMarker } from "@prisma/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGanttMarker, updateGanttMarker } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useModal } from "@/providers/modal-provider";
import { Calendar, Tag, Palette, Loader2 } from "lucide-react";

const formSchema = z.object({
  id: z.string().optional(),
  label: z
    .string()
    .min(1, { message: "Le libellé est requis" })
    .max(50, { message: "Le libellé ne peut pas dépasser 50 caractères" })
    .trim(),
  date: z.string().min(1, { message: "La date est requise" }),
  className: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface GanttMarkerFormProps {
  projectId: string;
  marker?: GanttMarker;
  date?: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

const classNameOptions = [
  {
    value: "bg-blue-100 text-blue-900 border-blue-200",
    label: "Bleu",
    color: "bg-blue-500",
    description: "Idéal pour les jalons importants",
  },
  {
    value: "bg-green-100 text-green-900 border-green-200",
    label: "Vert",
    color: "bg-green-500",
    description: "Parfait pour les objectifs atteints",
  },
  {
    value: "bg-purple-100 text-purple-900 border-purple-200",
    label: "Violet",
    color: "bg-purple-500",
    description: "Pour les événements spéciaux",
  },
  {
    value: "bg-red-100 text-red-900 border-red-200",
    label: "Rouge",
    color: "bg-red-500",
    description: "Attention requise ou échéances critiques",
  },
  {
    value: "bg-orange-100 text-orange-900 border-orange-200",
    label: "Orange",
    color: "bg-orange-500",
    description: "Avertissements ou révisions",
  },
  {
    value: "bg-teal-100 text-teal-900 border-teal-200",
    label: "Turquoise",
    color: "bg-teal-500",
    description: "Réunions et présentations",
  },
  {
    value: "bg-indigo-100 text-indigo-900 border-indigo-200",
    label: "Indigo",
    color: "bg-indigo-500",
    description: "Phases de développement",
  },
  {
    value: "bg-pink-100 text-pink-900 border-pink-200",
    label: "Rose",
    color: "bg-pink-500",
    description: "Événements créatifs",
  },
];

const GanttMarkerForm = ({
  projectId,
  marker,
  date,
  onSuccess,
  onCancel,
}: GanttMarkerFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setClose } = useModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: marker?.id || "",
      label: marker?.label || "",
      date: marker?.date
        ? new Date(marker.date).toISOString().split("T")[0]
        : date
        ? date.toISOString().split("T")[0]
        : "",
      className:
        marker?.className || "bg-blue-100 text-blue-900 border-blue-200",
    },
  });

  const selectedColorOption = classNameOptions.find(
    (option) => option.value === form.watch("className")
  );

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const markerData = {
        label: values.label,
        date: new Date(values.date),
        className:
          values.className || "bg-blue-100 text-blue-900 border-blue-200",
        projectId: projectId,
      };

      if (marker?.id) {
        await updateGanttMarker(marker.id, markerData);
      } else {
        await createGanttMarker(markerData);
      }

      toast.success(`Marqueur ${marker ? "modifié" : "ajouté"} avec succès`);
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {marker ? "Modifier le marqueur" : "Nouveau marqueur"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {marker
            ? "Modifiez les détails de votre marqueur"
            : "Créez un nouveau marqueur pour votre projet"}
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Libellé du marqueur
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Livraison finale, Réunion client..."
                      {...field}
                      className="transition-all duration-200 focus:ring-2"
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between text-xs">
                    <span>Donnez un nom descriptif à votre marqueur</span>
                    <span
                      className={`${
                        field.value?.length > 40
                          ? "text-orange-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {field.value?.length || 0}/50
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date du marqueur
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="transition-all duration-200 focus:ring-2"
                    />
                  </FormControl>
                  <FormDescription>
                    Sélectionnez la date à laquelle ce marqueur doit apparaître
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Couleur et style
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2">
                        <SelectValue placeholder="Sélectionner une couleur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-64">
                      {classNameOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="py-3"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div
                              className={`w-4 h-4 rounded-full ${option.color} shadow-sm`}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedColorOption && form.watch("label") && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Aperçu :
                      </p>
                      <Badge
                        className={`${selectedColorOption.value} shadow-sm border`}
                        variant="secondary"
                      >
                        {form.watch("label")}
                      </Badge>
                    </div>
                  )}

                  <FormDescription>
                    Choisissez une couleur qui correspond au type de marqueur
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 transition-all duration-200 bg-transparent"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {marker ? "Modification..." : "Création..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {marker ? "Modifier" : "Créer le marqueur"}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GanttMarkerForm;
