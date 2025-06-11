import { getUnitProductionsWithDetails } from "@/lib/queries";
import { getProjectsByUnitId } from "@/lib/queries";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Card, CardContent } from "@/components/ui/card";
import UnitProductionForm from "@/components/forms/unit-production-form";

type Params = Promise<{ unitId: string }>;

async function UniteProduction({ params }: { params: Params }) {
  const { unitId } = await params;
  // Récupérer les projets de l'unité
  const projects = await getProjectsByUnitId(unitId);

  // Récupérer les productions avec détails
  const productions = await getUnitProductionsWithDetails(unitId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        {/* <CardHeader>
          <CardTitle>Productions de l&apos;unité</CardTitle>
          <CardDescription>
            Gérez les productions de l&apos;unité, filtrez par projet, phase ou
            période.
          </CardDescription>
        </CardHeader> */}
        <CardContent>
          <DataTable
            columns={columns}
            data={productions}
            projects={projects}
            modalChildren={
              <UnitProductionForm
                projects={projects}
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default UniteProduction;
