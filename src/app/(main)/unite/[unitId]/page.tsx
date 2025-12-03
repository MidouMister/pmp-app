import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProductionByMonthChart } from "@/components/dashboard/production-by-month-chart";
import { ProjectsByTypeChart } from "@/components/dashboard/projects-by-type-chart";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { redirect } from "next/navigation";
import { getDashboardData } from "./actions";

interface DashboardPageProps {
  params: Promise<{
    unitId: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { unitId } = await params;
  const data = await getDashboardData(unitId);

  if (!data) {
    redirect(`/unite/${unitId}`);
  }

  return (
    <div className="flex flex-col gap-5 p-3 md:p-5 lg:p-6 max-w-[1600px] mx-auto">
      <DashboardHeader unitName={data.unitName} />

      {/* Stats Cards - 3 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCards data={data} />
      </div>

      {/* Production Chart - Full Width */}
      <ProductionByMonthChart data={data} />

      {/* Bottom Row - Charts Side by Side */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2 lg:items-start">
        <ProjectsByTypeChart data={data} />
        <RecentProjects data={data} unitId={unitId} />
      </div>
    </div>
  );
}
