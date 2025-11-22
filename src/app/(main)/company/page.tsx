import CompanyDetails from "@/components/forms/company-details";
import InvitationProcessor from "@/components/global/invitation-processor";
import Loading from "@/components/global/loading";
import Unauthorized from "@/components/unauthorized";
import { checkInvitationStatus, getAuthUserDetails } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const CompanyPage = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return redirect("/sign-in");
  }

  const userEmail = clerkUser.emailAddresses[0].emailAddress;

  // 1. Vérification simple (Lecture seule) - Pas de mutation ici !
  const pendingInvitation = await checkInvitationStatus(userEmail);

  // 2. Si une invitation existe, on affiche le Processeur Client qui lancera l'Action
  if (pendingInvitation) {
    return (
      <InvitationProcessor
        user={{
          id: clerkUser.id,
          email: userEmail,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`,
          image: clerkUser.imageUrl,
        }}
      />
    );
  }

  // 3. Sinon, flux normal...
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Loading size="lg" text="Chargement..." />
        </div>
      }
    >
      <CompanyPageContent userEmail={userEmail} />
    </Suspense>
  );
};
const CompanyPageContent = async ({ userEmail }: { userEmail: string }) => {
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
