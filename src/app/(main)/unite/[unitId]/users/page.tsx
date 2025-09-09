import { db } from "@/lib/db";

import { Plus } from "lucide-react";
import SendInvitation from "@/components/forms/send-invitation";

import { verifyAndAcceptInvitation } from "@/lib/queries";
import DataTable from "./data-table";
import { columns } from "./columns";
import { Suspense } from "react";
import Loading from "@/components/global/loading";

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
    <div className="w-full h-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full w-full">
            <Loading
              text="Chargement des utilisateurs"
              size="lg"
              variant="pulse"
            />
          </div>
        }
      >
        <DataTable
          actionButtonText={
            <>
              <Plus size={15} />
              Ajouter
            </>
          }
          modalChildren={
            <SendInvitation companyId={companyId} unitId={unitId} />
          }
          filterValue="name"
          columns={columns}
          data={unitUsers}
        ></DataTable>
      </Suspense>
    </div>
  );
};

export default UnitUsersPage;
