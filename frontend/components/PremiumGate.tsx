"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";

interface PremiumGateProps {
  children: React.ReactNode;
}

const PREMIUM_PLANS = ["plus", "teams", "pro"];

export function PremiumGate({ children }: PremiumGateProps) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const isPremium = user?.subscription?.plan && PREMIUM_PLANS.includes(user.subscription.plan);

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Premium Feature</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Website Showcase Videos are available on Plus, Teams, and Pro plans.
            Upgrade to create stunning motion graphics from any website URL.
          </p>
        </div>
        <Button asChild className="rounded-full px-8">
          <Link href="/#pricing">View Plans</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
