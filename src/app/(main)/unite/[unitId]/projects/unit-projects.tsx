"use client";

import { useState } from "react";
import {
  Plus,
  LayoutGrid,
  List,
  FileText,
  DollarSign,
  Calculator,
} from "lucide-react";
import { formatAmount } from "@/lib/utils";
import { columns } from "./columns";
import DataTable from "./data-table";

import { Project } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectForm from "@/components/forms/project-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectCard from "./project-card";
import { useModal } from "@/providers/modal-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomModal from "@/components/global/custom-model";

interface UnitProjectsProps {
  projects: (Project & { Client: { name: string } })[];
  unitId: string;
}

const UnitProjects = ({ projects, unitId }: UnitProjectsProps) => {
  const { setOpen } = useModal();
  const [view, setView] = useState<"table" | "card">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.Client.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get unique project types for filter
  const projectTypes = Array.from(
    new Set(projects.map((project) => project.type))
  );
  const modalId = `project-form-${unitId}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Projets de l&apos;unité</h1>
        <div className="flex items-center gap-2">
          <Tabs
            defaultValue={view}
            onValueChange={(v) => setView(v as "table" | "card")}
          >
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <List size={16} />
                Tableau
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <LayoutGrid size={16} />
                Cartes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="New">Nouveau</SelectItem>
              <SelectItem value="InProgress">En cours</SelectItem>
              <SelectItem value="Pause">En pause</SelectItem>
              <SelectItem value="Complete">Terminé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {projectTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {view === "card" && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <Card className="w-full md:w-full lg:w-64 h-24">
              <CardContent className="flex items-center p-4 h-full">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Nombres de projets
                  </span>
                  <span className="text-lg font-semibold">
                    {projects.length}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="w-full md:w-full lg:w-64 h-24">
              <CardContent className="flex items-center p-4 h-full">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm text-muted-foreground">
                    Total HT
                  </span>
                  <span className="text-lg font-semibold truncate">
                    {formatAmount(
                      projects.reduce(
                        (total, project) => total + project.montantHT,
                        0
                      )
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="w-full md:w-full lg:w-64 h-24">
              <CardContent className="flex items-center p-4 h-full">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm text-muted-foreground">
                    Total TTC
                  </span>
                  <span className="text-lg font-semibold truncate">
                    {formatAmount(
                      projects.reduce(
                        (total, project) => total + project.montantTTC,
                        0
                      )
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <Button
            className="flex items-center gap-2"
            size="sm"
            onClick={() =>
              setOpen(
                modalId,
                <CustomModal
                  modalId={modalId}
                  title="Ajouter Projet"
                  subheading="Ajouter un  nouveau Projet à votre Unité."
                >
                  <ProjectForm unitId={unitId} />
                </CustomModal>
              )
            }
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter</span>
          </Button>
        </div>
      )}
      {view === "table" ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <Card className="w-full md:w-full lg:w-64 h-24">
                <CardContent className="flex items-center p-4 h-full">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Total projets
                    </span>
                    <span className="text-lg font-semibold">
                      {projects.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="w-full md:w-full lg:w-64 h-24">
                <CardContent className="flex items-center p-4 h-full">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm text-muted-foreground">
                      Total HT
                    </span>
                    <span className="text-lg font-semibold truncate">
                      {formatAmount(
                        projects.reduce(
                          (total, project) => total + project.montantHT,
                          0
                        )
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="w-full md:w-full lg:w-64 h-24">
                <CardContent className="flex items-center p-4 h-full">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm text-muted-foreground">
                      Total TTC
                    </span>
                    <span className="text-lg font-semibold truncate">
                      {formatAmount(
                        projects.reduce(
                          (total, project) => total + project.montantTTC,
                          0
                        )
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <DataTable
            actionButtonText={
              <>
                <Plus size={15} />
                Ajouter
              </>
            }
            modalChildren={<ProjectForm unitId={unitId} />}
            filterValue="name"
            columns={columns}
            data={filteredProjects}
          />
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} unitId={unitId} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Aucun projet trouvé.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitProjects;
