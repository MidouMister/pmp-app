"use client";

import { DashboardData } from "@/app/(main)/unite/[unitId]/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  CreditCard,
  Factory,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";

interface StatsCardsProps {
  data: DashboardData;
}

export function StatsCards({ data }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats: Array<{
    title: string;
    value: number | string;
    icon: any;
    description: string;
    gradient: string;
    bgGradient: string;
    iconColor: string;
    trend: any;
    className?: string;
  }> = [
    {
      title: "Utilisateurs",
      value: data.usersCount,
      icon: Users,
      description: "Membres de l'unité",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-500",
      trend: null,
    },
    {
      title: "Projets",
      value: data.projectsCount,
      icon: Briefcase,
      description: "Projets actifs",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-500",
      trend: null,
    },
    {
      title: "Clients",
      value: data.clientsCount,
      icon: Building2,
      description: "Portefeuille clients",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-500",
      trend: null,
    },
    {
      title: "Portefeuille HT",
      value: formatCurrency(data.totalHT),
      icon: Wallet,
      description: "Montant total des projets",
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/10",
      iconColor: "text-violet-500",
      trend: TrendingUp,
    },
    {
      title: "Production HT",
      value: formatCurrency(data.totalProduction),
      icon: Factory,
      description: "Total produit",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-500",
      trend: TrendingUp,
    },
    {
      title: "RAR HT",
      value: formatCurrency(data.totalRAR),
      icon: CreditCard,
      description: "Reste à réaliser",
      gradient: "from-amber-500 to-yellow-500",
      bgGradient: "from-amber-500/10 to-yellow-500/10",
      iconColor: "text-amber-500",
      trend: data.totalRAR > 0 ? TrendingUp : TrendingDown,
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={stat.className}
        >
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 hover:scale-105">
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`}
            />

            {/* Animated gradient border effect */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}
            />

            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-lg`}
              >
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                {stat.trend && (
                  <stat.trend
                    className={`h-4 w-4 ${stat.iconColor} opacity-60`}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  );
}
