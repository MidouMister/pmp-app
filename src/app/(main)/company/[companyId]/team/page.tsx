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
  );
};

export default TeamPage;
