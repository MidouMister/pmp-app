"use client";
import React, { useEffect } from "react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";

import { Input } from "../ui/input";

import { Button } from "../ui/button";
import Loading from "../global/loading";

import { saveActivityLogsNotification, upsertLane } from "@/lib/queries";

import { useModal } from "@/providers/modal-provider";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lane } from "@prisma/client";
import { toast } from "sonner";

interface CreateLaneFormProps {
  defaultData?: Lane;
  unitId: string;
}

const LaneForm: React.FC<CreateLaneFormProps> = ({ defaultData, unitId }) => {
  const { setClose } = useModal();
  const router = useRouter();
  const LaneFormSchema = z.object({
    name: z.string().min(1),
  });
  const form = useForm<z.infer<typeof LaneFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(LaneFormSchema),
    defaultValues: {
      name: defaultData?.name || "",
    },
  });

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || "",
      });
    }
  }, [defaultData, form]);

  const isLoading = form.formState.isLoading;

  const onSubmit = async (values: z.infer<typeof LaneFormSchema>) => {
    if (!unitId) return;
    try {
      const response = await upsertLane({
        ...values,
        id: defaultData?.id,
        unitId: unitId,
        order: defaultData?.order,
      });

      await saveActivityLogsNotification({
        companyId: undefined,
        description: `Colonne mise à jour | ${response?.name}`,
        unitId: unitId,
      });

      toast.success("Détails de la colonne enregistrés");
      router.refresh();
    } catch (error) {
      toast.error(
        error + " Impossible d'enregistrer les détails de la colonne"
      );
    }
    setClose();
  };
  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Détails de la Colonne</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la Colonne</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de la colonne" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-20 mt-4" disabled={isLoading} type="submit">
              {form.formState.isSubmitting ? <Loading /> : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LaneForm;
