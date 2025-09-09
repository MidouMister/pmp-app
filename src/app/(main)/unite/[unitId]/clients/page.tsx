import { Plus } from "lucide-react";
import { columns } from "./columns";
import DataTable from "./data-table";
import ClientForm from "@/components/forms/client-form";
import { getUnitClients } from "@/lib/queries";
import { Suspense } from "react";
import UnitClientsSkeleton from "@/components/skeletons/unit-clients-skelton";

const ClientsPage = async ({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) => {
  const { unitId } = await params;
  const clients = await getUnitClients(unitId);

  return (
    <Suspense fallback={<UnitClientsSkeleton />}>
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
