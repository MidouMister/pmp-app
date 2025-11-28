"use server";

import { db } from "@/lib/db";
import { cacheTag } from "next/cache";

export type DashboardData = {
  usersCount: number;
  projectsCount: number;
  clientsCount: number;
  totalHT: number;
  totalProduction: number;
  totalRAR: number;
  topProjects: {
    id: string;
    name: string;
    clientName: string;
    montantHT: number;
    delai: string;
  }[];
  productionByMonth: {
    month: string; // Format: "Jan 2024"
    year: number;
    monthNum: number;
    amount: number;
  }[];
  projectsByType: {
    type: string;
    amount: number;
    count: number;
    fill: string;
  }[];
  unitName: string;
};

export const getDashboardData = async (
  unitId: string
): Promise<DashboardData | null> => {
  "use cache";
  cacheTag(`dashboard-${unitId}`);

  try {
    const unit = await db.unit.findUnique({
      where: { id: unitId },
      include: {
        members: true,
        clients: true,
        projects: {
          include: {
            Client: true,
            phases: {
              include: {
                Product: {
                  include: {
                    Productions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!unit) return null;

    const usersCount = unit.members.length;
    const clientsCount = unit.clients.length;
    const projectsCount = unit.projects.length;

    let totalHT = 0;
    let totalProduction = 0;

    // Track production by month
    const productionsByDate: { date: Date; amount: number }[] = [];

    // Track projects by type
    const projectTypeMap: Record<string, { amount: number; count: number }> =
      {};

    const projectStats = unit.projects.map((project) => {
      const projectHT = project.montantHT || 0;
      totalHT += projectHT;

      // Group projects by type
      const projectType = project.type || "Non défini";
      if (!projectTypeMap[projectType]) {
        projectTypeMap[projectType] = { amount: 0, count: 0 };
      }
      projectTypeMap[projectType].amount += projectHT;
      projectTypeMap[projectType].count += 1;

      let projectProduction = 0;
      project.phases.forEach((phase) => {
        if (phase.Product?.Productions) {
          phase.Product.Productions.forEach((prod) => {
            const amount = prod.mntProd || 0;
            projectProduction += amount;
            productionsByDate.push({ date: prod.date, amount });
          });
        }
      });
      totalProduction += projectProduction;

      return {
        id: project.id,
        name: project.name,
        clientName: project.Client.name,
        montantHT: projectHT,
        delai: project.delai,
        type: project.type || "Non défini",
        status: project.status,
        production: projectProduction,
        progress: projectHT > 0 ? (projectProduction / projectHT) * 100 : 0,
      };
    });

    const totalRAR = totalHT - totalProduction;

    // Sort by amount HT for top projects
    const topProjects = [...projectStats]
      .sort((a, b) => b.montantHT - a.montantHT)
      .slice(0, 4);

    // Group production by month
    const monthlyProduction: Record<string, number> = {};
    productionsByDate.forEach(({ date, amount }) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      monthlyProduction[key] = (monthlyProduction[key] || 0) + amount;
    });

    // Convert to array and format
    const monthNames = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jui",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const productionByMonth = Object.entries(monthlyProduction)
      .map(([key, amount]) => {
        const [year, month] = key.split("-");
        const monthNum = parseInt(month);
        return {
          month: `${monthNames[monthNum - 1]} ${year}`,
          year: parseInt(year),
          monthNum,
          amount,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNum - b.monthNum;
      });

    // Convert projects by type to array
    const typeColors = [
      "var(--color-chart-1)",
      "var(--color-chart-2)",
      "var(--color-chart-3)",
      "var(--color-chart-4)",
      "var(--color-chart-5)",
    ];

    const projectsByType = Object.entries(projectTypeMap).map(
      ([type, data], index) => ({
        type,
        amount: data.amount,
        count: data.count,
        fill: typeColors[index % typeColors.length],
      })
    );

    return {
      usersCount,
      projectsCount,
      clientsCount,
      totalHT,
      totalProduction,
      totalRAR,
      topProjects,
      productionByMonth,
      projectsByType,
      unitName: unit.name,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
};
