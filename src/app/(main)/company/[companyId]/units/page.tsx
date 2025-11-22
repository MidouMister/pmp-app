import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";

import UnitCompanySkeleton from "@/components/skeletons/unit-company-skeleton";
import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, getCompanyUnits } from "@/lib/queries";
import { cacheLife, cacheTag } from "next/cache";
import UnitsCompany from "./units-company";

export default async function UnitsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await currentUser();
  if (!user) return null;
  if (
    user.privateMetadata.role !== "OWNER" &&
    user.privateMetadata.role !== "ADMIN"
  ) {
    return <Unauthorized />;
  }
  const emailAddress = user.emailAddresses[0].emailAddress;

  return (
    <Suspense fallback={<UnitCompanySkeleton />}>
      <CompanyUnits userEmail={emailAddress} companyId={companyId} />
    </Suspense>
  );
}
async function CompanyUnits({
  userEmail,
  companyId,
}: {
  userEmail: string;
  companyId: string;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("company-units");

  const user = await getAuthUserDetails(userEmail);
  if (!user) return null;
  const units = await getCompanyUnits(companyId);
  const company = user.Company;
  if (!company) {
    return null;
  }
  return (
    <div>
      <UnitsCompany units={units} company={company} user={user} />
    </div>
  );
}
