import { getUnitProductionsWithDetails } from "@/lib/queries";
import { getProjectsByUnitId } from "@/lib/queries";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Card, CardContent } from "@/components/ui/card";
import UnitProductionForm from "@/components/forms/unit-production-form";

async function UniteProduction({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  // Récupérer les projets de l'unité
  const projects = await getProjectsByUnitId(unitId);

  // Récupérer les productions avec détails
  const productions = await getUnitProductionsWithDetails(unitId);

  return (
    <div className="container mx-auto ">
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={productions}
            projects={projects}
            modalChildren={<UnitProductionForm projects={projects} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default UniteProduction;
