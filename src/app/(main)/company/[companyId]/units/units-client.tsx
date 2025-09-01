"use client";

import { Unit, Company } from "@prisma/client";
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
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Unités
        </h1>
        <Button onClick={() => openUnitModal()} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouvelle Unité</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      {/* Search, Sort and View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une unité..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="px-3 py-2 rounded-md border bg-background"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as keyof Unit)}
          >
            <option value="name">Nom</option>
            <option value="email">Email</option>
            <option value="address">Adresse</option>
          </select>
          <Button
            variant="outline"
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </Button>
        </div>
        <Tabs
          value={view}
          onValueChange={(value) => setView(value as "grid" | "list")}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="grid" className="flex-1 sm:flex-none">
              <Grid className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Cartes</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex-1 sm:flex-none">
              <List className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tableau</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Section */}
      {filteredUnits.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3 sm:mb-4">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Aucune unité trouvée</h3>
            <p className="text-muted-foreground mb-4 max-w-md text-sm sm:text-base">
              {searchQuery
                ? `Aucune unité ne correspond à votre recherche "${searchQuery}".`
                : "Vous n'avez pas encore créé d'unités."}
            </p>
            {searchQuery ? (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                size="sm"
              >
                Effacer la recherche
              </Button>
            ) : (
              <Button onClick={() => openUnitModal()} size="sm">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {isLoading
                  ? Array.from({ length: itemsPerPage }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardHeader className="space-y-0 p-3 sm:p-4 border-b">
                          <div className="h-6 bg-muted rounded" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </CardContent>
                      </Card>
                    ))
                  : paginatedUnits.map((unit) => (
                      <Card
                        key={unit.id}
                        className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-primary/10 hover:border-primary/30"
                      >
                        <CardHeader className="space-y-0 p-3 sm:p-4 border-b">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg sm:text-xl font-bold truncate">
                              <Link
                                className="relative inline-block transition-colors hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
                                href={`/unite/${unit.id}`}
                              >
                                {unit.name}
                              </Link>
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                          {/* Email */}
                          <div className="flex items-center gap-2 sm:gap-3 group">
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary">
                              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Email
                              </p>
                              <p
                                className="text-sm sm:font-medium truncate"
                                title={unit.email || ""}
                              >
                                {unit.email || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center gap-2 sm:gap-3 group">
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary">
                              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Téléphone
                              </p>
                              <p className="text-sm sm:font-medium">
                                {unit.phone || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex items-start gap-2 sm:gap-3 group">
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary mt-0.5">
                              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Adresse
                              </p>
                              <p className="text-sm sm:font-medium">
                                {unit.address || "N/A"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 sm:p-4 pt-0 flex justify-end gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUnitModal(unit)}
                            className="text-xs sm:text-sm"
                          >
                            <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                            Modifier
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs sm:text-sm text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                              >
                                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmer la suppression
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette unité
                                  ? Cette action est irréversible.
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
                                  {isDeleting ? "Suppression..." : "Supprimer"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </CardFooter>
                      </Card>
                    ))}
              </div>
              {/* Pagination Controls */}
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 py-2 border rounded-md">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Adresse
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-medium">
                            {unit.name}
                          </TableCell>
                          <TableCell>{unit.email || "N/A"}</TableCell>
                          <TableCell>{unit.phone || "N/A"}</TableCell>
                          <TableCell
                            className="hidden md:table-cell max-w-xs truncate"
                            title={unit.address || ""}
                          >
                            {unit.address || "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openUnitModal(unit)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                                      Êtes-vous sûr de vouloir supprimer cette
                                      unité ? Cette action est irréversible.
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
  );
};

export default UnitsClient;
