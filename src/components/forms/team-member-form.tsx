"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, TeamMember } from "@prisma/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addTeamMember,
  updateTeamMember,
  getUnitUsers,
  createTeamForProject,
} from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  userId: z.string().min(1, { message: "L'utilisateur est requis" }),
  role: z.string().min(1, { message: "Le rôle est requis" }),
});

type FormValues = z.infer<typeof formSchema>;

interface TeamMemberFormProps {
  projectId: string;
  teamId?: string;
  teamMember?: TeamMember & { user: User };
  onSuccess: () => void;
  onCancel: () => void;
  unitId: string;
}

const TeamMemberForm = ({
  projectId,
  teamId,
  teamMember,
  onSuccess,
  onCancel,
  unitId,
}: TeamMemberFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: teamMember?.userId || "",
      role: teamMember?.role || "",
    },
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const unitUsers = await getUnitUsers(unitId);
        setUsers(unitUsers);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
        toast.error("Impossible de charger les utilisateurs");
      }
    };

    loadUsers();
  }, [unitId]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      // Si c'est une modification d'un membre existant
      if (teamMember) {
        await updateTeamMember(teamMember.id, values.role);
        toast.success("Membre modifié avec succès");
      } else {
        // Si c'est un ajout d'un nouveau membre
        // Vérifier si l'équipe existe, sinon la créer
        let actualTeamId = teamId;
        if (!actualTeamId) {
          const team = await createTeamForProject(projectId);
          actualTeamId = team.id;
        }

        await addTeamMember(actualTeamId, values.userId, values.role);
        toast.success("Membre ajouté avec succès");
      }

      router.refresh();
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Utilisateur</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!teamMember} // Désactiver si c'est une modification
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.jobeTitle || "Sans titre"})
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rôle dans le projet</FormLabel>
              <FormControl>
                <Input placeholder="Rôle dans le projet" {...field} />
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
            {isLoading ? "Chargement..." : teamMember ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TeamMemberForm;

// Composant Input manquant dans les imports
import { Input } from "@/components/ui/input";
