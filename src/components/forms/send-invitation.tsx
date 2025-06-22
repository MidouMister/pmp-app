"use client";
import type React from "react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/global/loading";
import {
  getCompanyUnits,
  saveActivityLogsNotification,
  sendInvitation,
} from "@/lib/queries";

import { useState, useEffect } from "react";
import type { Unit } from "@prisma/client";
import { toast } from "sonner";
import {
  Mail,
  User,
  Briefcase,
  Building2,
  Send,
  Shield,
  UserCheck,
} from "lucide-react";

interface SendInvitationProps {
  companyId: string;
  unitId?: string;
}

const SendInvitation: React.FC<SendInvitationProps> = ({
  companyId,
  unitId,
}) => {
  const userDataSchema = z.object({
    email: z.string().email("Veuillez saisir une adresse email valide"),
    role: z.enum(["ADMIN", "USER"]),
    unitId: z.string().min(1, "Veuillez sélectionner une unité"),
    jobTitle: z
      .string()
      .min(2, "Le titre du poste doit contenir au moins 2 caractères"),
  });

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: "USER",
      unitId: unitId || "",
      jobTitle: "",
    },
  });

  const [companyUnits, setCompanyUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCompanyUnits = async () => {
      if (companyId) {
        try {
          const units: Unit[] = await getCompanyUnits(companyId);
          setCompanyUnits(units);
          if (units.length > 0 && !unitId) {
            form.setValue("unitId", units[0].id);
          }
        } catch (error) {
          console.error("Failed to fetch company units:", error);
          toast.error("Échec du chargement des unités de l'entreprise");
        }
      }
    };
    fetchCompanyUnits();
  }, [companyId, form, unitId]);

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    setIsLoading(true);
    try {
      const res = await sendInvitation(
        values.role,
        values.email,
        companyId,
        unitId || values.unitId,
        values.jobTitle
      );
      await saveActivityLogsNotification({
        companyId: companyId,
        description: `Invited ${res.email}`,
        unitId: unitId || values.unitId,
      });
      toast.success("Invitation envoyée avec succès !");
      form.reset();
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast.error("Échec de l'envoi de l'invitation. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    return role === "ADMIN" ? (
      <Shield className="h-4 w-4" />
    ) : (
      <UserCheck className="h-4 w-4" />
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === "ADMIN" ? "default" : "secondary";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-lg border bg-card">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Envoyer une Invitation
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Inviter un nouveau membre à rejoindre votre organisation
              </CardDescription>
            </div>
          </div>
          <Separator />
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium text-foreground">
                  Comment ça fonctionne
                </p>
                <p className="text-muted-foreground mt-1">
                  Un email d&apos;invitation sera envoyé à l&apos;utilisateur.
                  S&apos;il a déjà une invitation en attente, aucun doublon ne
                  sera envoyé.
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email and Job Title Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Mail className="h-4 w-4" />
                        Adresse Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="utilisateur@entreprise.com"
                          className="h-11"
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
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Briefcase className="h-4 w-4" />
                        Titre du Poste
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ex. Ingénieur Logiciel"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Role and Unit Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <User className="h-4 w-4" />
                        Rôle Utilisateur
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Sélectionner le rôle utilisateur..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              {getRoleIcon("ADMIN")}
                              <span>Administrateur d&apos;Unité</span>
                              <Badge
                                variant={getRoleBadgeVariant("ADMIN")}
                                className="ml-auto"
                              >
                                Admin
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="USER">
                            <div className="flex items-center gap-2">
                              {getRoleIcon("USER")}
                              <span>Utilisateur d&apos;Unité</span>
                              <Badge
                                variant={getRoleBadgeVariant("USER")}
                                className="ml-auto"
                              >
                                Utilisateur
                              </Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!unitId && (
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="unitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Building2 className="h-4 w-4" />
                          Sélectionner l&apos;Unité
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Choisir une unité..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companyUnits?.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  {unit.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {unitId && (
                <input
                  type="hidden"
                  {...form.register("unitId")}
                  value={unitId}
                />
              )}

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => form.reset()}
                  disabled={isLoading}
                >
                  Réinitialiser
                </Button>
                <Button
                  disabled={isLoading || !form.formState.isValid}
                  type="submit"
                  className="flex-1 h-11 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loading />
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>Envoyer l&apos;Invitation</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SendInvitation;
