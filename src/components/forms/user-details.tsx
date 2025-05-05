"use client";

import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { initUser } from "@/lib/queries";
import Loading from "../global/loading";
import FileUpload from "../global/file-upload";

type Props = {
  data?: Partial<User> | null;
};

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  jobeTitle: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const UserDetails = ({ data }: Props) => {
  const router = useRouter();
  const [isFormReady, setIsFormReady] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name ?? "",
      jobeTitle: data?.jobeTitle ?? "",
      avatarUrl: data?.avatarUrl ?? "",
    },
  });

  // Initialize form once on mount
  useEffect(() => {
    if (data && !isFormReady) {
      form.reset({
        name: data.name ?? "",
        jobeTitle: data.jobeTitle ?? "",
        avatarUrl: data.avatarUrl ?? "",
      });
      setIsFormReady(true);
    }
  }, [data, form, isFormReady]);

  const isLoading = form.formState.isSubmitting;

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      await initUser({
        name: values.name,
        jobeTitle: values.jobeTitle || "",
        avatarUrl: values.avatarUrl || "",
      });

      toast.success("Profil mis à jour avec succès");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur", {
        description: "Impossible de mettre à jour votre profil",
      });
    }
  };

  // Don't render the form until the default values are set
  if (!isFormReady && data) {
    return <Loading />;
  }

  return (
    <div className="relative mt-4">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50">
          <Loading />
        </div>
      )}
      <Card className="w-full m-1 shadow-md">
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo de profil</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="userAvatar"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Entrez votre nom complet"
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
                name="jobeTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du poste</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Directeur Général, Développeur..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105 duration-200"
              >
                Enregistrer les modifications
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
