"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useModal } from "@/providers/modal-provider";
import { Search, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/global/custom-model";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductionWithDetails } from "@/lib/types";
import { Project, Phase } from "@prisma/client";

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
          // Ajouter 23:59:59 à la date de fin pour inclure toute la journée
          toDate.setHours(23, 59, 59, 999);
          isValid = isValid && itemDate <= toDate;
        }

        return isValid;
      });
    }

    // Filtre par projet
    if (selectedProject) {
      filtered = filtered.filter(
        (item) => item.Product.Phase.Project.id === selectedProject
      );
    }

    // Filtre par phase
    if (selectedPhase) {
      filtered = filtered.filter(
        (item) => item.Product.Phase.id === selectedPhase
      );
    }

    // Filtre global (recherche)
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
    setSelectedPhase(""); // Réinitialiser la phase lorsque le projet change
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche et bouton d'ajout */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Card className="w-full md:w-auto">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-9 w-full md:w-[300px]"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          className="flex gap-2"
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
          Ajouter une production
        </Button>
      </div>

      {/* Filtres avancés */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date-from">Date de début</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date-to">Date de fin</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="project-filter">Projet</Label>
              <Select
                value={selectedProject}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger id="project-filter" className="w-full">
                  <SelectValue placeholder="Tous les projets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les projets</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.code} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phase-filter">Phase</Label>
              <Select
                value={selectedPhase}
                onValueChange={setSelectedPhase}
                disabled={!selectedProject}
              >
                <SelectTrigger id="phase-filter" className="w-full">
                  <SelectValue placeholder="Toutes les phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les phases</SelectItem>
                  {availablePhases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.code} - {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau de données */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={`${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none hover:bg-muted/50"
                            : ""
                        } flex items-center rounded p-1`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
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
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {table.getFilteredRowModel().rows.length} sur{" "}
            {data.length} productions
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Lignes par page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Aller à la première page</span>
                <span>«</span>
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Aller à la page précédente</span>
                <span>‹</span>
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Aller à la page suivante</span>
                <span>›</span>
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Aller à la dernière page</span>
                <span>»</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
