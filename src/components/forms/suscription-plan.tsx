"use client";

import { Plan, Subscription } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { pricingCards } from "@/lib/constants";
import { CheckIcon } from "lucide-react";
import { createOrUpdateSubscription } from "@/lib/queries";
import Loading from "../global/loading";
import { Badge } from "../ui/badge";

type SubscriptionWithPlan = Subscription & {
  Plan: Plan;
};

type Props = {
  companyId: string;
  subscription?: SubscriptionWithPlan | null;
};

const SubscriptionPlans = ({ companyId, subscription }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscription = async (planId: string) => {
    try {
      setIsLoading(planId);
      await createOrUpdateSubscription(companyId, planId);
      toast.success("Abonnement mis à jour avec succès");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Erreur", {
        description: "Impossible de mettre à jour votre abonnement",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const currentPlanId = subscription?.planId;

  return (
    <div className="relative mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingCards.map((plan) => (
          <Card
            key={plan.title}
            className={`w-full border-2 ${
              currentPlanId === plan.priceId
                ? "border-primary shadow-md"
                : "border-border"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex justify-between">
                {plan.title}
                {currentPlanId === plan.priceId && (
                  <Badge className="bg-primary text-white">Actif</Badge>
                )}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
              <div className="flex gap-2 text-2xl font-bold">
                <span>{plan.price}</span>
                {plan.duration ? (
                  <span className="text-sm text-muted-foreground self-end">
                    /{plan.duration}
                  </span>
                ) : null}
              </div>
              <div>
                <p className="font-medium mb-2">{plan.highlight}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={isLoading !== null || currentPlanId === plan.priceId}
                variant={currentPlanId === plan.priceId ? "outline" : "default"}
                onClick={() => handleSubscription(plan.priceId)}
              >
                {isLoading === plan.priceId ? (
                  <Loading />
                ) : currentPlanId === plan.priceId ? (
                  "Plan actuel"
                ) : (
                  "Choisir ce plan"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
