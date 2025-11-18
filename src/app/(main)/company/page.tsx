import CompanyDetails from "@/components/forms/company-details";
import Loading from "@/components/global/loading";
import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const CompanyPage = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return redirect("/sign-in");
  }
   // Verify if user is invited
   const userEmail = clerkUser.emailAddresses[0].emailAddress;
  const userId = clerkUser.id;
  const userName = `${clerkUser.firstName} ${clerkUser.lastName}`;
  const userImage = clerkUser.imageUrl;
  
  await verifyAndAcceptInvitation(userId, userEmail, userName, userImage);

  

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Loading size="lg" text="Verification et Redirection en cours..." />
        </div>
      }
    >
      <CompanyPageContent
        userEmail={userEmail}
 
      />
    </Suspense>
  );
};

const CompanyPageContent = async ({
  userEmail,
   
}: {
  userEmail: string;
  
}) => {
  
  // Get user details
  const user = await getAuthUserDetails(userEmail);
  if (user?.companyId) {
    if (user?.role === "ADMIN") {
      return redirect("/unite");
    } else if (user?.role === "OWNER") {
      return redirect(`/company/${user.companyId}`);
    } else if (user?.role === "USER") {
      return redirect(`/user/${user.id}`);
    } else {
      return <Unauthorized />;
    }
  }

  // If we reach here, user should be OWNER without company or creating new company
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl">Créér votre Entreprise</h1>
        <CompanyDetails data={{ id: user?.companyId || "" }} />
      </div>
    </div>
  );
};

export default CompanyPage;
