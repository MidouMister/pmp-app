"use client";

import { DashboardData } from "@/app/(main)/unite/[unitId]/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { motion } from "motion/react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ProjectsByTypeChartProps {
  data: DashboardData;
}

export function ProjectsByTypeChart({ data }: ProjectsByTypeChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="font-semibold text-sm mb-1">
            {payload[0].payload.type}
          </p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.count} projet
            {payload[0].payload.count > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-primary font-semibold mt-1">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="col-span-1"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg">Projets par Type</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {data.projectsByType.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune donnée disponible
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.projectsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) =>
                      `${type} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={90}
                    dataKey="amount"
                  >
                    {data.projectsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
