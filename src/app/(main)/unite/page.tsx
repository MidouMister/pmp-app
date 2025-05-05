import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from "next/navigation";

const UnitPage = async () => {
  const companyId = await verifyAndAcceptInvitation();
  if (!companyId) return <Unauthorized />;

  const user = await getAuthUserDetails();
  if (!user) return null;
  if (user.role !== "OWNER") {
    return redirect(`/unite/${user.unitId}`);
  }
  if (user.role === "OWNER") {
    return redirect(`/company/${companyId}/units`);
  }
  return <Unauthorized />;
  return <div>UnitPage</div>;
};

export default UnitPage;
