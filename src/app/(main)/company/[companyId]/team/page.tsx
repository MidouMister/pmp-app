import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";

import { Plus } from "lucide-react";

import SendInvitation from "@/components/forms/send-invitation";
import DataTable from "./data-table";
import { columns } from "./columns";
import TeamSkeleton from "./team-skeleton";
import { getCompanyUsersWithUnit } from "@/lib/queries";
import Unauthorized from "@/components/unauthorized";
import { cacheLife, cacheTag } from "next/cache";

const TeamPage = async ({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) => {
  const { companyId } = await params;
  const authUser = await currentUser();
  if (!authUser) return null;
  if (authUser.privateMetadata.role !== "OWNER") {
    return <Unauthorized />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 ">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Membres
              </h1>
              <p className="text-muted-foreground text-lg">
                Gérez vos membres de l&apos;unité
              </p>
            </div>
          </div>
          <Suspense fallback={<TeamSkeleton />}>
            <UserTable companyId={companyId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;

async function UserTable({ companyId }: { companyId: string }) {
  "use cache";
  cacheLife("hours");
  cacheTag("company-users");
  const teamMembers = await getCompanyUsersWithUnit(companyId);
  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Ajouter
        </>
      }
      modalChildren={<SendInvitation companyId={companyId} />}
      filterValue="name"
      columns={columns}
      data={teamMembers || []}
    />
  );
}
