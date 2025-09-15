const UnitPage = async () => {
  // const companyId = await verifyAndAcceptInvitation();
  // if (!companyId) return <Unauthorized />;

  // const user = await getAuthUserDetails();
  // if (!user) return null;
  // if (user.role !== "OWNER") {
  //   return redirect(`/unite/${user.unitId}`);
  // }
  // if (user.role === "OWNER") {
  //   return redirect(`/company/${companyId}/units`);
  // }
  // return <Unauthorized />;
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Informations Unité</h1>
          <p className="text-muted-foreground">
            Vous trouver toutes les informations sur Votre Unité
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnitPage;
