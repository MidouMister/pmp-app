"use client";

import { wilayas } from "@/lib/constants";
import { deleteCompany, initUser, upsertCompany } from "@/lib/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import FileUpload from "../global/file-upload";
import Loading from "../global/loading";
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
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  data?: Partial<Company> | null; // Typage flexible pour gérer undefined/null
  noCard?: boolean; // Option to not render the outer Card
};

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom de l'entreprise doit contenir au moins 2 caractères.",
  }),
  companyEmail: z
    .string()
    .email({ message: "Veuillez entrer un email valide." }),
  companyPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: "Veuillez entrer un numéro de téléphone valide.",
  }),
  companyAddress: z.string().min(1, { message: "L'adresse est requise." }),
  registre: z.string().min(1, { message: "Le numéro de registre est requis." }),
  nif: z.string().min(1, { message: "Le NIF est requis." }),
  secteur: z.string().min(1, { message: "Le secteur d'activité est requis." }),
  formJur: z.string().min(1, { message: "La forme juridique est requise." }),
  state: z.string().min(1, { message: "La wilaya est requise." }),
  logo: z.string().min(1, { message: "Un logo est requis." }),
});

const CompanyDetails = ({ data, noCard = false }: Props) => {
  const router = useRouter();
  const [deletingCompany, setDeletingCompany] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name ?? "",
      companyEmail: data?.companyEmail ?? "",
      companyPhone: data?.companyPhone ?? "",
      companyAddress: data?.companyAddress ?? "",
      formJur: data?.formJur ?? "",
      nif: data?.nif ?? "",
      registre: data?.registre ?? "",
      secteur: data?.secteur ?? "",
      state: data?.state ?? "",
      logo: data?.logo ?? "",
    },
  });

  // Restaurer le useEffect
  useEffect(() => {
    if (data) {
      const currentValues = form.getValues();
      if (JSON.stringify(currentValues) !== JSON.stringify(data)) {
        form.reset({
          name: data.name ?? "",
          companyEmail: data.companyEmail ?? "",
          companyPhone: data.companyPhone ?? "",
          companyAddress: data.companyAddress ?? "",
          formJur: data.formJur ?? "",
          nif: data.nif ?? "",
          registre: data.registre ?? "",
          secteur: data.secteur ?? "",
          state: data.state ?? "",
          logo: data.logo ?? "",
        });
      }
    }
  }, [data, form]);

  const isLoading = form.formState.isSubmitting;

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      let newUserData;
      if (!data?.id) {
        newUserData = await initUser();
      }
      await upsertCompany({
        id: data?.id ? data.id : uuidv4(),
        name: values.name,
        companyEmail: values.companyEmail,
        companyPhone: values.companyPhone,
        companyAddress: values.companyAddress,
        logo: values.logo,
        state: values.state,
        formJur: values.formJur,
        registre: values.registre || "",
        nif: values.nif || "",
        secteur: values.secteur,
        ownerId: newUserData?.id ?? data?.ownerId ?? "",
        createdAt: data?.createdAt ?? new Date(),
        updatedAt: new Date(),
      });

      toast.success(
        data?.id ? "Entreprise mise à jour" : "Entreprise créée avec succès"
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur", {
        description: "Impossible de créer votre entreprise",
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (!data?.id) return;
    setDeletingCompany(true);
    try {
      await deleteCompany(data.id);
      toast.success("Entreprise supprimée", {
        description:
          "Votre entreprise et toutes ses unités ont été supprimées.",
      });
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Erreur", {
        description: "Impossible de supprimer l'entreprise.",
      });
    } finally {
      setDeletingCompany(false);
    }
  };

  const formContent = (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            disabled={isLoading}
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo de l&apos;entreprise</FormLabel>
                <FormControl>
                  <FileUpload
                    apiEndpoint="companyLogo"
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;entreprise</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Exemple : Hydraulique SA"
                      {...field}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="companyEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de l&apos;entreprise</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="exemple@entreprise.com"
                      {...field}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="companyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse de l&apos;entreprise</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Rue de l'Industrie, Alger"
                      {...field}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="companyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone de l&apos;entreprise</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+213 123 456 789"
                      {...field}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wilaya</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Sélectionnez une wilaya" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wilayas.map((wilaya) => (
                        <SelectItem key={wilaya} value={wilaya}>
                          {wilaya}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="secteur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secteur d&apos;activité</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Exemple : Hydraulique"
                      {...field}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="formJur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forme juridique</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Sélectionnez une forme juridique" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SPA">SPA</SelectItem>
                      <SelectItem value="SARL">SARL</SelectItem>
                      <SelectItem value="EURL">EURL</SelectItem>
                      <SelectItem value="SNC">SNC</SelectItem>
                      <SelectItem value="SCS">SCS</SelectItem>
                      <SelectItem value="SCA">SCA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="registre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de registre (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="RC123456"
                      {...field}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="nif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIF (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="NIF123456"
                      {...field}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105 duration-200"
          >
            {isLoading ? <Loading /> : "Enregistrer les informations"}
          </Button>
        </form>
      </Form>

      {data?.id && (
        <div className="mt-8 rounded-lg border border-destructive p-6 bg-red-50 dark:bg-red-900/10">
          <div className="flex flex-col items-start gap-4">
            <div className="w-full">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Zone de danger
              </h3>
            </div>
            <div className="w-full text-sm text-gray-600 dark:text-gray-300">
              La suppression de votre entreprise est irréversible. Cela
              supprimera également toutes les unités et données associées.
            </div>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isLoading || deletingCompany}
                className="w-full bg-red-600 hover:bg-red-700 text-white transition-all hover:scale-105 duration-200"
              >
                {deletingCompany ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Suppression...
                  </span>
                ) : (
                  "Supprimer l'Entreprise"
                )}
              </Button>
            </AlertDialogTrigger>
          </div>
        </div>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Êtes-vous absolument sûr ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Cette action est irréversible. Elle supprimera définitivement
            l&apos;entreprise et toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center justify-end space-x-2">
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={deletingCompany}
            className="bg-destructive hover:bg-destructive"
            onClick={handleDeleteCompany}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </>
  );

  return (
    <div className="relative mt-4">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <Loading />
        </div>
      )}
      <AlertDialog>
        {noCard ? (
          formContent
        ) : (
          <Card className="w-full m-1 shadow-md">
            <CardHeader>
              <CardTitle>Informations de l&apos;entreprise</CardTitle>
              <CardDescription>
                Créons une entreprise pour votre activité. Vous pourrez modifier
                les paramètres de l&apos;entreprise ultérieurement dans
                l&apos;onglet des paramètres.
              </CardDescription>
            </CardHeader>
            <CardContent>{formContent}</CardContent>
          </Card>
        )}
      </AlertDialog>
    </div>
  );
};

export default CompanyDetails;
