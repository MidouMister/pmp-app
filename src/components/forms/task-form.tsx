/* eslint-disable react/no-unescaped-entities */
"use client";
import {
  getUnitUsers,
  saveActivityLogsNotification,
  upsertTask,
} from "@/lib/queries";
import type { TaskWithTags } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Tag, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  User2,
  CalendarIcon,
  Save,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Loading from "../global/loading";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import TagCreator from "../global/tag-creator";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";

type Props = {
  laneId: string;
  unitId: string;
  getNewTask?: (task: TaskWithTags[0]) => void;
  defaultData?: TaskWithTags[0];
};

const TaskForm = ({ getNewTask, laneId, unitId, defaultData }: Props) => {
  const { data: modalData, setClose } = useModal();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<User[]>([]);
  const [assignedTo, setAssignedTo] = useState(
    defaultData?.assignedUserId ||
      modalData?.task?.assignedUserId ||
      "unassigned"
  );

  const TaskFormSchema = z
    .object({
      title: z.string().min(1, "titre est requis").max(100, "titre trop long"),
      description: z.string().optional(),
      startDate: z.date().nullable().optional(),
      dueDate: z.date().nullable().optional(),
      endDate: z.date().nullable().optional(),
      complete: z.boolean().default(false),
    })
    .refine(
      (data) => {
        if (data.startDate && data.dueDate) {
          return data.startDate <= data.dueDate;
        }
        return true;
      },
      {
        message: "La date de début doit être antérieure à la date d'échéance",
        path: ["dueDate"],
      }
    )
    .refine(
      (data) => {
        if (data.dueDate && data.endDate) {
          return data.dueDate <= data.endDate;
        }
        return true;
      },
      {
        message: "La date d'échéance doit être antérieure à la date de fin",
        path: ["endDate"],
      }
    );

  const taskData = defaultData || modalData?.task;

  const form = useForm<z.infer<typeof TaskFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      title: taskData?.title || "",
      description: taskData?.description || "",
      startDate: taskData?.startDate ? new Date(taskData.startDate) : null,
      dueDate: taskData?.dueDate ? new Date(taskData.dueDate) : null,
      endDate: taskData?.endDate ? new Date(taskData.endDate) : null,
      complete: taskData?.complete || false,
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (unitId) {
      const fetchData = async () => {
        try {
          const response = await getUnitUsers(unitId);
          if (response) setAllTeamMembers(response);
        } catch (error) {
          console.error("Error fetching team members:", error);
          toast.error("Failed to load team members");
        }
      };
      fetchData();
    }
  }, [unitId]);

  useEffect(() => {
    if (taskData) {
      form.reset({
        title: taskData.title || "",
        description: taskData.description || "",
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        endDate: taskData.endDate ? new Date(taskData.endDate) : null,
        complete: taskData.complete || false,
      });

      if (taskData.Tags) {
        setTags(taskData.Tags);
      }
    }
  }, [taskData, form]);

  const onSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    if (!laneId) {
      toast.error("Lane ID is required");
      return;
    }

    try {
      const response = await upsertTask(
        {
          ...values,
          laneId,
          id: taskData?.id,
          assignedUserId: assignedTo || null,
          unitId,
        },
        tags
      );

      await saveActivityLogsNotification({
        companyId: undefined,
        description: `${
          taskData?.id ? "Mise à jour" : "Création"
        } de la tâche: ${response?.title}`,
        unitId,
      });

      toast.success(
        `Tâche ${taskData?.id ? "mise à jour" : "créée"} avec succès`
      );

      if (response && getNewTask) {
        getNewTask(response);
      }

      router.refresh();
      setClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la tâche:", error);
      toast.error("Échec de l'enregistrement de la tâche");
    }
  };

  const getAssignedMember = () => {
    return allTeamMembers.find((member) => member.id === assignedTo);
  };

  const assignedMember = getAssignedMember();

  return (
    <div className="max-w-2xl mx-auto p-6 border border-accent rounded-lg shadow-sm bg-primary/5 hover:shadow-xl transition-all duration-200">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {taskData?.id ? "Modifier la tâche" : "Nouvelle tâche"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Créez ou modifiez les détails de votre tâche
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Title Field */}
          <FormField
            disabled={isLoading}
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  Titre de la tâche
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Saisissez le titre de votre tâche..."
                    className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            disabled={isLoading}
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-medium text-foreground">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez votre tâche en détail..."
                    className="min-h-[120px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Fields */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground">Planning</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Date de début
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 justify-start text-left font-normal bg-card border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd MMM yyyy")
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-destructive" />
                      Date d'échéance
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 justify-start text-left font-normal bg-card border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd MMM yyyy")
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Date de fin
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 justify-start text-left font-normal bg-card border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-3 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd MMM yyyy")
                            ) : (
                              <span>Choisir une date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Completion Status */}
          <FormField
            control={form.control}
            name="complete"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="space-y-1">
                  <FormLabel className="text-base font-medium text-foreground">
                    Statut d'achèvement
                  </FormLabel>
                  <FormDescription className="text-sm text-muted-foreground">
                    Marquer cette tâche comme terminée
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-primary"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Tags Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Étiquettes</h3>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <TagCreator
                unitId={unitId}
                getSelectedTags={setTags}
                defaultTags={taskData ? taskData.Tags : []}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assignment Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Attribution</h3>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
              <Select onValueChange={setAssignedTo} defaultValue={assignedTo}>
                <SelectTrigger className="h-12 bg-background border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                  <SelectValue
                    placeholder={
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            <User2 size={16} />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">
                          Sélectionner un membre
                        </span>
                      </div>
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <User2 size={16} />
                        </AvatarFallback>
                      </Avatar>
                      <span>Non assignée</span>
                    </div>
                  </SelectItem>
                  {allTeamMembers.map((teamMember) => (
                    <SelectItem key={teamMember.id} value={teamMember.id}>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            alt={teamMember.name || "Team member"}
                            src={teamMember.avatarUrl || ""}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {teamMember.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{teamMember.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {assignedMember && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      alt={assignedMember.name || "Assigned user"}
                      src={assignedMember.avatarUrl || ""}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {assignedMember.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Assignée à {assignedMember.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Membre de l&apos;équipe
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-8 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={setClose}
              disabled={isLoading}
              className="h-12 px-6 border-border hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <Loading />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {taskData?.id ? "Mettre à jour" : "Créer la tâche"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TaskForm;
