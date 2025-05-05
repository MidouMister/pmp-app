import { Plus } from "lucide-react";
import { columns } from "./columns";
import DataTable from "./data-table";
import ClientForm from "@/components/forms/client-form";
import { getUnitClients } from "@/lib/queries";

type Params = Promise<{ unitId: string }>;
const ClientsPage = async ({ params }: { params: Params }) => {
  const { unitId } = await params;
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
};

export default ClientsPage;
