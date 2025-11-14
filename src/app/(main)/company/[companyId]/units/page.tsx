import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";

import { getAuthUserDetails, getCompanyUnits } from "@/lib/queries";
import Unauthorized from "@/components/unauthorized";
import UnitsCompany from "./units-company";
import UnitCompanySkeleton from "@/components/skeletons/unit-company-skeleton";

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
