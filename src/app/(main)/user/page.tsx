import LayoutSkeleton from "@/components/skeletons/layout-skeleton";
import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const Page = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  if (user.privateMetadata.role !== "USER  ") return <Unauthorized />;

  const companyId = await verifyAndAcceptInvitation(
    user.id,
    user.emailAddresses[0].emailAddress,
    `${user.firstName} ${user.lastName}`,
    user.imageUrl
  );
  if (!companyId) return null;
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <LayoutSkeleton />
        </div>
      }
    >
      <UserPageContent userEmail={user.emailAddresses[0].emailAddress} />
    </Suspense>
  );
};

const UserPageContent = async ({ userEmail }: { userEmail: string }) => {
  const user = await getAuthUserDetails(userEmail);
  if (!user) return null;

  if (user.role === "USER") {
    return redirect(`/user/${user.id}`);
  }
  return <Unauthorized />;
};
export default Page;
