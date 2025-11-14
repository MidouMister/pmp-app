import LayoutSkeleton from "@/components/skeletons/layout-skeleton";
import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const UnitePage = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return redirect("/sign-in");
  }
  // Verify if user is invited
  const companyId = await verifyAndAcceptInvitation();
  if (!companyId) {
    return redirect("/company");
  }
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <LayoutSkeleton />
        </div>
      }
    >
      <UnitePageContent
        userEmail={clerkUser.emailAddresses[0].emailAddress}
        companyId={companyId}
      />
    </Suspense>
  );
};

const UnitePageContent = async ({
  userEmail,
  companyId,
}: {
  userEmail: string;
  companyId: string;
}) => {
  "use cache";
  if (!companyId) return <Unauthorized />;

  const user = await getAuthUserDetails(userEmail);
  if (!user) return null;

  if (user.role === "OWNER") {
    return redirect(`/company/${companyId}/units`);
  }

  if (user.role === "ADMIN") {
    return redirect(`/unite/${user.unitId}`);
  }
  if (user.role === "USER") {
    return redirect(`/user/${user.id}`);
  }
  return <Unauthorized />;
};

export default UnitePage;
