import { Plus } from "lucide-react";
import { columns } from "./columns";
import DataTable from "./data-table";
import ClientForm from "@/components/forms/client-form";
import { getUnitClients } from "@/lib/queries";
import { Suspense } from "react";
import Loading from "@/components/global/loading";

const ClientsPage = async ({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) => {
  const { unitId } = await params;
  const clients = await getUnitClients(unitId);

  return (
    <Suspense
      fallback={<Loading text="Chargement..." variant="pulse" size="md" />}
    >
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
    </Suspense>
  );
};

export default ClientsPage;
