import { db } from "@/lib/db";

import { Plus } from "lucide-react";
import SendInvitation from "@/components/forms/send-invitation";

import DataTable from "./data-table";
import { columns } from "./columns";
import { Suspense } from "react";
import TeamSkeleton from "@/app/(main)/company/[companyId]/team/team-skeleton";

const UnitUsersPage = async ({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) => {
  const { unitId } = await params;

  return (
    <div className="min-h-screen bg-background p-1">
      <div className="container mx-auto py-6 ">
        <div className="mb-3">
          <h1 className="text-3xl font-bold">Membres</h1>
          <p className="text-muted-foreground  ">
            Gérez vos membres de l&apos;unité
          </p>
        </div>
        <Suspense fallback={<TeamSkeleton />}>
          <UnitTeamData unitId={unitId} />
        </Suspense>
      </div>
    </div>
  );
};

export default UnitUsersPage;

async function UnitTeamData({ unitId }: { unitId: string }) {
  "use cache";
  const unitUsers = await db.user.findMany({
    where: {
      unitId,
    },
  });
  const companyId = unitUsers[0].companyId;
  if (!companyId) return null;
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
}
