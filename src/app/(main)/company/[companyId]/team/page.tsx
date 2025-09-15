import { Suspense } from "react";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

import { Plus } from "lucide-react";

import SendInvitation from "@/components/forms/send-invitation";
import DataTable from "./data-table";
import { columns } from "./columns";
import TeamSkeleton from "./team-skeleton";

const TeamPage = async ({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) => {
  const { companyId } = await params;
  const authUser = await currentUser();
  const teamMembers = await db.user.findMany({
    where: {
      companyId: companyId,
    },
    include: {
      Company: {
        include: {
          units: true,
        },
      },
    },
  });
  if (!authUser) return null;
  const companyDetails = await db.company.findUnique({
    where: {
      id: companyId,
    },
    include: {
      units: true,
    },
  });
  if (!companyDetails) return;

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
            <DataTable
              actionButtonText={
                <>
                  <Plus size={15} />
                  Ajouter
                </>
              }
              modalChildren={<SendInvitation companyId={companyDetails.id} />}
              filterValue="name"
              columns={columns}
              data={teamMembers}
            ></DataTable>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
