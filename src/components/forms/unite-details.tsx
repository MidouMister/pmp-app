"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { v4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { saveActivityLogsNotification, upsertUnit } from "@/lib/queries";
import { useEffect } from "react";
import Loading from "../global/loading";
import { useModal } from "@/providers/modal-provider";
import { Company, Unit } from "@prisma/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Le nom de l&apos;unité est requis"),
  address: z.string().min(1, "L&apos;adresse est requise"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  email: z
    .string()
    .email("Veuillez entrer un email valide")
    .min(1, "L&apos;email est requis"),
});

interface UnitDetailsProps {
  //To add the sub account to the agency
  companyDetails: Company;
  details?: Partial<Unit>;

  userName: string;
}

const UnitDetails: React.FC<UnitDetailsProps> = ({
  details,
  companyDetails,
  userName,
}) => {
  const { setClose } = useModal();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: details?.name ?? "",
      address: details?.address ?? "",
      phone: details?.phone ?? "",
      email: details?.email ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await upsertUnit({
        id: details?.id ? details.id : v4(),
        name: values.name,
        address: values.address,
        createdAt: details?.createdAt || new Date(),
        updatedAt: new Date(),
        phone: values.phone,
        email: values.email,
        companyId: companyDetails.id,
        adminId: null,
      });
      if (!response) throw new Error("No response from server");
      await saveActivityLogsNotification({
        companyId: companyDetails.id,
        description: `${userName} | a Moddifier l'unité | ${response.name}`,
        unitId: response.id,
        type: "GENERAL",
      });

      toast.success("Unité enregistrée avec succès");
      setClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Impossible d&apos;enregistrer l&apos;unité");
    }
  }

  // Optimized useEffect to prevent state updates during render phase
  useEffect(() => {
    // Only reset form when details change and contain data
    if (details && Object.keys(details).length > 0) {
      // Create form values with proper null checks
      const formValues = {
        name: details.name ?? "",
        address: details.address ?? "",
        phone: details.phone ?? "",
        email: details.email ?? "",
      };

      // Use setTimeout to ensure this happens after render is complete
      // This prevents the "Cannot update a component while rendering a different component" error
      const timeoutId = setTimeout(() => {
        form.reset(formValues, {
          keepDefaultValues: true,
        });
      }, 0);

      // Cleanup function to prevent memory leaks
      return () => clearTimeout(timeoutId);
    }
  }, [details, form]); // Removed form from dependency array to prevent unnecessary re-renders

  const isLoading = form.formState.isSubmitting;
  //CHALLENGE Create this form.
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informations de l&apos;Unité</CardTitle>
        <CardDescription>
          Veuillez entrer les détails de l&apos;unité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Nom de l&apos;unité
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 bg-background transition-colors focus-visible:ring-2"
                          placeholder="Ex: Unité de production"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 bg-background transition-colors focus-visible:ring-2"
                          placeholder="Ex: unite@entreprise.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Téléphone
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 bg-background transition-colors focus-visible:ring-2"
                          placeholder="Ex: +213 XX XX XX XX XX"
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Adresse
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 bg-background transition-colors focus-visible:ring-2"
                          placeholder="Ex: 123 Rue Example, Ville"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "h-11 px-8 font-medium transition-all",
                  isLoading ? "opacity-50" : "hover:opacity-90"
                )}
              >
                {isLoading ? <Loading /> : details ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UnitDetails;
