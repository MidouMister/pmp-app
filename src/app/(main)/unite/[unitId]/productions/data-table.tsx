"use client";

import type React from "react";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useModal } from "@/providers/modal-provider";
import {
  Search,
  Plus,
  Filter,
  X,
  Calendar,
  Building,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/global/custom-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductionWithDetails } from "@/lib/types";
import type { Project, Phase } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  projects: (Project & { phases: Phase[] })[];
  modalChildren?: React.ReactNode;
}

export function DataTable<TData extends ProductionWithDetails, TValue>({
  columns,
  data,
  projects,
  modalChildren,
}: DataTableProps<TData, TValue>) {
  const { setOpen } = useModal();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");

  // Filtrer les phases en fonction du projet sélectionné
  const availablePhases = useMemo(() => {
    return selectedProject
      ? projects.find((p) => p.id === selectedProject)?.phases || []
      : [];
  }, [selectedProject, projects]);

  // Filtrer les données en fonction des filtres sélectionnés
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Filtre par plage de dates
    if (dateFrom || dateTo) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        let isValid = true;

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          isValid = isValid && itemDate >= fromDate;
        }

        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          isValid = isValid && itemDate <= toDate;
        }

        return isValid;
      });
    }

    if (selectedProject) {
      filtered = filtered.filter(
        (item) => item.Product.Phase.Project.id === selectedProject
      );
    }

    if (selectedPhase) {
      filtered = filtered.filter(
        (item) => item.Product.Phase.id === selectedPhase
      );
    }

    if (globalFilter) {
      const searchTerm = globalFilter.toLowerCase();
      filtered = filtered.filter((item) => {
        const searchableFields = [
          item.Product.Phase.name,
          item.Product.Phase.code,
          item.Product.Phase.Project.code,
          item.Product.Phase.Project.name,
          item.taux.toString(),
          item.mntProd.toString(),
        ];

        return searchableFields.some((field) =>
          field?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return filtered;
  }, [data, dateFrom, dateTo, selectedProject, selectedPhase, globalFilter]);

  const table = useReactTable({
    data: filteredData as TData[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedProject("");
    setSelectedPhase("");
    setGlobalFilter("");
  };

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    setSelectedPhase("");
  };

  const activeFiltersCount = [
    dateFrom,
    dateTo,
    selectedProject,
    selectedPhase,
    globalFilter,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Productions</h2>
          <p className="text-muted-foreground">
            Gérez et suivez vos productions par projet et phase
          </p>
        </div>

        <Button
          size="lg"
          className="flex gap-2 shadow-sm" // Modernized: Use default variant, add subtle shadow
          // variant="default" // Default variant is applied automatically
          onClick={() => {
            if (modalChildren) {
              setOpen(
                <CustomModal
                  title="Ajouter une production"
                  subheading="Ajouter une nouvelle production à l'unité"
                >
                  {modalChildren}
                </CustomModal>
              );
            }
          }}
        >
          <Plus className="h-4 w-4" />
          Nouvelle production
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 border-0 shadow-sm hover:shadow transition-all duration-200">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par projet, phase, code..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 h-10 bg-background border-0 ring-1 ring-border focus-visible:ring-2 focus-visible:ring-ring"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setGlobalFilter("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow transition-all duration-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted/60">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total
              </p>
              <p className="text-lg font-medium">{filteredData.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow transition-all duration-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted/60">
              <Building className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Projets
              </p>
              <p className="text-lg font-medium">{projects.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card className="border-0 shadow-sm hover:shadow transition-all duration-200">
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Filtres avancés
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="date-from"
                className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground"
              >
                <Calendar className="h-3.5 w-3.5" />
                Date de début
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="date-to"
                className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground"
              >
                <Calendar className="h-3.5 w-3.5" />
                Date de fin
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="project-filter"
                className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground"
              >
                <Building className="h-3.5 w-3.5" />
                Projet
              </Label>
              <Select
                value={selectedProject || "all"}
                onValueChange={(value) =>
                  handleProjectChange(value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="project-filter" className="h-9 text-sm">
                  <SelectValue placeholder="Tous les projets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les projets</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal h-5 px-1.5"
                        >
                          {project.code}
                        </Badge>
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phase-filter"
                className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground"
              >
                <FileText className="h-3.5 w-3.5" />
                Phase
              </Label>
              <Select
                value={selectedPhase || "all"}
                onValueChange={(value) =>
                  setSelectedPhase(value === "all" ? "" : value)
                }
                disabled={!selectedProject}
              >
                <SelectTrigger id="phase-filter" className="h-9 text-sm">
                  <SelectValue placeholder="Toutes les phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les phases</SelectItem>
                  {availablePhases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal h-5 px-1.5"
                        >
                          {phase.code}
                        </Badge>
                        <span>{phase.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border/50 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 px-4 text-left align-middle font-medium text-muted-foreground text-xs"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <BarChart3 className="h-8 w-8 opacity-40" />
                      <p className="text-sm font-medium">
                        Aucun résultat trouvé
                      </p>
                      <p className="text-xs">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
          <div className="flex-1 text-xs text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} sur{" "}
            {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-xs font-medium text-muted-foreground">
                Lignes par page
              </p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px] text-xs">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={`${pageSize}`}
                      className="text-xs"
                    >
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-xs font-medium text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-7 w-7 p-0 lg:flex border-0 ring-1 ring-border"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Aller à la première page</span>
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                className="h-7 w-7 p-0 border-0 ring-1 ring-border"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Aller à la page précédente</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                className="h-7 w-7 p-0 border-0 ring-1 ring-border"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Aller à la page suivante</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-7 w-7 p-0 lg:flex border-0 ring-1 ring-border"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Aller à la dernière page</span>
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
