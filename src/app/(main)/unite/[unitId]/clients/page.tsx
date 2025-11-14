import Loading from "@/components/global/loading";
import { getUnitClients } from "@/lib/queries";
import { Suspense } from "react";
import DataTable from "./data-table";
import { Plus } from "lucide-react";
import ClientForm from "@/components/forms/client-form";
import { columns } from "./columns";

const ClientsPage = async ({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) => {
  const { unitId } = await params;

  return (
    <div className="min-h-screen bg-background p-1">
      <div className="container mx-auto py-6">
        <div className="mb-3">
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Gérez et suivez vos clients efficacement
          </p>
        </div>
        <Suspense
          fallback={
            <Loading text="Chargement..." variant="spinner" size="md" />
          }
        >
          <ClientTable unitId={unitId} />
        </Suspense>
      </div>
    </div>
  );
};

export default ClientsPage;

async function ClientTable({ unitId }: { unitId: string }) {
  "use cache";
  const clients = await getUnitClients(unitId);
  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Ajouter
        </>
      }
      modalChildren={<ClientForm unitId={unitId} />}
      filterValue="name"
      columns={columns}
      data={clients}
    ></DataTable>
  );
}
