import { getUnitProductionsWithDetails } from "@/lib/queries";
import { getProjectsByUnitId } from "@/lib/queries";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import UnitProductionForm from "@/components/forms/unit-production-form";
import { BarChart3, TrendingUp, Activity } from "lucide-react";

async function UniteProduction({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  // Récupérer les projets de l'unité
  const projects = await getProjectsByUnitId(unitId);

  // Récupérer les productions avec détails
  const productions = await getUnitProductionsWithDetails(unitId);

  const totalProductions = productions.length;
  const totalAmount = productions.reduce(
    (sum, prod) => sum + Number(prod.mntProd),
    0
  );
  const averageRate =
    productions.length > 0
      ? productions.reduce((sum, prod) => sum + Number(prod.taux), 0) /
        productions.length
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.primary/5),transparent_50%)]" />
        <div className="relative container mx-auto px-6 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Gestion des Productions
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3 text-balance">
              Productions de l&apos;Unité
            </h1>

            <p className="text-lg text-muted-foreground text-pretty max-w-2xl leading-relaxed">
              Suivez et gérez efficacement vos productions par projet et phase.
              Analysez les performances et optimisez vos processus de
              production.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {totalProductions}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Productions totales
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/15 transition-colors">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Montant total
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-6 transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {averageRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Taux moyen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,theme(colors.muted/20),transparent_70%)] pointer-events-none" />

          <div className="relative bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-8">
              <DataTable
                columns={columns}
                data={productions}
                projects={projects}
                modalChildren={<UnitProductionForm projects={projects} />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UniteProduction;
