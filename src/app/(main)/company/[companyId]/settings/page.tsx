import {
  getAuthUserDetails,
  getCompanySubscription,
  createDefaultPlans,
} from "@/lib/queries";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyDetails from "@/components/forms/company-details";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UserDetails from "@/components/forms/user-details";
import SubscriptionPlans from "@/components/forms/suscription-plan";

export default async function SettingsPage({
  params,
}: {
  params: { companyId: string };
}) {
  const { companyId } = await params;
  const user = await getAuthUserDetails();

  if (!user) {
    return redirect("/");
  }

  if (!companyId) {
    return redirect("/company");
  }

  // Make sure user has rights to access this company
  if (user.role !== "OWNER" || user.companyId !== companyId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Non autorisé</h1>
        <p>Vous n&apos;avez pas les droits pour accéder à cette page.</p>
      </div>
    );
  }

  // Get company details
  const company = user.ownedCompany;

  if (!company) {
    return redirect("/company");
  }

  // Create default plans if they don't exist
  await createDefaultPlans();

  // Get current subscription
  const subscription = await getCompanySubscription(companyId);

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les informations de votre entreprise et votre profil
          utilisateur.
        </p>
      </div>

      <Separator className="my-6" />

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
              <UserDetails data={user} />
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
                companyId={companyId}
                subscription={subscription}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
