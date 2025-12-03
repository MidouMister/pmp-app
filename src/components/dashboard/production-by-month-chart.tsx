"use client";

import { DashboardData } from "@/app/(main)/unite/[unitId]/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProductionByMonthChartProps {
  data: DashboardData;
}

export function ProductionByMonthChart({ data }: ProductionByMonthChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="font-semibold text-sm mb-1">
            {payload[0].payload.month}
          </p>
          <p className="text-xs text-primary font-semibold">
            {new Intl.NumberFormat("fr-DZ", {
              style: "currency",
              currency: "DZD",
              maximumFractionDigits: 0,
            }).format(payload[0].value)}
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
      transition={{ duration: 0.5, delay: 0.6 }}
      className="col-span-full"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg">Production par Mois</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {data.productionByMonth.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune donnée de production disponible
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={data.productionByMonth}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorProduction"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-chart-1)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-chart-1)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{
                      fill: "currentColor",
                      className: "fill-muted-foreground",
                    }}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    className="text-xs"
                    tick={{
                      fill: "currentColor",
                      className: "fill-muted-foreground",
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="linear"
                    dataKey="amount"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProduction)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
