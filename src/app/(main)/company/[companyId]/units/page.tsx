import { Suspense } from "react";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

import Loading from "@/components/global/loading";
import UnitsClient from "./units-client";

export default async function UnitsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await currentUser();
  if (!user) return null;

  const units = await db.unit.findMany({
    where: {
      companyId: companyId,
    },
  });

  const company = await db.company.findUnique({
    where: {
      id: companyId,
    },
  });

  if (!company) return null;

  const dbUser = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!dbUser) return null;

  return (
    <Suspense fallback={<Loading />}>
      <UnitsClient units={units} company={company} user={dbUser} />
    </Suspense>
  );
}
