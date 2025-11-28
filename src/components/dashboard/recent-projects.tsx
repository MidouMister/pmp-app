"use client";

import { DashboardData } from "@/app/(main)/unite/[unitId]/dashboard/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Building2, Calendar, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

interface RecentProjectsProps {
  data: DashboardData;
  unitId: string;
}

export function RecentProjects({ data, unitId }: RecentProjectsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="col-span-1 h-full"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <CardHeader className="relative flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg">Top 4 Projets</CardTitle>
          </div>
          <Link
            href={`/unite/${unitId}/projects`}
            className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-1 hover:gap-2 group"
          >
            Voir tout
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </CardHeader>
        <CardContent className="relative flex-1">
          {data.topProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun projet trouvé
            </p>
          ) : (
            <div className="space-y-3">
              {data.topProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  className="group p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                >
                  {/* Project Name and Amount */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-semibold text-base group-hover:text-primary transition-colors flex-1">
                      {project.name}
                    </h4>
                    <p className="font-bold text-base whitespace-nowrap text-primary">
                      {formatCurrency(project.montantHT)}
                    </p>
                  </div>

                  {/* Client and Delai */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate font-medium">
                        {project.clientName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium">{project.delai}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
