"use client";
import React from "react";
import { z } from "zod";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import Loading from "../global/loading";
import {
  getCompanyUnits,
  saveActivityLogsNotification,
  sendInvitation,
} from "@/lib/queries";

import { useState, useEffect } from "react";
import { Unit } from "@prisma/client";
import { toast } from "sonner";

interface SendInvitationProps {
  companyId: string;
  unitId?: string;
}

const SendInvitation: React.FC<SendInvitationProps> = ({
  companyId,
  unitId,
}) => {
  const userDataSchema = z.object({
    email: z.string().email(),
    role: z.enum(["ADMIN", "USER"]),
    unitId: z.string(),
    jobeTitle: z.string().min(2),
  });

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: "USER",
      unitId: "",
      jobeTitle: "",
    },
  });
  const [companyUnits, setCompanyUnits] = useState<Unit[]>();

  useEffect(() => {
    const fetchCompanyUnits = async () => {
      if (companyId) {
        const units: Unit[] = await getCompanyUnits(companyId);
        setCompanyUnits(units);
        if (units.length > 0 && !unitId) {
          form.setValue("unitId", units[0].id);
        }
      }
    };
    fetchCompanyUnits();
  }, [companyId, form, unitId]);

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    try {
      const res = await sendInvitation(
        values.role,
        values.email,
        companyId,
        unitId || values.unitId,
        values.jobeTitle
      );
      await saveActivityLogsNotification({
        companyId: companyId,
        description: `Invited ${res.email}`,
        unitId: unitId || values.unitId,
      });
      toast.success("Invitation envoyée avec succès");
    } catch (error) {
      console.log(error);
      toast.error("Erreur lors de l'envoi de l'invitation");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation</CardTitle>
        <CardDescription>
          An invitation will be sent to the user. Users who already have an
          invitation sent out to their email, will not receive another
          invitation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="jobeTitle"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Jobe </FormLabel>
                  <FormControl>
                    <Input placeholder="Jobe Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User role</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">Unit Admin</SelectItem>
                      <SelectItem value="USER">Unit User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!unitId ? (
              <FormField
                disabled={form.formState.isSubmitting}
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Select Unit</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companyUnits?.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <input
                type="hidden"
                {...form.register("unitId")}
                value={unitId}
              />
            )}
            <Button disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? <Loading /> : "Send Invitation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SendInvitation;
