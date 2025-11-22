"use client";

import { updateUser } from "@/lib/queries";
import { useModal } from "@/providers/modal-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FileUpload from "../global/file-upload";
import Loading from "../global/loading";
import { Button } from "../ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  data?: Partial<User> | null;
};

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  jobeTitle: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: z.nativeEnum(Role),
});

const UserDetails = ({ data }: Props) => {
  const router = useRouter();
  const { setClose } = useModal();

  const [isFormReady, setIsFormReady] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<Role | null>(
    data?.role || null
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name ?? "",
      jobeTitle: data?.jobeTitle ?? "",
      avatarUrl: data?.avatarUrl ?? "",
      role: data?.role ?? Role.USER,
    },
  });

  // Initialize form once on mount
  useEffect(() => {
    if (data && !isFormReady) {
      form.reset({
        name: data.name ?? "",
        jobeTitle: data.jobeTitle ?? "",
        avatarUrl: data.avatarUrl ?? "",
        role: data.role ?? Role.USER,
      });
      setIsFormReady(true);
    }
  }, [data, form, isFormReady]);

  const isLoading = form.formState.isSubmitting;
  const canEditRole = currentUserRole === data?.role;

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      await updateUser(data?.id || "", {
        name: values.name,
        jobeTitle: values.jobeTitle || "",
        avatarUrl: values.avatarUrl || "",
        role: values.role,
      });

      toast.success("Profil mis à jour avec succès");
      router.refresh();
      setClose();
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50 rounded-lg">
          <Loading />
        </div>
      )}
      <Card className="w-full m-1 shadow-md">
        <CardContent className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
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

              <FormField
                disabled={isLoading || !canEditRole}
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select
                      disabled={isLoading || !canEditRole}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Role.OWNER}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            Owner (Propriétaire)
                          </div>
                        </SelectItem>
                        <SelectItem value={Role.ADMIN}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-400" />
                            Admin (Administrateur)
                          </div>
                        </SelectItem>
                        <SelectItem value={Role.USER}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            User (Utilisateur)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {!canEditRole && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Seul le propriétaire peut modifier les rôles
                      </p>
                    )}
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
