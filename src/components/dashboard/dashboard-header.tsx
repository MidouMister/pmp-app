"use client";

import { LayoutDashboard } from "lucide-react";
import { motion } from "motion/react";

interface DashboardHeaderProps {
  unitName: string;
}

export function DashboardHeader({ unitName }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-4 mb-8"
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
        <LayoutDashboard className="w-7 h-7 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground mt-1">{unitName}</p>
      </div>
    </motion.div>
  );
}
