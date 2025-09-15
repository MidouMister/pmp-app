"use client";

import type { Unit, Company } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash2,
  Grid,
  List,
  Plus,
  Phone,
  Mail,
  MapPin,
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useModal } from "@/providers/modal-provider";
import UnitDetails from "@/components/forms/unite-details";

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
} from "@/components/ui/alert-dialog";
import { deleteUnit } from "@/lib/queries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import CustomModal from "@/components/global/custom-model";

interface UnitsClientProps {
  units: Unit[];
  company: Company;
  user: {
    id: string;
    name: string;
  };
}

const UnitsClient = ({ units, company, user }: UnitsClientProps) => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Unit>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading] = useState(false);
  const itemsPerPage = 9;
  const router = useRouter();
  const { setOpen } = useModal();

  const filteredUnits = units
    .filter(
      (unit) =>
        unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.email &&
          unit.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (unit.address &&
          unit.address.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() || "";
      const bValue = b[sortField]?.toString().toLowerCase() || "";
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const paginatedUnits = filteredUnits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (unitId: string) => {
    try {
      setIsDeleting(true);
      await deleteUnit(unitId);
      toast.success("Unité supprimée avec succès");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression de l'unité");
    } finally {
      setIsDeleting(false);
    }
  };

  const openUnitModal = (unit?: Unit) => {
    setOpen(
      `unit${unit?.id}`,
      <CustomModal
        modalId={`unit${unit?.id}`}
        title={unit ? "Modifier l'unité" : "Nouvelle unité"}
        subheading={
          unit ? "Modifier les détails de l'unité" : "Créer une nouvelle unité"
        }
      >
        <div className="mt-4">
          <UnitDetails
            companyDetails={company}
            details={unit}
            userName={user.name}
          />
        </div>
      </CustomModal>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 ">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Unités
              </h1>
              <p className="text-muted-foreground text-lg">
                Gérez vos unités d&apos;affaires
              </p>
            </div>
            <Button
              onClick={() => openUnitModal()}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle Unité
            </Button>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou adresse..."
                  className="pl-10 h-11 bg-card border-border/50 focus:border-primary/50 transition-colors"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2.5 rounded-lg border border-border/50 bg-card text-foreground focus:border-primary/50 focus:outline-none transition-colors min-w-[120px]"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as keyof Unit)}
                >
                  <option value="name">Nom</option>
                  <option value="email">Email</option>
                  <option value="address">Adresse</option>
                </select>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                  className="px-4 border-border/50 hover:border-primary/50"
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>

            <Tabs
              value={view}
              onValueChange={(value) => setView(value as "grid" | "list")}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-2 sm:w-auto bg-muted/50">
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  <span className="hidden sm:inline">Cartes</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Tableau</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content Section */}
        {filteredUnits.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50 bg-card/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-6">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {searchQuery ? "Aucun résultat" : "Aucune unité"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchQuery
                  ? `Aucune unité ne correspond à "${searchQuery}". Essayez avec d'autres termes.`
                  : "Commencez par créer votre première unité d'affaires."}
              </p>
              {searchQuery ? (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="border-border/50 hover:border-primary/50"
                >
                  Effacer la recherche
                </Button>
              ) : (
                <Button
                  onClick={() => openUnitModal()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une unité
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {view === "grid" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {isLoading
                    ? Array.from({ length: itemsPerPage }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                          <CardHeader className="space-y-3 p-6">
                            <div className="h-6 bg-muted rounded-lg" />
                          </CardHeader>
                          <CardContent className="p-6 pt-0 space-y-4">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-1/2" />
                            <div className="h-4 bg-muted rounded w-2/3" />
                          </CardContent>
                        </Card>
                      ))
                    : paginatedUnits.map((unit) => (
                        <Card
                          key={unit.id}
                          className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 bg-card border-border/50"
                        >
                          <CardHeader className="p-6 pb-4">
                            <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              <Link
                                href={`/unite/${unit.id}`}
                                className="flex items-center gap-2 hover:underline decoration-primary/50 underline-offset-4"
                              >
                                <Building2 className="h-5 w-5 text-primary" />
                                {unit.name}
                              </Link>
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="p-6 pt-0 space-y-4">
                            {/* Email */}
                            <div className="flex items-center gap-3 group/item">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover/item:bg-primary/20 transition-colors">
                                <Mail className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Email
                                </p>
                                <p
                                  className="text-sm font-medium text-foreground truncate"
                                  title={unit.email || ""}
                                >
                                  {unit.email || "Non renseigné"}
                                </p>
                              </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-3 group/item">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover/item:bg-primary/20 transition-colors">
                                <Phone className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Téléphone
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                  {unit.phone || "Non renseigné"}
                                </p>
                              </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start gap-3 group/item">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover/item:bg-primary/20 transition-colors mt-0.5">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Adresse
                                </p>
                                <p className="text-sm font-medium text-foreground line-clamp-2">
                                  {unit.address || "Non renseignée"}
                                </p>
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="p-6 pt-4 flex justify-end gap-2 border-t border-border/50">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUnitModal(unit)}
                              className="border-border/50 hover:border-primary/50 hover:text-primary"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 bg-transparent"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Confirmer la suppression
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer
                                    l&apos;unité &quot;{unit.name}&quot; ? Cette
                                    action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={isDeleting}
                                    onClick={() => handleDelete(unit.id)}
                                    className={cn(
                                      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                                      isDeleting &&
                                        "opacity-50 cursor-not-allowed"
                                    )}
                                  >
                                    {isDeleting
                                      ? "Suppression..."
                                      : "Supprimer"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </CardFooter>
                        </Card>
                      ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="border-border/50 hover:border-primary/50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={cn(
                                "w-10 h-10",
                                currentPage === pageNum
                                  ? "bg-primary text-primary-foreground"
                                  : "border-border/50 hover:border-primary/50"
                              )}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="border-border/50 hover:border-primary/50"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Enhanced table view with better styling */
              <Card className="border-border/50 bg-card overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-muted/50">
                          <TableHead className="font-semibold text-foreground">
                            Nom
                          </TableHead>
                          <TableHead className="font-semibold text-foreground">
                            Email
                          </TableHead>
                          <TableHead className="font-semibold text-foreground">
                            Téléphone
                          </TableHead>
                          <TableHead className="hidden lg:table-cell font-semibold text-foreground">
                            Adresse
                          </TableHead>
                          <TableHead className="text-right font-semibold text-foreground">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedUnits.map((unit) => (
                          <TableRow
                            key={unit.id}
                            className="border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="font-medium text-foreground">
                              <Link
                                href={`/unite/${unit.id}`}
                                className="flex items-center gap-2 hover:text-primary transition-colors text-xl"
                              >
                                <Building2 className="h-4 w-4 text-primary" />
                                {unit.name}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {unit.email || "Non renseigné"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {unit.phone || "Non renseigné"}
                            </TableCell>
                            <TableCell
                              className="hidden lg:table-cell max-w-xs truncate text-muted-foreground"
                              title={unit.address || ""}
                            >
                              {unit.address || "Non renseignée"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openUnitModal(unit)}
                                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Modifier</span>
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Supprimer</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Confirmer la suppression
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer
                                        l&apos;unité &quot;{unit.name}&quot; ?
                                        Cette action est irréversible.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Annuler
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        disabled={isDeleting}
                                        onClick={() => handleDelete(unit.id)}
                                        className={cn(
                                          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                                          isDeleting &&
                                            "opacity-50 cursor-not-allowed"
                                        )}
                                      >
                                        {isDeleting
                                          ? "Suppression..."
                                          : "Supprimer"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UnitsClient;
