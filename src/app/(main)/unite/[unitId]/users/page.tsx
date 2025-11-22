import SendInvitation from "@/components/forms/send-invitation";
import { Plus } from "lucide-react";

import TeamSkeleton from "@/app/(main)/company/[companyId]/team/team-skeleton";
import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, getUnitUsers } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { columns } from "./columns";
import DataTable from "./data-table";

const UnitUsersPage = async ({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) => {
  const { unitId } = await params;
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

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
          <UnitTeamData
            unitId={unitId}
            userEmail={user.emailAddresses[0].emailAddress}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default UnitUsersPage;

async function UnitTeamData({
  unitId,
  userEmail,
}: {
  unitId: string;
  userEmail: string;
}) {
  const authUser = await getAuthUserDetails(userEmail);
  if (!authUser) {
    redirect("/sign-in");
  }
  if (authUser.role !== "ADMIN" && authUser.role !== "OWNER") {
    return <Unauthorized />;
  }
  const companyId = authUser.companyId;
  if (!companyId) {
    redirect("/company");
  }
  const unitUsers = await getUnitUsers(unitId);

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
