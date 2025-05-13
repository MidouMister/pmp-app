"use client";

import * as React from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface TauxChartProps {
  taux: number;
  size?: number;
}

const TauxChart: React.FC<TauxChartProps> = ({ taux, size = 30 }) => {
  // Assurer que le taux est entre 0 et 100
  const normalizedTaux = Math.min(Math.max(taux, 0), 100);

  // Générer des données pour la courbe ascendante
  const generateData = () => {
    const points = 5; // Nombre de points sur la courbe
    const data = [];

    for (let i = 0; i < points; i++) {
      // Créer une courbe ascendante avec une légère variation aléatoire
      const value = (i / (points - 1)) * normalizedTaux;
      data.push({ value: Math.max(value * (0.8 + Math.random() * 0.4), 0) });
    }

    return data;
  };

  const data = generateData();

  return (
    <div className="flex items-center gap-2">
      <div style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              fillOpacity={1}
              fill="url(#colorValue)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <span className="font-medium">{normalizedTaux}%</span>
    </div>
  );
};

export default TauxChart;
