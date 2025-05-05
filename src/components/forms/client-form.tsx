"use client";

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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Client } from "@prisma/client";
import { upsertClient } from "@/lib/queries";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  wilaya: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email({ message: "Email invalide" })
    .optional()
    .or(z.literal("")),
});

interface ClientFormProps {
  unitId: string;
  client?: Client;
  onSuccess?: (clientData: Client) => void;
}

export default function ClientForm({
  unitId,
  client,
  onSuccess,
}: ClientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || "",
      wilaya: client?.wilaya || "",
      phone: client?.phone || "",
      email: client?.email || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const clientData: Client = {
        id: client?.id || uuidv4(),
        name: values.name,
        wilaya: values.wilaya || null,
        phone: values.phone || null,
        email: values.email || null,
        unitId: unitId,
      };

      await upsertClient(clientData);
      toast.success(
        client ? "Client modifié avec succès" : "Client ajouté avec succès"
      );

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(clientData);
      } else {
        router.refresh();
      }
    } catch (erreur) {
      toast.error("Une erreur est survenue" + erreur);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom*</FormLabel>
              <FormControl>
                <Input placeholder="Nom du client" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wilaya"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wilaya</FormLabel>
              <FormControl>
                <Input placeholder="Wilaya" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input placeholder="Téléphone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : client ? "Modifier" : "Ajouter"}
        </Button>
      </form>
    </Form>
  );
}
