import { db } from "@/lib/db";

import { Plus } from "lucide-react";
import SendInvitation from "@/components/forms/send-invitation";

import { verifyAndAcceptInvitation } from "@/lib/queries";
import DataTable from "./data-table";
import { columns } from "./columns";

const UnitUsersPage = async ({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) => {
  const companyId = await verifyAndAcceptInvitation();
  const { unitId } = await params;
  if (!companyId) return;

  const unitUsers = await db.user.findMany({
    where: {
      unitId,
    },
  });

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Ajouter
        </>
      }
      modalChildren={<SendInvitation companyId={companyId} unitId={unitId} />}
      filterValue="name"
      columns={columns}
      data={unitUsers}
    ></DataTable>
  );
};

export default UnitUsersPage;
