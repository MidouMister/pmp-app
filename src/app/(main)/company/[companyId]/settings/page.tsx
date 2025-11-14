import {
  getCompanySubscription,
  createDefaultPlans,
  getAuthUserDetails,
} from "@/lib/queries";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Unauthorized from "@/components/unauthorized";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionPlans from "@/components/forms/suscription-plan";
import UserDetails from "@/components/forms/user-details";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import CompanyDetails from "@/components/forms/company-details";
import { Company } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import TabsContentSkeleton from "@/components/skeletons/tabs-content-skeleton";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await currentUser();
  if (!user) {
    return redirect("/");
  }

  if (!companyId) {
    return redirect("/company");
  }

  if (user.privateMetadata.role !== "OWNER") {
    return <Unauthorized />;
  }
  const emailAddress = user.emailAddresses[0].emailAddress;
  return (
    <div className="min-h-screen bg-background ">
      <div className="container mx-auto py-6 ">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez les informations de votre entreprise et votre profil
            utilisateur.
          </p>
        </div>
        <Separator className="my-6" />
      </div>
      <Suspense fallback={<TabsContentSkeleton />}>
        <TabsContentComponent userEmail={emailAddress} />
      </Suspense>
    </div>
  );
}
async function TabsContentComponent({ userEmail }: { userEmail: string }) {
  "use cache";
  const userData = await getAuthUserDetails(userEmail);
  const company = userData?.Company as Company;
  // Create default plans if they don't exist
  await createDefaultPlans();
  // Get current subscription
  const subscription = await getCompanySubscription(company.id);
  return (
    <Tabs defaultValue="company" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="company">
          Informations de l&apos;entreprise
        </TabsTrigger>
        <TabsTrigger value="profile">Profil utilisateur</TabsTrigger>
        <TabsTrigger value="subscription">Abonnement</TabsTrigger>
      </TabsList>

      <TabsContent value="company">
        <Card>
          <CardHeader>
            <CardTitle>Informations de l&apos;entreprise</CardTitle>
            <CardDescription>
              Mettez à jour les informations concernant votre entreprise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyDetails data={company} noCard={true} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profil utilisateur</CardTitle>
            <CardDescription>
              Mettez à jour vos informations personnelles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserDetails data={userData} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="subscription">
        <Card>
          <CardHeader>
            <CardTitle>Gestion de l&apos;abonnement</CardTitle>
            <CardDescription>
              Choisissez le plan qui convient le mieux à votre entreprise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionPlans
              companyId={company.id}
              subscription={subscription}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
