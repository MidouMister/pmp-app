"use client";
import { Tag } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

import { PlusCircleIcon, TrashIcon, X, Tag as TagIcon } from "lucide-react";
import { v4 } from "uuid";
import {
  deleteTag,
  getTagsForUnit,
  saveActivityLogsNotification,
  upsertTag,
} from "@/lib/queries";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import TagComponent from "./tag";
import { toast } from "sonner";

type Props = {
  unitId: string;
  getSelectedTags: (tags: Tag[]) => void;
  defaultTags?: Tag[];
};

const TagColors = ["BLUE", "ORANGE", "ROSE", "PURPLE", "GREEN"] as const;
export type TagColor = (typeof TagColors)[number];

const TagCreator = ({ getSelectedTags, unitId, defaultTags }: Props) => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(defaultTags || []);
  const [tags, setTags] = useState<Tag[]>([]);
  const router = useRouter();
  const [value, setValue] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    getSelectedTags(selectedTags);
  }, [selectedTags, getSelectedTags]);

  useEffect(() => {
    if (unitId) {
      const fetchData = async () => {
        const response = await getTagsForUnit(unitId);
        if (response) setTags(response.Tag);
      };
      fetchData();
    }
  }, [unitId]);

  const handleDeleteSelection = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleAddTag = async () => {
    if (!value) {
      toast.error("Les tags doivent avoir un nom");
      return;
    }
    if (!selectedColor) {
      toast.info("Veuillez sélectionner une couleur");
      return;
    }
    const tagData: Tag = {
      color: selectedColor,
      createdAt: new Date(),
      id: v4(),
      name: value,
      unitId,
      updatedAt: new Date(),
    };

    setTags([...tags, tagData]);
    setValue("");
    setSelectedColor("");
    try {
      const response = await upsertTag(unitId, tagData);
      toast.success("Tag créé avec succès");

      await saveActivityLogsNotification({
        companyId: undefined,
        description: `Tag mis à jour | ${response?.name}`,
        unitId: unitId,
        type: "TAG",
      });
    } catch (error) {
      toast.error(error + "Impossible de créer le tag");
    }
  };

  const handleAddSelections = (tag: Tag) => {
    if (selectedTags.every((t) => t.id !== tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
    try {
      const response = await deleteTag(tagId);
      toast.success("Tag supprimé de votre unité");

      await saveActivityLogsNotification({
        companyId: undefined,
        description: `Tag supprimé | ${response?.name}`,
        unitId: unitId,
        type: "TAG",
      });

      router.refresh();
    } catch (error) {
      toast.error(error + "Impossible de supprimer le tag");
    }
  };

  return (
    <div className="space-y-6">
      <AlertDialog>
        <Command className="bg-transparent border-0 shadow-none">
          {/* Section des tags sélectionnés */}
          {!!selectedTags.length && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TagIcon size={16} />
                <span>Tags sélectionnés</span>
              </div>
              <div className="flex flex-wrap gap-2 p-4 bg-muted/30 border border-border/50 rounded-xl backdrop-blur-sm">
                {selectedTags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-1.5 group">
                    <TagComponent title={tag.name} colorName={tag.color} />
                    <button
                      onClick={() => handleDeleteSelection(tag.id)}
                      className="flex items-center justify-center w-5 h-5 rounded-full bg-muted-foreground/10 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section de création de nouveaux tags */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <PlusCircleIcon size={16} />
              <span>Créer un nouveau tag</span>
            </div>

            {/* Sélecteur de couleurs */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-medium">
                Choisir une couleur
              </span>
              <div className="flex items-center gap-3 p-3 bg-card/50 border border-border/50 rounded-lg">
                {TagColors.map((colorName) => (
                  <div
                    key={colorName}
                    className={`transition-all duration-200 ${
                      selectedColor === colorName
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                        : ""
                    }`}
                  >
                    <TagComponent
                      selectedColor={setSelectedColor}
                      title=""
                      colorName={colorName}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Input et bouton d'ajout */}
            <div className="relative">
              <CommandInput
                placeholder="Nom du tag..."
                value={value}
                onValueChange={setValue}
                className="pr-12 h-7 bg-card/50 border-border/50 rounded-lg text-sm placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
              />
              <button
                onClick={handleAddTag}
                disabled={!value || !selectedColor}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/10"
              >
                <PlusCircleIcon size={16} />
              </button>
            </div>
          </div>

          {/* Liste des tags existants */}
          <CommandList className="mt-6">
            <CommandSeparator className="bg-border/50" />
            <CommandGroup
              heading="Tags disponibles"
              className="text-muted-foreground font-medium"
            >
              <div className="space-y-1">
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-all duration-200 group border border-transparent hover:border-border/50"
                  >
                    <div
                      onClick={() => handleAddSelections(tag)}
                      className="flex-1"
                    >
                      <TagComponent title={tag.name} colorName={tag.color} />
                    </div>

                    <AlertDialogTrigger asChild>
                      <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <TrashIcon size={14} />
                      </button>
                    </AlertDialogTrigger>
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>

            {tags.length === 0 && (
              <CommandEmpty className="py-8 text-center text-muted-foreground">
                <div className="space-y-2">
                  <TagIcon size={32} className="mx-auto opacity-50" />
                  <p className="text-sm">Aucun tag trouvé</p>
                  <p className="text-xs">Créez votre premier tag ci-dessus</p>
                </div>
              </CommandEmpty>
            )}
          </CommandList>
        </Command>

        {/* Dialog de confirmation de suppression */}
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-left text-lg font-semibold">
              Supprimer ce tag ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-muted-foreground">
              Cette action est irréversible. Le tag sera définitivement supprimé
              de votre unité et retiré de nos serveurs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 sm:gap-2">
            <AlertDialogCancel className="flex-1">Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                const tagToDelete = tags.find(
                  (tag) =>
                    document
                      .querySelector("[data-tag-id]")
                      ?.getAttribute("data-tag-id") === tag.id
                );
                if (tagToDelete) {
                  handleDeleteTag(tagToDelete.id);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TagCreator;
