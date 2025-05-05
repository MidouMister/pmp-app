"use client";

import { getCompanySubscription } from "@/lib/queries";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";

type Props = {
  companyId: string;
};

export default function PlanBadge({ companyId }: Props) {
  const [planName, setPlanName] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const subscription = await getCompanySubscription(companyId);
        if (subscription) {
          setPlanName(subscription.Plan.name);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchPlan();
  }, [companyId]);

  if (!planName) {
    return null;
  }

  const getColor = () => {
    switch (planName) {
      case "Starter":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-800/20 dark:text-blue-300";
      case "Pro":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80 dark:bg-purple-800/20 dark:text-purple-300";
      case "Premium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100/80 dark:bg-amber-800/20 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-800/20 dark:text-gray-300";
    }
  };

  return (
    <Badge className={`ml-2 cursor-pointer ${getColor()}`} variant="outline">
      {planName}
    </Badge>
  );
}
